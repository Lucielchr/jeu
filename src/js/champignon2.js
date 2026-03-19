export class Champignon2 extends Phaser.Scene {
    constructor() { super('Champignon2'); }

    preload() {
        this.load.spritesheet('yoshi', 'src/asset/yoshi.png', { frameWidth: 248, frameHeight: 385 });
        this.load.image('tuyau', 'src/asset/tuyaux.png');
        this.load.image('bloc_img', 'src/asset/bloc.png');
        this.load.image('feu_img', 'src/asset/feu.png');
        this.load.image('coffre_img', 'src/asset/coffre_rouge.png');
        this.load.image('ciseaux_img', 'src/asset/Ciseaux.png');
        this.load.tilemapTiledJSON('map2', 'src/asset/map_lucie2.tmj');
        this.load.image('tuiles_img', 'src/asset/plat.png');
        this.load.image('fond_champignon', 'src/asset/champignon du fond .png');
    }

    create() {
        this.cameras.main.fadeIn(1000, 0, 0, 0);
        this.physics.world.gravity.y = 800;

        const map = this.make.tilemap({ key: 'map2' });
        const tsPlat = map.addTilesetImage('plat', 'tuiles_img');
        const tsFond = map.addTilesetImage('champignon du fond ', 'fond_champignon');
        const allTilesets = [tsPlat, tsFond];
        
        map.createLayer('fond', allTilesets, 0, 0);
        map.createLayer('tiges des plateformes', allTilesets, 0, 0);
        const platRose = map.createLayer('champignon_rose', allTilesets, 0, 0);
        const platRouge = map.createLayer('champignon_rouge', allTilesets, 0, 0);
        const platBleu = map.createLayer('champignon_bleu', allTilesets, 0, 0);

        if (platRose) platRose.setCollisionByProperty({ estSolide: true });
        if (platRouge) platRouge.setCollisionByProperty({ estSolide: true });
        if (platBleu) platBleu.setCollisionByProperty({ estSolide: true });

        this.spawnPoint = { x: 130, y: 70 };
        this.player = this.physics.add.sprite(this.spawnPoint.x, this.spawnPoint.y, 'yoshi');
        this.player.setDisplaySize(50, 70).setCollideWorldBounds(true);
        
        // --- DIRECTION PAR DEFAUT ---
        this.derniereDirection = 'droite';

        // --- BLOCS SOLIDES À DÉTRUIRE ---
        this.blocks = this.physics.add.group();
        for(let i = 0; i < 4; i++) {
            let b = this.blocks.create(1400, 280 - (i * 40), 'bloc_img');
            b.setDisplaySize(40, 40).setImmovable(true);
            b.body.allowGravity = false;
        }
        this.physics.add.collider(this.player, this.blocks);

        if (platBleu) this.physics.add.collider(this.player, platBleu, () => { if (this.player.body.blocked.down) this.player.setVelocityY(-400); });
        if (platRouge) this.physics.add.collider(this.player, platRouge, () => { if (this.player.body.blocked.down) this.player.setVelocityY(-650); });
        if (platRose) this.physics.add.collider(this.player, platRose);

        this.tuyauRetour = this.physics.add.staticImage(96, -20, 'tuyau').setFlipY(true);
        this.tuyauRetour.body.updateFromGameObject(); 
        this.physics.add.collider(this.player, this.tuyauRetour);

        this.coffre = this.physics.add.staticSprite(1440, 256, 'coffre_img').setDisplaySize(60, 60).setVisible(false);
        this.ciseaux = this.physics.add.staticSprite(1440, 200, 'ciseaux_img').setDisplaySize(40, 40).setVisible(false);
        this.hasCiseaux = false;

        this.fireballs = this.physics.add.group();
        this.keyA = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
        this.cursors = this.input.keyboard.createCursorKeys();

        // Collision tirs / blocs
        this.physics.add.collider(this.fireballs, this.blocks, (ball, block) => { 
            ball.destroy(); 
            block.destroy(); 
            if (this.blocks.countActive() === 0) this.coffre.setVisible(true); 
        });

        this.physics.add.overlap(this.player, this.coffre, () => { if (this.coffre.visible && !this.hasCiseaux) this.ciseaux.setVisible(true); });
        this.physics.add.overlap(this.player, this.ciseaux, () => { if (this.ciseaux.visible) { this.ciseaux.destroy(); this.hasCiseaux = true; this.cameras.main.flash(500, 255, 255, 255); } });

        this.cameras.main.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
        this.cameras.main.startFollow(this.player, true, 0.08, 0.08);
        this.physics.world.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
        this.physics.world.setBoundsCollision(true, true, true, false); 
        this.isExiting = false;
    }

    update() {
        if (this.isExiting) return;

        // --- MOUVEMENTS ET DETECTION DIRECTION ---
        if (this.cursors.left.isDown) { 
            this.player.setVelocityX(-250); 
            this.player.anims.play('anim_tourne_gauche', true);
            this.derniereDirection = 'gauche'; // Il regarde à gauche
        } 
        else if (this.cursors.right.isDown) { 
            this.player.setVelocityX(250); 
            this.player.anims.play('anim_tourne_droite', true);
            this.derniereDirection = 'droite'; // Il regarde à droite
        } 
        else { 
            this.player.setVelocityX(0); 
            this.player.anims.play('anim_face'); 
        }
        
        if (this.cursors.up.isDown && this.player.body.blocked.down) this.player.setVelocityY(-550);
        
        // Tirer avec A
        if (Phaser.Input.Keyboard.JustDown(this.keyA)) this.lancerFeu();

        // Sortie par le tuyau
        if (Phaser.Geom.Intersects.RectangleToRectangle(this.player.getBounds(), this.tuyauRetour.getBounds())) {
            if (this.cursors.up.isDown) {
                if (this.hasCiseaux) {
                    this.isExiting = true;
                    this.cameras.main.fadeOut(1000, 0, 0, 0);
                    this.cameras.main.once('camerafadeoutcomplete', () => { this.scene.start('Champignon1', { questComplete: true }); });
                } else {
                    this.afficherBulleAlerte(this.cameras.main.centerX, 500, "Vous devez d'abord trouver la cisaille !");
                }
            }
        }
        
        if (this.player.y > this.physics.world.bounds.height + 50) this.resetPlayer();
    }

    resetPlayer() {
        this.cameras.main.flash(400, 200, 0, 0); 
        this.player.setPosition(this.spawnPoint.x, this.spawnPoint.y);
        this.player.setVelocity(0, 0);
        this.player.anims.play('anim_face');
    }

    lancerFeu() {
        // Vitesse basée sur la variable derniereDirection
        let vx = (this.derniereDirection === 'gauche') ? -600 : 600;
        
        let ball = this.fireballs.create(this.player.x, this.player.y, 'feu_img');
        ball.setDisplaySize(30, 30);
        ball.setVelocityX(vx);
        ball.body.allowGravity = false;
        
        this.time.delayedCall(1500, () => { if(ball.active) ball.destroy(); });
    }

    afficherBulleAlerte(x, y, message) {
        if (this.alerteActive) return;
        this.alerteActive = true;
        let texte = this.add.text(0, 0, message, { fontSize: '20px', fill: '#000000', fontFamily: 'Arial' }).setDepth(102);
        let bg = this.add.graphics().fillStyle(0xffffff, 1).fillRoundedRect(x - (texte.width+40)/2, y - (texte.height+20)/2, texte.width+40, texte.height+20, 10).setDepth(101).setScrollFactor(0);
        texte.setPosition(x - texte.width/2, y - texte.height/2).setScrollFactor(0);
        this.time.delayedCall(2000, () => { texte.destroy(); bg.destroy(); this.alerteActive = false; });
    }
}