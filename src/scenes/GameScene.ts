import Phaser from 'phaser';
import { Heroine, Shadow } from '../entities/Player';
import { Shard } from '../entities/Shard';
import { Hazard } from '../entities/Hazard';
import { Checkpoint, Enemy, FallingRock, MovingBlade, EtherealWall } from '../entities/Hazards';
import { DarkCore } from '../entities/DarkCore';

export class GameScene extends Phaser.Scene {
    private heroine!: Heroine;
    private shadow!: Shadow;
    private platforms!: Phaser.Physics.Arcade.StaticGroup;
    private etherealWalls!: Phaser.Physics.Arcade.StaticGroup;
    private shards!: Phaser.Physics.Arcade.Group;
    private hazards!: Phaser.Physics.Arcade.StaticGroup;
    private checkpoints!: Phaser.Physics.Arcade.StaticGroup;
    private enemies!: Phaser.Physics.Arcade.Group;
    private rocks!: Phaser.Physics.Arcade.Group;
    private blades!: Phaser.Physics.Arcade.Group;
    private backgroundElements!: Phaser.GameObjects.Group;
    private exitGate!: DarkCore;
    private playerGlow!: Phaser.GameObjects.Image;
    private currentCheckpoint: { x: number, y: number } = { x: 100, y: 450 };
    private shardCount: number = 0;
    private requiredShards: number = 3;
    private isShadowMode: boolean = false;

    private scoreText!: Phaser.GameObjects.Text;
    private staminaBar!: Phaser.GameObjects.Graphics;
    private currentLevel: number = 1;
    private totalLevels: number = 10;
    private isTransitioning: boolean = false;
    private isGameStarted: boolean = false;
    private isGameOver: boolean = false;
    private titleText!: Phaser.GameObjects.Text;
    private instructionText!: Phaser.GameObjects.Text;
    private hudGroup!: Phaser.GameObjects.Group;
    private hearts: Phaser.GameObjects.Image[] = [];

