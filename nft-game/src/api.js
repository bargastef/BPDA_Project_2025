//src/api.js
import axios from 'axios';

const API_BASE_URL = 'http://127.0.0.1:5000';

export const connectWallet = async (pemContent) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/api/connect-wallet`, { pem: pemContent });
    return response.data;
  } catch (error) {
    console.error('Eroare la conectarea wallet-ului:', error);
    throw error;
  }
};

export const fetchNFTs = async (wallet) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/api/verify-nft`, {
      params: { wallet },
    });
    return response.data;
  } catch (error) {
    console.error('Eroare la obținerea NFT-urilor:', error);
    throw error;
  }
};
