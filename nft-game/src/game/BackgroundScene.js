//src/game/GameScene.js
import Phaser from 'phaser';

class GameScene extends Phaser.Scene {
  constructor() {
    super({ key: 'GameScene' });
  }

  preload() {
    this.load.image('rock', 'assets/images/rock.png');
    this.load.image('paper', 'assets/images/paper.png');
    this.load.image('scissors', 'assets/images/scissors.png');
  }

  create() {
    const elements = ['rock', 'paper', 'scissors'];

    for (let i = 0; i < 30; i++) {
      const x = Phaser.Math.Between(50, this.scale.width - 50);
      const y = Phaser.Math.Between(50, this.scale.height - 50);
      const type = Phaser.Math.RND.pick(elements);

      const sprite = this.add.sprite(x, y, type).setScale(0.1);
      sprite.setAlpha(1);

      this.tweens.add({
        targets: sprite,
        x: Phaser.Math.Between(50, this.scale.width - 50),
        y: Phaser.Math.Between(50, this.scale.height - 50),
        duration: 5000,
        ease: 'Sine.easeInOut',
        yoyo: true,
        repeat: -1,
      });
    }
  }
}

export default GameScene;
