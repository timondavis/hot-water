let SamSprite = require('../Sprite/Sam.sprite');
let StaticSprite = require('../Sprite/Static.sprite');
let ItemSprite = require('../Sprite/Item.sprite');
let ExelleratorSprite = require('../Sprite/Exellelerator.sprite');
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

        this.sam = new SamSprite({scene: this, x: 400, y: 400})
        this.sam.setScale(this.scale);
        this.sam.setDepth(50);

        this.conveyer = null; // Group
        this.conveyerRelease = null; // Timer
        this.setupLevel();
        this.createConveyer();

        this.items = this.add.group();

        this.currentItem = null;
        this.displayItem = this.add.sprite(400, 520);
        this.displayItem.setDepth(5000);
        this.displayItem.setAlpha(0.7);
        this.displayItem.setTexture(TextureNamesEnum.SPRITE_ATLAS);
        this.displayItem.visible = false;
        this.displayItem.setScale(2);

        this.itemSlots = [];
        this.itemSlots[0] = this.add.sprite(670, 350, TextureNamesEnum.SPRITE_ATLAS, 'poly/ball.png');
        this.itemSlots[0].setScale(0.45);
        this.itemSlots[0].contents = null;
        this.itemSlots[0].visible = false;


        this.itemSlots[1] = this.add.sprite(695, 365, TextureNamesEnum.SPRITE_ATLAS, 'poly/cube.png');
        this.itemSlots[1].setScale(0.45);
        this.itemSlots[1].contents = null;
        this.itemSlots[1].visible = false;

        this.itemSlots[2] = this.add.sprite(727, 383, TextureNamesEnum.SPRITE_ATLAS, 'poly/pyramid.png');
        this.itemSlots[2].setScale(0.45);
        this.itemSlots[2].contents = null;
        this.itemSlots[2].visible = false;

        this.createInputs();

        this.sam.on('animationcomplete', this.sam.onAnimationComplete);
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
        this.send = this.input.keyboard.addKey('s');

        this.itemSlotKeys = [];
        this.itemSlotKeys[0] = this.input.keyboard.addKey('i');
        this.itemSlotKeys[0].value = 0;

        this.itemSlotKeys[1] = this.input.keyboard.addKey('o');
        this.itemSlotKeys[1].value = 1;

        this.itemSlotKeys[2] = this.input.keyboard.addKey('p');
        this.itemSlotKeys[2].value = 2;
    }

    createConveyer() {

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

            spriteConfig = { scene: this, x: this.sys.game.config.width - ((48 * this.scale) * i), y: this.sam.y + (20 * this.scale),
                spriteName: spriteName, scale: this.scale };

            tempSprite = new StaticSprite(spriteConfig);

            this.conveyer.add(tempSprite);
        }

        Phaser.Actions.Call(this.conveyer.getChildren(), (conveyerSprite) => {
            conveyerSprite.setDepth(100);
        });

        this.conveyerRelease = this.time.addEvent({
            delay: 1000,
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

    handleInputs() {

        if (this.processingAction) { return; }

        let frontItem = this.items.getFirst(true);

        // Move to item and pick it up.
        if (frontItem && this.grab.isDown) {
            this.processingAction = true;
            this.handleGrab();
        }

        // Put an item in the left hyperchamber (D)
        if ((this.insertLeft.isDown || this.insertRight.isDown )) {
            this.handleHyperchamberInteraction();
        }

        if (this.send.isDown && this.currentItem === true) {
            this.processingAction = true;
            this.handleSend(this.currentItem)
        }

        const invokedSlots = this.itemSlotKeys.filter(key => key.isDown);

        if (Array.isArray(invokedSlots) && invokedSlots.length) {
            this.processingAction = true;
            this.handleSlotAction(invokedSlots[0]);
        }

    }

    setupLevel() {

        this.background = this.add.sprite(0, 0, TextureNamesEnum.SPRITE_ATLAS, 'background.png');
        this.background.setOrigin(0);
        this.background.setDepth(0);

        this.excellelerator = new ExelleratorSprite({scene: this, x:150, y: 250 });

        this.createHyperchambers();

        this.polybench = new StaticSprite({ scene: this, x: 700, y: 370, spriteName: StaticSprite.SpriteNames.POLYBENCH,
            scale: this.scale, end: 0, autoPlay: false });

    }

    handleSlotAction(invokedSlot) {

        this.slotTween = this.tweens.add({
            targets: this.sam,
            duration: 400,
            x: this.polybench.x - 200, y: this.polybench.y,
            onComplete: () => {
                this.handleSlotting(invokedSlot);
            }
        });
    }

    handleGrab() {

        //if (this.currentItem) { return; }

        this.processingAction = true;

        let item = this.items.getFirst(true);
        this.currentItem = item;
        this.displayItem.setFrame(this.currentItem.frame.name);

        this.sam.anims.play(this.sam.animationKeys.GRAB.DOWN);

        this.grabTween = this.tweens.add({

            targets: this.sam,
            duration: 250,
            x: item.x - 30, y: this.sam.homeRow,
            onComplete: () => {
                setTimeout(() => {
                    this.processingAction = false;
                    this.sam.anims.play(this.sam.animationKeys.STAND.DOWN);
                    this.displayItem.visible = true;
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

        if (targetChamber.isProductComplete() && !this.currentItem) {
            this.processingAction = true;
            this.sam.anims.play(this.sam.animationKeys.WALK.UP);
            this.handleGetPackage(targetChamber);
        }
        else if (targetChamber.mayItemBeInserted(this.currentItem)) {
            this.processingAction = true;
            this.sam.anims.play(this.sam.animationKeys.WALK.UP);
            this.handleInsert(targetChamber, this.currentItem);
        }
    }

    handleGetPackage(targetChamber) {

        if (this.getPackageTween) { return; }

        this.getPackageTween = this.tweens.add({
            targets: this.sam,
            duration: 400,
            x: targetChamber.x, y: targetChamber.y,
            onComplete: () => {
                this.displayItem.visible = true;
                this.displayItem.setFrame('package.png');
                targetChamber.resetItems();
                this.currentItem = true;
                this.getPackageTween = null;
                this.processingAction = false;
            }
        });
    }

    handleInsert(targetChamber, candidateItem) {

        if (this.insertTween) { return; }

        this.insertTween = this.tweens.add({
           targets: this.sam,
           duration: 400,
           x: targetChamber.x, y: targetChamber.y,
           onComplete: () => {
               targetChamber.insert(candidateItem);
               this.displayItem.visible = false;
               this.currentItem = null;
               this.insertTween = null;
               this.processingAction = false;
           }
        });
    }

    handleSend() {

       if (this.sendTween) { return; }

       this.sendTween = this.tweens.add({
           targets: this.sam,
           duration: 400,
           x: this.excellelerator.x, y: this.excellelerator.y,
           onComplete: () => {
               this.excellelerator.anims.play(this.excellelerator.animationKeys.OPEN);
               this.sendTween = null;
               this.currentItem = false;
               this.displayItem.visible = false;
               this.processingAction = false;
           }
       });
    }

    handleSlotting(invokedSlot) {

        let position = invokedSlot.value;

        if (!this.itemSlots[position].contents && !this.currentItem) {
            this.processingAction = false;
            return;
        }

        if (this.itemSlots[position].contents && !this.currentItem){

            this.currentItem = this.itemSlots[position].contents;
            this.displayItem.setFrame(this.currentItem.frame.name);
            this.displayItem.visible = true;

            this.itemSlots[position].contents = null;
            this.itemSlots[position].visible = false;
            this.processingAction = false;
            return;
        }

        if (!this.itemSlots[position].contents && this.currentItem) {

            this.itemSlots[position].contents = this.currentItem;
            this.itemSlots[position].setFrame(this.currentItem.frame.name)
            this.itemSlots[position].visible = true;

            this.currentItem = null;
            this.displayItem.visible = false;
            this.processingAction = false;
            return;
        }

        if (this.itemSlots[position].contents && this.currentItem) {

            let temp = this.currentItem;
            this.currentItem = this.itemSlots[position].contents;
            this.displayItem.setFrame(this.currentItem.frame.name);
            this.displayItem.visible = true;

            this.itemSlots[position].contents = temp;
            this.itemSlots[position].setFrame(temp.frame.name);
            this.itemSlots[position].visible = true;
            this.processingAction = false;
            return;
        }
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