export class Hub extends Phaser.Scene {
    constructor() {
        super({ key: 'Hub' });
    }

    preload() {
        // 1. On charge la carte (Le cerveau du niveau)
        this.load.tilemapTiledJSON('map-hub', './src/asset/hub_jeu.json');

        // 2. On charge tes 7 images (Tes briques de construction)
        // REMPLACE BIEN LES NOMS DES .PNG PAR TES VRAIS FICHIERS
        this.load.image('img1', 'src/asset/4.png');
        this.load.image('img2', 'src/asset/Assets_source.png');
        this.load.image('img3', 'src/asset/Brown_ruins1.png');
        this.load.image('img4', 'src/asset/green trees.png');
        this.load.image('img5', 'src/asset/pine-none06.png');
        this.load.image('img6', 'src/asset/pisilohe10.png');
        this.load.image('img7', 'src/asset/terrain.png');

        // 3. Le personnage
        this.load.spritesheet('player', 'src/asset/Male 16-1.png', { frameWidth: 32, frameHeight: 32 });
    }

    create() {
        // Création de la map à partir du JSON
        const map = this.make.tilemap({ key: 'map-hub' });

        // --- LA MAGIE : On récupère les noms internes du JSON automatiquement ---
        const nomsTilesetsDansJson = map.tilesets.map(t => t.name);
        
        // On associe chaque nom trouvé dans Tiled à une de tes 7 images
        const t1 = map.addTilesetImage('4', 'img1');
        const t2 = map.addTilesetImage('Assets_source', 'img2');
        const t3 = map.addTilesetImage('Brown_ruins1', 'img3');
        const t4 = map.addTilesetImage('green trees', 'img4');
        const t5 = map.addTilesetImage('pine-none06', 'img5');
        const t6 = map.addTilesetImage('pisilohe10', 'img6');
        const t7 = map.addTilesetImage('terrain', 'img7');

        const tousLesTilesets = [t1, t2, t3, t4, t5, t6, t7];

      // --- AFFICHAGE DES CALQUES (L'ordre est crucial : le premier est au fond) ---
        // On crée les calques un par un. Si un nom est faux, Phaser le dira.
        const murInvisible = map.createLayer('mur invisible', tousLesTilesets, 0, 0);
        const herbe = map.createLayer('herbe', tousLesTilesets, 0, 0);
        const detail = map.createLayer('detail', tousLesTilesets, 0, 0);
        const arbre = map.createLayer('arbre', tousLesTilesets, 0, 0);
        const detail2 = map.createLayer('detail2', tousLesTilesets, 0, 0);
        

       
        
        // --- LE JOUEUR (Il apparait au-dessus du sol mais sous les arbres si tu veux) ---
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

        // Animation quand on ne bouge pas (on garde la frame face caméra)
        this.anims.create({
            key: 'idle',
            frames: [{ key: 'player', frame: 1 }],
            frameRate: 10
        });
        
        // 1. On définit les limites du MONDE PHYSIQUE (pour que le perso ne soit pas bloqué à 800px)
        this.physics.world.setBounds(0, 0, map.widthInPixels, map.heightInPixels);

        // 2. On définit les limites de la CAMÉRA (pour qu'elle arrête de défiler quand on touche le bord)
        this.cameras.main.setBounds(0, 0, map.widthInPixels, map.heightInPixels);

        // 3. On dit au joueur de respecter les limites du monde (pour pas qu'il tombe dans le vide noir)
        this.player.setCollideWorldBounds(true);


        const maison = map.createLayer('maison', tousLesTilesets, 0, -128);
        

        // --- COLLISIONS ---
        // On active la collision pour les tuiles qui ont la propriété "estSolide" dans Tiled
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

        // Caméra
        this.cameras.main.startFollow(this.player);
        this.cursors = this.input.keyboard.createCursorKeys();
        
        // Optionnel : Empêcher de sortir de la map
        this.player.setCollideWorldBounds(true);
        this.cameras.main.setBounds(0, 0, map.widthInPixels, map.heightInPixels);

        // --- 1. DÉFINITION DE LA TOUCHE D'ACTION ---
        this.keyE = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E);

        // --- NOUVEAU : INITIALISATION DE LA CISAILLE ---
        if (this.registry.get('hasCisaille') === undefined) {
            this.registry.set('hasCisaille', false);
        }

        // --- 2. CRÉATION DES ZONES DES PORTES ---
        // Remplace les chiffres (x, y, largeur, hauteur) par tes vraies coordonnées
        this.porte1 = this.add.zone(1504, 1312, 160, 160); 
        this.porte2 = this.add.zone(1408, 192, 64, 128);
        this.porte3 = this.add.zone(64, 0, 64, 400);

