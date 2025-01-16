// // src/PreparationStage.js

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
  const [validNFTs, setValidNFTs] = useState([]); // NFT-uri valabile
  const [invalidNFTs, setInvalidNFTs] = useState([]); // NFT-uri invalide
  const [missingTypes, setMissingTypes] = useState([]); // Verificăm ce tipuri lipsesc

  useEffect(() => {
    // Când se modifică `wallet`, verificăm și luăm NFT-urile
    if (!wallet) return;

    // Apelează funcția care ia NFT-urile
    handleFetchNFTs(wallet).then(({ validNFTs, invalidNFTs }) => {
      setValidNFTs(validNFTs);
      setInvalidNFTs(invalidNFTs);
    });
  }, [wallet]);


  // Funcție pentru conectarea wallet-ului cu MultiversX
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
      handleFetchNFTs(result.walletAddress);
    } catch (error) {
      console.error('Eroare la conectarea wallet-ului:', error);
      alert(`Eroare la conectarea wallet-ului: ${error.message || 'Necunoscută'}`);
    }
  };

  // Funcție pentru obținerea NFT-urilor și validarea lor
  async function handleFetchNFTs(walletAddress) {
    try {
      // Presupunem că fetchNFTs(walletAddress) returnează { nfts: [...] }
      const result = await fetchNFTs(walletAddress);
      if (!result || !result.nfts) {
        throw new Error('Nu s-au găsit NFT-uri în wallet.');
      }
  
      const valid = [];
      const invalid = [];
  
      // Trecem prin toate NFT-urile
      result.nfts.forEach((nft) => {
        // Decodăm metadata
        const { hasGameTag, type, score, win } = decodeMetadata(nft.attributes);
  
        // Verificăm dacă are #nftgame
        if (hasGameTag) {
          valid.push({
            name: nft.name,
            type,
            score,
            win,
            image: nft.url || 'https://via.placeholder.com/150'
          });
        } else {
          invalid.push({
            name: nft.name,
            type,
            score,
            win,
            image: nft.url || 'https://via.placeholder.com/150'
          });
        }
      });
  
      return { validNFTs: valid, invalidNFTs: invalid };
    } catch (error) {
      console.error('Eroare la fetch-ul NFT-urilor:', error);
      // Returnăm niște liste goale, astfel încât aplicația să nu crape
      return { validNFTs: [], invalidNFTs: [] };
    }
  }
  
  
