var config = {
  type: Phaser.AUTO,
  width: 800, 
  height: 600, 
  physics: {
    // définition des parametres physiques
    default: "arcade", // mode arcade : le plus simple : des rectangles pour gérer les collisions. Pas de pentes
    arcade: {
      // parametres du mode arcade
      gravity: {
        y: 300 // gravité verticale : acceleration ddes corps en pixels par seconde
      },
      debug: false // permet de voir les hitbox et les vecteurs d'acceleration quand mis à true
    }
}
}

function create() {
 player = this.add.rectangle(150, 200, 28, 40, 0xffffff);
  this.physics.add.existing(player);

  player.body.setCollideWorldBounds(true);
  player.body.setSize(28, 40);
  player.body.setOffset(0, 0);

  // Collision joueur / map
  this.physics.add.collider(player, physicsLayer);

  console.log("%c✓ Joueur créé", "color: #00ff00;");
}


function update() {
  if (!player || !player.body) return;

  const speed = 220;
  const jumpForce = 520;

  // =========================================
  // Déplacement joueur
  // =========================================
  if (cursors.left.isDown) {
    player.body.setVelocityX(-speed);
  } else if (cursors.right.isDown) {
    player.body.setVelocityX(speed);
  } else {
    player.body.setVelocityX(0);
  }

  if (cursors.up.isDown && player.body.blocked.down) {
    player.body.setVelocityY(-jumpForce);
  }
}