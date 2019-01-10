let TextureNamesEnum = require('../Sprite/TextureNames.enum');
module.exports =
class MenuScene extends Phaser.Scene {

    init() {}

    preload() {}

    create() {
        this.background = this.add.sprite(0, 0, TextureNamesEnum.SPRITE_ATLAS, 'background.png');
        this.background.setOrigin(0);
        this.background.setDepth(0);

        this.bgBubble = this.add.graphics();
        this.bgBubble.setPosition(200, 100);
        this.bgBubble.fillStyle(0x000000, .5);
        this.bgBubble.fillRect(0, 0, 400, 400 );

        this.titleTop = this.add.text(1000, 150, 'Hot', {
            font: '40px Arial',
            fill: '#FA3333'
        });
        this.titleTop.setOrigin(0.5);
        this.titleTop.setScale(5);

        this.titleBottom = this.add.text(-200, 200, 'Water', {
            font: '40px Arial',
            fill: '#3333FA'
        });
        this.titleBottom.setOrigin(0.5);
        this.titleBottom.setScale(5);

        this.startGameLabel = this.add.text(400, 300, 'Commence Assembly', {
            font: '30px Arial',
            fill: '#CCCCCC'
        });
        this.startGameLabel.setOrigin(0.5);

        this.startGameLabel.setInteractive();

        this.startGameLabel.on('pointerdown', () => {
            this.scene.start('Conveyor');
        });

        this.tweens.add({
            targets: [this.titleTop, this.titleBottom],
            x: 400,
            scaleX: 1,
            scaleY: 1,
            duration: 2000
        });
    }

    update() {}
};