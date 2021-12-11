import Phaser from 'phaser';
import config from '../config';
import { BASE_BITMASK, BIRD_BITMASK, DESTROY_BITMASK, POINT_BITMASK } from '../constants';
import Bird from '../objects/Bird';
import Score from '../objects/Score';

export default class GameScene extends Phaser.Scene {
  private title: Phaser.GameObjects.Image | null = null;
  private instruction: Phaser.GameObjects.Image | null = null;
  private background: Phaser.GameObjects.Image | null = null;
  private base: Phaser.Physics.Matter.Image | null = null;
  private isAlive: boolean = true;
  private isMoving: boolean = true;
  private bird: Bird | null = null;
  private score: Score | null = null;
  private movers: Set<MatterJS.BodyType> = new Set();

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
    // Reset parameters
    this.title = null;
    this.instruction = null;
    this.background = null;
    this.base =  null;
    this.isAlive = true;
    this.isMoving = false;
    this.bird = null;
    this.score = null;
    this.movers = new Set();

    // Add title and instruction
    this.title = this.add.image(config.scale.width / 2, config.scale.height / 5, 'title').setDepth(4);
    this.instruction = this.add.image(config.scale.width / 2, config.scale.height / 2, 'instruction').setDepth(4);
    this.tweens.add({
      targets: this.instruction,
      yoyo: true,
      ease: 'Power2',
      duration: 1000,
      y: this.instruction.y - 25,
      repeat: -1
    })

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
    // this.bird.setPlay(true);
    this.bird.setIgnoreGravity(true);

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
      if (!this.isMoving) {
        // Start play
        this.isMoving = true;
        this.bird?.setIgnoreGravity(false);
        this.bird?.setPlay(true);
        this.title?.destroy();
        this.instruction?.destroy();

        // Add score display
        this.score = new Score(this, config.scale.width - 32, 38);
        this.add.existing(this.score);
        this.score.setDepth(4);
        this.score.setScore(0);
      }
      else {
        this.bird?.setPlay(true);
      }
    }, this)

    // Set collision event
    this.matter.world.on('collisionstart', this.handleCollide, this);
  }

  update(time: number, delta: number): void {
    if (this.isAlive) {
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
    if (this.isMoving) {
      // Add a pair of pipe
      var pointY = 90 + (310 - 90) * Math.random();

      var upPipe = this.matter.add.sprite(config.scale.width, pointY - 75, 'pipe', undefined, {ignoreGravity: true});
      upPipe.setFlipY(true);
      upPipe.x += upPipe.width / 2;
      upPipe.y -= upPipe.height / 2;
      upPipe.setCollisionCategory(BASE_BITMASK);
      upPipe.setCollidesWith([BIRD_BITMASK, DESTROY_BITMASK]);
      upPipe.setDensity(100000);

      var downPipe = this.matter.add.sprite(config.scale.width, pointY + 75, 'pipe', undefined, {ignoreGravity: true});
      downPipe.x += downPipe.width / 2;
      downPipe.y += downPipe.height / 2;
      downPipe.setCollisionCategory(BASE_BITMASK);
      downPipe.setCollidesWith([BIRD_BITMASK, DESTROY_BITMASK]);
      downPipe.setDensity(100000);

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
      this.movers.add(upPipe.body as MatterJS.BodyType);
      this.movers.add(downPipe.body as MatterJS.BodyType);
      this.movers.add(score);
    }
  }

  handleCollide(event: {pairs: {bodyA: MatterJS.BodyType, bodyB: MatterJS.BodyType}[]}) {
    for (var pair of event.pairs) {
      var catA = pair.bodyA.collisionFilter.category;
      var catB = pair.bodyB.collisionFilter.category;
      if ((catA == BIRD_BITMASK && catB == BASE_BITMASK) || (catA == BASE_BITMASK && catB == BIRD_BITMASK)) {
        this.bird?.setAlive(false);
        if (this.isMoving) {
          this.isMoving = false;
          this.isAlive = false;
          for (let body of this.movers) {
            body.friction = 1;
            body.frictionAir = 1;
            body.frictionStatic = 1;
          }
          this.time.addEvent({
            delay: 500,
            callback: () => {
              this.cameras.main.fadeOut(500);
            },
            callbackScope: this
          })
          this.time.addEvent({
            delay: 1000,
            callback: () => {
              this.scene.start('OverScene', {score: this.score?.getScore()});
            },
            callbackScope: this
          })
        }
      }
      else if ((catA == DESTROY_BITMASK) || (catB == DESTROY_BITMASK)) {
        if (catA == DESTROY_BITMASK) {
          this.movers.delete(pair.bodyB);
          pair.bodyB.gameObject?.destroy();
        }
        else if (catB == DESTROY_BITMASK) {
          this.movers.delete(pair.bodyA);
          pair.bodyA.gameObject?.destroy();
        }
      }
      else if ((catA == BIRD_BITMASK && catB == POINT_BITMASK) || (catA == POINT_BITMASK && catB == BIRD_BITMASK)) {
        if (catA == POINT_BITMASK) {
          this.movers.delete(pair.bodyA);
          this.matter.world.remove(pair.bodyA);
        }
        else {
          this.movers.delete(pair.bodyB);
          this.matter.world.remove(pair.bodyB);
        }
        this.score?.setScore(this.score?.getScore() + 1);
      }
    }
  }
}
