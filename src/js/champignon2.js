export class Champignon2 extends Phaser.Scene {
    constructor() { super({ key: 'Champignon2' }); }

    preload() {
        this.load.image('bloc', 'assets/bloc.png');
        this.load.image('carapace', 'assets/carapace.png'); // Ajoute une image de carapace
        this.load.image('tuyau', 'assets/tuyaux.png');
    }

    create() {
        this.physics.world.gravity.y = 800;
        // ... (Code chargement Map Lucie 2 identique à la 1 pour les calques)

        this.blocks = this.physics.add.staticGroup(); 
        this.carapaces = this.physics.add.group();

        // On crée les blocs (tu peux aussi les placer via des Objets dans Tiled)
        this.blocks.create(1800, 500, 'bloc');

        // Lancer de carapace
        this.input.keyboard.on('keydown-A', () => {
            let vx = this.player.flipX ? -400 : 400;
            let cara = this.carapaces.create(this.player.x, this.player.y, 'carapace');
            cara.setVelocityX(vx);
            cara.setBounce(1); // La carapace rebondit sur les murs
            cara.setCollideWorldBounds(true);
        });

        // Collision carapace casse le bloc
        this.physics.add.overlap(this.carapaces, this.blocks, (cara, bloc) => {
            bloc.destroy();
            cara.destroy();
        });

        // Tuyau de retour (en haut à gauche)
        this.tuyauRetour = this.physics.add.staticImage(50, 50, 'tuyau');
    }

    update() {
        // ... contrôles joueur ...
        
        // Retour vers Champignon1
        if (Phaser.Math.Distance.Between(this.player.x, this.player.y, this.tuyauRetour.x, this.tuyauRetour.y) < 50 
            && this.cursors.up.isDown) {
            this.scene.start('Champignon1');
        }
    }
}