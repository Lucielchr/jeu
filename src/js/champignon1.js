export class Champignon1 extends Phaser.Scene {
    constructor() {
        super('Champignon1');
    }

    init(data) {
        this.vientDuTuyau = data.questComplete || false;
    }

    preload() {
        this.load.spritesheet('yoshi', 'src/asset/yoshi.png', {
            frameWidth: 248,
            frameHeight: 385
        });
        this.load.image('tuyau', 'src/asset/tuyaux.png');
        this.load.tilemapTiledJSON('map1', 'src/asset/map_lucie.tmj');
        this.load.image('tuiles_img', 'src/asset/plat .png');
        this.load.image('fond_champignon', 'src/asset/champignon du fond .png');
        this.load.image('mimi_img', 'src/asset/mimi.png');
        this.load.image('ciel_img', 'src/asset/fond_lulu.png');
        this.load.image('donjon_img', 'src/asset/donjonfin_lulu.png');
        this.load.audio('musique_mario', 'src/asset/son_mario.mp3');
    }

    create() {
        this.cameras.main.fadeIn(1000, 0, 0, 0);
        this.physics.world.gravity.y = 800;

        if (!this.sound.get('musique_mario')) {
            this.bgMusic = this.sound.add('musique_mario', {
                volume: 0.3,
                loop: true
            });
            this.bgMusic.play();
        }

        const map = this.make.tilemap({
            key: 'map1'
        });
        const tsPlat = map.addTilesetImage('plat ', 'tuiles_img');
        const tsFond = map.addTilesetImage('champignon du fond ', 'fond_champignon');
        const tsMimi = map.addTilesetImage('mimi', 'mimi_img');
        const tsLulu = map.addTilesetImage('fond_lulu', 'ciel_img');
        const tsDonjon = map.addTilesetImage('donjonfin_lulu', 'donjon_img');
        const allTilesets = [tsPlat, tsFond, tsMimi, tsLulu, tsDonjon];

        map.createLayer('background1', allTilesets, 0, 0);
        map.createLayer('background2', allTilesets, 0, 0);
        map.createLayer('background4', allTilesets, 0, 0);

        const platRose = map.createLayer('champignon_rose', allTilesets, 0, 0);
        const platRouge = map.createLayer('champignon_rouge', allTilesets, 0, 0);
        const platBleu = map.createLayer('champignon_bleu', allTilesets, 0, 0);

        map.createLayer('détails', allTilesets, 0, 0);

        if (platRose) platRose.setCollisionByProperty({ estSolide: true });
        if (platRouge) platRouge.setCollisionByProperty({ estSolide: true });
        if (platBleu) platBleu.setCollisionByProperty({ estSolide: true });

        // --- OBJETS ---
        this.tuyau = this.physics.add.staticImage(1504, 580, 'tuyau').setDepth(5);
        this.donjon = this.physics.add.staticImage(3136, 256, 'donjon_img').setDepth(5);

        if (this.vientDuTuyau) {
            this.respawnX = 1504;
            this.respawnY = 350;
        } else {
            this.respawnX = 50;
            this.respawnY = 50;
        }

        this.player = this.physics.add.sprite(this.respawnX, this.respawnY, 'yoshi');
        this.player.setDisplaySize(50, 70).setCollideWorldBounds(true).setDepth(10);
        this.physics.world.setBoundsCollision(true, true, true, false);

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

        this.physics.add.collider(this.player, platRose, () => {
            if (this.player.body.blocked.down) this.player.setVelocityY(-400);
        });
        this.physics.add.collider(this.player, platRouge, () => {
            if (this.player.body.blocked.down) this.player.setVelocityY(-650);
        });
        this.physics.add.collider(this.player, platBleu);
        this.physics.add.collider(this.player, this.tuyau);

        // --- COLLISION DONJON (FIN) ---
        this.physics.add.collider(this.player, this.donjon, () => {
            if (this.vientDuTuyau) {
                this.registry.set('hasCisaille', true);
                this.afficherBulle(400, 300, "Cisaille récupérée ! Retour au Hub...");
                if (this.bgMusic) this.bgMusic.stop();
                this.time.delayedCall(2000, () => {
                    this.scene.start('Hub');
                });
            } else {
                this.afficherBulle(400, 300, "Le donjon est fermé, trouve la cisaille !");
            }
        });

        this.cursors = this.input.keyboard.createCursorKeys();
        this.physics.world.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
        this.cameras.main.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
        this.cameras.main.startFollow(this.player, true, 0.08, 0.08);

        // Message de départ
        this.time.delayedCall(500, () => {
            if (!this.vientDuTuyau) {
                this.afficherBulle(400, 100, 'Cherche la cisaille !');
            } else {
                this.afficherBulle(400, 100, 'Bravo ! Entre dans le donjon');
            }
        });
    }

    update() {
        if (this.cursors.left.isDown) {
            this.player.setVelocityX(-250);
            this.player.anims.play('anim_tourne_gauche', true);
        } else if (this.cursors.right.isDown) {
            this.player.setVelocityX(250);
            this.player.anims.play('anim_tourne_droite', true);
        } else {
            this.player.setVelocityX(0);
            this.player.anims.play('anim_face');
        }

        if (this.cursors.up.isDown && this.player.body.blocked.down) {
            this.player.setVelocityY(-600);
        }

        // Mort avec écran rouge
        if (this.player.y > this.physics.world.bounds.height + 50) {
            this.cameras.main.flash(500, 255, 0, 0);
            this.player.setPosition(this.respawnX, this.respawnY);
            this.player.setVelocity(0, 0);
        }

        if (Phaser.Geom.Intersects.RectangleToRectangle(this.player.getBounds(), this.tuyau.getBounds())) {
            if (this.cursors.down.isDown) {
                if (!this.vientDuTuyau) {
                    this.scene.start('Champignon2');
                } else {
                    this.afficherBulle(400, 300, "Le passage est fermé !");
                }
            }
        }
    }

    // FONCTION BULLE AMELIOREE
    afficherBulle(x, y, message) {
        if (this.bulleActive) return;
        this.bulleActive = true;

        // Texte
        let texte = this.add.text(x, y, message, {
            fontSize: '22px',
            fill: '#000000',
            fontFamily: 'Arial',
            align: 'center'
        })
            .setOrigin(0.5)
            .setDepth(102)
            .setScrollFactor(0);

        // Fond blanc arrondi
        let bg = this.add.graphics();
        bg.fillStyle(0xffffff, 1);
        bg.fillRoundedRect(
            x - (texte.width + 40) / 2,
            y - (texte.height + 20) / 2,
            texte.width + 40,
            texte.height + 20,
            15
        );
        bg.setDepth(101).setScrollFactor(0);

        // Bordure noire fine
        bg.lineStyle(2, 0x000000, 1);
        bg.strokeRoundedRect(
            x - (texte.width + 40) / 2,
            y - (texte.height + 20) / 2,
            texte.width + 40,
            texte.height + 20,
            15
        );

        this.time.delayedCall(3000, () => {
            texte.destroy();
            bg.destroy();
            this.bulleActive = false;
        });
    }
}