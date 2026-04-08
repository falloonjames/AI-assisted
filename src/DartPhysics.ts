import * as BABYLON from '@babylonjs/core';

/**
 * DartPhysics - Handles dart physics and trajectory
 */
export class DartPhysics {
    private scene: BABYLON.Scene;
    private dartSpeed: number = 50; // Base speed

    constructor(scene: BABYLON.Scene) {
        this.scene = scene;
    }

    /**
     * Create a dart mesh
     */
    public createDart(scene: BABYLON.Scene): BABYLON.Mesh {
        // Create dart as a simple cone/arrow shape
        const dart = BABYLON.MeshBuilder.CreateCylinder('dart', {
            diameter: 0.3,
            height: 5,
            tessellation: 8
        }, scene);

        const material = new BABYLON.StandardMaterial('dartMaterial', scene);
        material.emissiveColor = new BABYLON.Color3(1, 0.8, 0);
        dart.material = material;

        // Position dart at origin (slightly offset)
        dart.position = new BABYLON.Vector3(0, 0.5, -15);
        dart.rotation.z = Math.PI / 2;

        // Add physics
        dart.physicsImpostor = new BABYLON.PhysicsImpostor(
            dart,
            BABYLON.PhysicsImpostor.CylinderImpostor,
            { mass: 0.3, restitution: 0.4, friction: 0.2 },
            scene
        );

        return dart;
    }

    /**
     * Calculate velocity based on power and difficulty
     */
    public calculateVelocity(power: number, difficulty: number): BABYLON.Vector3 {
        // Normalize power
        const normalizedPower = (power / 100) * difficulty;

        // Base direction (towards dartboard, slightly upward)
        const baseVelocity = normalizedPower * this.dartSpeed;
        
        // Add random deviation based on difficulty (lower difficulty = less variance)
        const xDeviation = (Math.random() - 0.5) * (1 - difficulty) * 10;
        const yDeviation = (Math.random() - 0.5) * (1 - difficulty) * 5;
        const zDeviation = (Math.random() - 0.5) * (1 - difficulty) * 3;

        return new BABYLON.Vector3(
            xDeviation,
            baseVelocity * 0.3 + yDeviation,
            baseVelocity + zDeviation
        );
    }

    /**
     * Apply force to dart
     */
    public applyForce(dart: BABYLON.Mesh, velocity: BABYLON.Vector3): void {
        if (dart.physicsImpostor) {
            dart.physicsImpostor.setLinearVelocity(velocity);
            dart.physicsImpostor.applyForce(
                new BABYLON.Vector3(0, -9.81 * 0.3, 0), // Gravity adjustment
                dart.getAbsolutePosition()
            );
        }
    }

    /**
     * Check if dart is in flight
     */
    public isDartInFlight(dart: BABYLON.Mesh): boolean {
        const velocity = dart.physicsImpostor?.getLinearVelocity();
        if (!velocity) return false;
        
        const speed = velocity.length();
        return speed > 0.5; // Threshold for "in flight"
    }
}