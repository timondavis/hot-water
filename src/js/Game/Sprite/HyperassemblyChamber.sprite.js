let Phaser = require('phaser');
let ItemSprite = require('./Item.sprite');
let TextureNamesEnum = require('./TextureNames.enum');

let animationsRegistered = false;

const animationKeyNames = {
    OPEN: 'hyperassemblyChamber-open',
    CLOSE: 'hyperassemblyChamber-close',
};

module.exports =
class HyperassemblyChamberSprite extends Phaser.GameObjects.Sprite {

    constructor(config) {
        super(config.scene, config.x, config.y, TextureNamesEnum.SPRITE_ATLAS, 'hyperassembly-chamber/hyperassembly-chamber-0.png');
        this.scene = config.scene;
        this.scene.add.existing(this);
        this.setScale(3);

        this.minimumItemsRequired = 2;
        this.maximumItemsRequired = 4;

        this.requiredItems = [];
        this.requiredItemsBg = null;
        this.resetItemsTemplate();

        this.on('animationcomplete', this.onAnimationComplete);
    }

    /**
     * When item is inserted, check to see if there is a demand for such an item.  If there is demand,
     * 'consume' the item and light up
     * @param suggestedItem
     */
    insert(suggestedItem) {

        if (!this.mayItemBeInserted(suggestedItem)) { return; }

        let matchingItems = this.requiredItems.filter(
            requiredItem => requiredItem.itemType === suggestedItem.itemType && requiredItem.fulfilled === false
        );

        if (Array.isArray(matchingItems) && matchingItems.length) {
            this.anims.play(HyperassemblyChamberSprite.animationKeys.OPEN);

            const fulfilledItem =  matchingItems[0];
            fulfilledItem.fulfilled = true;
            fulfilledItem.setAlpha(1.0);

            this.scene.itemCount[suggestedItem.itemType] --;
        }
    }

    static get animationKeys() {
        return animationKeyNames;
    }

    /**
     * May the suggested item be inserted into the Hyperassembly Chamber?
     *
     * @param suggestedItem ItemSprite
     * @returns {boolean}
     */
    mayItemBeInserted(suggestedItem) {

        let matchingItems = this.requiredItems.filter(
            requiredItem => requiredItem.itemType === suggestedItem.itemType && requiredItem.fulfilled === false
        );

        if (Array.isArray(matchingItems) && matchingItems.length) {
            return true;
        }

        return false;
    }

    /**
     * Has the Hyperassembly Chamber produced its product?
     *
     * @returns {boolean}
     */
    isProductComplete() {

        let isProductReady = true;

        this.requiredItems.forEach((item) => {
            if (!item.fulfilled) { isProductReady = false; }
        });

        return isProductReady;
    }

    /**
     * Clear out the required items template for the hyperassembly chamber and set with new values.
     */
    resetItemsTemplate() {

        if (this.requiredItems) {
            this.requiredItems.forEach(sprite => sprite.destroy())
        }


        this.requiredItems = [];
        const numberOfItemsRequired = Phaser.Math.RND.between(this.minimumItemsRequired, this.maximumItemsRequired);

        let newItem = null;
        let xOffset = ((20 * numberOfItemsRequired) / 2) + (5 * (numberOfItemsRequired - 1)) ;

        for (let i = 0 ; i < numberOfItemsRequired; i++) {
            newItem = new ItemSprite({
                scene: this.scene,
                x: (this.x - xOffset) + (i * 40), y: this.y - 80,
                type: ItemSprite.getRandomItemType(),
            });
            newItem.setScale(.8);
            newItem.setAlpha(.5);
            newItem.fulfilled = false;

            this.requiredItems.push(newItem);
        }

        if (this.requiredItemsBg) {
            this.requiredItemsBg.destroy();
        }

        this.requiredItemsBg = this.scene.add.graphics();
        let requiredItemsBgMargin = 10;
        this.requiredItemsBg.fillStyle(0xFFFFFF, .5);
        this.requiredItemsBg.fillRect(
            this.x - ((this.requiredItems.length * 45) / 2),
            this.y - 90 - requiredItemsBgMargin,
            45 * this.requiredItems.length, 40
        );
    }

    /**
     * Set every item in the required items list to unfulfilled.
     */
    resetItems() {

        this.requiredItems.forEach((item) => {
            item.fulfilled = false;
            item.setAlpha(.5);
        })
    }

    static setAnimations(scene) {

        if (animationsRegistered) { return; }

        // Loop through each animation key and automate the registration of animations.
        Object.keys(HyperassemblyChamberSprite.animationKeys).forEach((animationKeyName) => {

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
            switch(HyperassemblyChamberSprite.animationKeys[animationKeyName]) {

                case (HyperassemblyChamberSprite.animationKeys.CLOSE): {
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
                for (let i = frameNames.length ; i >= 0 ; i--) {
                   reversed.push(frameNames[i]);
                }
                frameNames = reversed;
            }

            // Create new animation using those frame names.
            scene.anims.create({
                key: HyperassemblyChamberSprite.animationKeys[animationKeyName],
                frames: frameNames,
                frameRate: 2,
                repeat: 0
            });
        });

        animationsRegistered = true;
    }

    onAnimationComplete(animation) {

        if (animation.key == HyperassemblyChamberSprite.animationKeys.OPEN) {
            setTimeout(() => this.anims.play(HyperassemblyChamberSprite.animationKeys.CLOSE), 3000);
        }
    }
};