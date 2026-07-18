import { UniversalAccount, UNIVERSAL_ACCOUNT_VERSION, UA_TRANSACTION_STATUS } from "@particle-network/universal-account-sdk";

export interface UaPaymentRecord {
  found: boolean;
  sender: string | null;
  receiver: string | null;
  status: number | string | null;
  settled: boolean;
  failed: boolean;
  /** Real per-chain tx hashes extracted from the UA bundle's user operations. */
  chainTxHashes: string[];
  raw: unknown;
}

// Terminal failure states: execution failed or the deposit was refunded.
const FAILED_STATUSES = new Set<number>([
  UA_TRANSACTION_STATUS.EXECUTION_FAILED,   // 6
  UA_TRANSACTION_STATUS.WAIT_TO_REFUND,     // 3
  UA_TRANSACTION_STATUS.REFUND_LOCAL,       // 8
  UA_TRANSACTION_STATUS.REFUND_PENDING,     // 9
  UA_TRANSACTION_STATUS.REFUND_FAILED,      // 10
  UA_TRANSACTION_STATUS.REFUND_FINISHED,    // 11
]);

function extractChainTxHashes(record: Record<string, unknown>): string[] {
  const hashes: string[] = [];
  for (const key of [
    "depositUserOperations",
    "lendingUserOperations",
    "settlementUserOperations",
  ]) {
    const ops = record[key];
    if (!Array.isArray(ops)) continue;
    for (const op of ops) {
      const h = (op as Record<string, unknown>)?.txHash;
      if (typeof h === "string" && h.startsWith("0x") && h.length === 66) hashes.push(h);
    }
  }
  return [...new Set(hashes)];
}

function parseRecord(record: Record<string, unknown>): UaPaymentRecord {
  const change = record.change as Record<string, unknown> | undefined;
  const sender =
    (record.sender as string | undefined) ??
    (change?.from as string | undefined) ??
    null;
  const receiver =
    (record.receiver as string | undefined) ??
    (change?.to as string | undefined) ??
    null;
  const status = (record.status as number | string | undefined) ?? null;
  const numStatus = typeof status === "number" ? status : Number.NaN;

  return {
    found: true,
    sender,
    receiver,
    status,
    settled: numStatus === UA_TRANSACTION_STATUS.FINISHED,
    failed: FAILED_STATUSES.has(numStatus),
    chainTxHashes: extractChainTxHashes(record),
    raw: record,
  };
}

const NOT_FOUND: UaPaymentRecord = {
  found: false, sender: null, receiver: null, status: null,
  settled: false, failed: false, chainTxHashes: [], raw: null,
};

/**
 * Looks up a Universal Account transaction by the id returned from
 * `ua.sendTransaction(...)` and polls until it reaches a terminal state.
 * A UA payment is a cross-chain bundle, so this is the reliable way to
 * confirm it settled — `status` is numeric (UA_TRANSACTION_STATUS), and
 * FINISHED (7) is the only success state.
 */
export async function lookupUaTransaction(
  transactionId: string,
  ownerAddress: string,
  { attempts = 10, intervalMs = 3000 }: { attempts?: number; intervalMs?: number } = {}
): Promise<UaPaymentRecord> {
  const ua = new UniversalAccount({
    projectId: process.env.NEXT_PUBLIC_PARTICLE_PROJECT_ID!,
    projectClientKey: process.env.NEXT_PUBLIC_PARTICLE_CLIENT_KEY!,
    projectAppUuid: process.env.NEXT_PUBLIC_PARTICLE_APP_ID!,
    ownerAddress,
    smartAccountOptions: {
      // Particle's transaction-query API only accepts "UNIVERSAL" — "SIMPLE"
      // fails with "Unsupported smart account".
      name: "UNIVERSAL",
      version: UNIVERSAL_ACCOUNT_VERSION,
      ownerAddress,
      useEIP7702: true,
    },
  });

  let last: UaPaymentRecord = NOT_FOUND;
  for (let i = 0; i < attempts; i++) {
    if (i > 0) await new Promise((r) => setTimeout(r, intervalMs));
    try {
      const record = (await ua.getTransaction(transactionId)) as
        | Record<string, unknown>
        | null
        | undefined;
      if (!record) continue;
      last = parseRecord(record);
      if (last.settled || last.failed) return last;
    } catch (e) {
      console.error("UA lookup attempt failed:", e instanceof Error ? e.message : e);
    }
  }
  return last;
}

export function sameAddress(a: string | null, b: string | null): boolean {
  if (!a || !b) return false;
  return a.toLowerCase() === b.toLowerCase();
}
