import Phaser from 'phaser';

export class Checkpoint extends Phaser.Physics.Arcade.Sprite {
    public isActive: boolean = false;

    constructor(scene: Phaser.Scene, x: number, y: number) {
        super(scene, x, y, 'checkpoint');
        scene.add.existing(this);
        this.setAlpha(0.6);
    }

    activate() {
        if (this.isActive) return;
        this.isActive = true;
        this.setAlpha(1);
        this.setTint(0x00ffff);
    }
}

export class Enemy extends Phaser.Physics.Arcade.Sprite {
    private speed: number = 120;
    private distance: number = 250;
    private startX: number;
    public enemyType: number;

    constructor(scene: Phaser.Scene, x: number, y: number, type: number = 0) {
        super(scene, x, y, 'enemy_' + type);
        this.startX = x;
        this.enemyType = type;
        scene.add.existing(this);
    }

    update() {
        if (!this.body) return;
        const body = this.body as Phaser.Physics.Arcade.Body;
        if (this.x >= this.startX + this.distance) {
            body.setVelocityX(-this.speed);
            this.setFlipX(true);
        } else if (this.x <= this.startX) {
            body.setVelocityX(this.speed);
            this.setFlipX(false);
        }
    }
}

export class FallingRock extends Phaser.Physics.Arcade.Sprite {
    private isTriggered: boolean = false;

    constructor(scene: Phaser.Scene, x: number, y: number) {
        super(scene, x, y, 'rock');
        scene.add.existing(this);
    }

    trigger() {
        if (this.isTriggered || !this.body) return;
        this.isTriggered = true;
        (this.body as Phaser.Physics.Arcade.Body).setAllowGravity(true);
    }
}

export class MovingBlade extends Phaser.Physics.Arcade.Sprite {
    private startY: number;
    private distance: number = 150;
    private speed: number = 0.003;

    constructor(scene: Phaser.Scene, x: number, y: number) {
        super(scene, x, y, 'blade');
        this.startY = y;
        scene.add.existing(this);
    }

    update(time: number) {
        if (!this.body) return;
        const y = this.startY + Math.sin(time * this.speed) * this.distance;
        this.setY(y);
        this.setRotation(time * 0.012);
        if (this.body instanceof Phaser.Physics.Arcade.StaticBody) {
            this.body.updateFromGameObject();
        } else if (this.body instanceof Phaser.Physics.Arcade.Body) {
            // If dynamic, just ensure it's not falling
            this.body.setAllowGravity(false);
        }
    }
}

export class EtherealWall extends Phaser.Physics.Arcade.Sprite {
    constructor(scene: Phaser.Scene, x: number, y: number, w: number, h: number) {
        super(scene, x, y, 'ethereal');
        scene.add.existing(this);
        this.setAlpha(0.4);
        this.setTint(0x8800ff);
        this.setDisplaySize(w, h);
    }
}
