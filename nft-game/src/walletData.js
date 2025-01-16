//src/walletData.js
import { processCards } from './processCards';

let walletData = {
  wallet: null,
  cards: [],
};

export function setWalletData(wallet, cards) {
  walletData = {
    wallet,
    cards: processCards(cards), // Procesează cartonașele
  };
}

export function getWalletData() {
  return walletData;
}