    private levelData: any[] = [
        { // Level 1: The Dark Awakening
            shards: 3,
            platforms: [[400, 584, 1, 1], [200, 450, 0.3, 1], [600, 350, 0.3, 1], [1000, 500, 0.5, 1], [1400, 400, 0.3, 1], [1850, 584, 1, 1]],
            enemies: [[600, 550, 0, 200], [1000, 460, 1, 150]],
            checkpoints: [[100, 500]],
            shardsPos: [[300, 400], [800, 310], [1300, 360]],
            hazards: [[400, 560], [1600, 560]],
            gate: [1950, 530]
        },
        { // Level 2: Ethereal Echoes
            shards: 3,
            platforms: [[400, 584, 1, 1], [300, 400, 0.2, 1], [800, 450, 0.5, 1], [1300, 350, 0.3, 1], [1800, 500, 0.4, 1]],
            ethereal: [[600, 400, 32, 200], [1100, 350, 32, 200]],
            enemies: [[700, 400, 0, 150], [1200, 310, 1, 100]],
            shardsPos: [[300, 360], [1100, 400], [1700, 450]],
            gate: [1850, 460]
        },
        { // Level 3: Whispers of the Blade
            shards: 3,
            platforms: [[400, 584, 1, 1], [700, 450, 0.2, 1], [1100, 350, 0.4, 1], [1500, 450, 0.3, 1], [1900, 584, 0.5, 1]],
            blades: [[500, 400], [1300, 400]],
            enemies: [[900, 550, 2, 200]],
            shardsPos: [[700, 410], [1100, 310], [1500, 410]],
            gate: [1950, 530]
        },
        { // Level 4: Falling Silence
            shards: 4,
            platforms: [[200, 550, 0.3, 1], [500, 450, 0.3, 1], [800, 350, 0.3, 1], [500, 250, 0.3, 1], [200, 150, 0.3, 1], [1000, 150, 0.5, 1]],
            rocks: [[300, 50], [600, 50], [900, 50]],
            enemies: [[500, 210, 1, 80], [800, 310, 0, 120]],
            shardsPos: [[200, 110], [800, 310], [500, 210], [1000, 110]],
            gate: [1100, 110]
        },
        { // Level 5: The Lurker's Den
            shards: 4,
            platforms: [[300, 584, 1, 1], [800, 400, 0.4, 1], [1300, 584, 1, 1]],
            enemies: [[400, 550, 2, 300], [1200, 550, 2, 300]],
            blades: [[800, 300]],
            shardsPos: [[800, 350], [400, 500], [1200, 500], [1800, 500]],
            gate: [1900, 530]
        },
        { // Level 6: Shadow Gauntlet
            shards: 3,
            platforms: [[200, 500, 0.2, 1], [500, 500, 0.2, 1], [800, 500, 0.2, 1], [1100, 500, 0.2, 1]],
            ethereal: [[350, 500, 100, 200], [650, 500, 100, 200], [950, 500, 100, 200]],
            shardsPos: [[500, 450], [800, 450], [1100, 450]],
            gate: [1400, 500]
        },
        { // Level 7: Crushing Depths
            shards: 4,
            platforms: [[100, 584, 2, 1], [800, 300, 2, 1], [1500, 584, 2, 1]],
            rocks: [[200, 0], [400, 0], [600, 0], [1000, 0], [1200, 0]],
            shardsPos: [[100, 550], [800, 250], [1500, 550], [1800, 550]],
            gate: [1900, 550]
        },
        { // Level 8: Void Pillars
            shards: 3,
            platforms: [[100, 500, 0.1, 1], [400, 400, 0.1, 1], [700, 300, 0.1, 1], [1000, 400, 0.1, 1], [1300, 500, 0.1, 1]],
            enemies: [[400, 360, 2, 50], [1000, 360, 2, 50]],
            shardsPos: [[100, 450], [700, 250], [1300, 450]],
            gate: [1600, 500]
        },
        { // Level 9: Eternal Descent
            shards: 5,
            platforms: [[500, 100, 2, 1], [500, 300, 2, 1], [500, 500, 2, 1]],
            hazards: [[200, 500], [400, 500], [600, 500], [800, 500]],
            enemies: [[500, 260, 1, 200], [500, 460, 1, 200]],
            shardsPos: [[200, 50], [800, 50], [200, 250], [800, 250], [500, 450]],
            gate: [100, 450]
        },
        { // Level 10: The Ultimate Shadow
            shards: 5,
            platforms: [[100, 550, 0.1, 1], [400, 450, 0.1, 1], [700, 350, 0.1, 1], [1000, 250, 0.1, 1], [1300, 150, 0.1, 1], [1600, 150, 0.1, 1]],
            enemies: [[400, 410, 0, 50], [700, 310, 1, 50], [1000, 210, 2, 50]],
            blades: [[550, 400], [850, 300]],
            shardsPos: [[100, 510], [400, 410], [700, 310], [1000, 210], [1300, 110]],
            gate: [1700, 110]
        }
    ];

    // Theme Definitions
    private themes = [
        { name: "The Dark Prison", bg: '#1a0f0a', particle: 0xffaa00, tint: 0xffffff },   // Level 1-2 (Amber)
        { name: "The Ethereal Void", bg: '#0f0a1a', particle: 0x00ccff, tint: 0xaaccff }, // Level 3-4 (Cyan)
        { name: "The Blood Foundries", bg: '#1a0505', particle: 0xff0000, tint: 0xffaaaa }, // Level 5-6 (Crimson)
        { name: "The Toxic Sewers", bg: '#0a1a05', particle: 0x00ff00, tint: 0xaaffaa },  // Level 7-8 (Toxic Green)
        { name: "The Abyssal Depth", bg: '#050505', particle: 0xffffff, tint: 0x888888 }   // Level 9-10 (Monochrome)
    ];

    constructor() {
        super('GameScene');
    }

