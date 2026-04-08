/**
 * SwingMechanics - Adapts golf swing mechanics for darts
 * Based on 2K25 Golf pulling back and pushing forward
 */
export class SwingMechanics {
    private power: number = 0;
    private maxPower: number = 100;
    private minAccuracy: number = 0.7; // 70% accuracy at max power
    private maxAccuracy: number = 1.0; // 100% accuracy at low power

    constructor() {}

    /**
     * Start a new swing
     */
    public startSwing(): void {
        this.power = 0;
    }

    /**
     * Update power during swing (0-100)
     */
    public updatePower(power: number): void {
        this.power = Math.max(0, Math.min(100, power));
    }

    /**
     * Get current power
     */
    public getPower(): number {
        return this.power;
    }

    /**
     * Calculate difficulty modifier based on power
     * Higher power = lower accuracy (golf-style difficulty)
     */
    public calculateDifficulty(power: number): number {
        // Normalize power to 0-1
        const normalizedPower = power / this.maxPower;

        // Calculate accuracy (inverse relationship with power)
        // At 0% power: 100% accuracy
        // At 50% power: 85% accuracy
        // At 100% power: 70% accuracy
        const accuracy = this.maxAccuracy - (normalizedPower * (this.maxAccuracy - this.minAccuracy));

        // Add randomness factor that increases with power
        const randomFactor = 1 - (normalizedPower * 0.3); // Up to 30% variance at max power
        const variance = 0.8 + (Math.random() * (2 - 0.8) * (1 - randomFactor));

        return accuracy * variance;
    }

    /**
     * Get the difficulty curve visualization
     */
    public getDifficultyCurve(power: number): {
        accuracy: number;
        variance: number;
    } {
        const normalizedPower = power / this.maxPower;
        const accuracy = this.maxAccuracy - (normalizedPower * (this.maxAccuracy - this.minAccuracy));
        const variance = 1 - (normalizedPower * 0.3);

        return { accuracy, variance };
    }

    /**
     * Simulate pull-back phase (like golf swing)
     * Returns true if pull-back was successful
     */
    public validateSwing(power: number): boolean {
        // Basic validation - power should be between 20-100 for valid throw
        return power >= 20 && power <= 100;
    }
}