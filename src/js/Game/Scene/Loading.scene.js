const TextureNamesEnum = require('../Sprite/TextureNames.enum');
const ExelleleratorSprite = require('../Sprite/Exellelerator.sprite');

module.exports =
class LoadingScene extends Phaser.Scene {

    init() {

    }

    preload() {
        this.load.multiatlas(TextureNamesEnum.SPRITE_ATLAS, 'asset/asset.json', 'asset/');
    }

    create() {

        ExelleleratorSprite.setAnimations(this);
        this.scene.start('Conveyor');
    }

    update() {

    }
};