function creat(){
    // récupérer le calque d’objets "doors"
const objectsLayer = map.getObjectLayer("doors");

// groupe de portes
this.doors = this.physics.add.staticGroup();

// créer les zones de portes
objectsLayer.objects.forEach(obj => {

    const door = this.doors.create(obj.x, obj.y, null)
        .setSize(obj.width, obj.height)
        .setOrigin(0);

    // récupérer le target depuis Tiled
    const target = obj.properties.find(p => p.name === "target").value;

    door.setData("target", target);
});

// collision joueur / porte
this.physics.add.overlap(this.player, this.doors, (player, door) => {
    this.scene.start(door.getData("target"));
});
}