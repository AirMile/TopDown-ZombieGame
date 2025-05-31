import { PlayerConfig } from '../config/index.js';

export class PlayerHealth {
    #player
    #maxHealth
    #currentHealth
    #isInvulnerable
    #invulnerabilityTime
    #invulnerabilityTimer
    #onDeathCallback
    #onHealthChangeCallback

    constructor(player) {
        this.#player = player;
        this.#maxHealth = PlayerConfig.MAX_HEALTH;
        this.#currentHealth = this.#maxHealth;
        this.#isInvulnerable = false;
        this.#invulnerabilityTime = PlayerConfig.INVULNERABILITY_TIME;
        this.#invulnerabilityTimer = 0;
        this.#onDeathCallback = null;
        this.#onHealthChangeCallback = null;
        
        console.log(`PlayerHealth initialized: ${this.#currentHealth}/${this.#maxHealth} HP`);
    }

    // Health getters
    getCurrentHealth() {
        return this.#currentHealth;
    }

    getMaxHealth() {
        return this.#maxHealth;
    }

    getHealthPercentage() {
        return this.#currentHealth / this.#maxHealth;
    }

    // Invulnerability getters
    isInvulnerable() {
        return this.#isInvulnerable;
    }

    getInvulnerabilityTimeLeft() {
        return Math.max(0, this.#invulnerabilityTimer);
    }

    // Callback setters
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

    // Damage system
    takeDamage(damage = 10, source = 'unknown') {
        if (this.#isInvulnerable) {
            console.log(`Damage blocked: ${damage} from ${source} (invulnerable)`);
            return false;
        }

        const oldHealth = this.#currentHealth;
        this.#currentHealth -= damage;
        
        // Ensure health doesn't go below 0
        if (this.#currentHealth < 0) {
            this.#currentHealth = 0;
        }

        // Activate invulnerability
        this.#isInvulnerable = true;
        this.#invulnerabilityTimer = this.#invulnerabilityTime;
        
        console.log(`Player took ${damage} damage from ${source}: health=${this.#currentHealth}/${this.#maxHealth} (was ${oldHealth})`);
        
        // Notify health change
        this.#notifyHealthChange();
        
        // Check for death
        if (this.#currentHealth <= 0) {
            this.#handleDeath();
        }

        return true; // Damage was applied
    }

    // Healing system
    heal(amount, source = 'unknown') {
        if (this.#currentHealth >= this.#maxHealth) {
            console.log(`Heal blocked: already at max health (${this.#maxHealth})`);
            return false;
        }

        const oldHealth = this.#currentHealth;
        this.#currentHealth = Math.min(this.#maxHealth, this.#currentHealth + amount);
        const actualHealing = this.#currentHealth - oldHealth;
        
        console.log(`Player healed ${actualHealing} HP from ${source}: health=${this.#currentHealth}/${this.#maxHealth}`);
        
        // Notify health change
        this.#notifyHealthChange();

        return true; // Healing was applied
    }

    // Full heal
    fullHeal() {
        return this.heal(this.#maxHealth, 'full heal');
    }

    // Health state checks
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
        return this.getHealthPercentage() <= threshold;
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

    // Max health modification (for power-ups)
    increaseMaxHealth(amount) {
        const oldMaxHealth = this.#maxHealth;
        this.#maxHealth += amount;
        
        // Also heal the player by the same amount
        this.#currentHealth += amount;
        
        console.log(`Max health increased by ${amount}: ${oldMaxHealth} -> ${this.#maxHealth}`);
        
        this.#notifyHealthChange();
    }

    // Reset health system
    reset() {
        this.#currentHealth = this.#maxHealth;
        this.#isInvulnerable = false;
        this.#invulnerabilityTimer = 0;
        
        console.log('Player health system reset');
        
        this.#notifyHealthChange();
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

    // Force set health (for testing/debugging)
    setHealth(health) {
        this.#currentHealth = Math.max(0, Math.min(this.#maxHealth, health));
        this.#notifyHealthChange();
        
        if (this.#currentHealth <= 0) {
            this.#handleDeath();
        }
        
        console.log(`Health force-set to: ${this.#currentHealth}/${this.#maxHealth}`);
    }
}
