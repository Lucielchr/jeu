import { Hub } from './js/hub.js';
import { Champignon1 } from './js/champignon1.js';
import { Champignon2 } from './js/champignon2.js';
import {Jungle} from './js/jungle.js';

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
    scene: [Hub, Champignon1, Champignon2, Jungle] // Ajoute tes scènes ici
};

new Phaser.Game(config);