    create() {
        console.log("GameScene: STARTING CREATE");
        this.cameras.main.setBackgroundColor('#1a0f0a');

        // Error indicator override
        const errorDisplay = document.getElementById('error-display');
        if (errorDisplay) errorDisplay.innerHTML = "GAME ENGINE: RUNNING";

        // 0. GENERATE TEXTURES FIRST
        this.generateTextures();

        // 1. Initialize ALL Physics Groups FIRST
        this.platforms = this.physics.add.staticGroup();
        this.etherealWalls = this.physics.add.staticGroup();
        this.checkpoints = this.physics.add.staticGroup();
        this.hazards = this.physics.add.staticGroup();
        this.shards = this.physics.add.group();
        this.enemies = this.physics.add.group();
        this.rocks = this.physics.add.group();
        this.blades = this.physics.add.group();
        this.backgroundElements = this.add.group();

        // Input
        this.input.keyboard?.on('keydown-SPACE', () => this.toggleShadow());

        // HUD Initialization (Updated for Sprites)
        // HUD Initialization (Updated for Sprites)
        this.hudGroup = this.add.group();

        // HUD Background
        const hudBg = this.add.graphics();
        hudBg.fillStyle(0x000000, 0.5);
        hudBg.fillRoundedRect(10, 10, 200, 90, 10);
        hudBg.setScrollFactor(0);
        this.hudGroup.add(hudBg);

        const scoreIcon = this.add.image(35, 35, 'shard').setScrollFactor(0).setScale(1.5);
        this.scoreText = this.add.text(55, 25, '0 / 3', { fontSize: '20px', color: '#ffaa00', fontFamily: 'Cinzel, serif' }).setScrollFactor(0);
        this.hudGroup.add(scoreIcon);
        this.hudGroup.add(this.scoreText);

        // Hearts
        for (let i = 0; i < 3; i++) {
            const heart = this.add.image(35 + (i * 30), 65, 'heart').setScrollFactor(0).setScale(1.5);
            this.hearts.push(heart);
            this.hudGroup.add(heart);
        }

        this.staminaBar = this.add.graphics().setScrollFactor(0);
        this.hudGroup.add(this.staminaBar);
        this.hudGroup.setVisible(false); // Hide HUD initially

        this.generateTextures();
        this.loadLevel(this.currentLevel - 1);

        // Title Screen Setup
        this.showTitleScreen();

        console.log("GameScene: CREATE COMPLETE");
    }

    private showTitleScreen() {
        // Cinematic Camera Pos
        this.heroine.setVisible(true); // Ensure visible for scene
        this.cameras.main.setZoom(1.5);
        this.cameras.main.startFollow(this.heroine, true, 0.05, 0.05);

        this.titleText = this.add.text(512, 150, 'OSCURA:\nTHE SECOND SHADOW', {
            fontSize: '48px',
            color: '#ffaa00',
            fontFamily: 'Cinzel, serif',
            align: 'center',
            stroke: '#000000',
            strokeThickness: 6
        }).setOrigin(0.5).setScrollFactor(0).setAlpha(0);

        this.instructionText = this.add.text(512, 450, '- PRESS SPACE TO START -', {
            fontSize: '24px',
            color: '#ffffff',
            fontFamily: 'monospace',
            align: 'center'
        }).setOrigin(0.5).setScrollFactor(0).setAlpha(0);

        // Title Animation
        this.tweens.add({
            targets: this.titleText,
            alpha: 1,
            y: 180,
            duration: 2000,
            ease: 'Power2',
            onComplete: () => {
                this.tweens.add({
                    targets: this.titleText,
                    scale: 1.05,
                    duration: 1500,
                    yoyo: true,
                    repeat: -1,
                    ease: 'Sine.easeInOut'
                });
            }
        });

        // Instructions Blink
        this.tweens.add({
            targets: this.instructionText,
            alpha: 1,
            duration: 1000,
            delay: 1500,
            onComplete: () => {
                this.tweens.add({
                    targets: this.instructionText,
                    alpha: 0.3,
                    duration: 800,
                    yoyo: true,
                    repeat: -1
                });
            }
        });

        // Start Listener
        this.input.keyboard?.once('keydown-SPACE', () => this.startGame());
    }

