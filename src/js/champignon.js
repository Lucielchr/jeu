export default class Champignon extends Phaser.Scene {
    constructor() {
        super("Champignon");
        this.input.keyboard.on("keydown-ESC", () => {
        this.scene.start("Hub");
});
    }

    preload() {
        this.load.tilemapTiledJSON("mapChamp", "src/asset/champignon.json");
        this.load.image("tiles", "src/asset/tuilesJeu (3).png");
        this.load.image("player", "src/asset/yoshi.png");
    }

    create() {
        const map = this.make.tilemap({ key: "mapChamp" });

        const tileset = map.addTilesetImage("tuilesJeu (3)", "tiles");

        const layer = map.createLayer("parcours", tileset);

        layer.setCollisionByProperty({ estSolide: true });

        this.player = this.physics.add.sprite(100, 200, "player");

        this.physics.add.collider(this.player, layer);
    }
}