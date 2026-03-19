// On exporte la classe pour qu'elle soit utilisable dans d'autres fichiers (comme ton index.js)
export class Champignon1 extends Phaser.Scene {
    constructor() {
        // super('Champignon1') : Appelle les fonctionnalités de base des scènes Phaser et nomme celle-ci
        super('Champignon1');
    }

    // La fonction init reçoit des données envoyées par une autre scène
    init(data) {
        // On vérifie si le joueur vient du tuyau (via une quête réussie) ou non
        this.vientDuTuyau = data.questComplete || false;
    }

    // Chargement de toutes les images et sons avant que le jeu ne commence
    preload() {
        // Chargement du personnage Yoshi avec la taille de ses images (frames)
        this.load.spritesheet('yoshi', 'src/asset/yoshi.png', {
            frameWidth: 248,
            frameHeight: 385
        });
        // Chargement des images simples (décors, objets)
        this.load.image('tuyau', 'src/asset/tuyaux.png');
        this.load.tilemapTiledJSON('map1', 'src/asset/map_lucie.tmj'); // Le fichier de la carte (Tiled)
        this.load.image('tuiles_img', 'src/asset/plat .png'); // L'image des plateformes
        this.load.image('fond_champignon', 'src/asset/champignon du fond .png');
        this.load.image('mimi_img', 'src/asset/mimi.png');
        this.load.image('ciel_img', 'src/asset/fond_lulu.png');
        this.load.image('donjon_img', 'src/asset/donjonfin_lulu.png');
        // Chargement de la musique
        this.load.audio('musique_mario', 'src/asset/son_mario.mp3');
    }

