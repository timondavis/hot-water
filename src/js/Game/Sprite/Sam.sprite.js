let Phaser = require('phaser');
let TextureNamesEnum = require('./TextureNames.enum.js');

const animationKeyNames = {
    WALK: {
        UP: "sam/walk/up",
        DOWN: "sam/walk/down",
    },
    GRAB: {
        UP: "sam/grab/up",
        DOWN: "sam/grab/down",
    },
    STAND: {
        UP: "sam/stand/up",
        DOWN: "sam/stand/down",
    },
};

module.exports =
class SamSprite extends Phaser.GameObjects.Sprite {

    constructor(config) {
        super(config.scene, config.x, config.y, TextureNamesEnum.SPRITE_ATLAS, 'sam/stand/down-0.png');
        this.scene = config.scene;
        this.scene.add.existing(this);

        this.homeRow = config.x;
    }

    static get animationKeys() {
        return animationKeyNames;
    }

    stand() {
        this.setTexture(TextureNamesEnum.SPRITE_ATLAS, 'sam/walk/down-0.png');
    }

    onAnimationComplete(animation, frame) {

        const animationKey = animation.key;
        this.stand();
        this.scene.processingAction = false;
    }

    /**
     * Create animation frame names and the animations to consume them.
     */
    static setAnimations(scene) {

        // For each animationKey defined, loop through and:
        // 1.  Define the frame names
        // 2.  Define the animation which puts those frames to use.
        Object.keys(SamSprite.animationKeys).forEach((action) => {

            Object.keys(SamSprite.animationKeys[action]).forEach((direction) => {

                let startIndex = 0;
                let endIndex = 0;
                let zeroPad = 1;
                let horizontalInvert = false;
                let duration = 200;

                // Default indices, may be adjusted on a case-by-case basis if need be, but try to avoid
                // the need to do so.
                switch(action) {

                    case SamSprite.animationKeys.GRAB: {
                        break;
                    }
                    case SamSprite.animationKeys.STAND: {
                        break;
                    }
                    default:
                        let endIndex = 1;
                        let zeroPad = 1;
                        break;
                }

                // Generate frame names.
                let frameNames = scene.anims.generateFrameNames(TextureNamesEnum.SPRITE_ATLAS, {
                    start: 1,
                    end: 2,
                    zeroPad: 1,
                    prefix: SamSprite.animationKeys[action][direction] + "-",
                    suffix: '.png'
                });

                // Create new animation using those frame names.
                scene.anims.create({
                    key: SamSprite.animationKeys[action][direction],
                    frames: frameNames,
                    frameRate: 2,
                    repeat: -1,
                });
            });
        });
    }
};