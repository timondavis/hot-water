let Phaser = require('phaser');
let TextureNamesEnum = require('./TextureNames.enum.js');

module.exports =
class SamSprite extends Phaser.GameObjects.Sprite {

    constructor(config) {
        super(config.scene, config.x, config.y, TextureNamesEnum.SPRITE_ATLAS, 'sam/stand/down-0.png');
        this.scene = config.scene;
        this.scene.add.existing(this);
        this.setAnimations();

        this.homeRow = config.x;
    }

    setAnimations() {

        let path = "sam/";
        this.animationKeys = {
            WALK: {
                UP: path + "walk/up",
                DOWN: path + "walk/down",
                LEFT: path + "walk/left",
                RIGHT: path + "walk/left"
            },
            GRAB: {
                UP: path + "grab/up",
                DOWN: path + "grab/down",
            },
            STAND: {
                UP: path + "stand/up",
                DOWN: path + "stand/down",
                LEFT: path + "walk/left",
                RIGHT: path + "walk/right"
            },
        };

        this.assignAnimations();
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
    assignAnimations() {

        // For each animationKey defined, loop through and:
        // 1.  Define the frame names
        // 2.  Define the animation which puts those frames to use.
        Object.keys(this.animationKeys).forEach((action) => {

            Object.keys(this.animationKeys[action]).forEach((direction) => {

                let startIndex = 0;
                let endIndex = 0;
                let zeroPad = 1;
                let horizontalInvert = false;
                let duration = 200;

                // Default indices, may be adjusted on a case-by-case basis if need be, but try to avoid
                // the need to do so.
                switch(action) {

                    case this.animationKeys.GRAB: {
                        break;
                    }
                    case this.animationKeys.STAND: {
                        break;
                    }
                    default:
                        let endIndex = 1;
                        let zeroPad = 1;
                        break;
                }

                // Generate frame names.
                let frameNames = this.scene.anims.generateFrameNames(TextureNamesEnum.SPRITE_ATLAS, {
                    start: 1,
                    end: 2,
                    zeroPad: 1,
                    prefix: this.animationKeys[action][direction] + "-",
                    suffix: '.png'
                });

                // Create new animation using those frame names.
                this.scene.anims.create({
                    key: this.animationKeys[action][direction],
                    frames: frameNames,
                    frameRate: 2,
                    repeat: -1,
                });
            });
        });
    }
};