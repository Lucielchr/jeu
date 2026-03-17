export class Hub extends Phaser.Scene {
    constructor() { super({ key: 'hub' }); }

    create() {
        this.physics.world.gravity.y = 0;
        const map = this.make.tilemap({ key: 'map-hub' });
        const tileset = map.addTilesetImage('tileset_hub', 'tiles-hub');
        const obstacles = map.createLayer('Obstacles', tileset, 0, 0);

        // On active les collisions pour le calque obstacles
        obstacles.setCollisionByExclusion([-1]);

        this.player = this.physics.add.sprite(400, 300, 'player');
        this.physics.add.collider(this.player, obstacles);
        this.cursors = this.input.keyboard.createCursorKeys();

        // --- DÉTECTION DES TUILES PORTES ---
        // Remplace 12, 13 et 14 par les vrais IDs de tes tuiles dans Tiled
        obstacles.setTileIndexCallback(12, () => this.scene.start('Champignon'), this);
        obstacles.setTileIndexCallback(13, () => {
            if (this.registry.get('inventory')?.hasCisaille) this.scene.start('Jungle');
            else console.log("Bloqué ! Il faut la cisaille.");
        }, this);
        obstacles.setTileIndexCallback(14, () => {
            if (this.registry.get('inventory')?.hasEpee) this.scene.start('Demon');
            else console.log("Bloqué ! Il faut l'épée.");
        }, this);
    }

    update() {
        this.player.setVelocity(0);
        if (this.cursors.left.isDown) this.player.setVelocityX(-160);
        else if (this.cursors.right.isDown) this.player.setVelocityX(160);
        if (this.cursors.up.isDown) this.player.setVelocityY(-160);
        else if (this.cursors.down.isDown) this.player.setVelocityY(160);
        this.player.body.velocity.normalize().scale(160);
    }
}