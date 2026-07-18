"use client";

import { Magic } from "magic-sdk";
import { createContext, useContext, useEffect, useState, ReactNode } from "react";

type MagicContextType = {
  magic: Magic | null;
};

const MagicContext = createContext<MagicContextType>({ magic: null });

export const useMagic = () => useContext(MagicContext);

export function Providers({ children }: { children: ReactNode }) {
  const [magic, setMagic] = useState<Magic | null>(null);

  useEffect(() => {
    const key = process.env.NEXT_PUBLIC_MAGIC_API_KEY;
    if (!key) return;
    setMagic(
      new Magic(key, {
        network: {
          rpcUrl: "https://eth.llamarpc.com",
          chainId: 1,
        },
      })
    );
  }, []);

  return (
    <MagicContext.Provider value={{ magic }}>
      {children}
    </MagicContext.Provider>
  );
}
