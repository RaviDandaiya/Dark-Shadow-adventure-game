import Phaser from 'phaser';

export class Shard extends Phaser.Physics.Arcade.Sprite {
    constructor(scene: Phaser.Scene, x: number, y: number) {
        super(scene, x, y, 'shard');

        scene.add.existing(this);
        scene.physics.add.existing(this);

        this.setImmovable(true);
        (this.body as Phaser.Physics.Arcade.Body).setAllowGravity(false);

        // Simple pulse animation
        scene.tweens.add({
            targets: this,
            scaleX: 1.3,
            scaleY: 1.3,
            duration: 800,
            yoyo: true,
            repeat: -1
        });
    }
}