    // Création des éléments du jeu (une fois que tout est chargé)
    create() {
        // Effet d'apparition en fondu au début de la scène
        this.cameras.main.fadeIn(1000, 0, 0, 0);
        // On définit la force de la gravité vers le bas
        this.physics.world.gravity.y = 800;

        // Si la musique n'est pas déjà lancée, on la crée et on la joue en boucle
        if (!this.sound.get('musique_mario')) {
            // bgMusic : Nom de la variable choisie pour stocker et contrôler la musique
            this.bgMusic = this.sound.add('musique_mario', {
                volume: 0.3,
                loop: true
            });
            this.bgMusic.play();
        }

        // --- GESTION DE LA CARTE (TILEMAP) ---
        // const : Crée une variable fixe (qui ne changera pas de valeur dans cette fonction)
        const map = this.make.tilemap({ key: 'map1' });
        // On lie les noms des jeux de tuiles de Tiled aux images chargées dans preload
        const tsPlat = map.addTilesetImage('plat ', 'tuiles_img');
        const tsFond = map.addTilesetImage('champignon du fond ', 'fond_champignon');
        const tsMimi = map.addTilesetImage('mimi', 'mimi_img');
        const tsLulu = map.addTilesetImage('fond_lulu', 'ciel_img');
        const tsDonjon = map.addTilesetImage('donjonfin_lulu', 'donjon_img');
        // On regroupe tout pour créer les calques plus facilement
        const allTilesets = [tsPlat, tsFond, tsMimi, tsLulu, tsDonjon];

        // Création des différents calques de décors (arrière-plan vers premier plan)
        map.createLayer('background1', allTilesets, 0, 0);
        map.createLayer('background2', allTilesets, 0, 0);
        map.createLayer('background4', allTilesets, 0, 0);
        
        // Calques des plateformes sur lesquelles on peut marcher
        const platRose = map.createLayer('champignon_rose', allTilesets, 0, 0);
        const platRouge = map.createLayer('champignon_rouge', allTilesets, 0, 0);
        const platBleu = map.createLayer('champignon_bleu', allTilesets, 0, 0);
        
        // Calque des petits détails visuels
        map.createLayer('détails', allTilesets, 0, 0);

        // setCollisionByProperty : Active les collisions si la case "estSolide" est cochée dans Tiled
        if (platRose) platRose.setCollisionByProperty({ estSolide: true });
        if (platRouge) platRouge.setCollisionByProperty({ estSolide: true });
        if (platBleu) platBleu.setCollisionByProperty({ estSolide: true });

        // --- OBJETS ---
        // staticImage : Image avec physique qui ne bouge jamais (mur invisible, décor solide)
        this.tuyau = this.physics.add.staticImage(1504, 580, 'tuyau').setDepth(5);
        this.donjon = this.physics.add.staticImage(3136, 256, 'donjon_img').setDepth(5);

        // Détermination du point d'apparition (respawn) selon la provenance du joueur
        if (this.vientDuTuyau) {
            this.respawnX = 1504; // Près du tuyau
            this.respawnY = 350;
        } else {
            this.respawnX = 50; // Début de la map
            this.respawnY = 50;
        }

        // --- JOUEUR (YOSHI) ---
        // sprite : Objet animé qui peut bouger, sauter et tomber (physique dynamique)
        this.player = this.physics.add.sprite(this.respawnX, this.respawnY, 'yoshi');
        this.player.setDisplaySize(50, 70); // Redimensionnement
        // setCollideWorldBounds : Empêche Yoshi de sortir des bords de l'écran (murs invisibles)
        this.player.setCollideWorldBounds(true); 
        // setDepth : Définit l'ordre d'affichage (plus le chiffre est haut, plus l'objet est devant)
        this.player.setDepth(10); 
        this.physics.world.setBoundsCollision(true, true, true, false); // Collisions sol/murs mais pas le plafond

        // Création des animations si elles n'existent pas encore
        if (!this.anims.exists('anim_tourne_gauche')) {
            this.anims.create({
                key: 'anim_tourne_gauche',
                frames: this.anims.generateFrameNumbers('yoshi', { start: 6, end: 9 }),
                frameRate: 10,
                repeat: -1
            });
            this.anims.create({
                key: 'anim_face',
                frames: [{ key: 'yoshi', frame: 4 }],
                frameRate: 20
            });
            this.anims.create({
                key: 'anim_tourne_droite',
                frames: this.anims.generateFrameNumbers('yoshi', { start: 0, end: 3 }),
                frameRate: 10,
                repeat: -1
            });
        }

        // --- COLLISIONS ET INTERACTIONS ---
        // () => { ... } : Fonction fléchée (exécute les actions entre accolades lors de la collision)
        this.physics.add.collider(this.player, platRose, () => {
            // player.body.blocked.down : Vérifie si les pieds de Yoshi touchent le sol
            if (this.player.body.blocked.down) this.player.setVelocityY(-400);
        });
        this.physics.add.collider(this.player, platRouge, () => {
            // setVelocityY : Donne une vitesse verticale (négatif = vers le haut)
            if (this.player.body.blocked.down) this.player.setVelocityY(-650);
        });
        this.physics.add.collider(this.player, platBleu); // Collision simple
        this.physics.add.collider(this.player, this.tuyau); // Collision avec le tuyau

        // --- GESTION DE LA FIN (DONJON) ---
        this.physics.add.collider(this.player, this.donjon, () => {
            if (this.vientDuTuyau) {
                // this.registry.set : Enregistre une info dans la mémoire globale du jeu (sac à dos)
                this.registry.set('hasCisaille', true);
                this.afficherBulle(400, 300, "Cisaille récupérée ! Retour au Hub...");
                if (this.bgMusic) this.bgMusic.stop();
                // this.time.delayedCall : Attend un temps (en ms) avant de lancer une action
                this.time.delayedCall(2000, () => { this.scene.start('Hub'); });
            } else {
                this.afficherBulle(400, 300, "Le donjon est fermé, trouve la cisaille !");
            }
        });

        // --- CAMERA ---
        this.cursors = this.input.keyboard.createCursorKeys(); // Activer les touches du clavier
        // setBounds : Définit les limites réelles du monde (taille de ta carte Tiled)
        this.physics.world.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
        this.cameras.main.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
        this.cameras.main.startFollow(this.player, true, 0.08, 0.08); // La caméra suit Yoshi en douceur

        // Petit message de bienvenue après un court délai
        this.time.delayedCall(500, () => {
            if (!this.vientDuTuyau) {
                this.afficherBulle(400, 100, 'Cherche la cisaille !');
            } else {
                this.afficherBulle(400, 100, 'Bravo ! Entre dans le donjon');
            }
        });
    }