        // On active la physique sur les zones
        this.physics.add.existing(this.porte1, true);
        this.physics.add.existing(this.porte2, true);
        this.physics.add.existing(this.porte3, true);

        // On crée un petit texte d'aide (fixé à l'écran)
        this.texteAide = this.add.text(400, 550, "Appuie sur E pour entrer", { 
            fontSize: '20px', 
            fill: '#ffffff',
            backgroundColor: '#000000' 
        }).setOrigin(0.5).setScrollFactor(0);
        this.texteAide.setVisible(false); // Caché par défaut

        // --- LOGIQUE DU DRAGON ET DE L'ÉPÉE ---

        // 1. On prépare les variables dans le registre global
        if (this.registry.get('hasEpee') === undefined) {
            this.registry.set('hasEpee', false);
        }
        if (this.registry.get('dragonVivant') === undefined) {
            this.registry.set('dragonVivant', true);
        }

        // 2. On crée le dragon avec l'image 'img6' (ton fichier pisilohe10.png)
        // Je le place à (128, 128) pour qu'il soit visible devant ta porte 3 (64, 0)
        this.dragon = this.physics.add.staticSprite(64,128 , 'img6');

        // 3. On ajoute une collision : le joueur ne peut pas passer à travers lui
        this.physics.add.collider(this.player, this.dragon);

        // 4. Si le joueur a déjà tué le dragon lors d'une visite précédente, on le fait disparaître
        if (this.registry.get('dragonVivant') === false) {
            this.dragon.destroy();
        }
    }
    update() {
        // 1. On cache le texte par défaut
        this.texteAide.setVisible(false);

        // --- VÉRIFICATION PORTE 1 ---
        if (this.physics.overlap(this.player, this.porte1)) {
            this.texteAide.setText("Appuie sur E pour entrer au Niveau 1"); // On force le texte ici
            this.texteAide.setVisible(true);
            if (Phaser.Input.Keyboard.JustDown(this.keyE)) {
                this.scene.start('champignon1');
            }
        }

        // --- VÉRIFICATION PORTE 2 (AVEC CONDITION CISAILLE) ---
        else if (this.physics.overlap(this.player, this.porte2)) { // Utilise "else if" pour plus de clarté
            const possedeCisaille = this.registry.get('hasCisaille');

            if (possedeCisaille) {
                this.texteAide.setText("Appuie sur E pour entrer au Niveau 2");
                this.texteAide.setVisible(true);
                if (Phaser.Input.Keyboard.JustDown(this.keyE)) {
                    this.scene.start('jungle');
                }
            } else {
                this.texteAide.setText("OULALA IL Y A TROP DE BROUSSAILLES, il faudrait une cisaille !");
                this.texteAide.setVisible(true);
            }
        }    

        // --- VÉRIFICATION PORTE 3 (DRAGON + NIVEAU 3) ---
        if (this.physics.overlap(this.player, this.porte3)) {
            const dragonVivant = this.registry.get('dragonVivant');
            const possedeEpee = this.registry.get('hasEpee');

            if (dragonVivant) {
                // Le dragon est là
                if (possedeEpee) {
                    this.texteAide.setText("Appuie sur F pour terrasser le dragon avec l'épée !");
                    this.texteAide.setVisible(true);
                    if (Phaser.Input.Keyboard.JustDown(this.keyF)) {
                        this.registry.set('dragonVivant', false); // On enregistre sa mort
                        this.dragon.destroy(); // Il disparaît de l'écran
                        console.log("Dragon vaincu !");
                    }
                } else {
                    this.texteAide.setText("Ce dragon refuse de te laisser passer sans un combat... Il te faut une épée !");
                    this.texteAide.setVisible(true);
                }
            } else {
                // Le dragon est mort, la porte est accessible
                this.texteAide.setText("Le passage est libre ! Appuie sur E pour entrer au Niveau 3");
                this.texteAide.setVisible(true);
                if (Phaser.Input.Keyboard.JustDown(this.keyE)) {
                    this.scene.start('demon');
                }
            }
        }
    this.player.setVelocity(0);
    const speed = 160;

    // Déplacements et Animations horizontales
    if (this.cursors.left.isDown) {
        this.player.setVelocityX(-speed);
        this.player.anims.play('left', true);
    } else if (this.cursors.right.isDown) {
        this.player.setVelocityX(speed);
        this.player.anims.play('right', true);
    }

    // Déplacements et Animations verticales
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

    // Si on ne bouge pas du tout
    if (this.player.body.velocity.x === 0 && this.player.body.velocity.y === 0) {
        this.player.anims.play('idle');
    }

    // Normalisation pour éviter d'aller trop vite en diagonale
    if (this.player.body.velocity.x !== 0 || this.player.body.velocity.y !== 0) {
        this.player.body.velocity.normalize().scale(speed);
    }
}
}