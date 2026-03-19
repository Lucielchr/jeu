export class Jungle extends Phaser.Scene {
    constructor() {
        // Identifiant unique de la scène pour pouvoir y basculer avec this.scene.start('Jungle')
        super({ key: 'Jungle' });
    }

    preload() {
        // --- CHARGEMENT DE LA CARTE ---
        // Le ?v=Date.now() est une astuce pour éviter que le navigateur garde une vieille version du JSON en mémoire
        this.load.tilemapTiledJSON(
            "mapJungle",
            "src/asset/mapjungle.json?v=" + Date.now()
        );

        // --- CHARGEMENT DES ASSETS GRAPHIQUES ---
        this.load.image("bloc1", "src/asset/bloc1.png");
        this.load.image("feuille", "src/asset/feuille.png");
        this.load.image("fondarbre", "src/asset/fondarbre.png");
        this.load.image("Gtemple", "src/asset/Gtemple.png");
        this.load.image("pillier", "src/asset/pillier.png");
        this.load.image("Ptemple", "src/asset/Ptemple.png");

        // Objets interactifs
        this.load.image("chest", "src/asset/chest.png");
        this.load.image("sword", "src/asset/épée.png");
        this.load.image("door", "src/asset/door.png");

        // --- CHARGEMENT DU PERSONNAGE (Animations) ---
        // On découpe les images en carrés de 160x90 pixels
        this.load.spritesheet("heroIdle", "src/asset/hero-idle.png", { frameWidth: 160, frameHeight: 90 });
        this.load.spritesheet("heroRun", "src/asset/hero-run.png", { frameWidth: 160, frameHeight: 90 });
        this.load.spritesheet("heroJump", "src/asset/hero-jump.png", { frameWidth: 160, frameHeight: 90 });
    }

    create() {
        // 1. Initialisation des variables d'état (propres à cette scène)
        this.hasSword = false;      // Le joueur porte-t-il l'épée actuellement ?
        this.swordSpawned = false;  // L'épée est-elle déjà sortie du coffre ?

        // 2. Création de la map technique
        const map = this.make.tilemap({ key: "mapJungle" });
        console.log("Données de la map chargées :", map);

        // Association des noms Tiled aux images chargées dans le preload
        const tilesets = [
            map.addTilesetImage("bloc1", "bloc1"),
            map.addTilesetImage("Plan 1", "pillier"),
            map.addTilesetImage("Plan 2", "Gtemple"),
            map.addTilesetImage("Plan 4", "feuille"),
            map.addTilesetImage("Gemini_Generated_Image_8lz4oc8lz4oc8lz4", "fondarbre"),
            map.addTilesetImage("background 2", "Ptemple")
        ];

        // 3. Création automatique des calques (Layers)
        this.layers = {};
        map.layers.forEach((layerData, index) => {
            const layer = map.createLayer(layerData.name, tilesets, 0, 0);
            if (layer) {
                this.layers[layerData.name] = layer;
                // On utilise l'index de Tiled pour gérer la profondeur (qui est devant quoi)
                layer.setDepth(index); 
            }
        });

        // On récupère le calque "liane" pour la logique de ralentissement plus tard
        this.lianeLayer = this.layers["liane"];

        // 4. Positionnement du Joueur via les objets de Tiled
        const spawnPoint = map.findObject("Objects", obj => obj.name === "spawn");
        this.spawnX = spawnPoint ? spawnPoint.x : 50;
        this.spawnY = spawnPoint ? spawnPoint.y : 250;

        // Création du sprite avec physique
        this.player = this.physics.add.sprite(this.spawnX, this.spawnY - 32, "heroIdle");
        this.player.setCollideWorldBounds(true); // Bloqué par les bords de la map
        this.player.setGravityY(500);            // Force de la gravité
        this.player.setOrigin(0.5, 0.5);
        this.player.setSize(40, 30);             // Ajuste la "hitbox" (zone de collision) pour être plus précise
        this.player.setOffset(60, 50);           // Centre la hitbox sur le corps du sprite
        this.player.setDepth(50);                // S'assure que le joueur passe devant les décors de fond

        // 5. Création des animations (voir fonction createAnims)
        this.createAnims();

        // 6. Gestion des collisions avec le sol ("parcours")
        const sol = this.layers["parcours"];
        if (sol) {
            // Collision activée pour toutes les cases sauf les vides (-1)
            sol.setCollisionByExclusion([-1]);
            this.physics.add.collider(this.player, sol);
        }

        // 7. Plateformes Mobiles (voir fonction setupPlatforms)
        this.setupPlatforms(map);

        // 8. Logique du Coffre et de l'Épée (voir fonction setupItems)
        this.setupItems(map);

        // 9. Logique de la Porte (voir fonction setupDoor)
        this.setupDoor(map);

        // 10. Zone de chute mortelle (voir fonction setupDeathZone)
        this.setupDeathZone(map);

        // 11. Configuration Caméra et Limites du monde
        this.cameras.main.startFollow(this.player); // La caméra suit le héros
        this.cameras.main.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
        this.physics.world.setBounds(0, 0, map.widthInPixels, map.heightInPixels);

        // Capture des touches clavier
        this.cursors = this.input.keyboard.createCursorKeys();
    }

    // --- CRÉATION DES ANIMATIONS ---
    createAnims() {
        // On vérifie si l'anim existe déjà pour éviter les erreurs de doublons au rechargement
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

    // --- PLATEFORMES MOBILES ---
    setupPlatforms(map) {
        const tileSize = map.tileWidth;
        const createPlatform = (tileX, tileY) => {
            // Dessine un rectangle vert pour servir de plateforme
            const plat = this.add.rectangle(tileX * tileSize, tileY * tileSize, 120, 20, 0x2e8b57);
            this.physics.add.existing(plat); // Active la physique
            plat.body.setImmovable(true).setAllowGravity(false); // Ne tombe pas, ne bouge pas à l'impact
            this.physics.add.collider(this.player, plat); // Le joueur peut marcher dessus
            return plat;
        };

        // Création d'une liste de plateformes
        const plats = [createPlatform(30, 15), createPlatform(32, 8), createPlatform(40, 16), createPlatform(43, 10)];
        plats.forEach((plat, i) => {
            // Utilisation des "Tweens" pour créer le mouvement de va-et-vient
            this.tweens.add({
                targets: plat,
                y: i % 2 === 0 ? plat.y - 120 : plat.y, // Mouvement vertical pour 1 sur 2
                x: i % 2 !== 0 ? plat.x + 100 : plat.x, // Mouvement horizontal pour les autres
                duration: 2000,
                yoyo: true,     // Revient au point de départ
                repeat: -1,     // Infini
                onUpdate: () => plat.body.updateFromGameObject() // Crucial : met à jour la hitbox pendant le mouvement
            });
        });
    }

    // --- LOGIQUE DES OBJETS (COFFRE + ÉPÉE) ---
    setupItems(map) {
        // Texte qui s'affichera à la ramasse
        this.swordText = this.add.text(400, 150, "ÉPÉE RÉCUPÉRÉE ! ⚔️", {
            fontSize: '32px', fill: '#fff', backgroundColor: '#000', padding: { x: 20, y: 10 }
        }).setOrigin(0.5).setScrollFactor(0).setVisible(false).setDepth(100);

        const chestObj = map.findObject("Objects", obj => obj.name === "chest");
        if (chestObj) {
            // Place le coffre
            this.chest = this.physics.add.image(chestObj.x, chestObj.y, "chest").setScale(0.5).setOrigin(0.5, 1).setImmovable(true);
            this.chest.body.allowGravity = false;

            // Détection quand le joueur touche le coffre
            this.physics.add.overlap(this.player, this.chest, () => {
                if (this.swordSpawned || this.hasSword) return; // Empêche de faire apparaître 2 épées
                
                this.swordSpawned = true;
                // L'épée apparaît au-dessus du coffre
                this.sword = this.physics.add.image(this.chest.x, this.chest.y - 50, "sword").setScale(0.6).setDepth(60);
                this.sword.body.allowGravity = false;

                // Détection ramassage de l'épée
                this.physics.add.overlap(this.player, this.sword, () => {
                    this.hasSword = true;
                    this.sword.destroy(); // Supprime l'épée du sol
                    this.swordText.setVisible(true); // Affiche le message de succès
                    this.time.delayedCall(2000, () => this.swordText.setVisible(false)); // Cache le message après 2s
                });
            });
        }
    }

    // --- SORTIE DU NIVEAU ---
    setupDoor(map) {
        const doorObj = map.findObject("Objects", obj => obj.name === "door");
        if (doorObj) {
            this.door = this.physics.add.image(doorObj.x, doorObj.y, "door").setScale(0.7).setOrigin(0.5, 1).setImmovable(true);
            this.door.body.allowGravity = false;
            
            this.physics.add.overlap(this.player, this.door, () => {
                // On ne peut sortir que si on a trouvé l'épée
                if (this.hasSword) {
                    this.registry.set('hasEpee', true); // Sauvegarde globale de l'épée
                    this.scene.start('Hub');           // Retour au Hub
                }
            });
        }
    }

    // --- ZONE DE MORT (CHUTE) ---
    setupDeathZone(map) {
        // Crée une zone invisible tout en bas de la carte
        this.deathZone = this.add.rectangle(map.widthInPixels / 2, map.heightInPixels - 5, map.widthInPixels, 20);
        this.physics.add.existing(this.deathZone);
        this.deathZone.body.setAllowGravity(false).setImmovable(true);
        
        // Si le joueur tombe dedans, il réapparaît au point de départ
        this.physics.add.overlap(this.player, this.deathZone, () => {
            this.player.setPosition(this.spawnX, this.spawnY);
            this.player.body.setVelocity(0, 0); // Stop son élan
        });
    }

    update() {
        if (!this.player || !this.player.body) return;
        
        let speed = 200;
        let isMoving = false;

        // --- LOGIQUE DES LIANES (RALENTISSEMENT) ---
        // Vérifie si les pieds du joueur touchent une case du calque "liane"
        if (this.lianeLayer && this.lianeLayer.hasTileAtWorldXY(this.player.x, this.player.y)) {
            speed = 80; // Divise la vitesse par plus de 2
        }

        // --- MOUVEMENTS GAUCHE / DROITE ---
        if (this.cursors.left.isDown) {
            this.player.setVelocityX(-speed);
            this.player.setFlipX(true); // Oriente le sprite vers la gauche
            isMoving = true;
        } else if (this.cursors.right.isDown) {
            this.player.setVelocityX(speed);
            this.player.setFlipX(false); // Oriente le sprite vers la droite
            isMoving = true;
        } else {
            this.player.setVelocityX(0);
        }

        // --- GESTION DES ANIMATIONS SELON L'ÉTAT ---
        if (!this.player.body.blocked.down) {
            // Si le joueur est en l'air
            this.player.play("jump", true);
        } else if (isMoving) {
            // S'il avance au sol
            this.player.play("run", true);
        } else {
            // S'il est immobile au sol
            this.player.play("idle", true);
        }

        // --- SAUT ---
        // Autorisé uniquement si le joueur touche le sol (blocked.down)
        if (this.cursors.up.isDown && this.player.body.blocked.down) {
            this.player.setVelocityY(-400);
        }
    }
}