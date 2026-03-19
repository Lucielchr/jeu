// On exporte la classe Champignon2 pour qu'elle soit reconnue par le jeu
export class Champignon2 extends Phaser.Scene {
    constructor() {
        // super : Appelle le constructeur parent de Phaser et donne le nom 'Champignon2' à la scène
        super('Champignon2');
    }

    // preload : Chargement des images, sprites et données de la carte avant le début
    preload() {
        // spritesheet : Image contenant plusieurs cadres pour l'animation de Yoshi
        this.load.spritesheet('yoshi', 'src/asset/yoshi.png', {
            frameWidth: 248,
            frameHeight: 385
        });
        // Images simples pour les objets et décors
        this.load.image('tuyau', 'src/asset/tuyaux.png');
        this.load.image('bloc_img', 'src/asset/bloc.png');
        this.load.image('feu_img', 'src/asset/feu.png');
        this.load.image('coffre_img', 'src/asset/coffre_rouge.png');
        this.load.image('ciseaux_img', 'src/asset/Ciseaux.png');
        // tilemapTiledJSON : Chargement du fichier JSON créé avec le logiciel Tiled
        this.load.tilemapTiledJSON('map2', 'src/asset/map_lucie2.tmj');
        this.load.image('tuiles_img', 'src/asset/plat.png');
        this.load.image('fond_champignon', 'src/asset/champignon du fond .png');
    }

