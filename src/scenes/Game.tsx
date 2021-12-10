import Phaser from 'phaser';
import config from '../config';
import Bird from '../objects/Bird';

export default class GameScene extends Phaser.Scene {
  private background: Phaser.GameObjects.Image | null = null;
  private base: Phaser.GameObjects.Image | null = null;
  private isAlive: boolean = true;
  private isMoving: boolean = true;
  private bird: Bird | null = null;

  constructor() {
    super('GameScene');
  }

  preload(): void {
    for (var i = 0; i <= 9; i++) this.load.image(`score${i}`, `src/resources/sprite/${i}.png`);
    this.load.image('background', 'src/resources/sprite/background-day-extended.png');
    this.load.image('base', 'src/resources/sprite/base.png');
    this.load.image('instruction', 'src/resources/sprite/message.png');
    this.load.image('title', 'src/resources/sprite/Title.png');
    this.load.image('pipe', 'src/resources/sprite/pipe-green.png');
    this.load.image('bird1', 'src/resources/sprite/redbird-midflap.png');
    this.load.image('bird2', 'src/resources/sprite/redbird-upflap.png');
    this.load.image('bird3', 'src/resources/sprite/redbird-midflap.png');
    this.load.image('bird4', 'src/resources/sprite/redbird-downflap.png');
  }

  create(): void {
    // Add background
    this.background = this.add.image(0, 0, 'background');
    this.background.setOrigin(0);

    // Add base
    this.base = this.add.image(0, config.scale.height, 'base');
    this.base.setOrigin(0, 1);

    // Add bird player
    this.bird = new Bird(this, config.scale.width / 4, config.scale.height / 2);
    this.add.existing(this.bird);
  }

  update(time: number, delta: number): void {
    if (this.isMoving) {
      // Move background
      if (this.background) {
        this.background.x -= 0.5;
        if (this.background.x  + this.background.width / 2 <= 0) this.background.x = 0;
      }

      // Move base
      if (this.base) {
        this.base.x -= 2;
        if (this.base.x <= -24) this.base.x = 0;
      }
    }
  }
}
