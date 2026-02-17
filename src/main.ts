import Phaser from 'phaser';
import { GameScene } from './scenes/GameScene';

console.log("main.ts: Starting Phaser...");

const config: Phaser.Types.Core.GameConfig = {
    type: Phaser.AUTO, // Use AUTO for best performance/compatibility
    width: 1024,
    height: 576,
    parent: 'game',
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
    },
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 1000, x: 0 },
            debug: false
        }
    },
    scene: [GameScene],
    callbacks: {
        postBoot: function () {
            console.log("Phaser: Booted successfully");
        }
    }
};

new Phaser.Game(config);
