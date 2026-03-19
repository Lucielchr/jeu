export class Hub extends Phaser.Scene { // Déclare la classe "Hub" qui hérite des fonctionnalités d'une scène Phaser
    constructor() {
        super({ key: 'Hub' }); // Donne un identifiant unique ('Hub') à cette scène pour l'appeler plus tard
    }

    preload() {
        // 1. On charge la carte (Le cerveau du niveau)
        this.load.tilemapTiledJSON('map-hub', './src/asset/hub_jeu.json'); // Charge le fichier JSON créé avec le logiciel Tiled

        // 2. On charge tes 7 images
        this.load.image('img1', 'src/asset/4.png'); // Associe un nom interne ('img1') au fichier image
        this.load.image('img2', 'src/asset/Assets_source.png');
        this.load.image('img3', 'src/asset/Brown_ruins1.png');
        this.load.image('img4', 'src/asset/green trees.png');
        this.load.image('img5', 'src/asset/pine-none06.png');
        this.load.image('img6', 'src/asset/pisilohe10.png');
        this.load.image('img7', 'src/asset/terrain.png');

        // 3. Le personnage
        // Charge la planche de sprites du joueur en découpant des cadres de 32x32 pixels
        this.load.spritesheet('player', 'src/asset/Male 16-1.png', { frameWidth: 32, frameHeight: 32 });
    }

    create() {
        // Création de la map à partir du JSON chargé dans le preload
        const map = this.make.tilemap({ key: 'map-hub' });

        // Associe les noms des tilesets définis dans Tiled aux images chargées dans Phaser
        const t1 = map.addTilesetImage('4', 'img1');
        const t2 = map.addTilesetImage('Assets_source', 'img2');
        const t3 = map.addTilesetImage('Brown_ruins1', 'img3');
        const t4 = map.addTilesetImage('green trees', 'img4');
        const t5 = map.addTilesetImage('pine-none06', 'img5');
        const t6 = map.addTilesetImage('pisilohe10', 'img6');
        const t7 = map.addTilesetImage('terrain', 'img7');

        // Regroupe tous les tilesets dans un tableau pour les appliquer aux calques
        const tousLesTilesets = [t1, t2, t3, t4, t5, t6, t7];

        // --- AFFICHAGE DES CALQUES ---
        // Crée les couches de décors dans l'ordre (le premier est en dessous, le dernier au-dessus)
        const murInvisible = map.createLayer('mur invisible', tousLesTilesets, 0, 0);
        const herbe = map.createLayer('herbe', tousLesTilesets, 0, 0);
        const detail = map.createLayer('detail', tousLesTilesets, 0, 0);
        const arbre = map.createLayer('arbre', tousLesTilesets, 0, 0);
        const detail2 = map.createLayer('detail2', tousLesTilesets, 0, 0);

        // --- LE JOUEUR ---
        // Crée le sprite du joueur aux coordonnées (800, 1000) avec la physique activée
        this.player = this.physics.add.sprite(800, 1000, 'player');

        // --- ANIMATIONS DU JOUEUR ---
        // Animation pour marcher vers le bas (frames 0 à 2)
        this.anims.create({
            key: 'down',
            frames: this.anims.generateFrameNumbers('player', { start: 0, end: 2 }),
            frameRate: 10,
            repeat: -1 // -1 signifie que l'animation boucle à l'infini
        });

        // Animation pour marcher vers la gauche (frames 3 à 5)
        this.anims.create({
            key: 'left',
            frames: this.anims.generateFrameNumbers('player', { start: 3, end: 5 }),
            frameRate: 10,
            repeat: -1
        });

        // Animation pour marcher vers la droite (frames 6 à 8)
        this.anims.create({
            key: 'right',
            frames: this.anims.generateFrameNumbers('player', { start: 6, end: 8 }),
            frameRate: 10,
            repeat: -1
        });

        // Animation pour marcher vers le haut (frames 9 à 11)
        this.anims.create({
            key: 'up',
            frames: this.anims.generateFrameNumbers('player', { start: 9, end: 11 }),
            frameRate: 10,
            repeat: -1
        });

        // Animation d'immobilité (utilise une seule frame fixe)
        this.anims.create({
            key: 'Idle1',
            frames: [{ key: 'player', frame: 1 }],
            frameRate: 10
        });

        // Limites du monde et caméra
        // Empêche la physique et la caméra de sortir de la taille de la carte
        this.physics.world.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
        this.cameras.main.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
        this.player.setCollideWorldBounds(true); // Empêche le joueur de sortir des bords de l'écran

        // Crée le calque "maison" avec un décalage vertical de -128 pixels (effet de hauteur)
        const maison = map.createLayer('maison', tousLesTilesets, 0, -128);

        // --- COLLISIONS ---
        // Vérifie si le calque existe, active les collisions selon la propriété 'estSolide' définie dans Tiled
        if (arbre) {
            arbre.setCollisionByProperty({ estSolide: true });
            this.physics.add.collider(this.player, arbre); // Bloque le joueur contre ce calque
        }
        if (murInvisible) {
            murInvisible.setCollisionByProperty({ estSolide: true });
            this.physics.add.collider(this.player, murInvisible);
        }
        if (detail) {
            detail.setCollisionByProperty({ estSolide: true });
            this.physics.add.collider(this.player, detail);
        }
        if (detail2) {
            detail2.setCollisionByProperty({ estSolide: true });
            this.physics.add.collider(this.player, detail2);
        }
        if (herbe) {
            herbe.setCollisionByProperty({ estSolide: true });
            this.physics.add.collider(this.player, herbe);
        }

        // Caméra suit le joueur
        this.cameras.main.startFollow(this.player); // La caméra se centre sur le joueur
        this.cursors = this.input.keyboard.createCursorKeys(); // Initialise les flèches directionnelles

        // --- DÉFINITION DES TOUCHES ---
        this.keyE = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E); // Touche E pour interagir
        this.keyF = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.F); // Touche F pour attaquer

        // --- INITIALISATION REGISTRE ---
        // Le registre permet de garder des variables en mémoire même en changeant de scène
        if (this.registry.get('hasCisaille') === undefined) {
            this.registry.set('hasCisaille', false); // Etat par défaut : pas de cisaille
        }
        if (this.registry.get('hasEpee') === undefined) {
            this.registry.set('hasEpee', false); // Etat par défaut : pas d'épée
        }
        if (this.registry.get('dragonVivant') === undefined) {
            this.registry.set('dragonVivant', true); // Etat par défaut : le dragon est là
        }

        // --- CRÉATION DES ZONES DES PORTES ---
        // Crée des rectangles invisibles pour détecter si le joueur est devant une porte/un événement
        this.porte1 = this.add.zone(1504, 1312, 160, 160);
        this.porte2 = this.add.zone(1408, 192, 64, 128);
        this.porte3 = this.add.zone(64, 128, 120, 120);

        // Active la physique sur ces zones invisibles
        this.physics.add.existing(this.porte1, true);
        this.physics.add.existing(this.porte2, true);
        this.physics.add.existing(this.porte3, true);

        // Texte d'aide à l'écran
        this.texteAide = this.add.text(400, 550, "Appuie sur E pour entrer", {
            fontSize: '20px',
            fill: '#ffffff',
            backgroundColor: '#000000'
        }).setOrigin(0.5).setScrollFactor(0); // setScrollFactor(0) fixe le texte sur l'écran (il ne bouge pas avec la map)
        this.texteAide.setVisible(false); // Caché au départ

        // --- LE DRAGON ---
        this.dragon = this.physics.add.staticSprite(64, 128, 'img6'); // Crée le dragon
        this.physics.add.collider(this.player, this.dragon); // Le dragon bloque le passage physiquement

        // Si le dragon a déjà été tué (vérifié dans le registre), on le retire immédiatement
        if (this.registry.get('dragonVivant') === false) {
            this.dragon.destroy();
        }
    }

    update() {
        // 1. On cache le texte par défaut à chaque frame (il sera réaffiché si on est sur une zone)
        this.texteAide.setVisible(false);

        // --- VÉRIFICATION PORTE 1 ---
        // Si le joueur touche la zone de la porte 1
        if (this.physics.overlap(this.player, this.porte1)) {
            this.texteAide.setText("Appuie sur E pour entrer au Niveau 1");
            this.texteAide.setVisible(true);
            if (Phaser.Input.Keyboard.JustDown(this.keyE)) { // Si E est pressé une seule fois
                this.scene.start('Champignon1'); // Change de scène vers le niveau 1
            }
        }

        // --- VÉRIFICATION PORTE 2 ---
        else if (this.physics.overlap(this.player, this.porte2)) {
            const possedeCisaille = this.registry.get('hasCisaille'); // Vérifie l'inventaire
            if (possedeCisaille) {
                this.texteAide.setText("Appuie sur E pour entrer au Niveau 2");
                this.texteAide.setVisible(true);
                if (Phaser.Input.Keyboard.JustDown(this.keyE)) {
                    this.scene.start('Jungle');
                }
            } else {
                // Message si l'objet requis est manquant
                this.texteAide.setText("OULALA IL Y A TROP DE BROUSSAILLES, il faudrait une cisaille !");
                this.texteAide.setVisible(true);
            }
        }

        // --- VÉRIFICATION PORTE 3 (DRAGON) ---
        else if (this.physics.overlap(this.player, this.porte3)) {
            const dragonVivant = this.registry.get('dragonVivant');
            const possedeEpee = this.registry.get('hasEpee');

            if (dragonVivant) {
                if (possedeEpee) {
                    this.texteAide.setText("Appuie sur F pour terrasser le dragon avec l'épée !");
                    this.texteAide.setVisible(true);
                    if (Phaser.Input.Keyboard.JustDown(this.keyF)) { // Combat
                        this.registry.set('dragonVivant', false); // Enregistre la mort du dragon
                        this.dragon.destroy(); // Supprime visuellement le dragon
                        console.log("Dragon vaincu !");
                    }
                } else {
                    this.texteAide.setText("Ce dragon refuse de te laisser passer... Il te faut une épée !");
                    this.texteAide.setVisible(true);
                }
            } else {
                // Si le dragon est mort, la zone devient une porte vers le Niveau 3
                this.texteAide.setText("Le passage est libre ! Appuie sur E pour entrer au Niveau 3");
                this.texteAide.setVisible(true);
                if (Phaser.Input.Keyboard.JustDown(this.keyE)) {
                    this.scene.start('Demon');
                }
            }
        }

        // Mouvements du joueur
        this.player.setVelocity(0); // On stoppe le mouvement par défaut
        const speed = 160;

        // Gestion de la marche gauche/droite
        if (this.cursors.left.isDown) {
            this.player.setVelocityX(-speed);
            this.player.anims.play('left', true);
        } else if (this.cursors.right.isDown) {
            this.player.setVelocityX(speed);
            this.player.anims.play('right', true);
        }

        // Gestion de la marche haut/bas
        if (this.cursors.up.isDown) {
            this.player.setVelocityY(-speed);
            // Si on ne va pas déjà à gauche ou à droite, on joue l'anim de haut
            if (!this.cursors.left.isDown && !this.cursors.right.isDown) {
                this.player.anims.play('up', true);
            }
        } else if (this.cursors.down.isDown) {
            this.player.setVelocityY(speed);
            if (!this.cursors.left.isDown && !this.cursors.right.isDown) {
                this.player.anims.play('down', true);
            }
        }

        // Si le joueur ne bouge plus du tout, on joue l'animation Idle
        if (this.player.body.velocity.x === 0 && this.player.body.velocity.y === 0) {
            this.player.anims.play('Idle1', true);
        }

        // Normalisation de la vitesse (évite de courir plus vite en diagonale)
        if (this.player.body.velocity.x !== 0 || this.player.body.velocity.y !== 0) {
            this.player.body.velocity.normalize().scale(speed);
        }
    }
}