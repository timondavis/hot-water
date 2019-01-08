import '../style/style.scss';

let Phaser = require('phaser');
let ConveyorScene = require('./Game/Scene/Conveyor.scene');
let LoadingScene = require('./Game/Scene/Loading.scene');

let conveyorScene = new ConveyorScene('Conveyor');
let loadingScene = new LoadingScene('Loading');

let game = new Phaser.Game({
   type: Phaser.AUTO,
   width: 800,
   height: 600,
   scene: [loadingScene, conveyorScene],
   pixelArt: true,
   backgroundColor: 'dfdfdf'
});