    private startGame() {
        if (this.isGameStarted) return;
        this.isGameStarted = true;

        // Fade out Title
        this.tweens.add({
            targets: [this.titleText, this.instructionText],
            alpha: 0,
            duration: 1000,
            onComplete: () => {
                this.titleText.destroy();
                this.instructionText.destroy();
                this.hudGroup.setVisible(true);

                // Show Level 1 Text properly
                if (this.currentLevelText) {
                    this.tweens.add({
                        targets: this.currentLevelText,
                        alpha: 1,
                        duration: 1000,
                        onComplete: () => {
                            this.tweens.add({
                                targets: this.currentLevelText,
                                alpha: 0,
                                duration: 2000,
                                delay: 2000,
                                onComplete: () => {
                                    if (this.currentLevelText) this.currentLevelText.destroy();
                                    this.currentLevelText = undefined;
                                }
                            });
                        }
                    });
                }
            }
        });

        // Reset Camera
        this.cameras.main.zoomTo(1.3, 1500, 'Power2');

        // Play Sound? (If audio existed)
    }

    private currentLevelText?: Phaser.GameObjects.Text;

    private loadLevel(index: number) {
        // 1. Reset Scene
        this.platforms.clear(true, true);
        this.etherealWalls.clear(true, true);
        this.checkpoints.clear(true, true);
        this.hazards.clear(true, true);
        this.shards.clear(true, true);
        this.enemies.clear(true, true);
        this.rocks.clear(true, true);
        this.blades.clear(true, true);
        this.backgroundElements.clear(true, true);

        // Clear overlap text
        if (this.currentLevelText) {
            this.currentLevelText.destroy();
            this.currentLevelText = undefined;
        }

        // Determine Theme
        const themeIndex = Math.floor(index / 2) % this.themes.length;
        const theme = this.themes[themeIndex];

        this.cameras.main.setBackgroundColor(theme.bg);

        // Background - Ancient Stone Wall
        this.add.tileSprite(0, 0, 4000, 2000, 'stone_bg').setOrigin(0, 0).setScrollFactor(1).setDepth(-10).setTint(theme.tint);

        // Decorative Gears
        for (let i = 0; i < 20; i++) {
            const x = Math.random() * 4000;
            const y = Math.random() * 1000;
            const scale = 0.5 + Math.random() * 2;
            const gear = this.add.image(x, y, 'gear').setScale(scale).setAlpha(0.2).setDepth(-5).setScrollFactor(0.8);
            this.backgroundElements.add(gear);
            (gear as any).rotationSpeed = (Math.random() - 0.5) * 0.02;
        }

        // Void (now Ember) Particles
        const particles = this.add.particles(0, 0, 'void_dust', {
            x: { min: 0, max: 2000 },
            y: { min: 0, max: 1000 },
            frequency: 150,
            lifespan: 4000,
            speedY: { min: -20, max: -50 },
            speedX: { min: -10, max: 10 },
            scale: { start: 1, end: 0 },
            alpha: { start: 0.6, end: 0 },
            tint: theme.particle,
            blendMode: 'ADD'
        });
        particles.setDepth(-1);

        // Player Glow
        this.playerGlow = this.add.image(0, 0, 'glow').setAlpha(0.4).setScale(3).setDepth(-1).setBlendMode('ADD');

        // Level Text
        this.currentLevelText = this.add.text(512, 100, `LEVEL ${index + 1}`, {
            fontSize: '32px', color: '#ffffff', fontFamily: 'Cinzel, serif', stroke: '#000000', strokeThickness: 4
        }).setOrigin(0.5).setScrollFactor(0);

        if (!this.isGameStarted) {
            this.currentLevelText.setAlpha(0); // Hide if game hasn't started
        } else {
            // If game started, fade it out normally
            this.tweens.add({
                targets: this.currentLevelText,
                alpha: 0,
                duration: 2000,
                delay: 2000,
                onComplete: () => {
                    if (this.currentLevelText) this.currentLevelText.destroy();
                    this.currentLevelText = undefined;
                }
            });
        }
        const vignette = this.add.graphics().setScrollFactor(0).setDepth(100);
        for (let i = 0; i < 5; i++) {
            vignette.fillStyle(0x000000, 0.1);
            const offset = i * 20;
            vignette.fillRect(0, 0, 1024, offset + 20); // Top
            vignette.fillRect(0, 576 - offset - 20, 1024, offset + 20); // Bottom
            vignette.fillRect(0, 0, offset + 20, 576); // Left
            vignette.fillRect(1024 - offset - 20, 0, offset + 20, 576); // Right
        }

        if (this.exitGate) (this.exitGate as any).destroy();

        const data = this.levelData[index];
        this.requiredShards = data.shards;
        this.shardCount = 0;

        // 2. Build World
        if (data.platforms) {
            data.platforms.forEach((p: any) => {
                this.platforms.create(p[0], p[1], 'platform').setScale(p[2] || 1, p[3] || 1).refreshBody();
            });
        }

        if (data.checkpoints) {
            data.checkpoints.forEach((cp: any) => {
                const check = new Checkpoint(this, cp[0], cp[1]);
                this.checkpoints.add(check);
            });
        }

        if (data.ethereal) {
            data.ethereal.forEach((e: any) => {
                const wall = new EtherealWall(this, e[0], e[1], e[2], e[3]);
                this.etherealWalls.add(wall);
            });
        }

        if (data.rocks) {
            data.rocks.forEach((r: any) => {
                const rock = new FallingRock(this, r[0], r[1]);
                this.rocks.add(rock);
            });
        }

        if (data.blades) {
            data.blades.forEach((b: any) => {
                const blade = new MovingBlade(this, b[0], b[1]);
                this.blades.add(blade);
                this.physics.add.existing(blade, true);
            });
        }

        if (data.shardsPos) {
            data.shardsPos.forEach((s: any) => {
                const shard = new Shard(this, s[0], s[1]);
                this.shards.add(shard);
                (shard.body as Phaser.Physics.Arcade.Body).setAllowGravity(false);
            });
        }

        if (data.hazards) {
            data.hazards.forEach((h: any) => {
                const haz = new Hazard(this, h[0], h[1]);
                this.hazards.add(haz);
            });
        }

        if (data.enemies) {
            data.enemies.forEach((e: any) => {
                const en = new Enemy(this, e[0], e[1], e[2]);
                this.enemies.add(en);
                (en.body as Phaser.Physics.Arcade.Body).setCollideWorldBounds(true);
            });
        }

        const gx = data.gate ? data.gate[0] : 1900;
        const gy = data.gate ? data.gate[1] : 530;
        this.exitGate = new DarkCore(this, gx, gy, this.requiredShards);
        this.physics.add.existing(this.exitGate, true);

        // Reset Heroine
        this.currentCheckpoint = data.checkpoints ? { x: data.checkpoints[0][0], y: data.checkpoints[0][1] } : { x: 100, y: 450 };
        this.heroine = new Heroine(this, this.currentCheckpoint.x, this.currentCheckpoint.y);
        this.physics.add.existing(this.heroine);

        this.shadow = new Shadow(this, this.currentCheckpoint.x, this.currentCheckpoint.y, this.heroine);
        this.physics.add.existing(this.shadow);
        (this.shadow.body as Phaser.Physics.Arcade.Body).setAllowGravity(false);

        // Setup Collisions (Re-binding after clear)
        this.setupCollisions();

        // UI Follow
        this.cameras.main.startFollow(this.heroine, true, 0.1, 0.1);
        this.updateHUD();

        // Level Title
        const title = this.add.text(512, 100, `LEVEL ${index + 1}`, { fontSize: '42px', color: '#ffffff', fontFamily: 'monospace' }).setOrigin(0.5).setScrollFactor(0);
        this.tweens.add({ targets: title, alpha: 0, duration: 2000, delay: 1000 });
    }

