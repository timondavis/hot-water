let TextureNameEnums = require('./TextureNames.enum');

// "STATIC" constants
const itemTypes = {
    BALL: 'ball',
    BOX: 'cube',
    PYRAMID: 'pyramid',
};

module.exports =
class Item extends Phaser.GameObjects.Sprite {

    constructor (config) {
        super(config.scene, config.x, config.y, TextureNameEnums.SPRITE_ATLAS);
        this.scene = config.scene;
        this.scene.add.existing(this);
        this.visible = false;

        this.setDepth(1000);

        if (!config.type) {
            throw ("'type' property is required, see Item.itemTypes for selections");
        }
        this.itemType = config.type;

        this.assignTextureForType();
        this.visible = true;
    }

    static getRandomItemType(typesAllowed) {

        if (!Array.isArray(typesAllowed) || !typesAllowed.length) {
            const keys = Object.keys(itemTypes);
            const targetKey = Phaser.Math.RND.pick(keys);
            return itemTypes[targetKey];
        }

        const targetKey = Phaser.Math.RND.pick(typesAllowed);
        return itemTypes[targetKey];
    }

    static get typeKeys() {
        return itemTypes;
    }

    assignTextureForType() {
        this.setFrame('poly/' + this.itemType + '.png');
    }
};