import React, { createContext, useContext, useMemo } from 'react';
import { ConnectionProvider, WalletProvider as SolanaWalletProvider } from '@solana/wallet-adapter-react';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import { PhantomWalletAdapter, BackpackWalletAdapter } from '@solana/wallet-adapter-wallets';
import { clusterApiUrl } from '@solana/web3.js';

const WalletContext = createContext({});

export const WalletProvider = ({ children }) => {
  const endpoint = useMemo(() => clusterApiUrl('devnet'), []);
  const wallets = useMemo(() => [
    new PhantomWalletAdapter(),
    new BackpackWalletAdapter(),
  ], []);

  return (
    <ConnectionProvider endpoint={endpoint}>
      <SolanaWalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          {children}
        </WalletModalProvider>
      </SolanaWalletProvider>
    </ConnectionProvider>
  );
};

export const useWallet = () => useContext(WalletContext);