    // create : Configuration initiale de la scène au lancement
    create() {
        // Effet visuel de fondu noir vers l'image au début
        this.cameras.main.fadeIn(1000, 0, 0, 0);
        // On définit la gravité (poids) qui attire les objets vers le bas
        this.physics.world.gravity.y = 800;

        // --- GESTION DE LA CARTE (TILEMAP) ---
        // const : Crée une variable qui ne changera pas de valeur (fixe)
        const map = this.make.tilemap({ key: 'map2' });
        const tsPlat = map.addTilesetImage('plat', 'tuiles_img');
        const tsFond = map.addTilesetImage('champignon du fond ', 'fond_champignon');
        const allTilesets = [tsPlat, tsFond];

        // Création des couches (layers) de la carte dans l'ordre de profondeur
        map.createLayer('fond', allTilesets, 0, 0);
        map.createLayer('tiges des plateformes', allTilesets, 0, 0);
        const platRose = map.createLayer('champignon_rose', allTilesets, 0, 0);
        const platRouge = map.createLayer('champignon_rouge', allTilesets, 0, 0);
        const platBleu = map.createLayer('champignon_bleu', allTilesets, 0, 0);

        // setCollisionByProperty : Rend les tuiles solides si elles ont la propriété "estSolide" dans Tiled
        if (platRose) platRose.setCollisionByProperty({ estSolide: true });
        if (platRouge) platRouge.setCollisionByProperty({ estSolide: true });
        if (platBleu) platBleu.setCollisionByProperty({ estSolide: true });

        // spawnPoint : Coordonnées de départ du joueur (X=130, Y=70)
        this.spawnPoint = { x: 130, y: 70 };
        // sprite : Création de Yoshi avec de la physique (peut bouger et tomber)
        this.player = this.physics.add.sprite(this.spawnPoint.x, this.spawnPoint.y, 'yoshi');
        // setDisplaySize : On ajuste la taille visuelle de Yoshi
        // setCollideWorldBounds : Empêche Yoshi de sortir des limites du monde (murs invisibles)
        this.player.setDisplaySize(50, 70).setCollideWorldBounds(true);

        // --- DIRECTION PAR DEFAUT ---
        // Variable pour savoir si Yoshi regarde à gauche ou à droite (utile pour la direction du tir)
        this.derniereDirection = 'droite';

        // --- BLOCS SOLIDES À DÉTRUIRE ---
        // group : Crée un ensemble d'objets qu'on pourra gérer d'un coup (les blocs)
        this.blocks = this.physics.add.group();
        for (let i = 0; i < 5; i++) {
            // On crée 5 blocs empilés les uns sur les autres
            let b = this.blocks.create(1400, 280 - (i * 40), 'bloc_img');
            // setImmovable : Le bloc ne bouge pas quand on lui fonce dessus
            b.setDisplaySize(40, 40).setImmovable(true);
            // allowGravity = false : Le bloc reste en l'air (ne tombe pas avec la gravité)
            b.body.allowGravity = false;
        }
        // collider : Ajoute la collision physique entre Yoshi et le groupe de blocs
        this.physics.add.collider(this.player, this.blocks);

        // GESTION DES REBONDS SUR LES PLATEFORMES
        // player.body.blocked.down : On vérifie si Yoshi touche le sol avant de le faire sauter
        if (platBleu) {
            this.physics.add.collider(this.player, platBleu, () => {
                if (this.player.body.blocked.down) this.player.setVelocityY(-400);
            });
        }
        if (platRouge) {
            this.physics.add.collider(this.player, platRouge, () => {
                if (this.player.body.blocked.down) this.player.setVelocityY(-650);
            });
        }
        if (platRose) {
            this.physics.add.collider(this.player, platRose);
        }

        // staticImage : Image avec collision qui ne bouge jamais (tuyau de retour au plafond)
        // setFlipY(true) : On retourne l'image du tuyau verticalement (tête en bas)
        this.tuyauRetour = this.physics.add.staticImage(96, -20, 'tuyau').setFlipY(true);
        // updateFromGameObject : Met à jour la zone de collision après avoir retourné l'image
        this.tuyauRetour.body.updateFromGameObject();
        this.physics.add.collider(this.player, this.tuyauRetour);

        // Coffre et Ciseaux (cachés au début avec setVisible(false))
        this.coffre = this.physics.add.staticSprite(1440, 256, 'coffre_img').setDisplaySize(60, 60).setVisible(false);
        this.ciseaux = this.physics.add.staticSprite(1440, 200, 'ciseaux_img').setDisplaySize(40, 40).setVisible(false);
        this.hasCiseaux = false; // Variable (booléen) pour savoir si le joueur possède l'objet

        // Groupe pour les boules de feu (tirs)
        this.fireballs = this.physics.add.group();
        // addKey : On enregistre la touche 'A' pour pouvoir l'écouter
        this.keyA = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
        this.cursors = this.input.keyboard.createCursorKeys();

        // Collision tirs / blocs
        // (ball, block) => { ... } : Fonction fléchée qui détruit la balle et le bloc au contact
        this.physics.add.collider(this.fireballs, this.blocks, (ball, block) => {
            ball.destroy(); // Détruit la boule de feu
            block.destroy(); // Détruit le bloc touché
            // countActive : Si plus aucun bloc n'est présent dans le groupe, on montre le coffre
            if (this.blocks.countActive() === 0) this.coffre.setVisible(true);
        });

        // overlap : Détecte si Yoshi passe "sur" le coffre (sans être bloqué comme par un mur)
        this.physics.add.overlap(this.player, this.coffre, () => {
            if (this.coffre.visible && !this.hasCiseaux) this.ciseaux.setVisible(true);
        });
        
        // Ramassage des ciseaux
        this.physics.add.overlap(this.player, this.ciseaux, () => {
            if (this.ciseaux.visible) {
                this.ciseaux.destroy();
                this.hasCiseaux = true;
                this.cameras.main.flash(500, 255, 255, 255); // Flash blanc pour l'effet visuel
            }
        });

        // --- CONFIGURATION CAMERA ---
        // setBounds : Définit les limites de déplacement de la caméra (taille de la map)
        this.cameras.main.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
        // startFollow : La caméra suit Yoshi avec un petit effet de retard (0.08) pour la douceur
        this.cameras.main.startFollow(this.player, true, 0.08, 0.08);
        this.physics.world.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
        // setBoundsCollision : Active les murs à gauche, droite et haut, mais pas en bas (pour tomber)
        this.physics.world.setBoundsCollision(true, true, true, false);
        this.isExiting = false; // Variable pour éviter de lancer le changement de scène en boucle
    }

