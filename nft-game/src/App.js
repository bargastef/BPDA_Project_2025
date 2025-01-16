//src/App.js

// src/App.js

import React, { useState, useEffect } from 'react';
import './App.css';
import PhaserGame from './PhaserGame';
import PreparationStage from './PreparationStage';
import RobotPlayingStage from './RobotPlayingStage';
import { setWalletData } from './walletData';
import devLoginDetails from './devlogin_details';

function App() {
  const [isGameSetup, setIsGameSetup] = useState(false);
  const [showDevLogin, setShowDevLogin] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  // Folosit doar pentru exemplu, ca să resetăm wallet-ul la delogare
  const resetWallet = () => {
    setWalletData(null, []);
  };

  window.SHOW_DEV_LOGIN = 0;

  // Funcție pentru DevLogin
  const handleDevLogin = () => {
    alert('Te-ai logat ca dezvoltator!');
    setWalletData(devLoginDetails.wallet, devLoginDetails.cards);
    setIsGameSetup(true);
  };

  // Funcție pentru MultiversX Login (simulare)
  const handleMultiversXLogin = () => {
    alert('Conectare cu MultiversX! (Neimplementată)');
    setWalletData('MultiversX_Wallet', [
      { name: 'NFT_1', score: 10, wins: 5, type: '01' },
      { name: 'NFT_2', score: 20, wins: 10, type: '02' },
    ]);
    setIsGameSetup(true);
  };

  useEffect(() => {
    window.devlogin = () => setShowDevLogin(true);

    if (window.SHOW_DEV_LOGIN === 1) {
      setShowDevLogin(true);
    }

    return () => {
      delete window.devlogin;
    };
  }, []);

  const handleLogout = () => {
    // Delogăm userul
    resetWallet();
    setIsGameSetup(false);
    setIsPlaying(false);
  };

  // Când dăm click pe "Joc împotriva robotului"
  const handleRobotGame = () => {
    setIsPlaying(true);
  };

  // Dacă suntem în modul de joc
  if (isGameSetup && isPlaying) {
    return (
      <div className="App">
        {/* Scoatem vechiul PhaserGame dacă nu mai vrei fundalul animat */}
        {/* <PhaserGame />  <- comentează dacă nu vrei fundal */}
        <RobotPlayingStage onBack={() => setIsPlaying(false)} />
      </div>
    );
  }
 // Dacă am făcut login, dar încă nu jucăm
 if (isGameSetup && !isPlaying) {
  return (
    <div className="App">
      {/* Păstrăm fundalul animat dacă vrei */}
      <PhaserGame />
      <PreparationStage onRobotGame={handleRobotGame} onLogout={handleLogout} />
    </div>
  );
}

  // Altfel, ecranul de Login
  return (
    <div className="App">
      <div className="background-blur"></div>
      <PhaserGame />
      <header className="App-header">
        <h1>Bine ai venit la Foaie, Foarfecă, Ciocan & NFTx!</h1>
        <p>Loghează-te pentru a începe aventura!</p>
        <button onClick={handleMultiversXLogin} className="btn wallet-btn">
          Conectează Wallet-ul MultiversX
        </button>
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





// import React, { useState } from 'react';
// import './App.css';
// import PhaserGame from './PhaserGame';

// function App() {
//   const [isDevLoggedIn, setIsDevLoggedIn] = useState(false);
//   const [isGameSetup, setIsGameSetup] = useState(false); // Adaugă starea pentru pagina de setup
//   const [wallet, setWallet] = useState(null); // Stochează valoarea portofelului

//   // Funcția pentru login fantomă
//   const handleDevLogin = () => {
//     alert('Te-ai logat ca dezvoltator!');
//     setIsDevLoggedIn(true);
//     setWallet('Dev_Wallet'); // Simulează valoarea portofelului
//     setIsGameSetup(true); // Trece la pagina de setup
//   };

//   // Atașează funcția `devlogin` la fereastra browserului
//   React.useEffect(() => {
//     window.devlogin = handleDevLogin;

//     // Cleanup pentru a elimina funcția la demontarea componentului
//     return () => {
//       delete window.devlogin;
//     };
//   }, []);

//   // Redirecționare către pagina de setup a jocului
//   if (isGameSetup) {
//     return (
//       <div className="App">
//         <header className="App-header">
//           <h1>Bun venit, {wallet}!</h1>
//           <p>Alege modul de joc pentru a începe:</p>
//           <button className="btn" onClick={() => alert('Joc împotriva unui robot selectat!')}>
//             Joc împotriva robotului
//           </button>
//           <button className="btn" onClick={() => alert('Joc împotriva unui alt jucător selectat!')}>
//             Joc împotriva unui alt jucător
//           </button>
//         </header>
//       </div>
//     );
//   }

//   return (
//     <div className="App">
//       <div className="background-blur"></div>
//       <PhaserGame />

//       {/* Caseta centrală */}
//       <header className="App-header">
//         <h1>Bine ai venit la Foaie, Foarfeca, Ciocan & NFTx!</h1>
//         <p>Loghează-te pentru a începe aventura!</p>
//         <button className="btn wallet-btn" disabled>
//           Conectează Wallet-ul MultiversX
//         </button>
//         {isDevLoggedIn && (
//           <div className="dev-login-message">
//             <h2>Bun venit, dezvoltatorule!</h2>
//             <p>Acesta este login-ul fantomă activat din consolă.</p>
//           </div>
//         )}
//       </header>
//     </div>
//   );
// }

// export default App;

//app.js