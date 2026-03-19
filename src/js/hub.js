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

        // Associe les noms des tilesets définis dans Tiled aux images chargées dans Phaser et déclare que dans la fonction create
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
        const murInvisible = map.createLayer('mur invisible', tousLesTilesets, 0, 0);
        const herbe = map.createLayer('herbe', tousLesTilesets, 0, 0);
        const detail = map.createLayer('detail', tousLesTilesets, 0, 0);
        const arbre = map.createLayer('arbre', tousLesTilesets, 0, 0);
        const detail2 = map.createLayer('detail2', tousLesTilesets, 0, 0);
        const maison = map.createLayer('maison', tousLesTilesets, 0, -128);

        // --- LE JOUEUR ---
        this.player = this.physics.add.sprite(800, 1000, 'player');

        // --- ANIMATIONS DU JOUEUR ---
        this.anims.create({
            key: 'down',
            frames: this.anims.generateFrameNumbers('player', { start: 0, end: 2 }),
            frameRate: 10,
            repeat: -1 
        });
        this.anims.create({
            key: 'left',
            frames: this.anims.generateFrameNumbers('player', { start: 3, end: 5 }),
            frameRate: 10,
            repeat: -1
        });
        this.anims.create({
            key: 'right',
            frames: this.anims.generateFrameNumbers('player', { start: 6, end: 8 }),
            frameRate: 10,
            repeat: -1
        });
        this.anims.create({
            key: 'up',
            frames: this.anims.generateFrameNumbers('player', { start: 9, end: 11 }),
            frameRate: 10,
            repeat: -1
        });
        this.anims.create({
            key: 'Idle1',
            frames: [{ key: 'player', frame: 1 }],
            frameRate: 10
        });

        // Limites du monde et caméra
        this.physics.world.setBounds(0, 0, map.widthInPixels, map.heightInPixels); 
        this.cameras.main.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
        this.player.setCollideWorldBounds(true); 

        // --- COLLISIONS ---
        if (arbre) {
            arbre.setCollisionByProperty({ estSolide: true });
            this.physics.add.collider(this.player, arbre);
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
        this.cameras.main.startFollow(this.player); 
        this.cursors = this.input.keyboard.createCursorKeys(); 

        // --- DÉFINITION DES TOUCHES ---
        this.keyE = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E); 
        this.keyF = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.F); 

        // --- INITIALISATION REGISTRE ---
        if (this.registry.get('hasCisaille') === undefined) { 
            this.registry.set('hasCisaille', false); 
        }
        if (this.registry.get('hasEpee') === undefined) {
            this.registry.set('hasEpee', false); 
        }
        if (this.registry.get('dragonVivant') === undefined) {
            this.registry.set('dragonVivant', true); 
        }

        // --- NOUVEAU : On vérifie si l'intro a déjà été vue ---
        if (this.registry.get('dejaVuIntro') === undefined) {
            this.registry.set('dejaVuIntro', false);
        }

        // --- CRÉATION DES ZONES DES PORTES ---
        this.porte1 = this.add.zone(1504, 1312, 160, 160);
        this.porte2 = this.add.zone(1408, 192, 64, 128);
        this.porte3 = this.add.zone(64, 128, 120, 120);

        this.physics.add.existing(this.porte1, true);
        this.physics.add.existing(this.porte2, true);
        this.physics.add.existing(this.porte3, true);

        // Texte d'aide à l'écran
        this.texteAide = this.add.text(400, 550, "Appuie sur E pour entrer", {
            fontSize: '20px',
            fill: '#ffffff',
            backgroundColor: '#000000'
        }).setOrigin(0.5).setScrollFactor(0); 
        this.texteAide.setVisible(false); 

        // --- LE DRAGON ---
        this.dragon = this.physics.add.staticSprite(64, 128, 'img6'); 
        this.physics.add.collider(this.player, this.dragon); 

        if (this.registry.get('dragonVivant') === false) {
            this.dragon.destroy();
        }

        // --- AJOUT : BULLE D'INTRODUCTION (UNE SEULE FOIS) ---
        if (this.registry.get('dejaVuIntro') === false) {
            this.time.delayedCall(500, () => {
                this.afficherBulleIntroduction("Ohh noonnn!! mon chien a disparu, je pense que c'est le démon!");
                // On marque l'intro comme "vue" pour que ça ne revienne plus
                this.registry.set('dejaVuIntro', true);
            });
        }
    }

    update() {
        this.texteAide.setVisible(false);

        // --- VÉRIFICATION PORTE 1 ---
        if (this.physics.overlap(this.player, this.porte1)) {
            this.texteAide.setText("Appuie sur E pour entrer au Niveau 1");
            this.texteAide.setVisible(true);
            if (Phaser.Input.Keyboard.JustDown(this.keyE)) {
                this.scene.start('Champignon1'); 
            }
        }

        // --- VÉRIFICATION PORTE 2 ---
        else if (this.physics.overlap(this.player, this.porte2)) {
            const possedeCisaille = this.registry.get('hasCisaille'); 
            if (possedeCisaille) {
                this.texteAide.setText("Appuie sur E pour entrer au Niveau 2");
                this.texteAide.setVisible(true);
                if (Phaser.Input.Keyboard.JustDown(this.keyE)) {
                    this.scene.start('Jungle');
                }
            } else {
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
                    if (Phaser.Input.Keyboard.JustDown(this.keyF)) { 
                        this.registry.set('dragonVivant', false); 
                        this.dragon.destroy(); 
                    }
                } else {
                    this.texteAide.setText("OHHHH un dragon, il me faut une épée pour le combattre !");
                    this.texteAide.setVisible(true);
                }
            } else {
                this.texteAide.setText("Le passage est libre ! Appuie sur E pour entrer au Niveau 3");
                this.texteAide.setVisible(true);
                if (Phaser.Input.Keyboard.JustDown(this.keyE)) {
                    this.scene.start('Demon');
                }
            }
        }

        // Mouvements du joueur
        this.player.setVelocity(0); 
        const speed = 160;

        if (this.cursors.left.isDown) {
            this.player.setVelocityX(-speed);
            this.player.anims.play('left', true);
        } else if (this.cursors.right.isDown) {
            this.player.setVelocityX(speed);
            this.player.anims.play('right', true);
        }

        if (this.cursors.up.isDown) {
            this.player.setVelocityY(-speed);
            if (!this.cursors.left.isDown && !this.cursors.right.isDown) { 
                this.player.anims.play('up', true);
            }
        } else if (this.cursors.down.isDown) {
            this.player.setVelocityY(speed);
            if (!this.cursors.left.isDown && !this.cursors.right.isDown) {
                this.player.anims.play('down', true);
            }
        }

        if (this.player.body.velocity.x === 0 && this.player.body.velocity.y === 0) {
            this.player.anims.play('Idle1', true);
        }

        if (this.player.body.velocity.x !== 0 || this.player.body.velocity.y !== 0) {
            this.player.body.velocity.normalize().scale(speed); 
        }
    }

    // --- FONCTION POUR LA BULLE ---
    afficherBulleIntroduction(message) {
        let bulleConteneur = this.add.container(this.player.x, this.player.y - 60);

        let texte = this.add.text(0, 0, message, {
            fontSize: '14px',
            fill: '#000000',
            wordWrap: { width: 180 },
            align: 'center'
        }).setOrigin(0.5);

        let bg = this.add.graphics();
        bg.fillStyle(0xffffff, 1);
        bg.lineStyle(2, 0x000000, 1);
        bg.fillRoundedRect(-(texte.width/2 + 10), -(texte.height/2 + 10), texte.width + 20, texte.height + 20, 10);
        bg.strokeRoundedRect(-(texte.width/2 + 10), -(texte.height/2 + 10), texte.width + 20, texte.height + 20, 10);

        bulleConteneur.add([bg, texte]);
        bulleConteneur.setDepth(100);

        const suivreJoueur = this.time.addEvent({
            delay: 10,
            callback: () => {
                if(bulleConteneur) {
                    bulleConteneur.x = this.player.x;
                    bulleConteneur.y = this.player.y - 60;
                }
            },
            loop: true
        });

        // Modifié à 10000ms (10 secondes)
        this.time.delayedCall(10000, () => {
            suivreJoueur.remove();
            if(bulleConteneur) bulleConteneur.destroy();
        });
    }
}