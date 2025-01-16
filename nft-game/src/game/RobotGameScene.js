// src/game/RobotGameScene.js
import Phaser from 'phaser';
import { getWalletData, setWalletData } from '../walletData';
import { updateNFTOnChain } from '../api';

export default class RobotGameScene extends Phaser.Scene {
  constructor() {
    super('RobotGameScene');
    this.playerCards = [];
    this.roundCount = 0;
    this.maxRounds = 5;
  }

  init(data) {
    // (1) Preluăm NFT-urile trimise de RobotPlayingStage
    // data.selectedNFTs e array-ul de NFT-uri bifate de user
    this.playerCards = data.selectedNFTs || [];
    console.log('RobotGameScene - playerCards:', this.playerCards);
  }

  // ============================================
  // PRELOAD: încărcăm imaginile din NFT-urile selectate
  // ============================================
  preload() {
    // Iterăm toate NFT-urile și facem "load.image" cu un key unic
    this.playerCards.forEach((card, index) => {
      // card.image => link direct la imagine
      this.load.image(`nftImage-${index}`, card.image);
    });
  }

  // ============================================
  // CREATE: afișăm sprite pentru fiecare NFT
  // ============================================
  create() {
    console.log("playerCards:", this.playerCards)
    if (!this.playerCards || this.playerCards.length === 0) {
      // Dacă nu avem nimic, afișăm un mesaj
      this.add.text(100, 100, 'Niciun NFT selectat!', { fontSize: '24px', color: '#fff' });
      return;
    }

    const centerX = this.cameras.main.width / 2;
    const centerY = this.cameras.main.height / 2;
    const totalCards = this.playerCards.length;
    const spacing = 150;
    const startX = centerX - (spacing * (totalCards - 1)) / 2;
    const rowY = centerY;

    // Creăm câte un sprite pentru fiecare NFT
    this.playerCards.forEach((card, index) => {
      // key-ul imaginii încărcate în preload e `nftImage-${index}`
      const textureKey = `nftImage-${index}`;

      const xPos = startX + index * spacing;
      const sprite = this.add
        .sprite(xPos, rowY, textureKey)
        .setInteractive()
        .setScale(0.5); // scale up/down cum vrei

      // Mic text sub sprite
      const textOffsetY = sprite.height * 0.5; 
      const infoText = this.add.text(
        xPos - 50,
        rowY + textOffsetY + 10,
        `Score: ${card.score} | Win: ${card.win}`,
        { fontSize: '16px', color: '#fff' }
      );

      // La click -> facem runda
      sprite.on('pointerdown', () => {
        this.handlePlayerChoice(card, infoText);
      });
    });

    // Text cu runda
    this.resultText = this.add.text(20, 20, 'Alege un NFT pentru runda 1!', {
      fontSize: '20px',
      color: '#ff0',
    });

    // Buton Update NFT (ascuns inițial)
    this.updateButton = this.add.text(20, 60, 'Update NFT', {
      fontSize: '20px',
      color: '#0f0',
      backgroundColor: '#333',
      padding: { x: 10, y: 5 },
    })
      .setInteractive()
      .setVisible(false);

    this.updateButton.on('pointerdown', () => {
      this.handleUpdateNFT();
    });
  }

  // Robotul alege random: piatra / foarfeca / hartie
  getRobotChoice() {
    const choices = ['piatra', 'foarfeca', 'hartie'];
    const randIndex = Math.floor(Math.random() * choices.length);
    return choices[randIndex];
  }

  // Determinăm câștigător
  determineWinner(playerType, robotType) {
    const p = playerType.toLowerCase();
    const r = robotType.toLowerCase();
    if (p === r) return 'draw';
    // Reguli:
    //   foarfeca bate hartie
    //   hartie bate piatra
    //   piatra bate foarfeca
    if ((p === 'foarfeca' && r === 'hartie') ||
        (p === 'hartie' && r === 'piatra') ||
        (p === 'piatra' && r === 'foarfeca')) {
      return 'player';
    }
    return 'robot';
  }

  handlePlayerChoice(selectedCard, infoText) {
    if (this.roundCount >= this.maxRounds) {
      return;
    }

    const robotPick = this.getRobotChoice();
    const winner = this.determineWinner(selectedCard.type, robotPick);

    let message = `Runda ${this.roundCount + 1} → `;
    message += `Tu: ${selectedCard.type} vs Robot: ${robotPick} => `;

    if (winner === 'draw') {
      message += 'Remiză!';
    } else if (winner === 'player') {
      selectedCard.score = parseInt(selectedCard.score, 10) + 1;
      selectedCard.win = parseInt(selectedCard.win, 10) + 1;
      message += 'Ai câștigat!';
    } else {
      selectedCard.score = parseInt(selectedCard.score, 10) - 1;
      message += 'Robotul a câștigat!';
    }

    infoText.setText(`Score: ${selectedCard.score} | Win: ${selectedCard.win}`);

    this.roundCount++;
    this.resultText.setText(message);

    if (this.roundCount >= this.maxRounds) {
      this.resultText.setText(`${message}\nJoc încheiat după 5 runde!`);
      this.updateButton.setVisible(true);
      // Poți dezactiva sprite-urile, ex.:
      // this.input.enabled = false;
    }
  }

  async handleUpdateNFT() {
    this.resultText.setText('Se face update on-chain...');
    const { wallet, cards } = getWalletData();

    // Facem update la TOT ce e în this.playerCards
    for (let card of this.playerCards) {
      try {
        const resp = await updateNFTOnChain(card.identifier, card.score, card.win);
        if (resp.status === 'success') {
          console.log(`Update reușit pentru ${card.identifier}`);
        } else {
          console.warn('Eroare update NFT on-chain:', resp);
        }
      } catch (err) {
        console.error('Exception la updateNFTOnChain:', err);
      }
    }

    this.resultText.setText('Update complet! Poți închide jocul.');
    this.updateButton.setVisible(false);

    // Salvăm local scorurile noi
    const updatedCards = cards.map((c) => {
      const found = this.playerCards.find(x => x.identifier === c.identifier);
      return found || c;
    });
    setWalletData(wallet, updatedCards);
  }
}