    // update : Boucle logique lancée 60 fois par seconde
    update() {
        if (this.isExiting) return; // Si on sort du niveau, on ignore les contrôles

        // --- MOUVEMENTS ET DETECTION DIRECTION ---
        if (this.cursors.left.isDown) {
            this.player.setVelocityX(-250);
            this.player.anims.play('anim_tourne_gauche', true);
            this.derniereDirection = 'gauche'; // On enregistre qu'il regarde à gauche
        } else if (this.cursors.right.isDown) {
            this.player.setVelocityX(250);
            this.player.anims.play('anim_tourne_droite', true);
            this.derniereDirection = 'droite'; // On enregistre qu'il regarde à droite
        } else {
            this.player.setVelocityX(0);
            this.player.anims.play('anim_face');
        }

        // Saut classique (uniquement si Yoshi touche le sol)
        if (this.cursors.up.isDown && this.player.body.blocked.down) {
            this.player.setVelocityY(-550);
        }

        // Tirer avec la touche A (JustDown = s'active une seule fois par pression)
        if (Phaser.Input.Keyboard.JustDown(this.keyA)) {
            this.lancerFeu();
        }

        // Sortie par le tuyau (Intersects : détection de contact entre les deux rectangles)
        if (Phaser.Geom.Intersects.RectangleToRectangle(this.player.getBounds(), this.tuyauRetour.getBounds())) {
            if (this.cursors.up.isDown) {
                if (this.hasCiseaux) {
                    this.isExiting = true; // Bloque la suite de l'update
                    this.cameras.main.fadeOut(1000, 0, 0, 0); // Fondu vers le noir
                    // once : Attend que le fondu soit fini pour changer de scène
                    this.cameras.main.once('camerafadeoutcomplete', () => {
                        this.scene.start('Champignon1', { questComplete: true });
                    });
                } else {
                    this.afficherBulleAlerte(this.cameras.main.centerX, 500, "Vous devez d'abord trouver la cisaille !");
                }
            }
        }

        // Si Yoshi tombe sous le bas de la carte, on le réinitialise
        if (this.player.y > this.physics.world.bounds.height + 50) {
            this.resetPlayer();
        }
    }

    // resetPlayer : Replace Yoshi au début après une chute
    resetPlayer() {
        this.cameras.main.flash(400, 200, 0, 0); // Flash rouge pour indiquer l'erreur
        this.player.setPosition(this.spawnPoint.x, this.spawnPoint.y);
        this.player.setVelocity(0, 0);
        this.player.anims.play('anim_face');
    }

    // lancerFeu : Logique pour créer et propulser une boule de feu
    lancerFeu() {
        // let vx : Calcule la vitesse X (600 ou -600) selon là où regarde Yoshi
        let vx = (this.derniereDirection === 'gauche') ? -600 : 600;

        // Création de la boule de feu dans le groupe fireballs
        let ball = this.fireballs.create(this.player.x, this.player.y, 'feu_img');
        ball.setDisplaySize(30, 30);
        ball.setVelocityX(vx); // Propulsion horizontale
        ball.body.allowGravity = false; // La boule de feu ne tombe pas par terre

        // delayedCall : On détruit la boule après 1.5 seconde pour économiser la mémoire
        this.time.delayedCall(1500, () => {
            if (ball.active) ball.destroy();
        });
    }

    // afficherBulleAlerte : Dessine une bulle de dialogue temporaire à l'écran
    afficherBulleAlerte(x, y, message) {
        if (this.alerteActive) return; // Empêche d'ouvrir plusieurs alertes
        this.alerteActive = true;

        // Création du texte
        let texte = this.add.text(0, 0, message, {
            fontSize: '20px',
            fill: '#000000',
            fontFamily: 'Arial'
        }).setDepth(102);

        // Outil de dessin pour le rectangle blanc
        let bg = this.add.graphics();
        bg.fillStyle(0xffffff, 1);
        bg.fillRoundedRect(
            x - (texte.width + 40) / 2,
            y - (texte.height + 20) / 2,
            texte.width + 40,
            texte.height + 20,
            10
        );
        bg.setDepth(101).setScrollFactor(0);

        texte.setPosition(x - texte.width / 2, y - texte.height / 2).setScrollFactor(0);

        // On détruit le texte et le fond après 2 secondes
        this.time.delayedCall(2000, () => {
            texte.destroy();
            bg.destroy();
            this.alerteActive = false;
        });
    }
}