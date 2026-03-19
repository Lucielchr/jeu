// --- IMPORTATIONS ---
// On importe chaque classe de scène depuis leurs fichiers respectifs pour que le jeu les connaisse
import { Hub } from './js/hub.js';
import { Champignon1 } from './js/champignon1.js';
import { Champignon2 } from './js/champignon2.js';
import { Jungle } from './js/jungle.js';
import { Demon } from './js/demon.js';

// --- CONFIGURATION DU JEU ---
// const : On crée une variable fixe qui contient tous les réglages de ton jeu Phaser
const config = {
    // type : Définit le mode de rendu (AUTO choisit WebGL si disponible, sinon Canvas)
    type: Phaser.AUTO,
    
    // Largeur et hauteur de la fenêtre de jeu (la partie visible à l'écran)
    width: 800,
    height: 600,
    
    // parent : L'ID de la balise <div> dans ton fichier index.html où le jeu va s'afficher
    parent: 'game-container', 
    
    // pixelArt : true permet de garder les images bien nettes (pas de flou) quand on les agrandit
    pixelArt: true,
    
    // physics : On définit le moteur physique du jeu
    physics: {
        // default : 'arcade' est le moteur le plus simple et rapide pour les jeux de plateforme
        default: 'arcade',
        arcade: {
            // gravity : On met la gravité globale à 0 ici, car on la définit souvent scène par scène
            gravity: { y: 0 },
            
            // debug : Si tu mets true, Phaser affichera des boîtes roses autour de Yoshi et des blocs
            // C'est super pratique pour voir si tes collisions fonctionnent bien !
            debug: false 
        }
    },
    
    // scene : La liste de toutes les scènes de ton jeu. 
    // La première de la liste (ici Hub) sera celle qui se lancera au démarrage.
    scene: [Hub, Champignon1, Champignon2, Jungle, Demon] 
};

// --- LANCEMENT ---
// Cette ligne crée officiellement l'instance du jeu avec la configuration ci-dessus
new Phaser.Game(config);
