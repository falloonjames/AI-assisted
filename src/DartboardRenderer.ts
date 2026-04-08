import * as BABYLON from '@babylonjs/core';

interface ScoringZone {
    name: string;
    radius: number;
    points: number;
    color: BABYLON.Color3;
}

/**
 * DartboardRenderer - Creates and manages the dartboard
 */
export class DartboardRenderer {
    private scene: BABYLON.Scene;
    private dartboard!: BABYLON.Mesh;
    private scoringZones: ScoringZone[] = [];

    constructor(scene: BABYLON.Scene) {
        this.scene = scene;
        this.createDartboard();
        this.defineScoringZones();
    }

    private createDartboard(): void {
        // Create main dartboard as a cylinder
        this.dartboard = BABYLON.MeshBuilder.CreateCylinder('dartboard', {
            diameter: 20,
            height: 1,
            tessellation: 32
        }, this.scene);

        this.dartboard.position = new BABYLON.Vector3(0, 0, 20);

        // Create dartboard material with checkerboard pattern
        const dartboardMaterial = new BABYLON.StandardMaterial('dartboardMat', this.scene);
        dartboardMaterial.emissiveColor = new BABYLON.Color3(0.1, 0.1, 0.1);
        this.dartboard.material = dartboardMaterial;

        // Add physics impostor
        this.dartboard.physicsImpostor = new BABYLON.PhysicsImpostor(
            this.dartboard,
            BABYLON.PhysicsImpostor.CylinderImpostor,
            { mass: 0, restitution: 0.8, friction: 0.5 },
            this.scene
        );

        // Create visual rings
        this.createVisualRings();
    }

    private createVisualRings(): void {
        const rings = [
            { radius: 2, color: new BABYLON.Color3(1, 0, 0) },     // Bullseye
            { radius: 4, color: new BABYLON.Color3(1, 0.8, 0) },   // Inner ring
            { radius: 8, color: new BABYLON.Color3(0, 0.8, 1) },   // Middle ring
            { radius: 12, color: new BABYLON.Color3(0.2, 1, 0.2) } // Outer ring
        ];

        rings.forEach((ring, index) => {
            const tubeData = BABYLON.MeshBuilder.CreateTube(
                `ring_${index}`,
                {
                    path: BABYLON.Curve3.CreateCatmullRomSpline(
                        this.getCirclePoints(ring.radius, 64),
                        64
                    ).getPoints(),
                    radius: 0.1,
                    updatable: false
                },
                this.scene
            );

            const material = new BABYLON.StandardMaterial(`ringMat_${index}`, this.scene);
            material.emissiveColor = ring.color;
            material.emissiveColor.scaleInPlace(0.6);
            tubeData.material = material;
            tubeData.position.z = 20.5;
        });
    }

    private getCirclePoints(radius: number, segments: number): BABYLON.Vector3[] {
        const points: BABYLON.Vector3[] = [];
        for (let i = 0; i <= segments; i++) {
            const angle = (i / segments) * Math.PI * 2;
            points.push(new BABYLON.Vector3(
                radius * Math.cos(angle),
                radius * Math.sin(angle),
                0
            ));
        }
        return points;
    }

    private defineScoringZones(): void {
        this.scoringZones = [
            { name: 'Bullseye', radius: 1, points: 50, color: new BABYLON.Color3(1, 0, 0) },
            { name: 'Inner Ring', radius: 3, points: 25, color: new BABYLON.Color3(1, 0.8, 0) },
            { name: 'Middle Ring', radius: 7, points: 15, color: new BABYLON.Color3(0, 0.8, 1) },
            { name: 'Outer Ring', radius: 11, points: 10, color: new BABYLON.Color3(0.2, 1, 0.2) },
            { name: 'Miss', radius: 100, points: 0, color: new BABYLON.Color3(0.5, 0.5, 0.5) }
        ];
    }

    /**
     * Check where dart hit the board
     */
    public checkDartHit(dartPosition: BABYLON.Vector3): { name: string; points: number } | null {
        // Calculate distance from dartboard center (ignoring Z)
        const boardCenter = this.dartboard.position;
        const dx = dartPosition.x - boardCenter.x;
        const dy = dartPosition.y - boardCenter.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        // Find which zone the dart hit
        for (const zone of this.scoringZones) {
            if (distance <= zone.radius) {
                return {
                    name: zone.name,
                    points: zone.points
                };
            }
        }

        return null;
    }

    /**
     * Get dartboard position
     */
    public getPosition(): BABYLON.Vector3 {
        return this.dartboard.position;
    }
}