import { Actor, Vector } from "excalibur"
import { Resources } from "../resources.js"
import { Player } from "../player/player.js";
import { AmmoPickup } from "../items/ammopickup.js"; 

export class Zombie extends Actor {
    #movementSpeed = 50; 
    #maxHealth = 30; 
    #health;
    #isKnockedBack = false;
    #knockbackTimer = 0;
    #knockbackDuration = 200; 

    constructor(options = {}) {
        super(options);
        this.pos = options.pos ?? new Vector(500, 300);
        this.#health = this.#maxHealth;
        // console.log(`Zombie created: position=${this.pos.x},${this.pos.y}, health=${this.#health}`);
    }

    // ==== Getters & Setters ====

    /** @returns {number} Movement speed van deze zombie */
    get movementSpeed() {
        return this.#movementSpeed;
    }

    /** @returns {number} Maximale health van deze zombie */
    get maxHealth() {
        return this.#maxHealth;
    }

    /** @returns {number} Huidige health van deze zombie */
    get health() {
        return this.#health;
    }

    /** @returns {boolean} Of de zombie knockback heeft */
    get isKnockedBack() {
        return this.#isKnockedBack;
    }

    /** @param {number} speed - Zet de movement speed */
    set movementSpeed(speed) {
        this.#movementSpeed = speed;
        // console.log(`Zombie movement speed set: speed=${speed}`);
    }

    /** @param {number} health - Zet max health en reset huidige health */
    set maxHealth(health) {
        this.#maxHealth = health;
        this.#health = health;
        // console.log(`Zombie max health set: maxHealth=${health}, currentHealth=${this.#health}`);
    }

    // ==== Lifecycle & Public Methods ====

    /**
     * Wordt elke frame aangeroepen door Excalibur.
     * @param {Engine} engine 
     * @param {number} delta 
     */
    onPreUpdate(engine, delta) {
        // Update knockback timer
        if (this.#isKnockedBack) {
            this.#knockbackTimer -= delta;
            const frictionForce = 0.95; 
            this.vel = this.vel.scale(frictionForce);
            if (this.#knockbackTimer <= 0) {
                this.#isKnockedBack = false;
                // console.log(`Zombie knockback ended: position=${this.pos.x.toFixed(2)},${this.pos.y.toFixed(2)}`);
            }
            return;
        }

        // Optimalisatie: gebruik engine.player als referentie naar de speler
        const player = engine.player;
        if (player) {
            // Bereken de richting naar de speler
            const directionToPlayer = player.pos.sub(this.pos).normalize();
            // Stel de snelheid in de richting van de speler in
            this.vel = directionToPlayer.scale(this.#movementSpeed);
            // Zombie kijkt naar de speler
            this.rotation = directionToPlayer.toAngle() - Math.PI / 2;
        } else {
            // Als er geen speler is, stop de zombie
            this.vel = Vector.Zero;
        }
    }

    /**
     * Laat de zombie schade nemen.
     * @param {number} damage 
     */
    takeDamage(damage) {
        // Voorkom schade als al dood
        if (this.#health <= 0) {
            return;
        }
        this.#health -= damage;
        // console.log(`Zombie took damage: damage=${damage}, remainingHealth=${this.#health}, maxHealth=${this.#maxHealth}`);
        if (this.#health <= 0) {
            // console.log(`Zombie died: finalHealth=${this.#health}, position=${this.pos.x.toFixed(2)},${this.pos.y.toFixed(2)}`);
            this.awardKillPoints();
            this.dropAmmoPickup();
            this.kill();
        }
    }

    /**
     * Past knockback toe op de zombie.
     * @param {Vector} direction 
     * @param {number} strength 
     */
    applyKnockback(direction, strength) {
        this.#isKnockedBack = true;
        this.#knockbackTimer = this.#knockbackDuration;
        const knockbackVelocity = direction.scale(strength);
        this.vel = this.vel.add(knockbackVelocity);
        // console.log(`Zombie knockback applied: direction=${direction.x.toFixed(2)},${direction.y.toFixed(2)}, strength=${strength}, newVel=${this.vel.x.toFixed(2)},${this.vel.y.toFixed(2)}, isKnockedBack=${this.#isKnockedBack}`);
    }

    /**
     * Ken punten toe wanneer zombie wordt gedood.
     */
    awardKillPoints() {
        const collisionManager = this.scene?.engine?.collisionManager;
        if (collisionManager) {
            let points = 15;
            collisionManager.addScore(points);
        }
    }

    // ==== Private/Helper Methods ====

    /**
     * Drop een ammo pickup met een kans.
     * @private
     */
    dropAmmoPickup() {
        const dropChance = 0.10;
        const randomValue = Math.random();
        if (randomValue < dropChance) {
            const pickup = new AmmoPickup(this.pos.x, this.pos.y);
            if (this.scene) {
                this.scene.add(pickup);
            }
        }
    }
}
