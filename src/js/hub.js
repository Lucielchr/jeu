export class Hub extends Phaser.Scene {
    constructor() { super({ key: 'Hub' }); }

    preload() {
        // Chargement des images et du JSON
        this.load.image('tiles-hub', 'assets/hub_jeu.png'); // Ton image tileset
        this.load.tilemapTiledJSON('map-hub', 'assets/hub.json'); // Ton JSON Tiled
        this.load.spritesheet('player', 'assets/perso.png', { frameWidth: 32, frameHeight: 48 });
    }

    create() {
        this.physics.world.gravity.y = 0;
        const map = this.make.tilemap({ key: 'map-hub' });
        
        // "hub_jeu" est le nom que tu as donné au tileset DANS Tiled
        const tileset = map.addTilesetImage('hub_jeu', 'tiles-hub');

        // --- CRÉATION DES 5 CALQUES ---
        // L'ordre d'affichage dépend de l'ordre ici (le premier est tout en dessous)
        const mur_invisible = map.createLayer('mur invisible', tileset, 0, 0);
        const herbe = map.createLayer('herbe', tileset, 0, 0);
        const detail = map.createLayer('detail', tileset, 0, 0);
        const arbre = map.createLayer('arbre', tileset, 0, 0);
        const detail2 = map.createLayer('detail2', tileset, 0, 0);
        
        

        // --- GESTION DES COLLISIONS (Propriété estSolide) ---
        // On liste les calques qui doivent bloquer le joueur
        const calquesSolides = [arbre, murInvisible];

        calquesSolides.forEach(layer => {
            // Cette ligne magique cherche la propriété "estSolide" dans ton JSON
            layer.setCollisionByProperty({ estSolide: true });
        });

        // --- JOUEUR ---
        this.player = this.physics.add.sprite(400, 300, 'player');
        
        // On ajoute la collision entre le joueur et les calques solides
        this.physics.add.collider(this.player, arbre);
        this.physics.add.collider(this.player, murInvisible);

        this.cursors = this.input.keyboard.createCursorKeys();
        this.cameras.main.startFollow(this.player);
    }

    update() {
        this.player.setVelocity(0);
        const speed = 180;

        if (this.cursors.left.isDown) this.player.setVelocityX(-speed);
        else if (this.cursors.right.isDown) this.player.setVelocityX(speed);

        if (this.cursors.up.isDown) this.player.setVelocityY(-speed);
        else if (this.cursors.down.isDown) this.player.setVelocityY(speed);

        this.player.body.velocity.normalize().scale(speed);
    }
}


// Si le perso tombe dans le trou (mettons aux coordonnées X: 1504, Y: 1312)
if (Phaser.Math.Distance.Between(this.player.x, this.player.y, 1504, 1312) < 64) {
    this.scene.start('Champignon1');
}