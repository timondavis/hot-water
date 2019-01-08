const Phaser = require('phaser');
const TextureNamesEnum = require('./TextureNames.enum');

module.exports =
class PolybenchSprite extends Phaser.GameObjects.Sprite {

    constructor(config) {
        super(config.scene, config.x, config.y, TextureNamesEnum.SPRITE_ATLAS, 'polybench/polybench-0.png');
        this.scene = config.scene;
        this.scene.add.existing(this);
        this.setScale(3);

        this.itemSlots = [];
        this.initializeItemSlots();
    }

    initializeItemSlots() {
        this.itemSlots = [];

        let nextItemAt = {x: 670, y: 350};

        for (let i = 0 ; i < 3 ; i++) {

            this.itemSlots[i] = this.scene.add.sprite(nextItemAt.x + (i * 35), nextItemAt.y + (i * 20), TextureNamesEnum.SPRITE_ATLAS, 'poly/ball.png');
            this.itemSlots[i].setScale(0.45);
            this.itemSlots[i].contents = null;
            this.itemSlots[i].visible = false;
        }
    }

    swap(invokedSlot) {

        let position = invokedSlot.value;

        if (!this.itemSlots[position].contents && !this.scene.currentItem) {
            this.scene.slotTween = false;
            this.scene.eprocessingAction = false;
            return;
        }

        if (this.itemSlots[position].contents && !this.scene.currentItem){

            this.scene.currentItem = this.itemSlots[position].contents;
            this.scene.displayItem.setFrame(this.scene.currentItem.frame.name);
            this.scene.displayItem.visible = true;

            this.itemSlots[position].contents = null;
            this.itemSlots[position].visible = false;
            this.scene.processingAction = false;
            this.scene.slotTween = false;
            return;
        }

        if (!this.itemSlots[position].contents && this.scene.currentItem) {

            this.itemSlots[position].contents = this.scene.currentItem;
            this.itemSlots[position].setFrame(this.scene.currentItem.frame.name)
            this.itemSlots[position].visible = true;

            this.scene.currentItem = null;
            this.scene.displayItem.visible = false;
            this.scene.processingAction = false;
            this.scene.slotTween = false;
            return;
        }

        if (this.itemSlots[position].contents && this.scene.currentItem) {

            let temp = this.scene.currentItem;
            this.scene.currentItem = this.itemSlots[position].contents;
            this.scene.displayItem.setFrame(this.scene.currentItem.frame.name);
            this.scene.displayItem.visible = true;

            this.itemSlots[position].contents = temp;
            this.itemSlots[position].setFrame(temp.frame.name);
            this.itemSlots[position].visible = true;
            this.scene.processingAction = false;
            this.scene.slotTween = false;
        }
    }
};