import React, { useState, useEffect } from 'react';
import './App.css';
import PhaserGame from './PhaserGame';
import PreparationStage from './PreparationStage';
import RobotPlayingStage from './RobotPlayingStage';
import { setWalletData } from './walletData';
import devLoginDetails from './devlogin_details';
import { connectWallet, fetchNFTs } from './api'; // Funcții pentru MultiversX

function App() {
  const [isGameSetup, setIsGameSetup] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false); // Feedback pentru MultiversX
  const [errorMessage, setErrorMessage] = useState(''); // Feedback pentru erori
  const [showDevLogin, setShowDevLogin] = useState(false); // Modul DevLogin
  const [pemFile, setPemFile] = useState(null); // Stocăm fișierul PEM
  window.SHOW_DEV_LOGIN = 1;


  // Resetează datele wallet-ului
  const resetWallet = () => {
    setWalletData(null, []);
  };

  // === Funcții pentru MultiversX ===
  const handleMultiversXLogin = async (pemFile) => {
    setIsLoading(true);
    setErrorMessage('');
    try {
      if (!pemFile) {
        throw new Error('Fișierul PEM nu a fost selectat.');
      }
  
      const reader = new FileReader();
      reader.onload = async (e) => {
        const pemContent = e.target.result;
  
        // Conectăm wallet-ul
        const connectResponse = await connectWallet(pemContent);
        if (connectResponse.status === 'error') {
          throw new Error(connectResponse.message);
        }
  
        const walletAddress = connectResponse.walletAddress;
  
        // Verificăm NFT-urile
        const nftResponse = await fetchNFTs(walletAddress);
        if (!nftResponse.exists) {
          alert('Nu există NFT-uri în wallet. Se trece în Preparation Stage.');
          setIsGameSetup(true);
        } else {
          alert('Wallet-ul conține NFT-uri. Poți începe jocul.');
          setWalletData(walletAddress, nftResponse.nfts);
          setIsGameSetup(true);
        }
      };
  
      reader.onerror = () => {
        throw new Error('Eroare la citirea fișierului PEM.');
      };
  
      reader.readAsText(pemFile);
    } catch (error) {
      console.error('Eroare la logare:', error);
      setErrorMessage(`Eroare: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };
  
  

  // === Funcții pentru DevLogin ===
  const handleDevLogin = () => {
    setWalletData(devLoginDetails.wallet, devLoginDetails.cards); // Placeholder-uri
    alert('Te-ai logat ca dezvoltator!');
    setIsGameSetup(true); // Setup complet pentru modul DevLogin
  };

  // Gestionare DevLogin din URL (debugging)
  useEffect(() => {
    window.devlogin = () => setShowDevLogin(true);
    if (window.SHOW_DEV_LOGIN === 1) {
      setShowDevLogin(true);
    }
    return () => {
      delete window.devlogin;
    };
  }, []);

  // Delogare completă
  const handleLogout = () => {
    resetWallet();
    setIsGameSetup(false);
    setIsPlaying(false);
  };

  // === Jocul propriu-zis ===
  const handleRobotGame = () => {
    setIsPlaying(true);
  };

  if (isGameSetup && isPlaying) {
    return (
      <div className="App">
        <RobotPlayingStage onBack={() => setIsPlaying(false)} />
      </div>
    );
  }

  if (isGameSetup && !isPlaying) {
    return (
      <div className="App">
        <PhaserGame />
        <PreparationStage onRobotGame={handleRobotGame} onLogout={handleLogout} />
      </div>
    );
  }

  const handlePemFileSelected = (e) => {
    const file = e.target.files[0];
    if (!file) {
      setErrorMessage('Niciun fișier PEM nu a fost selectat.');
      return;
    }
  
    const reader = new FileReader();
    reader.onload = async (event) => {
      const pemContent = event.target.result;
      try {
        setIsLoading(true);
        const walletData = await connectWallet(pemContent); // Apelăm API-ul pentru conectare
        const nfts = await fetchNFTs(walletData.wallet); // Obținem NFT-urile din wallet
        setWalletData(walletData.wallet, nfts); // Salvăm wallet-ul și NFT-urile
        setIsGameSetup(true);
        alert('Conectare reușită la MultiversX!');
      } catch (error) {
        console.error('Eroare la conectarea cu MultiversX:', error);
        setErrorMessage('Eroare la conectarea cu MultiversX. Verificați fișierul PEM sau conexiunea de rețea.');
      } finally {
        setIsLoading(false);
      }
    };
  
    reader.onerror = () => {
      setErrorMessage('Eroare la citirea fișierului PEM.');
    };
  
    reader.readAsText(file); // Citim fișierul PEM
  };
  

  return (
    <div className="App">
      <div className="background-blur"></div>
      <PhaserGame />
      <header className="App-header">
        <h1>Bine ai venit la Foaie, Foarfecă, Ciocan & NFTx!</h1>
        <p>Loghează-te pentru a începe aventura!</p>

        <input
  type="file"
  accept=".pem"
  id="pem-file-input"
  style={{ display: 'none' }}
  onChange={(e) => handleMultiversXLogin(e.target.files[0])}
      />
<button
  onClick={() => document.getElementById('pem-file-input').click()}
  className="btn wallet-btn"
  disabled={isLoading}
>
  {isLoading ? 'Se conectează...' : 'Conectează Wallet-ul MultiversX'}
</button>
{errorMessage && <p className="error">{errorMessage}</p>}


        {errorMessage && <p className="error">{errorMessage}</p>}
        {showDevLogin && (
          <button onClick={handleDevLogin} className="btn dev-btn">
            DevLogin
          </button>
        )}
      </header>
    </div>
  );
}

export default App;





// import React, { useState, useEffect } from 'react';
// import './App.css';
// import PhaserGame from './PhaserGame';
// import PreparationStage from './PreparationStage';
// import RobotPlayingStage from './RobotPlayingStage';
// import { setWalletData } from './walletData';
// import devLoginDetails from './devlogin_details';
// import { connectWallet, fetchNFTs } from './api'; // Funcții pentru MultiversX

// function App() {
//   const [isGameSetup, setIsGameSetup] = useState(false);
//   const [isPlaying, setIsPlaying] = useState(false);
//   const [isLoading, setIsLoading] = useState(false); // Feedback pentru MultiversX
//   const [errorMessage, setErrorMessage] = useState(''); // Feedback pentru erori
//   const [showDevLogin, setShowDevLogin] = useState(false); // Modul DevLogin
//   const [pemFile, setPemFile] = useState(null); // Stocăm fișierul PEM
//   window.SHOW_DEV_LOGIN = 1;


//   // Resetează datele wallet-ului
//   const resetWallet = () => {
//     setWalletData(null, []);
//   };

//   // === Funcții pentru MultiversX ===
//   const handleMultiversXLogin = async (pemFile) => {
//     setIsLoading(true);
//     setErrorMessage('');
//     try {
//       if (!pemFile) {
//         throw new Error('Fișierul PEM nu a fost selectat.');
//       }
  
//       const reader = new FileReader();
//       reader.onload = async (e) => {
//         const pemContent = e.target.result;
  
//         // Conectăm wallet-ul
//         const connectResponse = await connectWallet(pemContent);
//         if (connectResponse.status === 'error') {
//           throw new Error(connectResponse.message);
//         }
  
//         const walletAddress = connectResponse.walletAddress;
  
//         // Verificăm NFT-urile
//         const nftResponse = await fetchNFTs(walletAddress);
//         if (!nftResponse.exists) {
//           alert('Nu există NFT-uri în wallet. Se trece în Preparation Stage.');
//           setIsGameSetup(true);
//         } else {
//           alert('Wallet-ul conține NFT-uri. Poți începe jocul.');
//           setWalletData(walletAddress, nftResponse.nfts);
//           setIsGameSetup(true);
//         }
//       };
  
//       reader.onerror = () => {
//         throw new Error('Eroare la citirea fișierului PEM.');
//       };
  
//       reader.readAsText(pemFile);
//     } catch (error) {
//       console.error('Eroare la logare:', error);
//       setErrorMessage(`Eroare: ${error.message}`);
//     } finally {
//       setIsLoading(false);
//     }
//   };
  
  

//   // === Funcții pentru DevLogin ===
//   const handleDevLogin = () => {
//     setWalletData(devLoginDetails.wallet, devLoginDetails.cards); // Placeholder-uri
//     alert('Te-ai logat ca dezvoltator!');
//     setIsGameSetup(true); // Setup complet pentru modul DevLogin
//   };

//   // Gestionare DevLogin din URL (debugging)
//   useEffect(() => {
//     window.devlogin = () => setShowDevLogin(true);
//     if (window.SHOW_DEV_LOGIN === 1) {
//       setShowDevLogin(true);
//     }
//     return () => {
//       delete window.devlogin;
//     };
//   }, []);

//   // Delogare completă
//   const handleLogout = () => {
//     resetWallet();
//     setIsGameSetup(false);
//     setIsPlaying(false);
//   };

//   // === Jocul propriu-zis ===
//   const handleRobotGame = () => {
//     setIsPlaying(true);
//   };

//   if (isGameSetup && isPlaying) {
//     return (
//       <div className="App">
//         <RobotPlayingStage onBack={() => setIsPlaying(false)} />
//       </div>
//     );
//   }

//   if (isGameSetup && !isPlaying) {
//     return (
//       <div className="App">
//         <PhaserGame />
//         <PreparationStage onRobotGame={handleRobotGame} onLogout={handleLogout} />
//       </div>
//     );
//   }

//   const handlePemFileSelected = (e) => {
//     const file = e.target.files[0];
//     if (!file) {
//       setErrorMessage('Niciun fișier PEM nu a fost selectat.');
//       return;
//     }
  
//     const reader = new FileReader();
//     reader.onload = async (event) => {
//       const pemContent = event.target.result;
//       try {
//         setIsLoading(true);
//         const walletData = await connectWallet(pemContent); // Apelăm API-ul pentru conectare
//         const nfts = await fetchNFTs(walletData.wallet); // Obținem NFT-urile din wallet
//         setWalletData(walletData.wallet, nfts); // Salvăm wallet-ul și NFT-urile
//         setIsGameSetup(true);
//         alert('Conectare reușită la MultiversX!');
//       } catch (error) {
//         console.error('Eroare la conectarea cu MultiversX:', error);
//         setErrorMessage('Eroare la conectarea cu MultiversX. Verificați fișierul PEM sau conexiunea de rețea.');
//       } finally {
//         setIsLoading(false);
//       }
//     };
  
//     reader.onerror = (error) => {
//       console.error('Eroare FileReader:', error);
//       setErrorMessage('Eroare la citirea fișierului PEM.');
//     };
  
//     reader.readAsText(file); // Citim fișierul PEM
//   };
  

//   return (
//     <div className="App">
//       <div className="background-blur"></div>
//       <PhaserGame />
//       <header className="App-header">
//         <h1>Bine ai venit la Foaie, Foarfecă, Ciocan & NFTx!</h1>
//         <p>Loghează-te pentru a începe aventura!</p>
//         <input
//   type="file"
//   accept=".pem"
//   id="pem-file-input"
//   style={{ display: 'none' }}
//   onChange={handlePemFileSelected} // Apelăm funcția corectă
//         />

// <button
//   onClick={() => document.getElementById('pem-file-input').click()}
//   className="btn wallet-btn"
//   disabled={isLoading}
//   >
//   {isLoading ? 'Se conectează...' : 'Conectează Wallet-ul MultiversX'}
//   </button>
// {errorMessage && <p className="error">{errorMessage}</p>}


//         {errorMessage && <p className="error">{errorMessage}</p>}
//         {showDevLogin && (
//           <button onClick={handleDevLogin} className="btn dev-btn">
//             DevLogin
//           </button>
//         )}
//       </header>
//     </div>
//   );
// }

// export default App;
