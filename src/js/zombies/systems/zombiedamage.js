import { Player } from "../../player/player.js";
import { ZombieConfig } from "../../config/zombieconfig.js";

export class ZombieDamage {
    constructor(zombie, damage, cooldown = ZombieConfig.DAMAGE_COOLDOWN) {
        this.zombie = zombie;
        this.damage = damage;
        this.damageCooldown = cooldown;
        this.damageTimer = 0;
        this.initializationDelay = ZombieConfig.INITIALIZATION_DELAY;
        
        console.log(`ZombieDamage created: damage=${damage}, cooldown=${cooldown}ms`);
    }

    // Update damage timers
    update(delta) {
        // Update initialization delay
        if (this.initializationDelay > 0) {
            this.initializationDelay -= delta;
        }
        
        // Update damage timer
        if (this.damageTimer > 0) {
            this.damageTimer -= delta;
        }
    }

    // Check if zombie can deal damage (after initialization delay)
    canDealDamage() {
        return this.initializationDelay <= 0 && this.damageTimer <= 0;
    }

    // Deal damage to player and start cooldown
    dealDamageToPlayer(player) {
        if (!this.canDealDamage()) {
            return false;
        }

        if (!player || typeof player.takeHit !== 'function') {
            console.warn("ZombieDamage: Invalid player object");
            return false;
        }

        // Apply damage to player
        player.takeHit(this.damage);
        
        // Reset damage timer
        this.damageTimer = this.damageCooldown;
        
        console.log(`ZombieDamage: Dealt ${this.damage} damage to player, cooldown started`);
        return true;
    }

    // Check if zombie is ready to deal damage (no delay)
    isReady() {
        return this.initializationDelay <= 0;
    }

    // Get remaining cooldown time
    getRemainingCooldown() {
        return Math.max(0, this.damageTimer);
    }

    // Get remaining initialization delay
    getRemainingDelay() {
        return Math.max(0, this.initializationDelay);
    }
}
