let SamSprite = require('../Sprite/Sam.sprite');
let StaticSprite = require('../Sprite/Static.sprite');
let ItemSprite = require('../Sprite/Item.sprite');
let ExelleratorSprite = require('../Sprite/Exellelerator.sprite');
let HyperassemblyChamberSprite = require('../Sprite/HyperassemblyChamber.sprite');
let PolybenchSprite = require('../Sprite/Polybench.sprite');
let TextureNamesEnum = require('../Sprite/TextureNames.enum');

module.exports =
class ConveyorScene extends Phaser.Scene {

    init() {
        this.scale = 3;
        this.processingAction = false;
        this.resetTween = null;
        this.itemCount = {};
        this.isGameOver = false;
        this.shippedCount = 0;
        this.conveyerSpeed = 0.7;

        Object.keys(ItemSprite.typeKeys).forEach(key => this.itemCount[ItemSprite.typeKeys[key]] = 0 );
    }

    preload() {
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

        this.createInputs();

        this.sam.on('animationcomplete', this.sam.onAnimationComplete);

        this.shippingCounter = this.add.text(160, 207, this.shippedCount, {
            font: '22px Arial',
            fill: '#dcc21b'
        });
        this.shippingCounter.setOrigin(0.5);
    }

    update() {


        let frontItem = this.items.getFirst(true);

        if (frontItem && frontItem.x <= 50) {
            this.gameOver();
        }

        Phaser.Actions.Call(this.items.getChildren(), (item) => {
            item.x -= this.conveyerSpeed;
        });
        this.handleInputs();

        this.shippingCounter.setText(this.shippedCount);

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
            delay: 2000,
            startAt: 1,
            loop: true,
            callback: () => {
                let item = this.getNewRandomItem() ;
                this.items.add(item);
            }
        })
    }

    getNewRandomItem() {

        const typesAllowed = [];

        Object.keys(ItemSprite.typeKeys).forEach(type => {
            if (this.itemCount[ItemSprite.typeKeys[type]] < 2) { typesAllowed.push(type); }
        });

        const type = ItemSprite.getRandomItemType(typesAllowed);
        this.itemCount[type] += 1;
        return new ItemSprite({
            scene: this,
            x: 810, y: 420,
            type: type,
        })
    }

    handleInputs() {

        if (this.processingAction) { return; }

        let frontItem = this.items.getFirst(true);

        // Move to item and pick it up.
        if (frontItem && this.grab.isDown) {
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

        // Handle the slot request if there are slots available.  Note: if currentItem === true, it's a package.
        // That can't be slotted, so ignore those requests.
        if (Array.isArray(invokedSlots) && invokedSlots.length && this.currentItem !== true) {
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

        this.polybench = new PolybenchSprite({ scene: this, x: 700, y: 370});
    }

    handleSlotAction(invokedSlot) {

        if (this.slotTween) { return; }

        this.slotTween = this.tweens.add({
            targets: this.sam,
            duration: 400,
            x: this.polybench.x - 75, y: this.polybench.y,
            onComplete: () => {
                this.polybench.swap(invokedSlot);
            }
        });
    }

    handleGrab() {

        // When current item === true, it means a package is being carried.
        if (this.currentItem === true) { return; }
        if (this.grabTween) { return; }

        this.processingAction = true;

        let swap = !!this.currentItem;

        let item = this.items.getFirst(true);

        this.sam.anims.play(SamSprite.animationKeys.GRAB.DOWN);

        this.grabTween = this.tweens.add({

            targets: this.sam,
            duration: 250,
            x: item.x - 30, y: this.sam.homeRow,
            onComplete: () => {
                setTimeout(() => {

                    let tempFrame = false;
                    let tempType = false;

                    if (swap) {
                        tempType = this.currentItem.itemType;
                        tempFrame = this.currentItem.frame.name;
                    }

                    this.processingAction = false;
                    this.sam.anims.play(SamSprite.animationKeys.STAND.DOWN);
                    this.displayItem.setFrame(item.frame.name);
                    this.displayItem.visible = true;

                    if (swap) {
                        this.currentItem.setFrame(item.frame.name);
                        this.currentItem.itemType = item.itemType;
                        item.setFrame(tempFrame);
                        item.itemType = tempType;
                    } else {
                        this.currentItem = item;
                        item.visible = false;
                        this.items.remove(item);
                    }

                    this.grabTween = null;
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
            this.sam.anims.play(SamSprite.animationKeys.WALK.UP);
            this.handleGetPackage(targetChamber);
        }
        else if (this.currentItem && targetChamber.mayItemBeInserted(this.currentItem)) {
            this.processingAction = true;
            this.sam.anims.play(SamSprite.animationKeys.WALK.UP);
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
                targetChamber.resetItemsTemplate();
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

       if (this.isGameOver) { return; }
       if (this.sendTween) { return; }

       this.sendTween = this.tweens.add({
           targets: this.sam,
           duration: 400,
           x: this.excellelerator.x, y: this.excellelerator.y,
           onComplete: () => {
               this.excellelerator.anims.play(ExelleratorSprite.animationKeys.OPEN);
               this.sendTween = null;
               this.currentItem = false;
               this.displayItem.visible = false;
               this.processingAction = false;
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

    gameOver() {

        let item = this.items.getFirst(true);
        this.items.remove(item);

        this.tweens.add({
            targets: item,
            x: 0, y: this.sys.game.config.height,
            duration: 700,
            ease: 'Quad.easeIn',
            onComplete: () => {

                if (this.resetTween) {return;}

                this.resetTween = setTimeout(() => {
                    this.tweens.add({
                        targets: this.shippingCounter,
                        x: 400, y:100,
                        scaleY: 3,
                        scaleX: 3,
                        duration: 2000,
                        onComplete: () => {
                            setTimeout(() => {
                                this.scene.restart();
                            }, 2000);
                        }
                    });
                }, 200);
            }
        });
    }

};