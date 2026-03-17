export class champignon extends Phaser.Scene {
    constructor() { super({ key: 'champignon' }); }

    create() {
        this.physics.world.gravity.y = 800; // Gravité active
        
        const map = this.make.tilemap({ key: 'map-champ' });
        const tileset = map.addTilesetImage('tiles_plateforme', 'tiles-img');
        const sol = map.createLayer('Sol', tileset, 0, 0);
        sol.setCollisionByExclusion([-1]);

        this.player = this.physics.add.sprite(100, 500, 'player');
        this.physics.add.collider(this.player, sol);
        this.cursors = this.input.keyboard.createCursorKeys();

        // L'objet à ramasser (ici la cisaille)
        this.cisaille = this.physics.add.sprite(700, 400, 'cisaille');
        this.physics.add.overlap(this.player, this.cisaille, () => {
            let inv = this.registry.get('inventory') || { hasCisaille: false, hasEpee: false };
            inv.hasCisaille = true;
            this.registry.set('inventory', inv);
            this.scene.start('hub'); // Retour au Hub
        });
    }

    update() {
        if (this.cursors.left.isDown) this.player.setVelocityX(-200);
        else if (this.cursors.right.isDown) this.player.setVelocityX(200);
        else this.player.setVelocityX(0);

        if (this.cursors.up.isDown && this.player.body.onFloor()) {
            this.player.setVelocityY(-500); // Saut
        }
    }
}