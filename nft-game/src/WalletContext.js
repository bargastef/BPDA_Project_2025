import React, { createContext, useState } from 'react';
import { DappProvider } from '@multiversx/sdk-dapp/wrappers';
import { DappUI } from '@multiversx/sdk-dapp/UI';

export const WalletContext = createContext();

export const WalletProvider = ({ children }) => {
  const [walletAddress, setWalletAddress] = useState(null);

  const handleLogin = (address) => {
    setWalletAddress(address);
  };

  const handleLogout = () => {
    setWalletAddress(null);
  };

  return (
    <WalletContext.Provider value={{ walletAddress, handleLogin, handleLogout }}>
      <DappProvider
        environment="devnet" // Poți schimba în "testnet" sau "mainnet" dacă este cazul
        appName="Foaie, Foarfeca, Ciocan & NFTx"
      >
        {children}
      </DappProvider>
    </WalletContext.Provider>
  );
};
