import Phaser from 'phaser';

export class Heroine extends Phaser.Physics.Arcade.Sprite {
    public cursors: Phaser.Types.Input.Keyboard.CursorKeys;
    public isActive: boolean = true;
    public health: number = 3;
    private isCrouching: boolean = false;
    private lastDashTime: number = 0;
    private dashCooldown: number = 1000;
    private isDashing: boolean = false;

    constructor(scene: Phaser.Scene, x: number, y: number) {
        super(scene, x, y, 'heroine');
        scene.add.existing(this);
        // Physics added by scene
        this.cursors = scene.input.keyboard!.createCursorKeys();
    }

    update(time: number) {
        if (!this.isActive || this.isDashing || !this.body) return;

        const onGround = this.body.blocked.down || this.body.touching.down;

        if (this.cursors.down.isDown && onGround) {
            this.isCrouching = true;
            this.setBodySize(24, 20);
            this.setOffset(4, 28);
            this.setVelocityX(0);
        } else {
            this.isCrouching = false;
            this.setBodySize(24, 44);
            this.setOffset(4, 4);
        }

        if (!this.isCrouching) {
            if (this.cursors.left.isDown) {
                this.setVelocityX(-280);
                this.setFlipX(true);
            } else if (this.cursors.right.isDown) {
                this.setVelocityX(280);
                this.setFlipX(false);
            } else {
                this.setVelocityX(0);
            }

            if (Phaser.Input.Keyboard.JustDown(this.cursors.up) && onGround) {
                this.setVelocityY(-480);
            }
        }

        const shiftKey = this.scene.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.SHIFT);
        if (Phaser.Input.Keyboard.JustDown(shiftKey) && time > this.lastDashTime + this.dashCooldown) {
            this.dash();
            this.lastDashTime = time;
        }
    }

    private dash() {
        if (!this.body) return;
        this.isDashing = true;
        const dashVelocity = this.flipX ? -900 : 900;
        this.setVelocityX(dashVelocity);
        this.setVelocityY(0);
        (this.body as Phaser.Physics.Arcade.Body).setAllowGravity(false);

        this.scene.time.delayedCall(200, () => {
            this.isDashing = false;
            if (this.body) (this.body as Phaser.Physics.Arcade.Body).setAllowGravity(true);
        });
    }

    takeDamage() {
        this.health--;
        this.setTint(0xff0000);
        this.scene.time.delayedCall(200, () => this.clearTint());
        return this.health <= 0;
    }
}

export class Shadow extends Phaser.Physics.Arcade.Sprite {
    public cursors: Phaser.Types.Input.Keyboard.CursorKeys;
    public isActive: boolean = false;
    public stamina: number = 100;
    public maxStamina: number = 100;
    private owner: Heroine;

    constructor(scene: Phaser.Scene, x: number, y: number, owner: Heroine) {
        super(scene, x, y, 'shadow');
        this.owner = owner;
        scene.add.existing(this);
        // Physics added by scene
        this.setAlpha(0.7);
        this.cursors = scene.input.keyboard!.createCursorKeys();
        this.setVisible(false);
    }

    update() {
        if (!this.isActive) {
            this.setPosition(this.owner.x, this.owner.y);
            this.stamina = Math.min(this.maxStamina, this.stamina + 0.5);
            return;
        }

        this.stamina -= 0.3;
        if (this.stamina <= 0) {
            this.recall();
            return;
        }

        let vx = 0;
        let vy = 0;
        if (this.cursors.left.isDown) {
            vx = -350;
            this.setFlipX(true);
        } else if (this.cursors.right.isDown) {
            vx = 350;
            this.setFlipX(false);
        }

        if (this.cursors.up.isDown) vy = -350;
        else if (this.cursors.down.isDown) vy = 350;

        if (this.body) {
            this.setVelocity(vx, vy);
        }
    }

    separate() {
        if (this.stamina < 30) return false;
        this.isActive = true;
        this.setVisible(true);
        if (this.body) (this.body as Phaser.Physics.Arcade.Body).setAllowGravity(false);
        this.setPosition(this.owner.x, this.owner.y);
        return true;
    }

    recall() {
        this.isActive = false;
        this.setVisible(false);
        this.setVelocity(0, 0);
    }
}
