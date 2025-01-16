// src/api.js
import axios from 'axios';

const API_BASE_URL = 'http://localhost:3001'; // Asigură-te că backend-ul rulează pe acest port

export const getDataFromContract = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/getDataFromContract`);
    return response.data;
  } catch (error) {
    console.error('Eroare la obținerea datelor de la contract:', error);
    throw error;
  }
};

export const mintNFT = async (userAddress, tokenURI) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/mintNFT`, { userAddress, tokenURI });
    return response.data;
  } catch (error) {
    console.error('Eroare la mintarea NFT-ului:', error);
    throw error;
  }
};
