const TextureNames = require('./TextureNames.enum');
const Phaser = require('phaser');

const staticSprites = {
    CONVEYOR_OUTSIDE: "conveyer/outside",
    CONVEYOR_CENTER: "conveyer/center",
    EXCELLELERATOR: "excellelerator/excellelerator",
    POLYBENCH: "polybench/polybench"
};

let registeredAnimations = [];

module.exports =
class StaticSprite extends Phaser.GameObjects.Sprite {


    constructor(config) {
        super(config.scene, config.x, config.y, TextureNames.SPRITE_ATLAS, (config.staticFrame)? config.staticFrame : config.spriteName + '-0.png');
        console.log(config.spriteName);
        this.scene = config.scene;
        this.scene.add.existing(this);
        this.startFrame = (config.start) ? config.start : 0;
        this.endFrame = (config.end) ? config.end : 1;
        this.zeroPad = (config.zeroPad) ? config.zeroPad: 1;
        this.setScale((config.scale) ? config.scale : 1);
        this.spriteName = config.spriteName;
        this.yoyo = (config.yoyo) ? config.yoyo : false;
        this.autoPlay = (config.hasOwnProperty('autoPlay') ? config.autoplay : true);

        if ( this.registerAnimations() ) {
            registeredAnimations.push(this.spriteName);
        }

        if (this.autoPlay) {
            this.play();
        }
    }

    static get SpriteNames() { return staticSprites }

    registerAnimations() {

        // Don't re-register if registered.
        if (registeredAnimations.indexOf(this.spriteName) !== -1) { return false; }

        console.log(this.endFrame);
        const frameNames = this.scene.anims.generateFrameNames(TextureNames.SPRITE_ATLAS, {
            start: this.startFrame,
            end: this.endFrame,
            zeroPad: this.zeroPad,
            prefix: this.spriteName + '-',
            suffix: '.png'
        });

        this.scene.anims.create({
            key: this.spriteName,
            frames: frameNames,
            frameRate: 2,
            repeat: -1,
            yoyo: this.yoyo
        });

        return true;
    }

    play() {
        this.anims.play(this.spriteName);
    }

    pause() {
        this.anims.pause(this.spriteName);
    }

};