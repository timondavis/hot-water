const TextureNamesEnum = require('../Sprite/TextureNames.enum');
const SamSprite = require('../Sprite/Sam.sprite');
const ExelleleratorSprite = require('../Sprite/Exellelerator.sprite');
const HyperassemblyChamberSprite = require('../Sprite/HyperassemblyChamber.sprite');

module.exports =
class LoadingScene extends Phaser.Scene {

    init() {

    }

    preload() {
        this.load.multiatlas(TextureNamesEnum.SPRITE_ATLAS, 'asset/asset.json', 'asset/');
    }

    create() {

        SamSprite.setAnimations(this);
        ExelleleratorSprite.setAnimations(this);
        HyperassemblyChamberSprite.setAnimations(this);
        this.scene.start('Conveyor');
    }

    update() {

    }
};