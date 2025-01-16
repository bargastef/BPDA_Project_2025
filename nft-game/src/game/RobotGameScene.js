import Phaser from 'phaser';
import { getWalletData, setWalletData } from '../walletData';

/**
 * RobotGameScene:
 * - Afișează un sprite pentru fiecare card al jucătorului, centrat pe ecran (stil grilă).
 * - Când userul dă click pe un card, robotul alege random un tip -> determinăm câștigătorul.
 * - Actualizăm score / wins pe cardul jucătorului în walletData.
 */
export default class RobotGameScene extends Phaser.Scene {
  constructor() {
    super('RobotGameScene');
    this.playerCards = [];
  }

  preload() {
    // Încarcă aici imaginile asociate tipurilor:
    // "01" = Foarfecă, "02" = Piatra, "03" = Foaie
    this.load.image('scissors', 'assets/images/scissors.png'); // 01
    this.load.image('rock', 'assets/images/rock.png');         // 02
    this.load.image('paper', 'assets/images/paper.png');       // 03
  }

  create() {
    // Preluăm cardurile din memorie
    const { cards } = getWalletData();
    this.playerCards = cards;

    // Aranjăm sprite-urile într-o manieră cât de cât centrată
    // Exemplu simplu: un grid orizontal cu spațieri
    const centerX = this.cameras.main.width / 2;
    const centerY = this.cameras.main.height / 2;

    const totalCards = this.playerCards.length;
    const spacing = 150; // distanță între sprite-uri
    const startX = centerX - (spacing * (totalCards - 1)) / 2;
    const rowY = centerY; 

    this.playerCards.forEach((card, index) => {
      // stabilim textura sprite-ului în funcție de tip
      let texture = 'scissors'; // default
      if (card.type === '02') texture = 'rock';
      if (card.type === '03') texture = 'paper';

      const xPos = startX + index * spacing;
      const sprite = this.add.sprite(xPos, rowY, texture).setInteractive().setScale(0.35);

      // Adăugăm text sub sprite cu scorul și wins
      const textOffsetY = sprite.height * 0.35; // jumate din înălțime (scalată)
      const infoText = this.add.text(
        xPos - 50,
        rowY + textOffsetY,
        `Score: ${card.score} | Wins: ${card.wins}`,
        { fontSize: '16px', color: '#fff' }
      );
      
      // La click -> derulăm runda
      sprite.on('pointerdown', () => {
        this.handlePlayerChoice(card, infoText);
      });
    });

    // Text unde afișăm ultima acțiune
    this.resultText = this.add.text(20, 20, 'Alege un cartonaș!', {
      fontSize: '20px',
      color: '#ff0',
    });
  }

  getRobotChoice() {
    const choices = ['01', '02', '03'];
    const randIndex = Math.floor(Math.random() * choices.length);
    return choices[randIndex];
  }

  determineWinner(playerType, robotType) {
    if (playerType === robotType) return 'draw';
    // 01 (Foarfecă) bate 03 (Foaie)
    // 03 (Foaie) bate 02 (Piatra)
    // 02 (Piatra) bate 01 (Foarfecă)
    if (
      (playerType === '01' && robotType === '03') ||
      (playerType === '03' && robotType === '02') ||
      (playerType === '02' && robotType === '01')
    ) {
      return 'player';
    }
    return 'robot';
  }

  handlePlayerChoice(selectedCard, infoText) {
    const robotType = this.getRobotChoice();
    const winner = this.determineWinner(selectedCard.type, robotType);

    // Determinăm un text mai frumos pentru tip
    const typeToText = {
      '01': 'Foarfecă',
      '02': 'Piatra',
      '03': 'Foaie',
    };

    let message = `Tu: ${typeToText[selectedCard.type]} vs Robot: ${typeToText[robotType]} → `;

    if (winner === 'draw') {
      message += 'Remiză!';
    } else if (winner === 'player') {
      // +1 score, +1 win
      selectedCard.score++;
      selectedCard.wins++;
      message += 'Ai câștigat!';
    } else {
      // scor -1
      selectedCard.score--;
      message += 'Robotul a câștigat!';
    }

    this.resultText.setText(message);

    // Actualizăm textul info (Score, Wins) sub sprite
    infoText.setText(`Score: ${selectedCard.score} | Wins: ${selectedCard.wins}`);

    // Salvăm în walletData, să persiste
    const { wallet, cards } = getWalletData();
    // îl căutăm pe selectedCard în cards și îl actualizăm
    const updatedCards = cards.map((c) => (c.type === selectedCard.type && c.name === selectedCard.name ? selectedCard : c));
    setWalletData(wallet, updatedCards);
  }
}
