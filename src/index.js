// Importation de toutes tes scènes (vérifie que les noms de fichiers correspondent)
import { Hub } from './Hub.js';
import { Champignon } from './Champignon.js';
import { Jungle } from './Jungle.js';
import { Demon } from './Demon.js';

const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    parent: 'mon-jeu', // <--- Ici, tu mets l'ID de la div que tu as créée
    pixelArt: true,
    physics: {
        default: 'arcade',
        arcade: { gravity: { y: 0 } }
    },
    scene: [Hub, Champignon, Jungle, Demon]
};

// Initialisation du jeu
const game = new Phaser.Game(config);