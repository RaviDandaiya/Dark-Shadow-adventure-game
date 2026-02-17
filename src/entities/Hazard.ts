import Phaser from 'phaser';

export class Hazard extends Phaser.Physics.Arcade.Sprite {
    constructor(scene: Phaser.Scene, x: number, y: number) {
        super(scene, x, y, 'hazard');
        scene.add.existing(this);
        scene.physics.add.existing(this, true);
    }
}