    private setupCollisions() {
        this.physics.add.collider(this.heroine, this.platforms);
        this.physics.add.overlap(this.heroine, this.shards, (_h, s) => this.collectShard(s as Shard), undefined, this);
        this.physics.add.overlap(this.heroine, this.hazards, () => this.playerHit(), undefined, this);
        this.physics.add.overlap(this.heroine, this.enemies, () => this.playerHit(), undefined, this);
        this.physics.add.overlap(this.heroine, this.rocks, () => this.playerHit(), undefined, this);
        this.physics.add.overlap(this.heroine, this.blades, () => this.playerHit(), undefined, this);
        this.physics.add.overlap(this.heroine, this.etherealWalls, undefined, () => !this.isShadowMode, this);
        this.physics.add.collider(this.heroine, this.exitGate, () => this.reachExit(), undefined, this);
        this.physics.add.collider(this.shadow, this.platforms);
    }



    private generateTextures() {
        const g = this.add.graphics();

        // 1. Stone Background (Ancient blocks)
        g.clear();
        g.fillStyle(0x1a0f0a);
        g.fillRect(0, 0, 128, 128);
        g.lineStyle(2, 0x332211, 0.4);
        g.strokeRect(2, 2, 124, 60);
        g.strokeRect(2, 64, 60, 60);
        g.strokeRect(66, 64, 60, 60);
        g.generateTexture('stone_bg', 128, 128);

        // 2. Mechanical Gear (Silhouette)
        g.clear();
        g.fillStyle(0x000000);
        const centerX = 32, centerY = 32, radius = 20, teeth = 8;
        g.beginPath();
        for (let i = 0; i < teeth * 2; i++) {
            const angle = (i / (teeth * 2)) * Math.PI * 2;
            const r = i % 2 === 0 ? radius + 8 : radius;
            g.lineTo(centerX + Math.cos(angle) * r, centerY + Math.sin(angle) * r);
        }
        g.closePath();
        g.fill();
        g.fillStyle(0x1a0f0a);
        g.fillCircle(centerX, centerY, 8);
        g.generateTexture('gear', 64, 64);

        // 3. Radial Amber Glow (Ethereal light)
        const canvas = (this.textures as any).createCanvas('glow', 256, 256);
        if (canvas) {
            const ctx = canvas.getContext();
            const grad = ctx.createRadialGradient(128, 128, 0, 128, 128, 128);
            grad.addColorStop(0, 'rgba(255, 120, 0, 0.5)');
            grad.addColorStop(1, 'rgba(255, 120, 0, 0)');
            ctx.fillStyle = grad;
            ctx.fillRect(0, 0, 256, 256);
            canvas.refresh();
        }

        // 4. Platform (Pure Silhouette)
        g.clear();
        g.fillStyle(0x000000);
        g.fillRect(0, 0, 800, 32);
        g.generateTexture('platform', 800, 32);

        // Heroine - "Ethereal Badland" Style
        g.clear();
        g.fillStyle(0x000000);

        // Spindly Body
        g.beginPath();
        g.moveTo(16, 8); g.lineTo(22, 48); g.lineTo(10, 48); g.closePath(); g.fill();
        g.fillCircle(16, 8, 5); // Small Head

        // Jagged Multi-Layer Cape
        g.beginPath();
        g.moveTo(12, 14); g.lineTo(2, 40); g.lineTo(8, 28); g.lineTo(4, 48); g.lineTo(12, 34); g.closePath(); g.fill();
        g.beginPath();
        g.moveTo(20, 14); g.lineTo(30, 40); g.lineTo(24, 28); g.lineTo(28, 48); g.lineTo(20, 34); g.closePath(); g.fill();

        // Pulsing White Eyes
        g.fillStyle(0xffffff);
        g.fillCircle(14, 7, 1.5);
        g.fillCircle(18, 7, 1.5);
        g.fillStyle(0xffffff, 0.5);
        g.fillCircle(14, 7, 3);
        g.fillCircle(18, 7, 3);

        // Spindly Limbs (Needle-like)
        g.lineStyle(2, 0x000000);
        g.lineBetween(11, 40, 6, 56);
        g.lineBetween(21, 40, 26, 56);

        // Creepy Hand Glow
        g.fillStyle(0xffaa00, 0.6); g.fillCircle(24, 26, 4);
        g.fillStyle(0xffffff); g.fillCircle(24, 26, 1.5);
        g.generateTexture('heroine', 32, 56);

        // 6. Shadow (Spectral Wisp)
        g.clear();
        g.fillStyle(0x442266, 0.5); // Deep Purple/Sepia mix
        g.beginPath();
        g.moveTo(16, 10); g.lineTo(26, 40); g.lineTo(20, 52); g.lineTo(12, 52); g.lineTo(6, 40); g.closePath(); g.fill();

        // Wisp/Tail effect
        g.beginPath();
        g.moveTo(16, 48); g.lineTo(22, 56); g.lineTo(10, 56); g.closePath(); g.fill();

        g.fillCircle(16, 12, 6);
        g.fillStyle(0xffaa00); g.fillCircle(14.5, 11, 1.5); g.fillCircle(17.5, 11, 1.5); // Amber Eyes
        g.generateTexture('shadow', 32, 56);

        // 7. Enemies (Pure Silhouettes with Red Eye)
        for (let i = 0; i < 3; i++) {
            g.clear();
            g.fillStyle(0x000000);
            if (i === 0) g.fillCircle(24, 24, 18);
            else if (i === 1) g.fillEllipse(24, 24, 20, 12);
            else g.fillEllipse(24, 24, 12, 24);
            g.fillStyle(0xff1100); g.fillCircle(24, 18, 3); // Single Red Eye
            g.generateTexture('enemy_' + i, 48, 48);
        }

        // 8. Shard (Glowing Ember)
        g.clear();
        g.fillStyle(0xff9900, 0.4); g.fillCircle(10, 10, 10);
        g.fillStyle(0xffffff); g.fillCircle(10, 10, 3);
        g.generateTexture('shard', 20, 20);

        // 9. Misc
        g.clear(); g.fillStyle(0x000000); g.fillCircle(16, 16, 16); g.generateTexture('rock', 32, 32);
        g.clear(); g.fillStyle(0x000000); g.fillRect(0, 0, 64, 96); g.generateTexture('darkcore', 64, 96);
        g.clear(); g.fillStyle(0xff0000); g.beginPath(); g.moveTo(0, 20); g.lineTo(10, 0); g.lineTo(20, 20); g.closePath(); g.fill(); g.generateTexture('hazard', 20, 20);
        g.clear(); g.fillStyle(0xffaa00, 0.8); g.fillCircle(4, 4, 4); g.generateTexture('void_dust', 8, 8);

        // Blade
        g.clear();
        g.lineStyle(2, 0xff0000);
        g.strokeCircle(16, 16, 14);
        g.fillStyle(0x000000); g.fillCircle(16, 16, 12);
        g.lineStyle(2, 0x333333);
        g.lineBetween(0, 16, 32, 16);
        g.lineBetween(16, 0, 16, 32);
        g.generateTexture('blade', 32, 32);

        // Checkpoint
        g.clear();
        g.fillStyle(0x00ccff, 0.3); g.fillCircle(16, 16, 16);
        g.fillStyle(0xffffff); g.fillCircle(16, 16, 4);
        g.generateTexture('checkpoint', 32, 32);

        // Ethereal
        g.clear();
        g.fillStyle(0x8800ff, 0.2); g.fillRect(0, 0, 32, 32);
        g.lineStyle(1, 0x8800ff, 0.5); g.strokeRect(0, 0, 32, 32);
        g.generateTexture('ethereal', 32, 32);

        // Heart Icon
        g.clear();
        g.fillStyle(0xff0000);
        g.fillCircle(5, 5, 5);
        g.fillCircle(15, 5, 5);
        g.beginPath();
        g.moveTo(0, 5); g.lineTo(10, 18); g.lineTo(20, 5);
        g.fill();
        g.generateTexture('heart', 20, 20);

        g.destroy();
    }

