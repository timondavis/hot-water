let SamSprite = require('../Sprite/Sam.sprite');
let StaticSprite = require('../Sprite/Static.sprite');
let ItemSprite = require('../Sprite/Item.sprite');
let HyperassemblyChamberSprite = require('../Sprite/HyperassemblyChamber.sprite');
let TextureNamesEnum = require('../Sprite/TextureNames.enum');

module.exports =
class ConveyorScene extends Phaser.Scene {

    init() {
        this.scale = 3;
        this.processingAction = false;
    }

    preload() {
        this.load.multiatlas(TextureNamesEnum.SPRITE_ATLAS, 'asset/asset.json', 'asset/');
    }

    create() {

        this.sam = new SamSprite({scene: this, x: 400, y: 400});
        this.sam.setScale(this.scale);
        this.sam.setDepth(50);

        this.setupLevel();

        this.items = this.add.group();

        this.currentItem = this.add.sprite(400, 520);
        this.currentItem.setDepth(5000);
        this.currentItem.setAlpha(0.7);
        this.currentItem.setTexture(TextureNamesEnum.SPRITE_ATLAS);
        this.currentItem.visible = false;
        this.currentItem.setScale(2);
        this.currentItem.itemType = null;

        this.createInputs();

        this.sam.on('animationcomplete', this.sam.onAnimationComplete);

        this.conveyerRelease = this.time.addEvent({
            delay: 3000,
            startAt: 1,
            loop: true,
            callback: () => {
                console.log('looping');
                this.items.add(new ItemSprite({
                    scene: this,
                    x: 810, y: 420,
                    type: ItemSprite.getRandomItemType(),
                }));
            }
        });
    }

    update() {
        Phaser.Actions.Call(this.items.getChildren(), (item) => {
            item.x -= 0.5;
        });
        this.handleInputs();
    }

    createInputs() {

        this.grab = this.input.keyboard.addKey('space');
        this.insertLeft = this.input.keyboard.addKey('d');
        this.insertRight = this.input.keyboard.addKey('f');
    }

    handleInputs() {

        let item = this.items.getFirst(true);

        // Move to item and pick it up.
        if (item && this.grab.isDown && !this.processingAction) { this.handleGrab(); }

        // Put an item in the left hyperchamber (D)
        if (item &&
            (this.insertLeft.isDown || this.insertRight.isDown ) &&
            !this.processingAction
        ) {
            this.handleHyperchamberInteraction();
        }

    }

    setupLevel() {

        this.background = this.add.sprite(0, 0, TextureNamesEnum.SPRITE_ATLAS, 'background.png');
        this.background.setOrigin(0);
        this.background.setDepth(0);

        this.conveyer = this.add.group();

        let spriteConfig = {};
        let spriteName = '';
        let tempSprite = null;
        for (let i = 0 ; i < 6 ; i++) {

            if ( i < 5) {
                spriteName = StaticSprite.SpriteNames.CONVEYOR_CENTER;
            } else {
                spriteName = StaticSprite.SpriteNames.CONVEYOR_OUTSIDE;
            }

            spriteConfig = {
                scene: this,
                x: this.sys.game.config.width - ((48 * this.scale) * i), y: this.sam.y + (20 * this.scale),
                spriteName: spriteName,
                scale: this.scale
            };

            tempSprite = new StaticSprite(spriteConfig);

            this.conveyer.add(tempSprite);
        }

        Phaser.Actions.Call(this.conveyer.getChildren(), (conveyerSprite) => {
            conveyerSprite.setDepth(100);
        });

        this.excellelerator = new StaticSprite({
            scene: this,
            x: 150, y: 250,
            spriteName: StaticSprite.SpriteNames.EXCELLELERATOR,
            scale: this.scale,
            end: 2,
            yoyo: true,
            autoPlay: false
        });

        this.createHyperchambers();

        this.polybench = new StaticSprite({
            scene: this,
            x: 700, y: 370,
            spriteName: StaticSprite.SpriteNames.POLYBENCH,
            scale: this.scale,
            end: 0,
            autoPlay: false
        });

    }

    handleGrab() {
        this.processingAction = true;

        let item = this.items.getFirst(true);
        this.currentItem.setFrame(item.frame.name);
        this.currentItem.itemType = item.itemType;

        this.sam.anims.play(this.sam.animationKeys.GRAB.DOWN);

        this.grabTween = this.tweens.add({

            targets: this.sam,
            duration: 250,
            x: item.x - 30, y: this.sam.homeRow,
            onComplete: () => {
                setTimeout(() => {
                    this.sam.anims.play(this.sam.animationKeys.STAND.DOWN);
                    this.currentItem.visible = true;
                    this.currentItem.itemType = item.itemType;
                    item.visible = false;
                    this.items.remove(item);
                }, 300);
            }
        });
    }

    handleHyperchamberInteraction() {

        let targetChamber = null;

        if (this.insertLeft.isDown) {
            targetChamber = this.hyperChamberOne;
        } else if (this.insertRight.isDown) {
            targetChamber = this.hyperChamberTwo;
        }

        if (targetChamber.isProductComplete() && !this.currentItem.visible) {
            this.sam.anims.play(this.sam.animationKeys.WALK.UP);
            this.handleGetPackage(targetChamber);
        }
        else if (targetChamber.mayItemBeInserted(this.currentItem)) {
            this.handleInsert(targetChamber, this.currentItem);
        }
    }

    handleGetPackage(targetChamber) {

        this.currentItem.setFrame('')
    }


    handleInsert(targetChamber, candidateItem) {

        if (this.insertTween) { return; }

        this.insertTween = this.tweens.add({
           targets: this.sam,
           duration: 400,
           x: targetChamber.x, y: targetChamber.y,
           onComplete: () => {
               targetChamber.insert(candidateItem);
               this.currentItem.visible = false;
               this.insertTween = null;
           }
        });
    }

    createHyperchambers() {
        this.hyperChamberOne = new HyperassemblyChamberSprite({
            x: 340,
            y: 260,
            scene: this
        });

        this.hyperChamberTwo = new HyperassemblyChamberSprite({
            x: 560,
            y: 260,
            scene: this
        });
    }
};