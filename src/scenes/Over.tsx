import Phaser from 'phaser';
import config from '../config';

export default class OverScene extends Phaser.Scene {
    private score: number = 0;
    constructor() {
        super('OverScene');
    }

    init(data: {score: number}): void {
        this.score = data.score;
    }

    preload(): void {
        this.load.image('background', 'assets/sprite/background-day-extended.png');
        this.load.image('base', 'assets/sprite/base.png');
    }

    create(): void {
        // Set fade in
        this.cameras.main.fadeIn(500);

        // Add background
        var background = this.add.image(0, 0, 'background');
        background.setOrigin(0);

        // Add base
        var base = this.add.image(0, config.scale.height, 'base');
        base.setDepth(1);
        base.x += base.width / 2;
        base.y -= base.height / 2;

        // Add texts
        var title = this.add.text(config.scale.width / 2, config.scale.height * 5 / 12, "GAME OVER", {
            font: "30px rainy"
        })
        title.setOrigin(0.5);
        var score = this.add.text(config.scale.width / 2, config.scale.height / 2, `Your score: ${this.score}`, {
            font: "24px rainy"
        });
        score.setOrigin(0.5);

        // Return to game scene upon click
        // Click screen event
        this.input.on('pointerdown', () => {
            this.cameras.main.fadeOut(500);
            this.time.addEvent({
            delay: 500,
            callback: () => {
                this.scene.start('GameScene');
            },
            callbackScope: this
            })
        }, this)
    }

    update(time: number, delta: number): void {
        
    }
}