    private updateHUD() {
        this.scoreText.setText(`${this.shardCount} / ${this.requiredShards}`);

        // Update Hearts
        const health = this.heroine.health; // Assuming heroine has health accessor
        this.hearts.forEach((h, i) => {
            h.setVisible(i < health);
        });

        this.staminaBar.clear();
        this.staminaBar.fillStyle(0x00ffff, 0.6);
        this.staminaBar.fillRect(16, 80, (this.shadow as any).stamina, 10);
    }

    private toggleShadow() {
        if (!this.isGameStarted) return; // Block input if title screen
        if (!this.isShadowMode) {
            if (this.shadow.separate()) {
                this.isShadowMode = true;
                this.heroine.isActive = false;
                this.cameras.main.startFollow(this.shadow, true, 0.1, 0.1);
            }
        } else {
            this.recallShadow();
        }
    }

    private recallShadow() {
        this.isShadowMode = false;
        this.heroine.isActive = true;

        // Teleport Heroine to Shadow's location
        this.heroine.setPosition(this.shadow.x, this.shadow.y);

        // Visual feedback
        this.cameras.main.flash(100, 136, 0, 255, true);

        this.shadow.recall();
        this.cameras.main.startFollow(this.heroine, true, 0.1, 0.1);
    }

    private collectShard(s: Shard) {
        (s as any).destroy();
        this.shardCount++;
        this.updateHUD(); // Trigger update
        if (this.shardCount >= this.requiredShards) {
            this.exitGate.tryUnlock(this.shardCount);
            (this.cameras.main as any).flash(200, 0, 255, 0);
        }
    }

