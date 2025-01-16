// src/api.js
import axios from 'axios';

// Adresa completă către serverul Flask
const BASE_URL = 'http://localhost:5000/api'; 
// Sau, dacă e pe alt IP: `http://172.25.130.5:5000/api`

export async function connectWallet(pemContent) {
  const response = await axios.post(`${BASE_URL}/connect-wallet`, {
    pem: pemContent,
  });
  return response.data;
}

export async function fetchNFTs(walletAddress) {
  const response = await axios.get(`${BASE_URL}/verify-nft`, {
    params: { wallet: walletAddress },
  });
  return response.data;
}

export async function createNFTOnChain(walletAddress, nftType) {
  const response = await axios.post(`${BASE_URL}/create-nft`, {
    wallet: walletAddress,
    type: nftType,
  });
  return response.data;
}



/** Noua funcție care trimite un POST la /api/update-nft-score */
export async function updateNFTOnChain(identifier, score, win) {
  const response = await axios.post(`${BASE_URL}/update-nft-score`, {
    identifier,
    score,
    win
  });
  return response.data;
}