// src/PreparationStage.js
import React, { useState, useEffect } from 'react';
import { getWalletData, setWalletData } from './walletData';
import devLoginDetails from './devlogin_details';
import { connectWallet, fetchNFTs } from './api'; // Funcții din API-ul nostru


function PreparationStage({ onRobotGame, onLogout }) {
  const initialWalletData = getWalletData();
  const [wallet, setWallet] = useState(initialWalletData.wallet); // Nou state pentru wallet
  const { cards } = initialWalletData;
  const [pemContent, setPemContent] = useState(''); // Pentru conținutul PEM
  const [nfts, setNFTs] = useState([]); // Lista de NFT-uri obținute
  const [missingTypes, setMissingTypes] = useState([]); // Verificăm ce tipuri lipsesc

  useEffect(() => {
    setMissingTypes(getMissingTypes(cards));
  }, [cards]);
  const handleConnectWallet = async () => {
    if (!pemContent.trim()) {
      alert('Conținutul PEM este gol. Introduceți un PEM valid.');
      return;
    }
  
    try {
      const result = await connectWallet(pemContent); // Apelăm API-ul pentru conectare
      if (!result.walletAddress) {
        throw new Error('Wallet-ul nu a putut fi conectat.');
      }
      setWallet(result.walletAddress); // Actualizăm wallet-ul local
      setWalletData(result.walletAddress, cards); // Sincronizăm cu structura globală
      alert('Wallet conectat cu succes!');
    } catch (error) {
      console.error('Eroare la conectarea wallet-ului:', error);
      alert(`Eroare la conectarea wallet-ului: ${error.message || 'Necunoscută'}`);
    }
  };
  

  const handleFetchNFTs = async () => {
    if (!wallet) {
      alert('Wallet-ul nu este conectat. Conectează-te mai întâi.');
      return;
    }
  
    try {
      const result = await fetchNFTs(wallet); // Obținem NFT-urile din API
      if (!result || !result.nfts) {
        throw new Error('Nu s-au găsit NFT-uri în wallet.');
      }
      setNFTs(result.nfts || []);
      alert('NFT-urile au fost afișate cu succes!');
    } catch (error) {
      console.error('Eroare la obținerea NFT-urilor:', error);
      alert(`Eroare la obținerea NFT-urilor: ${error.message || 'Necunoscută'}`);
    }
  };
  

  // Funcție care returnează tipurile lipsă (01, 02, 03)
  function getMissingTypes(myCards) {
    const typesSet = new Set(myCards.map((c) => c.type));
    const needed = [];
    if (!typesSet.has('01')) needed.push('01');
    if (!typesSet.has('02')) needed.push('02');
    if (!typesSet.has('03')) needed.push('03');
    return needed;
  }

  // Generează cardurile lipsă
  const handleGenerateMissingTypes = () => {
    // 1) Generează noi carduri lipsă
    const updatedCards = [...cards];
    missingTypes.forEach((type) => {
      updatedCards.push(generateCard(type));
    });
    // 2) Salvează în walletData
    setWalletData(wallet, updatedCards);

    // 3) Dacă e user de devlogin, simulăm și actualizarea în devLoginDetails
    if (wallet === devLoginDetails.wallet) {
      devLoginDetails.addMissingTypes(missingTypes);
    }

    // 4) Recalculează ce mai lipsește
    setMissingTypes(getMissingTypes(updatedCards));
  };

  // Funcție helper care crează un card nou, similar cu `devLoginDetails.generateCard`
  const generateCard = (type) => {
    let name = '';
    switch (type) {
      case '01':
        name = 'Foarfecă';
        break;
      case '02':
        name = 'Piatra';
        break;
      case '03':
        name = 'Foaie';
        break;
      default:
        name = 'Necunoscut';
    }
    return { name, score: 0, wins: 0, type };
  };

  const handleRobotGame = () => {
    onRobotGame();
  };

  const handleHumanGame = () => {
    alert('Joc împotriva unui alt jucător selectat! (Neimplementat)');
  };

  const handleLogout = () => {
    onLogout();
  };

  

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
            <>
          <button onClick={handleFetchNFTs} className="btn">
            Afișează NFT-urile
          </button>
          <h2>Lista NFT-urilor:</h2>
          {nfts.length > 0 ? (
            <ul>
              {nfts.map((nft, index) => (
                <li key={index}>
                  {nft.name} - Tip: {nft.type} - Scor: {nft.score} - Winuri: {nft.wins}
                </li>
              ))}
            </ul>
          ) : (
            <p>Nu s-au găsit NFT-uri sau wallet-ul nu conține NFT-uri disponibile.</p>
          )}
        </>
  
            <h2>Cartonașele tale:</h2>
            <ul>
              {cards.map((card, index) => (
                <li key={index}>
                  {card.name} - Scor: {card.score}, Winuri: {card.wins}, Tip: {card.type}
                </li>
              ))}
            </ul>
  
            {missingTypes.length > 0 ? (
              <div style={{ margin: '20px' }}>
                <p>Îți lipsesc următoarele tipuri de carduri: {missingTypes.join(', ')}</p>
                <button onClick={handleGenerateMissingTypes} className="btn">
                  Generează cardurile lipsă
                </button>
              </div>
            ) : (
              <>
                <p>Alege modul de joc:</p>
                <button onClick={handleRobotGame} className="btn">
                  Joc împotriva unui robot
                </button>
                <button onClick={handleHumanGame} className="btn">
                  Joc împotriva unui alt jucător
                </button>
              </>
            )}
          </>
        )}
  
        <hr />
        <button onClick={handleLogout} className="btn">
          Delogare
        </button>
      </header>
    </div>
    
  );
  
  
}




export default PreparationStage;
