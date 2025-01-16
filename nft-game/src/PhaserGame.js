//src/PhaserGame.js

import Phaser from 'phaser';
import React from 'react';
import BackgroundScene from './game/BackgroundScene';

class PhaserGame extends React.Component {
componentDidMount() {
  const width = window.innerWidth * 0.9; // 90% din lățimea ferestrei
  const height = window.innerHeight * 0.9; // 90% din înălțimea ferestrei

  this.game = new Phaser.Game({
    type: Phaser.AUTO,
    parent: 'phaser-container',
    width: width, // Dimensiuni calculate
    height: height, // Dimensiuni calculate
    transparent: true, // Fundal transparent
    scene: [BackgroundScene],
  });

  // Recalculează dimensiunile la redimensionarea ferestrei
  window.addEventListener('resize', this.handleResize);
}

handleResize = () => {
  const width = window.innerWidth * 0.9;
  const height = window.innerHeight * 0.9;

  if (this.game) {
    this.game.scale.resize(width, height);
  }
};

componentWillUnmount() {
  if (this.game) {
    this.game.destroy(true);
  }
  window.removeEventListener('resize', this.handleResize);
}

render() {
  return <div id="phaser-container" style={{ position: 'absolute', top: 0, left: 0, zIndex: -1 }}></div>;
}
}

export default PhaserGame;