    private reachExit() {
        if (this.exitGate.isUnlocked && !this.isTransitioning) {
            this.isTransitioning = true;
            if (this.currentLevel < this.totalLevels) {
                const text = this.add.text(512, 288, 'GATE UNLOCKED - NEXT LEVEL', { fontSize: '32px', color: '#00ff00', fontFamily: 'monospace' }).setOrigin(0.5).setScrollFactor(0);

                this.time.delayedCall(1500, () => {
                    text.destroy();
                    this.currentLevel++;
                    this.loadLevel(this.currentLevel - 1);
                    this.isTransitioning = false;
                });
            } else {
                this.add.text(512, 288, 'OSCURA: THE SECOND SHADOW\nCONQUERED', { fontSize: '48px', color: '#ffaa00', align: 'center' }).setOrigin(0.5).setScrollFactor(0);
                this.physics.pause();
                this.heroine.isActive = false;
            }
        }
    }

    private playerHit() {
        if (this.heroine.takeDamage()) {
            this.heroine.health = 3;
            this.heroine.setPosition(this.currentCheckpoint.x, this.currentCheckpoint.y);
            this.updateHUD();
        } else {
            this.updateHUD();
            this.heroine.setVelocityY(-400);
            this.heroine.setVelocityX(this.heroine.flipX ? 400 : -400);
        }
    }

