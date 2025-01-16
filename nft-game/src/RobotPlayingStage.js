// src/RobotPlayingStage.js
import React from 'react';
import Phaser from 'phaser';
import RobotGameScene from './game/RobotGameScene';

function RobotPlayingStage({ onBack, selectedNFTs }) {
  React.useEffect(() => {
    const width = window.innerWidth;
    const height = window.innerHeight;
    console.log('Received NFTs in RobotPlayingStage:', selectedNFTs); 

    const config = {
      type: Phaser.AUTO,
      parent: 'robot-playing-container',
      width,
      height,
      backgroundColor: '#222',
      scene: [RobotGameScene]
    };

    
    const game = new Phaser.Game({
      type: Phaser.AUTO,
      parent: 'robot-playing-container',
      width: 800,
      height: 600,
      backgroundColor: '#222',
      scene: [RobotGameScene],
    });
    console.log("Received NFTs in RobotPlayingStage:", selectedNFTs)

    // Trimitem NFT-urile selectate la scenă
    game.scene.start('RobotGameScene', { selectedNFTs });

    // Cleanup
    return () => {
      game.destroy(true);
    };
  }, [selectedNFTs]);

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
