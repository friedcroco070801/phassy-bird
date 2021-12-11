import Phaser from "phaser";

export default class Score extends Phaser.GameObjects.Container {
    private score: number = 0;

    constructor(scene: Phaser.Scene, x: number, y: number) {
        super(scene, x, y);
    }

    public setScore(score: number) {
        this.score = score;
        this.removeAll(true);
        var temp = `${this.score}`;
        for (var i = temp.length - 1; i >= 0; i--) {
            let image = this.scene.add.image(-(temp.length - i - 1) * 24, 0, `score${temp[i]}`);
            image.setDepth(this.depth);
            this.add(image);
        }
    }

    public getScore(): number { return this.score; }
}