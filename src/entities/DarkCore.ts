import Phaser from 'phaser';

export class DarkCore extends Phaser.Physics.Arcade.Sprite {
    public isUnlocked: boolean = false;
    private requiredShards: number;

    constructor(scene: Phaser.Scene, x: number, y: number, requiredShards: number) {
        super(scene, x, y, 'darkcore');
        this.requiredShards = requiredShards;
        scene.add.existing(this);
    }

    tryUnlock(currentShards: number) {
        if (currentShards >= this.requiredShards) {
            this.isUnlocked = true;
            this.setTint(0x00ff00);
            this.setAlpha(0.6);
            return true;
        }
        return false;
    }
}
