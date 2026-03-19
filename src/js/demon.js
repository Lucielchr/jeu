export class Demon extends Phaser.Scene {

    // =====================================================
    // CONSTRUCTEUR
    // =====================================================
    constructor() {
        super("Demon");

        console.log("%c=== DÉMARRAGE DU JEU ===", "color: #00ff00; font-weight: bold;");

        // -----------------------------
        // Position de réapparition du joueur
        // -----------------------------
        this.spawnX = 50;
        this.spawnY = 300;

        // -----------------------------
        // États du jeu
        // -----------------------------
        this.statueActivated = false;
        this.musicStarted = false;
        this.gameEnded = false;

        // -----------------------------
        // Sons / musiques
        // -----------------------------
        this.statueSound = null;
        this.bgMusic = null;

        // -----------------------------
        // Joueur et contrôles
        // -----------------------------
        this.player = null;
        this.cursors = null;

        // -----------------------------
        // Tilemap et calques
        // -----------------------------
        this.map = null;
        this.groundLayer = null;
        this.platformLayer = null;
        this.decorLayer = null;
        this.frontLayer = null;

        // -----------------------------
        // Éléments de décor / parallax
        // -----------------------------
        this.moon = null;
        this.mountains = null;
        this.graveyard = null;
    }

    // =====================================================
    // PRELOAD
    // Charge tous les assets du jeu
    // =====================================================
    preload() {
        console.log("%c[PRELOAD] Début du chargement des assets", "color: #ffff00;");

        // Texte affiché pendant le chargement
        const loadingText = this.add.text(640, 360, "Chargement...", {
            font: "32px Arial",
            fill: "#ffffff"
        }).setOrigin(0.5);

        // Dossier de base des assets
        this.load.setPath("src/asset/");

        // -----------------------------
        // Images de fond / décor
        // -----------------------------
        this.load.image("moon", "background.png");
        this.load.image("mountains", "mountains.png");
        this.load.image("graveyard", "graveyard.png");

        // -----------------------------
        // Tilesets
        // -----------------------------
        this.load.image("tileset", "tileset.png");
        this.load.image("objects", "objects.png");
        this.load.image("tileset_lave", "tileset_lave.png");

        // -----------------------------
        // Sons
        // -----------------------------
        this.load.audio("statueSound", "statue.mp3");
        this.load.audio("bgMusic", "music.mp3");

        // -----------------------------
        // Map Tiled
        // -----------------------------
        this.load.tilemapTiledJSON("map", "map.tmj");

        // -----------------------------
        // Spritesheets du joueur
        // -----------------------------
        this.load.spritesheet("heroIdle", "hero-idle.png", {
            frameWidth: 160,
            frameHeight: 90
        });

        this.load.spritesheet("heroRun", "hero-run.png", {
            frameWidth: 160,
            frameHeight: 90
        });

        this.load.spritesheet("heroJump", "hero-jump.png", {
            frameWidth: 160,
            frameHeight: 90
        });

        // -----------------------------
        // Suivi du chargement
        // -----------------------------
        this.load.on("progress", (value) => {
            const percent = Math.round(value * 100);
            console.log(`[PRELOAD] ${percent}% chargé`);
            loadingText.setText(`Chargement... ${percent}%`);
        });

        this.load.on("complete", () => {
            console.log("%c[PRELOAD] Tous les assets sont chargés", "color: #00ff00;");
            loadingText.destroy();
        });

        this.load.on("loaderror", (fileObj) => {
            console.error("%c[PRELOAD] ERREUR de chargement :", "color: #ff0000;", fileObj.key);
        });
    }

    // =====================================================
    // RESPAWN DU JOUEUR
    // Remet le joueur à sa position de départ
    // =====================================================
    respawnPlayer() {
        if (!this.player || !this.player.body) return;

        this.player.body.stop();
        this.player.setPosition(this.spawnX, this.spawnY);
        this.player.setVelocity(0, 0);
        this.player.setFlipX(false);
        this.player.play("idle", true);
    }

    // =====================================================
    // DÉMARRAGE DE LA MUSIQUE
    // Lance la musique une seule fois
    // =====================================================
    tryStartMusic() {
        if (this.bgMusic && !this.bgMusic.isPlaying && !this.musicStarted) {
            this.bgMusic.play();
            this.musicStarted = true;
            console.log("%c✓ Musique de fond démarrée", "color: #00ff00;");
        }
    }

    // =====================================================
    // AFFICHAGE DES CRÉDITS
    // Se lance quand le joueur atteint la fin
    // =====================================================
    showCredits() {
        this.gameEnded = true;

        // On bloque le joueur
        if (this.player && this.player.body) {
            this.player.setVelocity(0, 0);
            this.player.body.enable = false;
        }

        // On coupe la musique de fond
        if (this.bgMusic && this.bgMusic.isPlaying) {
            this.bgMusic.stop();
        }

        const cam = this.cameras.main;
        const centerX = cam.width / 2;
        const centerY = cam.height / 2;

        // Fond noir plein écran
        this.add.rectangle(centerX, centerY, cam.width, cam.height, 0x000000)
            .setScrollFactor(0)
            .setDepth(1000);

        // Texte principal
        this.add.text(centerX, centerY - 70, "Merci d'avoir joué à notre jeu !", {
            font: "42px Arial",
            fill: "#ffffff",
            align: "center"
        })
            .setOrigin(0.5)
            .setScrollFactor(0)
            .setDepth(1001);

        // Crédits
        this.add.text(centerX, centerY + 10, "Crédits\n\nProjet réalisé par Mathis, Mathis, Lucie, Arthur", {
            font: "24px Arial",
            fill: "#cccccc",
            align: "center"
        })
            .setOrigin(0.5)
            .setScrollFactor(0)
            .setDepth(1001);
    }

    // =====================================================
    // CREATE
    // Initialise toute la scène
    // =====================================================
    create() {
        console.log("%c[CREATE] Début de la création de la scène", "color: #ffff00;");

        // -----------------------------
        // Configuration générale de la scène
        // -----------------------------
        this.scale.resize(1280, 720);
        this.physics.world.gravity.y = 1200;

        // Réinitialisation des états
        this.statueActivated = false;
        this.musicStarted = false;
        this.gameEnded = false;

        // =================================================
        // 1) CHARGEMENT DE LA MAP TILED
        // =================================================
        try {
            this.map = this.make.tilemap({ key: "map" });

            console.log("%c✓ Map Tiled chargée", "color: #00ff00;");
            console.log("Layers détectés :", this.map.layers.map(layer => layer.name));
            console.log("Tilesets détectés :", this.map.tilesets.map(tileset => tileset.name));
        } catch (error) {
            console.error("%c✗ ERREUR Tilemap :", "color: #ff0000;", error);

            this.add.text(640, 360, "ERREUR : Map non chargée\n" + error.message, {
                font: "20px Arial",
                fill: "#ff0000",
                align: "center"
            }).setOrigin(0.5);

            // return;
        }

        // =================================================
        // 2) RÉCUPÉRATION DES TILESETS
        // =================================================
        const terrainTileset = this.map.addTilesetImage("tileset", "tileset");
        const objectTileset = this.map.addTilesetImage("objects", "objects");
        const laveTileset = this.map.addTilesetImage("tileset_lave", "tileset_lave");

        const allTilesets = [terrainTileset, objectTileset, laveTileset].filter(Boolean);

        const worldWidth = this.map.widthInPixels;
        const worldHeight = this.map.heightInPixels;

        // =================================================
        // 3) CRÉATION DES FONDS / PARALLAX
        // =================================================

        // Fond fixe
        this.moon = this.add.image(0, 0, "moon")
            .setOrigin(0, 0)
            .setScrollFactor(0);

        this.moon.displayWidth = this.scale.width;
        this.moon.displayHeight = this.scale.height;

        // Montagnes qui bougent lentement
        this.mountains = this.add.tileSprite(
            0,
            this.scale.height - 420,
            worldWidth,
            420,
            "mountains"
        ).setOrigin(0, 0).setScrollFactor(0);

        // Cimetière qui bouge un peu plus vite
        this.graveyard = this.add.tileSprite(
            0,
            this.scale.height - 260,
            worldWidth,
            260,
            "graveyard"
        ).setOrigin(0, 0).setScrollFactor(0);

        // =================================================
        // 4) CRÉATION DES CALQUES DE LA MAP
        // =================================================
        this.groundLayer = this.map.createLayer("Ground", allTilesets, 0, 0);
        this.platformLayer = this.map.createLayer("Platforms", allTilesets, 0, 0);
        this.decorLayer = this.map.createLayer("Mid", allTilesets, 0, 0);
        this.frontLayer = this.map.createLayer("Front", allTilesets, 0, 0);

        if (!this.groundLayer) {
            console.error("Le calque 'Ground' est introuvable dans Tiled.");
            return;
        }

        // =================================================
        // 5) CRÉATION DES ANIMATIONS DU JOUEUR
        // =================================================
        if (!this.anims.exists("idle")) {
            this.anims.create({
                key: "idle",
                frames: this.anims.generateFrameNumbers("heroIdle", { start: 0, end: 3 }),
                frameRate: 6,
                repeat: -1
            });
        }

        if (!this.anims.exists("run")) {
            this.anims.create({
                key: "run",
                frames: this.anims.generateFrameNumbers("heroRun", { start: 0, end: 3 }),
                frameRate: 10,
                repeat: -1
            });
        }

        if (!this.anims.exists("jump")) {
            this.anims.create({
                key: "jump",
                frames: this.anims.generateFrameNumbers("heroJump", { start: 0, end: 3 }),
                frameRate: 8,
                repeat: -1
            });
        }

        // =================================================
        // 6) CRÉATION DU JOUEUR
        // =================================================
        this.player = this.physics.add.sprite(this.spawnX, this.spawnY, "heroIdle", 0);

        this.player.setCollideWorldBounds(true);
        this.player.setScale(1);
        this.player.setDepth(10);

        // Ajustement de la hitbox
        this.player.body.setSize(40, 70);
        this.player.body.setOffset(
            (this.player.width - 40) / 2,
            (this.player.height - 70) / 2
        );

        this.player.play("idle", true);

        // =================================================
        // 7) COLLISIONS AVEC LE SOL
        // =================================================
        this.groundLayer.setCollisionByProperty({ collides: true });

        // Les tuiles "hidden" sont invisibles au départ et sans collision
        this.groundLayer.forEachTile((tile) => {
            if (tile.properties && tile.properties.hidden === true) {
                tile.visible = false;
                tile.setCollision(false, false, false, false);
            }
        });

        this.physics.add.collider(this.player, this.groundLayer);

        // =================================================
        // 8) COLLISIONS AVEC LES PLATEFORMES
        // =================================================
        if (this.platformLayer) {
            this.platformLayer.setCollisionByExclusion([-1]);

            // Collision uniquement par le dessus
            this.platformLayer.forEachTile((tile) => {
                if (tile.index !== -1) {
                    tile.setCollision(false, false, true, false);
                }
            });

            this.platformLayer.calculateFacesWithin(
                0,
                0,
                this.platformLayer.layer.width,
                this.platformLayer.layer.height
            );

            this.physics.add.collider(this.player, this.platformLayer);
        }

        // =================================================
        // 9) CAMÉRA ET MONDE PHYSIQUE
        // =================================================
        this.cameras.main.setBounds(0, 0, worldWidth, worldHeight);
        this.physics.world.setBounds(0, 0, worldWidth, worldHeight);

        this.cameras.main.startFollow(this.player, true, 0.08, 0.08);
        this.cameras.main.setZoom(2);

        // =================================================
        // 10) CONTRÔLES CLAVIER
        // =================================================
        this.cursors = this.input.keyboard.createCursorKeys();

        // Démarre la musique dès qu'une touche est pressée
        this.input.keyboard.on("keydown", () => {
            this.tryStartMusic();
        });

        // =================================================
        // 11) SONS
        // =================================================
        this.statueSound = this.sound.add("statueSound", { volume: 0.4 });
        this.bgMusic = this.sound.add("bgMusic", { volume: 0.6, loop: true });

        // =================================================
        // 12) PROFONDEUR DES ÉLÉMENTS
        // =================================================
        this.moon.setDepth(0);
        this.mountains.setDepth(1);
        this.graveyard.setDepth(2);

        if (this.groundLayer) this.groundLayer.setDepth(3);
        if (this.platformLayer) this.platformLayer.setDepth(4);
        if (this.decorLayer) this.decorLayer.setDepth(5);
        if (this.frontLayer) this.frontLayer.setDepth(6);

        this.player.setDepth(10);

        // =================================================
        // 13) TEXTE DEBUG / AIDE
        // =================================================
        this.add.text(10, 10, "Phaser fonctionne !\nFlèches pour se déplacer\nFlèche haut pour sauter", {
            font: "16px monospace",
            fill: "#ffffff",
            stroke: "#000000",
            strokeThickness: 4
        }).setScrollFactor(0);

        console.log("%c[CREATE] Scène initialisée avec succès ! ✓", "color: #00ff00; font-weight: bold;");
    }

    // =====================================================
    // UPDATE
    // Gère la logique en temps réel
    // =====================================================
    update() {
        // Si le jeu est terminé, on ne met plus rien à jour
        if (this.gameEnded) return;

        // Sécurité si le joueur n'existe pas encore
        if (!this.player || !this.player.body) return;

        // =================================================
        // 1) DÉMARRAGE DE LA MUSIQUE SI LE JOUEUR BOUGE
        // =================================================
        if (this.cursors.left.isDown || this.cursors.right.isDown || this.cursors.up.isDown) {
            this.tryStartMusic();
        }

        // =================================================
        // 2) PARAMÈTRES DE DÉPLACEMENT
        // =================================================
        const speed = 220;
        const jumpForce = 520;

        let moving = false;

        // =================================================
        // 3) DÉPLACEMENTS HORIZONTAUX
        // =================================================
        if (this.cursors.left.isDown) {
            this.player.setVelocityX(-speed);
            this.player.setFlipX(true);
            moving = true;
        } else if (this.cursors.right.isDown) {
            this.player.setVelocityX(speed);
            this.player.setFlipX(false);
            moving = true;
        } else {
            this.player.setVelocityX(0);
        }

        // =================================================
        // 4) SAUT
        // =================================================
        if (this.cursors.up.isDown && this.player.body.blocked.down) {
            this.player.setVelocityY(-jumpForce);
        }

        // =================================================
        // 5) ANIMATIONS DU JOUEUR
        // =================================================
        if (!this.player.body.blocked.down) {
            this.player.play("jump", true);
        } else if (moving) {
            this.player.play("run", true);
        } else {
            this.player.play("idle", true);
        }

        // =================================================
        // 6) EFFET PARALLAX
        // =================================================
        const camX = this.cameras.main.scrollX;
        this.mountains.tilePositionX = camX * 0.15;
        this.graveyard.tilePositionX = camX * 0.35;

        // =================================================
        // 7) VÉRIFICATION DES TUILES MORTELLES
        // =================================================
        const footX = this.player.body.x + this.player.body.width / 2;
        const footY = this.player.body.y + this.player.body.height + 2;

        const tileBelow = this.groundLayer.getTileAtWorldXY(footX, footY, false);

        if (tileBelow && tileBelow.properties && tileBelow.properties.death === true) {
            this.respawnPlayer();
            return;
        }

        // Si le joueur tombe hors de la map
        if (this.player.y > this.map.heightInPixels + 100) {
            this.respawnPlayer();
            return;
        }

        // =================================================
        // 8) VÉRIFICATION DE LA TUILE DE FIN
        // =================================================
        const checkEndAroundPlayer = (layer) => {
            if (!layer) return false;

            const tiles = layer.getTilesWithinWorldXY(
                this.player.body.x,
                this.player.body.y,
                this.player.body.width,
                this.player.body.height,
                {}
            );

            return tiles.some(tile => tile && tile.properties && tile.properties.end === true);
        };

        const touchedEndTile =
            checkEndAroundPlayer(this.groundLayer) ||
            checkEndAroundPlayer(this.platformLayer) ||
            checkEndAroundPlayer(this.decorLayer) ||
            checkEndAroundPlayer(this.frontLayer);

        if (touchedEndTile && !this.gameEnded) {
            console.log("Tuile de fin touchée !");
            this.showCredits();
            return;
        }

        // =================================================
        // 9) ACTIVATION DE LA STATUE / SWITCH
        // =================================================
        const bodyCenterX = this.player.body.x + this.player.body.width / 2;
        const bodyCenterY = this.player.body.y + this.player.body.height / 2;

        if (!this.statueActivated && this.frontLayer) {
            const statueTile = this.frontLayer.getTileAtWorldXY(bodyCenterX, bodyCenterY, false);

            if (statueTile && statueTile.properties && statueTile.properties.switch === true) {
                this.statueActivated = true;

                // Lecture du son de la statue
                if (this.statueSound) {
                    this.statueSound.play();
                }

                // Révèle toutes les tuiles cachées
                this.groundLayer.forEachTile((tile) => {
                    if (tile.properties && tile.properties.hidden === true) {
                        tile.visible = true;
                        tile.setCollision(true, true, true, true);
                    }
                });

                // Recalcule les collisions après modification
                this.groundLayer.calculateFacesWithin(
                    0,
                    0,
                    this.groundLayer.layer.width,
                    this.groundLayer.layer.height
                );

                console.log("%c✓ Switch activé", "color: #00ff00;");
            }
        }
    }
}