    // Boucle de mise à jour (s'exécute 60 fois par seconde)
    update() {
        // Déplacement à gauche
        if (this.cursors.left.isDown) {
            this.player.setVelocityX(-250);
            this.player.anims.play('anim_tourne_gauche', true);
        } 
        // Déplacement à droite
        else if (this.cursors.right.isDown) {
            this.player.setVelocityX(250);
            this.player.anims.play('anim_tourne_droite', true);
        } 
        // Arrêt (regard face)
        else {
            this.player.setVelocityX(0);
            this.player.anims.play('anim_face');
        }

        // Saut (seulement si Yoshi est au sol)
        if (this.cursors.up.isDown && this.player.body.blocked.down) {
            this.player.setVelocityY(-600);
        }

        // Gestion de la chute (si Yoshi tombe sous la hauteur de la carte + marge)
        if (this.player.y > this.physics.world.bounds.height + 50) {
            this.cameras.main.flash(500, 255, 0, 0); // Flash rouge de dégâts
            this.player.setPosition(this.respawnX, this.respawnY); // Téléportation au départ
            this.player.setVelocity(0, 0); // On stoppe sa vitesse
        }

        // Interaction avec le tuyau : Vérifie si les deux rectangles se touchent
        if (Phaser.Geom.Intersects.RectangleToRectangle(this.player.getBounds(), this.tuyau.getBounds())) {
            if (this.cursors.down.isDown) {
                if (!this.vientDuTuyau) {
                    this.scene.start('Champignon2'); // Aller vers le niveau 2
                } else {
                    this.afficherBulle(400, 300, "Le passage est fermé !");
                }
            }
        }
    }

    // Fonction personnalisée pour afficher une bulle de texte à l'écran
    afficherBulle(x, y, message) {
        if (this.bulleActive) return; 
        // this.bulleActive = true : Interrupteur pour éviter d'ouvrir 100 bulles en même temps
        this.bulleActive = true;

        // Création du texte
        let texte = this.add.text(x, y, message, {
            fontSize: '22px',
            fill: '#000000',
            fontFamily: 'Arial',
            align: 'center'
        })
        .setOrigin(0.5)
        .setDepth(102)
        .setScrollFactor(0); // Reste fixe sur l'écran même si la caméra bouge

        // let bg = this.add.graphics() : Crée un outil de dessin pour faire des formes
        let bg = this.add.graphics();
        // bg.fillStyle : Définit la couleur (blanc 0xffffff) et l'opacité (1)
        bg.fillStyle(0xffffff, 1);
        // bg.fillRoundedRect : Dessine un rectangle blanc avec des coins arrondis
        bg.fillRoundedRect(
            x - (texte.width + 40) / 2,
            y - (texte.height + 20) / 2,
            texte.width + 40,
            texte.height + 20,
            15
        );
        bg.setDepth(101).setScrollFactor(0);

        // Dessin de la bordure noire
        bg.lineStyle(2, 0x000000, 1);
        bg.strokeRoundedRect(
            x - (texte.width + 40) / 2,
            y - (texte.height + 20) / 2,
            texte.width + 40,
            texte.height + 20,
            15
        );

        // Faire disparaître la bulle après 3 secondes
        this.time.delayedCall(3000, () => {
            texte.destroy();
            bg.destroy();
            this.bulleActive = false;
        });
    }
}