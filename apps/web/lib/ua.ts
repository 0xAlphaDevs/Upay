import { UniversalAccount, UNIVERSAL_ACCOUNT_VERSION } from "@particle-network/universal-account-sdk";
import type { EIP7702Authorization, ITransaction } from "@particle-network/universal-account-sdk";
import { Signature } from "ethers";
import type { Magic } from "magic-sdk";

/** Particle Universal Account for a Magic-owned EOA (EIP-7702 mode). */
export function createUA(ownerAddress: string) {
  return new UniversalAccount({
    projectId: process.env.NEXT_PUBLIC_PARTICLE_PROJECT_ID!,
    projectClientKey: process.env.NEXT_PUBLIC_PARTICLE_CLIENT_KEY!,
    projectAppUuid: process.env.NEXT_PUBLIC_PARTICLE_APP_ID!,
    ownerAddress,
    smartAccountOptions: {
      // "UNIVERSAL" is the account name Particle's APIs accept everywhere;
      // "SIMPLE" is rejected by the transaction-query endpoints.
      name: "UNIVERSAL",
      version: UNIVERSAL_ACCOUNT_VERSION,
      ownerAddress,
      useEIP7702: true,
    },
    tradeConfig: {
      slippageBps: 100,
    },
  });
}

export type UAPhase = "authorizing" | "signing" | "sending";

/**
 * Sign a universal transaction with the Magic wallet and send it via Particle.
 * Handles the EIP-7702 authorization for chains where the EOA isn't delegated yet —
 * Magic holds the key, so it can produce the raw (unprefixed) authorization signature
 * that injected wallets can't.
 */
export async function signAndSendWithMagic({
  magic,
  ua,
  transaction,
  ownerAddress,
  onPhase,
}: {
  magic: Magic;
  ua: UniversalAccount;
  transaction: ITransaction;
  ownerAddress: string;
  onPhase?: (phase: UAPhase) => void;
}) {
  const eip7702Authorizations: EIP7702Authorization[] = [];
  const chainsNeedingAuth = transaction.userOps.filter(
    (op) => !op.eip7702Delegated && op.eip7702Auth
  );

  if (chainsNeedingAuth.length > 0) {
    onPhase?.("authorizing");
    for (const op of chainsNeedingAuth) {
      const auth = await magic.wallet.sign7702Authorization({
        contractAddress: op.eip7702Auth!.address,
        chainId: op.eip7702Auth!.chainId,
        nonce: op.eip7702Auth!.nonce,
      });
      const signature = Signature.from({ r: auth.r, s: auth.s, v: auth.v }).serialized;
      eip7702Authorizations.push({ userOpHash: op.userOpHash, signature });
    }
  }

  onPhase?.("signing");
  const signature = await magic.rpcProvider.request({
    method: "personal_sign",
    params: [transaction.rootHash, ownerAddress],
  }) as string;

  onPhase?.("sending");
  return ua.sendTransaction(
    transaction,
    signature,
    eip7702Authorizations.length > 0 ? eip7702Authorizations : undefined
  );
}