// Funcție pentru decodarea metadata-ului
function decodeMetadata(attributes) {
  try {
    if (!attributes) {
      return { hasGameTag: false, type: 'N/A', score: 'N/A', win: 'N/A' };
    }
    // Decodăm din Base64
    const decoded = atob(attributes); 
    // Ex: "#nftgame;type:foarfeca;score:10;win:2" 
    // sau  "ESDTNFTUpdateAttributes@GAMEKY-6864c9@@type:piatra;score:21"

    // Segmentăm la ';' - e posibil să nu fie perfect pentru toate cazurile,
    // dar de obicei se folosește semn de separare
    const parts = decoded.split(';');

    // Verificăm dacă oricare dintre segmente conține "#nftgame"
    const hasGameTag = parts.some(part => part.includes('#nftgame'));

    let type = 'N/A';
    let score = 'N/A';
    let win = 'N/A';

    // Parcurgem fiecare segment să căutăm "type:", "score:", "win:"
    parts.forEach((segment) => {
      if (segment.includes('type:')) {
        // ex: "type:foarfeca" => ["type","foarfeca"]
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
    // Returnăm un set de valori neutre, să nu stricăm restul fluxului
    return { hasGameTag: false, type: 'N/A', score: 'N/A', win: 'N/A' };
  }
}


  // Funcție care returnează tipurile lipsă (01, 02, 03)
  const getMissingTypes = (myCards) => {
    const typesSet = new Set(myCards.map((c) => c.type));
    const needed = [];
    if (!typesSet.has('01')) needed.push('01');
    if (!typesSet.has('02')) needed.push('02');
    if (!typesSet.has('03')) needed.push('03');
    return needed;
  };

  // Generează cardurile lipsă
  const handleGenerateMissingTypes = () => {
    const updatedCards = [...cards];
    missingTypes.forEach((type) => {
      updatedCards.push(generateCard(type));
    });
    setWalletData(wallet, updatedCards);
    setMissingTypes(getMissingTypes(updatedCards));
  };

  // Funcție helper care crează un card nou
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

            <h2>NFT-uri Valabile (au #nftgame):</h2>
      <ul>
        {validNFTs.map((nft, i) => (
          <li key={i}>
            <img src={nft.image} alt={nft.name} width="100" height="100" />
            <p>{nft.name} - Type: {nft.type}, Score: {nft.score}, Win: {nft.win}</p>
          </li>
        ))}
      </ul>

      <h2>NFT-uri Invalide (nu au #nftgame):</h2>
      <ul>
        {invalidNFTs.map((nft, i) => (
          <li key={i}>
            <img src={nft.image} alt={nft.name} width="100" height="100" />
            <p>{nft.name} - Type: {nft.type}, Score: {nft.score}, Win: {nft.win}</p>
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
// import React, { useState, useEffect } from 'react';
// import { getWalletData, setWalletData } from './walletData';
// import devLoginDetails from './devlogin_details';
// import { connectWallet, fetchNFTs } from './api'; // Funcții din API-ul nostru


// function PreparationStage({ onRobotGame, onLogout }) {
//   const initialWalletData = getWalletData();
//   const [wallet, setWallet] = useState(initialWalletData.wallet); // Nou state pentru wallet
//   const { cards } = initialWalletData;
//   const [pemContent, setPemContent] = useState(''); // Pentru conținutul PEM
//   const [nfts, setNFTs] = useState([]); // Lista de NFT-uri obținute
//   const [missingTypes, setMissingTypes] = useState([]); // Verificăm ce tipuri lipsesc

//   useEffect(() => {
//     setMissingTypes(getMissingTypes(cards));
//   }, [cards]);
//   const handleConnectWallet = async () => {
//     if (!pemContent.trim()) {
//       alert('Conținutul PEM este gol. Introduceți un PEM valid.');
//       return;
//     }
  
//     try {
//       const result = await connectWallet(pemContent); // Apelăm API-ul pentru conectare
//       if (!result.walletAddress) {
//         throw new Error('Wallet-ul nu a putut fi conectat.');
//       }
//       setWallet(result.walletAddress); // Actualizăm wallet-ul local
//       setWalletData(result.walletAddress, cards); // Sincronizăm cu structura globală
//       alert('Wallet conectat cu succes!');
//     } catch (error) {
//       console.error('Eroare la conectarea wallet-ului:', error);
//       alert(`Eroare la conectarea wallet-ului: ${error.message || 'Necunoscută'}`);
//     }
//   };
  

//   const handleFetchNFTs = async () => {
//     if (!wallet) {
//       alert('Wallet-ul nu este conectat. Conectează-te mai întâi.');
//       return;
//     }
  
//     try {
//       const result = await fetchNFTs(wallet); // Obținem NFT-urile din API
//       if (!result || !result.nfts) {
//         throw new Error('Nu s-au găsit NFT-uri în wallet.');
//       }
//       setNFTs(result.nfts || []);
//       alert('NFT-urile au fost afișate cu succes!');
//     } catch (error) {
//       console.error('Eroare la obținerea NFT-urilor:', error);
//       alert(`Eroare la obținerea NFT-urilor: ${error.message || 'Necunoscută'}`);
//     }
//   };
  

//   // Funcție care returnează tipurile lipsă (01, 02, 03)
//   function getMissingTypes(myCards) {
//     const typesSet = new Set(myCards.map((c) => c.type));
//     const needed = [];
//     if (!typesSet.has('01')) needed.push('01');
//     if (!typesSet.has('02')) needed.push('02');
//     if (!typesSet.has('03')) needed.push('03');
//     return needed;
//   }

//   // Generează cardurile lipsă
//   const handleGenerateMissingTypes = () => {
//     // 1) Generează noi carduri lipsă
//     const updatedCards = [...cards];
//     missingTypes.forEach((type) => {
//       updatedCards.push(generateCard(type));
//     });
//     // 2) Salvează în walletData
//     setWalletData(wallet, updatedCards);

//     // 3) Dacă e user de devlogin, simulăm și actualizarea în devLoginDetails
//     if (wallet === devLoginDetails.wallet) {
//       devLoginDetails.addMissingTypes(missingTypes);
//     }

//     // 4) Recalculează ce mai lipsește
//     setMissingTypes(getMissingTypes(updatedCards));
//   };

//   // Funcție helper care crează un card nou, similar cu `devLoginDetails.generateCard`
//   const generateCard = (type) => {
//     let name = '';
//     switch (type) {
//       case '01':
//         name = 'Foarfecă';
//         break;
//       case '02':
//         name = 'Piatra';
//         break;
//       case '03':
//         name = 'Foaie';
//         break;
//       default:
//         name = 'Necunoscut';
//     }
//     return { name, score: 0, wins: 0, type };
//   };

//   const handleRobotGame = () => {
//     onRobotGame();
//   };

//   const handleHumanGame = () => {
//     alert('Joc împotriva unui alt jucător selectat! (Neimplementat)');
//   };

//   const handleLogout = () => {
//     onLogout();
//   };

  

//   return (
    
//     <div className="App">
//       <div className="background-blur"></div>
//       <header className="App-header-preparation">
//         {!wallet ? (
//           <>
//             <h2>Conectează-te cu Wallet-ul tău MultiversX</h2>
//             <textarea
//               placeholder="Introduceți conținutul PEM"
//               value={pemContent}
//               onChange={(e) => setPemContent(e.target.value)}
//               style={{ width: '80%', height: '100px', marginBottom: '10px' }}
//             />
//             <button onClick={handleConnectWallet} className="btn">
//               Conectează Wallet-ul
//             </button>
//           </>
//         ) : (
//           <>
//             <h1>Bun venit, {wallet}!</h1>
//             <>
//           <button onClick={handleFetchNFTs} className="btn">
//             Afișează NFT-urile
//           </button>
//           <h2>Lista NFT-urilor:</h2>
//           {nfts.length > 0 ? (
//             <ul>
//               {nfts.map((nft, index) => (
//                 <li key={index}>
//                   {nft.name} - Tip: {nft.type} - Scor: {nft.score} - Winuri: {nft.wins}
//                 </li>
//               ))}
//             </ul>
//           ) : (
//             <p>Nu s-au găsit NFT-uri sau wallet-ul nu conține NFT-uri disponibile.</p>
//           )}
//         </>
  
//             <h2>Cartonașele tale:</h2>
//             <ul>
//               {cards.map((card, index) => (
//                 <li key={index}>
//                   {card.name} - Scor: {card.score}, Winuri: {card.wins}, Tip: {card.type}
//                 </li>
//               ))}
//             </ul>
  
//             {missingTypes.length > 0 ? (
//               <div style={{ margin: '20px' }}>
//                 <p>Îți lipsesc următoarele tipuri de carduri: {missingTypes.join(', ')}</p>
//                 <button onClick={handleGenerateMissingTypes} className="btn">
//                   Generează cardurile lipsă
//                 </button>
//               </div>
//             ) : (
//               <>
//                 <p>Alege modul de joc:</p>
//                 <button onClick={handleRobotGame} className="btn">
//                   Joc împotriva unui robot
//                 </button>
//                 <button onClick={handleHumanGame} className="btn">
//                   Joc împotriva unui alt jucător
//                 </button>
//               </>
//             )}
//           </>
//         )}
  
//         <hr />
//         <button onClick={handleLogout} className="btn">
//           Delogare
//         </button>
//       </header>
//     </div>
    
//   );
  
  
// }




// export default PreparationStage;
