import Phase from 'phaser';
import { BASE_BITMASK, BIRD_BITMASK, POINT_BITMASK } from '../constants';

export default class Bird extends Phaser.Physics.Matter.Sprite {
    private isAlive: boolean = true;
    private isPlaying: boolean = false;
    private initialX: number = 0;
    
    constructor(world: Phaser.Physics.Matter.World, scene: Phaser.Scene, x: number, y: number) {
        super(world, x, y, 'bird1');
        this.initialX = x;

        // Add flapping animation
        this.anims.create({key: 'flap', frames: [
            {key: 'bird1'}, {key: 'bird2'}, {key: 'bird3'}, {key: 'bird4'}
        ], frameRate: 10, repeat: -1});
        this.anims.play('flap');

        // Set physics options
        this.setCircle(15);
        this.setBounce(0.2);
        this.setMass(0.0000001);
        this.setCollisionCategory(BIRD_BITMASK);
        this.setCollidesWith([BASE_BITMASK, POINT_BITMASK]);
    }

    public setPlay(isPlaying: boolean = false): void {
        if (this.isAlive) {
            this.isPlaying = isPlaying;
            if (isPlaying) this.setVelocityY(-9);
        }
    }

    public setAlive(isAlive: boolean = false): void {
        this.isAlive = isAlive;
        if (!isAlive) {
            this.isPlaying = false;
            this.anims.stop();
        }
    }

    protected preUpdate(time: number, delta: number): void {
        super.preUpdate(time, delta);
        if (this.isPlaying && this.isAlive) {
            this.angle = 45 * Math.min(Math.max(this.body.velocity.y, -9), 9) / 9; 
            this.x = this.initialX;
        }
    }
}