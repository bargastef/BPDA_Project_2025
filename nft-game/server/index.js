// server/index.js
const express = require('express');
const { ProxyNetworkProvider } = require('@multiversx/sdk-network-providers');
const { Address, ContractFunction } = require('@multiversx/sdk-core');

const app = express();
app.use(express.json());

// Configurarea providerului pentru devnet
const provider = new ProxyNetworkProvider('https://devnet-gateway.multiversx.com');

// Endpoint de test
app.get('/', (req, res) => {
  res.send('Server pentru NFT Game este pornit...');
});

// Exemplu de endpoint pentru a obține date de la un contract
app.get('/getDataFromContract', async (req, res) => {
  try {
    const contractAddress = new Address('adresa-contractului-tau'); // Înlocuiește cu adresa contractului tău
    const data = await provider.queryContract(
      contractAddress,
      new ContractFunction('getSomething'), // Înlocuiește cu funcția ta
      []
    );
    res.json({ result: data.returnData });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// Exemplu de endpoint pentru a minta un NFT
app.post('/mintNFT', async (req, res) => {
  try {
    const { userAddress, tokenURI } = req.body;

    // Logică de mintare a NFT-ului
    // Aici va trebui să interacționezi cu smart contract-ul tău pentru a minta NFT-ul

    res.json({ message: 'NFT mintat cu succes!' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Serverul rulează pe portul ${PORT}`);
});
