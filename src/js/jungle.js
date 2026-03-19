export class Jungle extends Phaser.Scene {
    constructor() {
        super({ key: 'Jungle' });
    }

    preload() {
        // Le ?v=Date.now() force le navigateur à ne pas utiliser le cache
        this.load.tilemapTiledJSON(
            "mapJungle",
            "src/asset/mapjungle.json?v=" + Date.now()
        );

        this.load.image("bloc1", "src/asset/bloc1.png");
        this.load.image("feuille", "src/asset/feuille.png");
        this.load.image("fondarbre", "src/asset/fondarbre.png");
        this.load.image("Gtemple", "src/asset/Gtemple.png");
        this.load.image("pillier", "src/asset/pillier.png");
        this.load.image("Ptemple", "src/asset/Ptemple.png");

        this.load.image("chest", "src/asset/chest.png");
        this.load.image("sword", "src/asset/épée.png");
        this.load.image("door", "src/asset/door.png");

        this.load.spritesheet("heroIdle", "src/asset/hero-idle.png", { frameWidth: 160, frameHeight: 90 });
        this.load.spritesheet("heroRun", "src/asset/hero-run.png", { frameWidth: 160, frameHeight: 90 });
        this.load.spritesheet("heroJump", "src/asset/hero-jump.png", { frameWidth: 160, frameHeight: 90 });
    }

    create() {
        // 1. Initialisation des variables d'état
        this.hasSword = false;
        this.swordSpawned = false;

        // 2. Création de la map
        const map = this.make.tilemap({ key: "mapJungle" });
        console.log("Données de la map chargées :", map);

        const tilesets = [
            map.addTilesetImage("bloc1", "bloc1"),
            map.addTilesetImage("Plan 1", "pillier"),
            map.addTilesetImage("Plan 2", "Gtemple"),
            map.addTilesetImage("Plan 4", "feuille"),
            map.addTilesetImage("Gemini_Generated_Image_8lz4oc8lz4oc8lz4", "fondarbre"),
            map.addTilesetImage("background 2", "Ptemple")
        ];

        // 3. Création des calques (Layers)
        this.layers = {};
        map.layers.forEach((layerData, index) => {
            const layer = map.createLayer(layerData.name, tilesets, 0, 0);
            if (layer) {
                this.layers[layerData.name] = layer;
                // On s'assure que les calques sont empilés dans l'ordre de Tiled
                layer.setDepth(index); 
            }
        });

        this.lianeLayer = this.layers["liane"];

        // 4. Spawn et Joueur
        const spawnPoint = map.findObject("Objects", obj => obj.name === "spawn");
        this.spawnX = spawnPoint ? spawnPoint.x : 50;
        this.spawnY = spawnPoint ? spawnPoint.y : 250;

        this.player = this.physics.add.sprite(this.spawnX, this.spawnY - 32, "heroIdle");
        this.player.setCollideWorldBounds(true);
        this.player.setGravityY(500);
        this.player.setOrigin(0.5, 0.5);
        this.player.setSize(40, 30);
        this.player.setOffset(60, 50);
        this.player.setDepth(50); // Toujours devant les décors

        // 5. Animations (si elles n'existent pas déjà)
        this.createAnims();

        // 6. Collisions Sol
        const sol = this.layers["parcours"];
        if (sol) {
            sol.setCollisionByExclusion([-1]);
            this.physics.add.collider(this.player, sol);
        }

        // 7. Plateformes Mobiles
        this.setupPlatforms(map);

        // 8. Logique du Coffre et de l'Épée
        this.setupItems(map);

        // 9. Logique de la Porte (Sauvegarde Registry)
        this.setupDoor(map);

        // 10. Zone de mort
        this.setupDeathZone(map);

        // 11. Caméra
        this.cameras.main.startFollow(this.player);
        this.cameras.main.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
        this.physics.world.setBounds(0, 0, map.widthInPixels, map.heightInPixels);

        this.cursors = this.input.keyboard.createCursorKeys();
    }

    createAnims() {
        if (!this.anims.exists("idle")) {
            this.anims.create({ key: "idle", frames: this.anims.generateFrameNumbers("heroIdle", { start: 0, end: 3 }), frameRate: 6, repeat: -1 });
        }
        if (!this.anims.exists("run")) {
            this.anims.create({ key: "run", frames: this.anims.generateFrameNumbers("heroRun", { start: 0, end: 3 }), frameRate: 10, repeat: -1 });
        }
        if (!this.anims.exists("jump")) {
            this.anims.create({ key: "jump", frames: this.anims.generateFrameNumbers("heroJump", { start: 0, end: 3 }), frameRate: 8, repeat: -1 });
        }
    }

    setupPlatforms(map) {
        const tileSize = map.tileWidth;
        const createPlatform = (tileX, tileY) => {
            const plat = this.add.rectangle(tileX * tileSize, tileY * tileSize, 120, 20, 0x2e8b57);
            this.physics.add.existing(plat);
            plat.body.setImmovable(true).setAllowGravity(false);
            this.physics.add.collider(this.player, plat);
            return plat;
        };

        const plats = [createPlatform(30, 15), createPlatform(32, 8), createPlatform(40, 16), createPlatform(43, 10)];
        plats.forEach((plat, i) => {
            this.tweens.add({
                targets: plat,
                y: i % 2 === 0 ? plat.y - 120 : plat.y,
                x: i % 2 !== 0 ? plat.x + 100 : plat.x,
                duration: 2000,
                yoyo: true,
                repeat: -1,
                onUpdate: () => plat.body.updateFromGameObject()
            });
        });
    }

    setupItems(map) {
        this.swordText = this.add.text(400, 150, "ÉPÉE RÉCUPÉRÉE ! ⚔️", {
            fontSize: '32px', fill: '#fff', backgroundColor: '#000', padding: { x: 20, y: 10 }
        }).setOrigin(0.5).setScrollFactor(0).setVisible(false).setDepth(100);

        const chestObj = map.findObject("Objects", obj => obj.name === "chest");
        if (chestObj) {
            this.chest = this.physics.add.image(chestObj.x, chestObj.y, "chest").setScale(0.5).setOrigin(0.5, 1).setImmovable(true);
            this.chest.body.allowGravity = false;

            this.physics.add.overlap(this.player, this.chest, () => {
                if (this.swordSpawned || this.hasSword) return;
                this.swordSpawned = true;
                this.sword = this.physics.add.image(this.chest.x, this.chest.y - 50, "sword").setScale(0.6).setDepth(60);
                this.sword.body.allowGravity = false;

                this.physics.add.overlap(this.player, this.sword, () => {
                    this.hasSword = true;
                    this.sword.destroy();
                    this.swordText.setVisible(true);
                    this.time.delayedCall(2000, () => this.swordText.setVisible(false));
                });
            });
        }
    }

    setupDoor(map) {
        const doorObj = map.findObject("Objects", obj => obj.name === "door");
        if (doorObj) {
            this.door = this.physics.add.image(doorObj.x, doorObj.y, "door").setScale(0.7).setOrigin(0.5, 1).setImmovable(true);
            this.door.body.allowGravity = false;
            this.physics.add.overlap(this.player, this.door, () => {
                if (this.hasSword) {
                    this.registry.set('hasEpee', true);
                    this.scene.start('Hub');
                }
            });
        }
    }

    setupDeathZone(map) {
        this.deathZone = this.add.rectangle(map.widthInPixels / 2, map.heightInPixels - 5, map.widthInPixels, 20);
        this.physics.add.existing(this.deathZone);
        this.deathZone.body.setAllowGravity(false).setImmovable(true);
        this.physics.add.overlap(this.player, this.deathZone, () => {
            this.player.setPosition(this.spawnX, this.spawnY);
            this.player.body.setVelocity(0, 0);
        });
    }

    update() {
        if (!this.player || !this.player.body) return;
        let speed = 200;
        let isMoving = false;

        if (this.lianeLayer && this.lianeLayer.hasTileAtWorldXY(this.player.x, this.player.y)) {
            speed = 80;
        }

        if (this.cursors.left.isDown) {
            this.player.setVelocityX(-speed);
            this.player.setFlipX(true);
            isMoving = true;
        } else if (this.cursors.right.isDown) {
            this.player.setVelocityX(speed);
            this.player.setFlipX(false);
            isMoving = true;
        } else {
            this.player.setVelocityX(0);
        }

        if (!this.player.body.blocked.down) {
            this.player.play("jump", true);
        } else if (isMoving) {
            this.player.play("run", true);
        } else {
            this.player.play("idle", true);
        }

        if (this.cursors.up.isDown && this.player.body.blocked.down) {
            this.player.setVelocityY(-400);
        }
    }
}