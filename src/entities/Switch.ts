import Phaser from 'phaser';

export class Switch extends Phaser.Physics.Arcade.Sprite {
    public isActivated: boolean = false;
    private onActivate: () => void;

    constructor(scene: Phaser.Scene, x: number, y: number, onActivate: () => void) {
        super(scene, x, y, 'switch');
        this.onActivate = onActivate;
        scene.add.existing(this);
        scene.physics.add.existing(this, true);
    }

    activate() {
        if (this.isActivated) return;
        this.isActivated = true;
        this.setTint(0x00ff00);
        this.onActivate();
    }
}
