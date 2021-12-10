import Phaser from 'phaser';
import config from '../config';
import { BASE_BITMASK, BIRD_BITMASK, DESTROY_BITMASK, POINT_BITMASK } from '../constants';
import Bird from '../objects/Bird';

export default class GameScene extends Phaser.Scene {
  private background: Phaser.GameObjects.Image | null = null;
  private base: Phaser.Physics.Matter.Image | null = null;
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
    this.base = this.matter.add.image(0, config.scale.height, 'base', undefined, {ignoreGravity: true, isStatic: true});
    this.base.setDepth(1);
    this.base.x += this.base.width / 2;
    this.base.y -= this.base.height / 2;
    this.base.setCollisionCategory(BASE_BITMASK);
    this.base.setCollidesWith(BIRD_BITMASK);

    // Add bird player
    this.bird = new Bird(this.matter.world, this, config.scale.width / 4, config.scale.height / 2);
    this.add.existing(this.bird);
    this.bird.setPlay(true);

    // Add destroyer after scene
    var destroyer = this.matter.add.rectangle(-100, config.scale.height / 2, 100, config.scale.height, {ignoreGravity: true, isStatic: true});
    destroyer.collisionFilter.category = DESTROY_BITMASK;
    destroyer.collisionFilter.mask = BASE_BITMASK;

    // Create pipes per time
    this.time.addEvent({
      delay: 1500,
      callback: this.createPipe,
      repeat: -1,
      callbackScope: this
    })

    // Click screen event
    this.input.on('pointerdown', () => {
      this.bird?.setPlay(true);
    }, this)

    // Set collision event
    this.matter.world.on('collisionstart', this.handleCollide, this);
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
        if (this.base.x <= -24 + this.base.width / 2) this.base.x = this.base.width / 2;
      }
    }
  }

  createPipe() {
    // Add a pair of pipe
    var pointY = 70 + (330 - 70) * Math.random();

    var upPipe = this.matter.add.sprite(config.scale.width, pointY - 75, 'pipe', undefined, {ignoreGravity: true});
    upPipe.setFlipY(true);
    upPipe.x += upPipe.width / 2;
    upPipe.y -= upPipe.height / 2;
    upPipe.setCollisionCategory(BASE_BITMASK);
    upPipe.setCollidesWith([BIRD_BITMASK, DESTROY_BITMASK]);
    upPipe.setDensity(100);

    var downPipe = this.matter.add.sprite(config.scale.width, pointY + 75, 'pipe', undefined, {ignoreGravity: true});
    downPipe.x += downPipe.width / 2;
    downPipe.y += downPipe.height / 2;
    downPipe.setCollisionCategory(BASE_BITMASK);
    downPipe.setCollidesWith([BIRD_BITMASK, DESTROY_BITMASK]);
    downPipe.setDensity(100);

    // Add score
    var score = this.matter.add.rectangle(config.scale.width + upPipe.width / 2, pointY, 20, 150, {ignoreGravity: true});
    score.collisionFilter.category = POINT_BITMASK;
    score.collisionFilter.mask = BIRD_BITMASK;

    // Move pipes
    upPipe.setFriction(0, 0, 0);
    upPipe.setVelocityX(-2);
    downPipe.setFriction(0, 0, 0);
    downPipe.setVelocityX(-2);
    score.friction = 0; score.frictionAir = 0; score.frictionStatic = 0;
    score.force = {x: -0.0215, y: 0};
  }

  handleCollide(event: {pairs: {bodyA: MatterJS.BodyType, bodyB: MatterJS.BodyType}[]}) {
    for (var pair of event.pairs) {
      var catA = pair.bodyA.collisionFilter.category;
      var catB = pair.bodyB.collisionFilter.category;
      if ((catA == BIRD_BITMASK && catB == BASE_BITMASK) || (catA == BASE_BITMASK && catB == BIRD_BITMASK)) {
        this.bird?.setAlive(false);
      }
      else if ((catA == DESTROY_BITMASK) || (catB == DESTROY_BITMASK)) {
        if (catA == DESTROY_BITMASK) pair.bodyB.gameObject?.destroy();
        else if (catB == DESTROY_BITMASK) pair.bodyA.gameObject?.destroy();
      }
      else if ((catA == BIRD_BITMASK && catB == POINT_BITMASK) || (catA == POINT_BITMASK && catB == BIRD_BITMASK)) {
        console.log('+1');
        if (catA == POINT_BITMASK) this.matter.world.remove(pair.bodyA);
        else this.matter.world.remove(pair.bodyB);
      }
    }
  }
}