    private triggerGameOver() {
        if (this.isGameOver) return;
        this.isGameOver = true;
        this.heroine.setVelocity(0, 0);
        (this.heroine.body as Phaser.Physics.Arcade.Body).setAllowGravity(false);
        this.physics.pause();

        // 1. Camera Shake
        this.cameras.main.shake(500, 0.05);

        // 2. Red/Black Fade
        this.cameras.main.fade(1000, 50, 0, 0);

        // 3. Text
        this.add.text(512, 288, 'GAME OVER', {
            fontSize: '72px',
            color: '#ff0000',
            fontFamily: 'Cinzel, serif',
            stroke: '#000000',
            strokeThickness: 8
        }).setOrigin(0.5).setDepth(200).setScrollFactor(0);

        // 4. Restart
        this.time.delayedCall(2000, () => {
            this.isGameOver = false;
            this.scene.restart();
        });
    }


    update(time: number) {
        if (!this.isGameStarted || this.isGameOver) return; // Pause game logic

        // Fall Detection
        if (this.heroine.y > 800) {
            this.triggerGameOver();
            return;
        }

        this.heroine.update(time);
        this.updateHUD(); // Continuous update for health/stamina
        this.shadow.update();

        // Update Glow Position
        if (this.playerGlow) {
            this.playerGlow.setPosition(this.heroine.x, this.heroine.y);
        }

        // Update Background Gears
        this.backgroundElements.getChildren().forEach((g: any) => {
            if (g.texture.key === 'gear') {
                g.rotation += g.rotationSpeed || 0.01;
            }
        });

        this.enemies.getChildren().forEach((e: any) => {
            if (e.active) e.update();
        });

        this.blades.getChildren().forEach((b: any) => {
            if (b.active) b.update(time);
        });

        this.rocks.getChildren().forEach((r: any) => {
            if (r.active && Math.abs(r.x - this.heroine.x) < 80 && r.y < this.heroine.y) {
                r.trigger();
            }
        });

        this.staminaBar.clear();
        this.staminaBar.fillStyle(0x00ffff, 0.6);
        this.staminaBar.fillRect(16, 80, (this.shadow as any).stamina, 10);

        if (this.isShadowMode && !this.shadow.isActive) this.recallShadow();
    }
}
