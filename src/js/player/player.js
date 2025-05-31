import { Actor, Vector, Keys, CollisionType } from "excalibur";
import { Resources } from "../resources.js";
import { PlayerWeapon } from "./playerweapon.js";
import { PlayerMovement } from "./playermovement.js";
import { PlayerInput } from "./playerinput.js";
import { SlowZombie } from "../zombies/slowzombie.js";
import { FastZombie } from "../zombies/fastzombie.js";

export class Player extends Actor {
    constructor() {
        super({ 
            width: 32,
            height: 32,
            collisionType: CollisionType.Active
        });

        // Initialize sprite
        const sprite = Resources.Player.toSprite();
        sprite.scale = new Vector(0.9, 0.9);
        sprite.rotation = -Math.PI / 2;
        this.graphics.use(sprite);
        
        this.pos = new Vector(100, 100);
        this.vel = new Vector(0, 0);        // Initialize subsystems
        this.weapon = new PlayerWeapon(this);
        this.movement = new PlayerMovement(this);
        this.input = new PlayerInput(this);        // Initialize health system
        this.maxHealth = 100;
        this.currentHealth = this.maxHealth;
        
        console.log(`Player initialized with health: ${this.currentHealth}/${this.maxHealth}`);
        this.isInvulnerable = false;
        this.invulnerabilityTime = 1000; // 1 second
        this.invulnerabilityTimer = 0;
    }    onInitialize(engine) {
        // Setup input handlers
        engine.input.keyboard.on('press', (evt) => {
            // Double-S for dash
            if (evt.key === Keys.S) {
                const now = Date.now();
                if (now - this.input.lastSDoublePressTime < this.input.doubleSPressThreshold) {
                    this.input.sPressCount++;
                } else {
                    this.input.sPressCount = 1;
                }
                this.input.lastSDoublePressTime = now;
                
                if (this.input.sPressCount === 2) {
                    this.movement.startDash(-1); // Backward dash
                    this.input.sPressCount = 0;
                }
            }            // Down arrow for dash (alternative)
            if (evt.key === Keys.Down) {
                this.movement.startDash(-1);
            }

            // R key for manual reload
            if (evt.key === Keys.R) {
                if (this.weapon) {
                    this.weapon.manualReload();                }
            }
        });
    }

    onPreUpdate(engine, delta) {
        // Update invulnerability timer
        if (this.isInvulnerable) {
            this.invulnerabilityTimer -= delta;
            if (this.invulnerabilityTimer <= 0) {
                this.isInvulnerable = false;
            }
        }

        // Update subsystems
        this.weapon.update(delta);
        this.movement.update(delta);
        this.input.update(engine, delta);

        // Handle rotation input
        if (engine.input.keyboard.isHeld(Keys.Right)) {
            this.rotation += 0.02;
        }
        if (engine.input.keyboard.isHeld(Keys.Left)) {
            this.rotation -= 0.02;
        }        // Get movement input
        const { speed, strafe, isSprinting } = this.input.getMovementInput(engine);

        // Handle shooting
        if (!isSprinting && this.weapon.canShoot()) {
            this.weapon.shoot();
        }

        // Apply movement if not dashing
        if (!this.movement.isDashing) {
            this.vel = this.movement.calculateVelocity(speed, strafe);        } else {
            this.vel = Vector.Zero;
        }
    }    takeHit(damage = 10) {
        console.log(`=== PLAYER TAKING DAMAGE ===`);
        console.log(`Damage amount: ${damage}`);
        console.log(`Player health before damage: ${this.currentHealth}/${this.maxHealth}`);
        console.log(`Player invulnerable: ${this.isInvulnerable}`);
        
        if (this.isInvulnerable) {
            console.log(`❌ Player is invulnerable - damage blocked!`);
            return;
        }        this.currentHealth -= damage;
        
        // Zorgen dat health nooit onder 0 komt
        if (this.currentHealth < 0) {
            this.currentHealth = 0;
        }
        
        this.isInvulnerable = true;
        this.invulnerabilityTimer = this.invulnerabilityTime;
        
        console.log(`✅ Player took ${damage} damage`);
        console.log(`Player health after damage: ${this.currentHealth}/${this.maxHealth}`);
        console.log(`Player invulnerability activated for ${this.invulnerabilityTime}ms`);
        
        // Update UI if available
        if (this.scene?.engine?.uiManager) {
            this.scene.engine.uiManager.updateHealth(this.currentHealth, this.maxHealth);
        }
        
        // Check for death
        if (this.currentHealth <= 0) {
            this.currentHealth = 0;
            console.log(`💀 PLAYER HEALTH REACHED ZERO - TRIGGERING DEATH!`);
            this.handleDeath();
        }
        
        console.log(`=== END PLAYER DAMAGE ===\n`);
    }    handleDeath() {
        console.log(`=== PLAYER DEATH SEQUENCE ===`);
        console.log(`Player final health: ${this.currentHealth}`);
        console.log(`Player position: x=${this.pos.x.toFixed(1)}, y=${this.pos.y.toFixed(1)}`);
        console.log(`Triggering game over...`);
        
        // Stop player movement immediately
        this.vel = Vector.Zero;
        
        // Disable player controls to prevent further input
        if (this.input) {
            this.input.enabled = false;
        }
        
        // Trigger game over (this will kill all entities including this player)
        if (this.scene?.engine?.endGame) {
            this.scene.engine.endGame();
            console.log(`✅ Game over triggered successfully`);
        } else {
            console.log(`❌ Could not trigger game over - endGame method not found`);
        }
        
        console.log(`=== END PLAYER DEATH ===\n`);
    }

    // Get current health percentage
    getHealthPercentage() {
        return this.currentHealth / this.maxHealth;
    }

    // Heal player
    heal(amount) {
        const oldHealth = this.currentHealth;
        this.currentHealth = Math.min(this.maxHealth, this.currentHealth + amount);
        
        // Update UI if available
        if (this.scene?.engine?.uiManager) {
            this.scene.engine.uiManager.updateHealth(this.currentHealth, this.maxHealth);
        }
    }
}
