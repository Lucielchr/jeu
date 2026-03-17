import { Hub } from './hub.js';
import { Champignon1 } from './champignon1.js';
import { Champignon2 } from './champignon2.js';

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  parent: 'game-container', // Doit correspondre à l'ID dans ton HTML
  pixelArt: true,
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0 },
      debug: true // Affiche les box de collision en rose pour tester
    }
  },
  scene: [Hub, Champignon1, Champignon2]
};

new Phaser.Game(config);