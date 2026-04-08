import * as BABYLON from '@babylonjs/core';
import { SwingMechanics } from './SwingMechanics';
import { DartPhysics } from './DartPhysics';
import { DartboardRenderer } from './DartboardRenderer';

class DartGame {
    private scene!: BABYLON.Scene;
    private engine!: BABYLON.Engine;
    private camera!: BABYLON.ArcRotateCamera;
    private swingMechanics!: SwingMechanics;
    private dartPhysics!: DartPhysics;
    private dartboard!: DartboardRenderer;
    private score: number = 0;
    private darts: BABYLON.Mesh[] = [];
    private isSwinging: boolean = false;

    constructor() {
        this.initialize();
    }

    private initialize(): void {
        const canvas = document.getElementById('babylonCanvas') as HTMLCanvasElement;
        this.engine = new BABYLON.Engine(canvas, true);
        this.scene = new BABYLON.Scene(this.engine);
        this.scene.enablePhysics(new BABYLON.Vector3(0, 0, 0), new BABYLON.HavokPlugin());

        // Camera setup
        this.camera = new BABYLON.ArcRotateCamera(
            'camera',
            Math.PI / 2,
            Math.PI / 2.5,
            30,
            BABYLON.Vector3.Zero(),
            this.scene
        );
        this.camera.attachControl(canvas, true);
        this.camera.inertia = 0.7;
        this.camera.angularSensibilityX = 1000;
        this.camera.angularSensibilityY = 1000;

        // Lighting
        const light = new BABYLON.PointLight('light', new BABYLON.Vector3(5, 10, 5), this.scene);
        light.intensity = 1;
        const ambientLight = new BABYLON.HemisphericLight('ambient', new BABYLON.Vector3(0, 1, 0), this.scene);
        ambientLight.intensity = 0.6;

        // Background
        this.scene.clearColor = new BABYLON.Color3(0.2, 0.3, 0.5);

        // Initialize game systems
        this.dartboard = new DartboardRenderer(this.scene);
        this.swingMechanics = new SwingMechanics();
        this.dartPhysics = new DartPhysics(this.scene);

        // Input handling
        this.setupControls();

        // Render loop
        this.engine.runRenderLoop(() => {
            this.update();
            this.scene.render();
        });

        // Resize handler
        window.addEventListener('resize', () => {
            this.engine.resize();
        });
    }

    private setupControls(): void {
        let mouseDown = false;
        let mouseStartY = 0;

        document.addEventListener('mousedown', (e) => {
            mouseDown = true;
            mouseStartY = e.clientY;
            this.isSwinging = true;
            this.swingMechanics.startSwing();
            document.getElementById('swingMeter')!.style.display = 'block';
            document.getElementById('swingLabel')!.style.display = 'block';
        });

        document.addEventListener('mousemove', (e) => {
            if (mouseDown) {
                const dragDistance = Math.max(0, mouseStartY - e.clientY);
                const power = Math.min(100, (dragDistance / 200) * 100);
                this.swingMechanics.updatePower(power);
                
                const meterFill = document.getElementById('swingMeterFill')!;
                meterFill.style.width = power + '%';
            }
        });

        document.addEventListener('mouseup', () => {
            if (mouseDown && this.isSwinging) {
                const power = this.swingMechanics.getPower();
                this.throwDart(power);
                this.isSwinging = false;
                mouseDown = false;
                document.getElementById('swingMeter')!.style.display = 'none';
                document.getElementById('swingLabel')!.style.display = 'none';
            }
        });

        // Reset with R key
        document.addEventListener('keydown', (e) => {
            if (e.key.toLowerCase() === 'r') {
                this.resetGame();
            }
        });
    }

    private throwDart(power: number): void {
        const dart = this.dartPhysics.createDart(this.scene);
        this.darts.push(dart);

        // Apply physics based on power (golf-style difficulty)
        const difficulty = this.swingMechanics.calculateDifficulty(power);
        const velocity = this.dartPhysics.calculateVelocity(power, difficulty);
        
        this.dartPhysics.applyForce(dart, velocity);

        // Check collision after delay
        setTimeout(() => {
            const hit = this.dartboard.checkDartHit(dart.getAbsolutePosition());
            if (hit) {
                this.score += hit.points;
                document.getElementById('score')!.textContent = `Score: ${this.score}`;
            }
        }, 1500);
    }

    private resetGame(): void {
        this.score = 0;
        document.getElementById('score')!.textContent = `Score: 0`;
        
        // Remove all darts
        this.darts.forEach(dart => dart.dispose());
        this.darts = [];
    }

    private update(): void {
        // Game update loop
    }
}

// Start the game
new DartGame();