export class Champignon1 extends Phaser.Scene {
    constructor() { super({ key: 'Champignon1' }); }

    preload() {
        this.load.image('tiles-lucie', 'assets/image_139dfa.png');
        this.load.tilemapTiledJSON('map-lucie', 'assets/map_lucie.tmj');
        this.load.image('tuyau', 'assets/tuyaux.png');
    }

    create() {
        // Activation de la gravité pour cette scène uniquement
        this.physics.world.gravity.y = 800;

        const map = this.make.tilemap({ key: 'map-lucie' });
        const tileset = map.addTilesetImage('image_139dfa', 'tiles-lucie');

        // Création des calques
        const sol = map.createLayer('sol', tileset, 0, 0);
        const champisRouges = map.createLayer('champignons_rouges', tileset, 0, 0);
        const champisRoses = map.createLayer('champignons_roses', tileset, 0, 0);
        const champisBleus = map.createLayer('champignons_bleus', tileset, 0, 0);

        // On définit les collisions
        sol.setCollisionByProperty({ estSolide: true });
        champisRouges.setCollisionByProperty({ estSolide: true });
        champisRoses.setCollisionByProperty({ estSolide: true });
        champisBleus.setCollisionByProperty({ estSolide: true });

        this.player = this.physics.add.sprite(100, 100, 'player');
        
        // Collisions simples
        this.physics.add.collider(this.player, sol);
        this.physics.add.collider(this.player, champisBleus); // Bleu = pas de saut spécial

        // Rebond sur ROUGE (Très haut)
        this.physics.add.collider(this.player, champisRouges, () => {
            if (this.player.body.blocked.down) this.player.setVelocityY(-700);
        });

        // Rebond sur ROSE (Petit peu)
        this.physics.add.collider(this.player, champisRoses, () => {
            if (this.player.body.blocked.down) this.player.setVelocityY(-400);
        });

        this.tuyau = this.physics.add.staticImage(1200, 500, 'tuyau');
        this.cursors = this.input.keyboard.createCursorKeys();
        this.cameras.main.startFollow(this.player);
    }

    update() {
        if (this.cursors.left.isDown) this.player.setVelocityX(-200);
        else if (this.cursors.right.isDown) this.player.setVelocityX(200);
        else this.player.setVelocityX(0);

        // Saut normal sur le sol (touche haut)
        if (this.cursors.up.isDown && this.player.body.blocked.down) {
            this.player.setVelocityY(-350);
        }

        // Entrer dans le tuyau vers Champignon2
        if (Phaser.Math.Distance.Between(this.player.x, this.player.y, this.tuyau.x, this.tuyau.y) < 60 
            && this.cursors.down.isDown) {
            this.scene.start('Champignon2');
        }
    }
}