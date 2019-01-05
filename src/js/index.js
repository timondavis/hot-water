import '../style/style.scss';

let Phaser = require('phaser');
let ConveyorScene = require('./Game/Scene/Conveyor.scene');

let conveyorScene = new ConveyorScene('Conveyor');

let game = new Phaser.Game({
   type: Phaser.AUTO,
   width: 800,
   height: 600,
   scene: [conveyorScene],
   pixelArt: true,
   backgroundColor: 'dfdfdf'
});



