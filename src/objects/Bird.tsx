import Phase from 'phaser';

export default class Bird extends Phaser.GameObjects.Sprite {
    private isAlive: boolean = true;
    private isPlaying: boolean = false;
    
    constructor(scene: Phaser.Scene, x: number, y: number) {
        super(scene, x, y, 'bird1');

        // Add flapping animation
        scene.anims.create({key: 'flap', frames: [
            {key: 'bird1'}, {key: 'bird2'}, {key: 'bird3'}, {key: 'bird4'}
        ], frameRate: 10, repeat: -1});
        this.play('flap');
    }
}