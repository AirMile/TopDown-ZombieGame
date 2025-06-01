import { PlayerConfig } from '../config/index.js';

export class PlayerHealth {
    #player
    #maxHealth
    #currentHealth
    #isInvulnerable
    #invulnerabilityTime
    #invulnerabilityTimer = 0
    #onDeathCallback
    #onHealthChangeCallback

    constructor(player) {
        this.#player = player;
        this.#maxHealth = PlayerConfig.MAX_HEALTH;
        this.#currentHealth = this.#maxHealth;
        this.#isInvulnerable = false;
        this.#invulnerabilityTime = PlayerConfig.INVULNERABILITY_TIME;
        this.#onDeathCallback = null;
        this.#onHealthChangeCallback = null;
        
        console.log(`PlayerHealth initialized: ${this.#currentHealth}/${this.#maxHealth} HP`);
    }

    // Health methods
    getCurrentHealth() {
        return this.#currentHealth;
    }

    getMaxHealth() {
        return this.#maxHealth;
    }

    getHealthPercentage() {
        return this.#currentHealth / this.#maxHealth;
    }

    // Invulnerability methods
    isInvulnerable() {
        return this.#isInvulnerable;
    }

    getInvulnerabilityTimeLeft() {
        return Math.max(0, this.#invulnerabilityTimer);
    }

    // Callback settings
    setOnDeathCallback(callback) {
        this.#onDeathCallback = callback;
    }

    setOnHealthChangeCallback(callback) {
        this.#onHealthChangeCallback = callback;
    }

    // Update method for timers
    update(delta) {
        // Update invulnerability timer
        if (this.#isInvulnerable) {
            this.#invulnerabilityTimer -= delta;
            if (this.#invulnerabilityTimer <= 0) {
                this.#isInvulnerable = false;
                console.log('Player invulnerability ended');
            }
        }
    }

    // Helper for consistent health updates
    #updateHealth(newHealth) {
        this.#currentHealth = Math.max(0, Math.min(this.#maxHealth, newHealth));
        this.#notifyHealthChange();
        if (this.#currentHealth <= 0) {
            this.#handleDeath();
        }
    }

    // Helper for invulnerability activation
    #activateInvulnerability() {
        this.#isInvulnerable = true;
        this.#invulnerabilityTimer = this.#invulnerabilityTime;
        console.log(`Player invulnerability activated for ${this.#invulnerabilityTime}ms`);
    }

    // Damage system
    takeDamage(damage = 10, source = 'unknown') {
        if (this.#isInvulnerable) {
            console.log(`Damage blocked: ${damage} from ${source} (invulnerable)`);
            return false;
        }

        const oldHealth = this.#currentHealth;
        
        this.#activateInvulnerability();
        this.#updateHealth(this.#currentHealth - damage);
        
        console.log(`Player took ${damage} damage from ${source}: health=${this.#currentHealth}/${this.#maxHealth} (was ${oldHealth})`);

        return true;
    }

    // Healing system
    heal(amount, source = 'unknown') {
        if (this.#currentHealth >= this.#maxHealth) {
            console.log(`Heal blocked: already at max health (${this.#maxHealth})`);
            return false;
        }

        const oldHealth = this.#currentHealth;
        this.#updateHealth(this.#currentHealth + amount);
        
        const actualHealing = this.#currentHealth - oldHealth;
        console.log(`Player healed ${actualHealing} HP from ${source}: health=${this.#currentHealth}/${this.#maxHealth}`);

        return true;
    }

    // Full healing
    fullHeal() {
        if (this.#currentHealth === this.#maxHealth) {
            console.log('Full heal blocked: already at max health');
            return false;
        }
        
        const oldHealth = this.#currentHealth;
        this.#updateHealth(this.#maxHealth);
        
        console.log(`Player fully healed: health=${this.#currentHealth}/${this.#maxHealth} (was ${oldHealth})`);
        return true;
    }

    // Health status checks
    isDead() {
        return this.#currentHealth <= 0;
    }

    isAtFullHealth() {
        return this.#currentHealth >= this.#maxHealth;
    }

    isAtLowHealth(threshold = 0.25) {
        return this.getHealthPercentage() <= threshold;
    }

    isCriticalHealth(threshold = 0.1) {
        return this.isAtLowHealth(threshold);
    }

    // Death handling
    #handleDeath() {
        console.log(`Player died: health=${this.#currentHealth}, calling death callback`);
        
        if (this.#onDeathCallback) {
            this.#onDeathCallback();
        }
    }

    // Health change notification
    #notifyHealthChange() {
        if (this.#onHealthChangeCallback) {
            this.#onHealthChangeCallback(this.#currentHealth, this.#maxHealth);
        }
    }

    // Max health adjustment (for power-ups)
    increaseMaxHealth(amount) {
        const oldMaxHealth = this.#maxHealth;
        this.#maxHealth += amount;
        
        this.#updateHealth(this.#currentHealth + amount);
        
        console.log(`Max health increased by ${amount}: ${oldMaxHealth} -> ${this.#maxHealth}`);
    }

    // Reset health system
    reset() {
        this.#isInvulnerable = false;
        this.#invulnerabilityTimer = 0;
        
        // Update health via helper
        this.#updateHealth(this.#maxHealth);
        
        console.log('Player health system reset');
    }

    // Debug methods
    getDebugInfo() {
        return {
            currentHealth: this.#currentHealth,
            maxHealth: this.#maxHealth,
            healthPercentage: this.getHealthPercentage(),
            isInvulnerable: this.#isInvulnerable,
            invulnerabilityTimeLeft: this.getInvulnerabilityTimeLeft(),
            isDead: this.isDead(),
            isAtFullHealth: this.isAtFullHealth(),
            isAtLowHealth: this.isAtLowHealth(),
            isCriticalHealth: this.isCriticalHealth()
        };
    }

    // Force health setting (for testing/debugging)
    setHealth(health) {
        // Update health via helper
        this.#updateHealth(health);
        
        console.log(`Health force-set to: ${this.#currentHealth}/${this.#maxHealth}`);
    }
}
