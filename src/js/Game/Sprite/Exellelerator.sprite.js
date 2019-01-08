let Phaser = require('phaser');
let TextureNamesEnum = require('./TextureNames.enum');

let animationsRegistered = false;

const animationKeyMap = {
    OPEN: 'excellelerator-open',
    CLOSE: 'excellelerator-close'
};

module.exports =
class ExelleleratorSprite extends Phaser.GameObjects.Sprite {

    constructor(config) {
        super(config.scene, config.x, config.y, TextureNamesEnum.SPRITE_ATLAS, 'excellelerator/excellelerator-0.png');
        this.scene = config.scene;
        this.scene.add.existing(this);
        this.setScale(3);

        this.on('animationcomplete', this.onAnimationComplete);
    }

    static get animationKeys() { return animationKeyMap; }

    onAnimationComplete(animation) {

        if (animation.key == this.animationKeys.OPEN) {
            setTimeout(() => this.anims.play(this.animationKeys.CLOSE), 3000);
        }
    }

    static setAnimations(scene) {

        if (animationsRegistered) { return; }

        // Loop through each animation key and automate the registration of animations.
        Object.keys(ExelleleratorSprite.animationKeys).forEach((animationKeyName) => {

            // Name and path are pretty much never going to change, just the number.
            const path = 'excellelerator/';
            const name = 'excellelerator-';

            // Start and end points for the filename references from the sprite atlas.
            let start = 0;
            let end = 2;
            let zeroPad = 1;

            // Allows us to reverse the declared frame order of an animation.
            let reverseOrder = false;

            // Configure the animation based on the animation key invoked.
            switch(ExelleleratorSprite.animationKeys[animationKeyName]) {

                case (ExelleleratorSprite.animationKeys.CLOSE): {
                    reverseOrder = true;
                    break;
                }
                default: {
                    break;
                }
            }

            // Generate frame names.
            let frameNames = scene.anims.generateFrameNames(TextureNamesEnum.SPRITE_ATLAS, {
                start: start,
                end: end,
                zeroPad: zeroPad,
                prefix: path + name,
                suffix: '.png'
            });

            if (reverseOrder) {
                const reversed = [];
                for (let i = frameNames.length - 1; i >= 0 ; i--) {
                    reversed.push(frameNames[i]);
                }
                frameNames = reversed;
            }

            // Create new animation using those frame names.
            scene.anims.create({
                key: this.animationKeys[animationKeyName],
                frames: frameNames,
                frameRate: 2,
                repeat: 0
            });
        });

        animationsRegistered = true;
    }
};