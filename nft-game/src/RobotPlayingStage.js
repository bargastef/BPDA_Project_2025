// src/RobotPlayingStage.js
import React from 'react';
import Phaser from 'phaser';
import RobotGameScene from './game/RobotGameScene';

function RobotPlayingStage({ onBack }) {
  React.useEffect(() => {
    const width = window.innerWidth;
    const height = window.innerHeight;

    const game = new Phaser.Game({
      type: Phaser.AUTO,
      parent: 'robot-playing-container',
      width,
      height,
      backgroundColor: '#222',
      scene: [RobotGameScene],
    });

    return () => {
      game.destroy(true);
    };
  }, []);

  return (
    <div style={{ position: 'relative' }}>
      <div id="robot-playing-container"></div>
      <button
        style={{
          position: 'absolute',
          top: '20px',
          right: '20px',
          zIndex: 9999,
          padding: '10px 20px',
        }}
        onClick={onBack}
      >
        Înapoi
      </button>
    </div>
  );
}

export default RobotPlayingStage;
