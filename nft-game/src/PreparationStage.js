// src/PreparationStage.js
import React, { useState, useEffect } from 'react';
import { getWalletData, setWalletData } from './walletData';
import { connectWallet, fetchNFTs, createNFTOnChain } from './api'; 
// ↑ asigură-te că ai un "createNFTOnChain(wallet, nftType)" în api.js care face POST la /api/create-nft

function PreparationStage({ onRobotGame, onLogout }) {
  const initialWalletData = getWalletData();
  const [wallet, setWallet] = useState(initialWalletData.wallet);
  const [pemContent, setPemContent] = useState('');

  // NFT-urile valabile (au #nftgame)
  const [validNFTs, setValidNFTs] = useState([]);
  // NFT-urile invalide (nu au #nftgame)
  const [invalidNFTs, setInvalidNFTs] = useState([]);
  // Balanța contului (eGLD)
  const [balance, setBalance] = useState(null);

  // Ce NFT-uri (din validNFTs) au fost selectate
  const [selectedNFTs, setSelectedNFTs] = useState([]);

  // Când se schimbă `wallet`, aducem NFT-urile și balanța
  useEffect(() => {
    if (wallet) {
      loadNFTs(wallet);
      fetchBalance(wallet);
    }
  }, [wallet]);

  // ===== CONECTARE WALLET PEM =====
  const handleConnectWallet = async () => {
    if (!pemContent.trim()) {
      alert('Conținutul PEM este gol. Introduceți un PEM valid.');
      return;
    }
    try {
      const result = await connectWallet(pemContent);
      if (!result.walletAddress) {
        throw new Error('Wallet-ul nu a putut fi conectat.');
      }
      setWallet(result.walletAddress);
      setWalletData(result.walletAddress, []);
      alert('Wallet conectat cu succes!');
      // Preluăm NFT-urile + balanța
      await loadNFTs(result.walletAddress);
      await fetchBalance(result.walletAddress);
    } catch (error) {
      console.error('Eroare la conectarea wallet-ului:', error);
      alert(`Eroare la conectarea wallet-ului: ${error.message || 'Necunoscută'}`);
    }
  };

  // ===== FUNCȚIE REFRESH NFTs =====
  const handleRefreshNFTs = async () => {
    if (!wallet) return;
    await loadNFTs(wallet);
  };

  // ===== OBTINERE NFT-URI =====
  async function loadNFTs(walletAddr) {
    try {
      const { nfts } = await fetchNFTs(walletAddr);
      if (!nfts) {
        setValidNFTs([]);
        setInvalidNFTs([]);
        return;
      }
      // Împărțim NFT-urile
      const valid = [];
      const invalid = [];
      nfts.forEach((nft) => {
        const { hasGameTag, type, score, win } = decodeMetadata(nft.attributes);
        if (hasGameTag) {
          valid.push({
            identifier: nft.identifier,
            name: nft.name,
            type,
            score,
            win,
            image: nft.url || 'https://via.placeholder.com/150'
          });
        } else {
          invalid.push({
            identifier: nft.identifier,
            name: nft.name,
            type,
            score,
            win,
            image: nft.url || 'https://via.placeholder.com/150'
          });
        }
      });
      setValidNFTs(valid);
      setInvalidNFTs(invalid);
    } catch (error) {
      console.error('Eroare la încărcarea NFT-urilor:', error);
      setValidNFTs([]);
      setInvalidNFTs([]);
    }
  }

  // ===== FETCH BALANCE (din devnet) =====
  async function fetchBalance(walletAddr) {
    try {
      const url = `https://devnet-api.multiversx.com/accounts/${walletAddr}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error('Nu pot obține balanța contului.');
      const data = await res.json();
      // Balanța e în WEI (1e18) => convertim la eGLD
      const rawBalance = parseFloat(data.balance || '0');
      const egld = rawBalance / 1e18;
      setBalance(egld.toFixed(4));
    } catch (error) {
      console.error('Eroare la fetchBalance:', error);
      setBalance('0.0000');
    }
  }

  // ===== DECODE METADATA =====
  function decodeMetadata(attributes) {
    if (!attributes) {
      return { hasGameTag: false, type: 'N/A', score: 'N/A', win: 'N/A' };
    }
    try {
      const decoded = atob(attributes); 
      const parts = decoded.split(';');
      const hasGameTag = parts.some(part => part.includes('#nftgame'));
      let type = 'N/A', score = 'N/A', win = 'N/A';
      parts.forEach((segment) => {
        if (segment.includes('type:')) {
          const val = segment.split(':')[1];
          if (val) type = val.trim();
        }
        if (segment.includes('score:')) {
          const val = segment.split(':')[1];
          if (val) score = val.trim();
        }
        if (segment.includes('win:')) {
          const val = segment.split(':')[1];
          if (val) win = val.trim();
        }
      });
      return { hasGameTag, type, score, win };
    } catch (error) {
      console.error('Eroare la decodarea metadata-ului:', error);
      return { hasGameTag: false, type: 'N/A', score: 'N/A', win: 'N/A' };
    }
  }

  // ===== CREATE NFT ON CHAIN =====
  // (tip poate fi: "piatra", "foarfeca", "hartie")
  const handleCreateNFT = async (tip) => {
    if (!wallet) {
      alert('Trebuie să te conectezi cu un wallet înainte de a crea NFT-uri.');
      return;
    }
    try {
      // Apelează backend-ul (POST /api/create-nft)
      const resp = await createNFTOnChain(wallet, tip);
      if (resp.status === 'success') {
        alert(`NFT de tip ${tip} creat cu succes!\n\n${resp.message}`);
        // Refresh la NFT-uri
        await loadNFTs(wallet);
      } else {
        alert(`Eroare la crearea NFT-ului: ${resp.message}`);
      }
    } catch (error) {
      console.error('Eroare la createNFTOnChain:', error);
      alert('A apărut o eroare la crearea NFT-ului.');
    }
  };

  // ===== SELECTARE / DESELECTARE NFT VALID =====
  const handleToggleNFT = (nft) => {
    const found = selectedNFTs.find(x => x.identifier === nft.identifier);
    if (found) {
      // Deselectăm
      setSelectedNFTs(selectedNFTs.filter(x => x.identifier !== nft.identifier));
    } else {
      // Selectăm
      setSelectedNFTs([...selectedNFTs, nft]);
    }
  };

  // Verificăm dacă user-ul are **minim un** NFT din fiecare tip (piatra, foarfeca, hartie)
  const userHasAll3TypesSelected = () => {
    const selectedTypes = new Set(selectedNFTs.map(x => x.type.toLowerCase()));
    return (
      selectedTypes.has('piatra') &&
      selectedTypes.has('foarfeca') &&
      selectedTypes.has('hartie')
    );
  };

  // ===== START JOC CU ROBOTUL =====
  const handleRobotGame = () => {
    if (!userHasAll3TypesSelected()) {
      alert('Pentru a începe jocul, trebuie să selectezi cel puțin un NFT din "piatra", "foarfeca" și "hartie".');
      return;
    }
    onRobotGame();
  };

  // ===== P2P (deocamdată inactiv) =====
  const handleP2PGame = () => {
    alert('Modul P2P nu este implementat încă.');
  };

  // ===== DELGARE =====
  const handleLogout = () => {
    onLogout();
  };

  // === AFIȘARE UI ===
  return (
    <div className="App">
      <div className="background-blur"></div>
      <header className="App-header-preparation">
        {!wallet ? (
          <>
            <h2>Conectează-te cu Wallet-ul tău MultiversX</h2>
            <textarea
              placeholder="Introduceți conținutul PEM"
              value={pemContent}
              onChange={(e) => setPemContent(e.target.value)}
              style={{ width: '80%', height: '100px', marginBottom: '10px' }}
            />
            <button onClick={handleConnectWallet} className="btn">
              Conectează Wallet-ul
            </button>
          </>
        ) : (
          <>
            <h1>Bun venit, {wallet}!</h1>
            <p>Balanța (devnet): <strong>{balance ?? '0.0000'}</strong> eGLD</p>

            <button onClick={handleRefreshNFTs} className="btn" style={{ marginBottom: '20px' }}>
              Reîmprospătează Lista NFT-urilor
            </button>

            {/* SECȚIUNE NFT-URI VALABILE */}
            <h2>NFT-uri Valabile (au #nftgame):</h2>
            <ul>
              {validNFTs.map((nft, i) => {
                const isSelected = !!selectedNFTs.find(x => x.identifier === nft.identifier);
                return (
                  <li key={nft.identifier} style={{ textAlign: 'left' }}>
                    <label style={{ cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleToggleNFT(nft)}
                      />
                      <img src={nft.image} alt={nft.name} width="80" height="80" style={{ margin: '0 10px' }} />
                      <strong>{nft.name}</strong> <br />
                      Tip: {nft.type}, Score: {nft.score}, Win: {nft.win}
                    </label>
                  </li>
                );
              })}
            </ul>

            {/* Butoane de creare NFT pe blockchain (ca exemplu) */}
            <h3>Generează NFT nou (direct pe blockchain):</h3>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
              <button className="btn" onClick={() => handleCreateNFT('piatra')}>Piatra</button>
              <button className="btn" onClick={() => handleCreateNFT('foarfeca')}>Foarfeca</button>
              <button className="btn" onClick={() => handleCreateNFT('hartie')}>Hartie</button>
            </div>

            {/* SECȚIUNE NFT-URI INVALIDE */}
            <h2>NFT-uri Invalide (nu au #nftgame):</h2>
            <ul>
              {invalidNFTs.map((nft, i) => (
                <li key={nft.identifier} style={{ textAlign: 'left' }}>
                  <img src={nft.image} alt={nft.name} width="80" height="80" style={{ margin: '0 10px' }} />
                  <strong>{nft.name}</strong> <br />
                  Tip: {nft.type}, Score: {nft.score}, Win: {nft.win}
                </li>
              ))}
            </ul>

            <div style={{ marginTop: '20px' }}>
              <button onClick={handleRobotGame} className="btn" style={{ marginRight: '10px' }}>
                Joc împotriva Robotului
              </button>
              <button onClick={handleP2PGame} className="btn" style={{ backgroundColor: 'grey' }}>
                Joc P2P (în lucru)
              </button>
            </div>

            <hr />
            <button onClick={handleLogout} className="btn" style={{ backgroundColor: '#d9534f' }}>
              Delogare
            </button>
          </>
        )}
      </header>
    </div>
  );
}

export default PreparationStage;
