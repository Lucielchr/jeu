import { Hub } from './hub.js';
import { MapLucie } from './map_lucie.js';
import { MapLucie2 } from './map_lucie2.js';

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
    scene: [Hub]
};

new Phaser.Game(config);