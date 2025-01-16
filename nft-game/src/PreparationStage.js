// src/PreparationStage.js
import React, { useState, useEffect } from 'react';
import { getWalletData, setWalletData } from './walletData';
import devLoginDetails from './devlogin_details';

function PreparationStage({ onRobotGame, onLogout }) {
  const { wallet, cards } = getWalletData();

  // Verificăm ce tipuri lipsesc
  const [missingTypes, setMissingTypes] = useState([]);

  useEffect(() => {
    setMissingTypes(getMissingTypes(cards));
  }, [cards]);

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
      <header className="App-header-preparation">
        <h1>Bun venit, {wallet}!</h1>

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

        <hr />
        <button onClick={handleLogout} className="btn">
          Delogare
        </button>
      </header>
    </div>
  );
}

export default PreparationStage;
