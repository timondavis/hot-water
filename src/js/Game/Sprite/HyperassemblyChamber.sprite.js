let Phaser = require('phaser');
let ItemSprite = require('./Item/Item.sprite');
let TextureNamesEnum = require('./TextureNames.enum');

let animationsRegistered = false;

module.exports =
class HyperassemblyChamberSprite extends Phaser.GameObjects.Sprite {

    constructor(config) {
        super(config.scene, config.x, config.y, TextureNamesEnum.SPRITE_ATLAS, 'hyperassembly-chamber/hyperassembly-chamber-0.png');
        this.scene = config.scene;
        this.scene.add.existing(this);
        this.setAnimations();
        this.setScale(3);

        this.on('animationcomplete', this.onAnimationComplete);

        this.minimumItemsRequired = 2;
        this.maximumItemsRequired = 2;

        this.items = [];
        this.requiredItemsTemplate = [];

        this.resetItemsTemplate();
    }

    /**
     * When item is inserted, check to see if there is a demand for such an item.  If there is demand,
     * 'consume' the item and light up
     * @param suggestedItem
     */
    insert(suggestedItem) {

        let matchingItems = this.requiredItemsTemplate.filter(
            requiredItem => requiredItem.itemType === suggestedItem.itemType && requiredItem.fulfilled === false
        );

        if (Array.isArray(matchingItems) && matchingItems.length) {
            this.anims.play(this.animationKeys.OPEN);

            const fulfilledItem =  matchingItems[0];
            fulfilledItem.fulfilled = true;
            fulfilledItem.setAlpha(1.0);
        }
    }

    resetItemsTemplate() {

        this.resetItems();
        this.requiredItemsTemplate = [];
        const numberOfItemsRequired = Phaser.Math.RND.between(this.minimumItemsRequired, this.maximumItemsRequired);

        let newItem = null;

        for (let i = 0 ; i < numberOfItemsRequired; i++) {
            newItem = new ItemSprite({
                scene: this.scene,
                x: (this.x - 20) + (i * 40), y: this.y - 80,
                type: ItemSprite.getRandomItemType(),
            });
            newItem.setScale(.8);
            newItem.setAlpha(.7);
            newItem.fulfilled = false;

            this.requiredItemsTemplate.push(newItem);
        }
    }

    resetItems() {

        this.items = [];
    }

    setAnimations() {

        this.animationKeys = {
           OPEN: 'hyperassemblyChamber-open',
           CLOSE: 'hyperassemblyChamber-close',
        };

        if (this.isAnimationsRegistered()) { return; }

        // Loop through each animation key and automate the registration of animations.
        Object.keys(this.animationKeys).forEach((animationKeyName) => {

            // Name and path are pretty much never going to change, just the number.
            const path = 'hyperassembly-chamber/';
            const name = 'hyperassembly-chamber-';

            // Start and end points for the filename references from the sprite atlas.
            let start = 0;
            let end = 2;
            let zeroPad = 1;

            // Allows us to reverse the declared frame order of an animation.
            let reverseOrder = false;

            // Configure the animation based on the animation key invoked.
            switch(this.animationKeys[animationKeyName]) {

                case (this.animationKeys.CLOSE): {
                    reverseOrder = true;
                    break;
                }
                default: {
                    break;
                }
            }

            // Generate frame names.
            let frameNames = this.scene.anims.generateFrameNames(TextureNamesEnum.SPRITE_ATLAS, {
                start: start,
                end: end,
                zeroPad: zeroPad,
                prefix: path + name,
                suffix: '.png'
            });

            if (reverseOrder) {
                const reversed = [];
                for (let i = frameNames.length ; i >= 0 ; i--) {
                   reversed.push(frameNames[i]);
                }
                frameNames = reversed;
            }

            // Create new animation using those frame names.
            this.scene.anims.create({
                key: this.animationKeys[animationKeyName],
                frames: frameNames,
                frameRate: 2,
                repeat: 0
            });
        });

        animationsRegistered = true;
    }

    isAnimationsRegistered() {
        return animationsRegistered;
    }

    onAnimationComplete(animation) {

        if (animation.key == this.animationKeys.OPEN) {
            setTimeout(() => this.anims.play(this.animationKeys.CLOSE), 3000);
        }
    }
};