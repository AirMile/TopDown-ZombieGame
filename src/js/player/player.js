import { Actor, Vector, Keys, CollisionType } from "excalibur";
import { Resources } from "../resources.js";
import { PlayerWeapon } from "./playerweapon.js";
import { PlayerMovement } from "./playermovement.js";
import { PlayerInput } from "./playerinput.js";
import { SlowZombie } from "../slowzombie.js";
import { FastZombie } from "../fastzombie.js";

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
        this.vel = new Vector(0, 0);

        // Initialize subsystems
        this.weapon = new PlayerWeapon(this);
        this.movement = new PlayerMovement(this);
        this.input = new PlayerInput(this);        console.log("Player constructor voltooid met subsystems");

        // Initialize health system
        this.maxHealth = 100;
        this.currentHealth = this.maxHealth;
        this.isInvulnerable = false;
        this.invulnerabilityTime = 1000; // 1 second
        this.invulnerabilityTimer = 0;
    }

    onInitialize(engine) {
        console.log("Player onInitialize aangeroepen");
        
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
                    this.weapon.manualReload();
                }
            }        });
    }

    onPreUpdate(engine, delta) {
        // Update invulnerability timer
        if (this.isInvulnerable) {
            this.invulnerabilityTimer -= delta;
            if (this.invulnerabilityTimer <= 0) {
                this.isInvulnerable = false;
                console.log("Player invulnerability ended");
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
        }

        // Get movement input
        const { speed, strafe, isSprinting } = this.input.getMovementInput(engine);

        // Handle shooting
        if (!isSprinting && !this.input.isTurning && this.weapon.canShoot()) {
            this.weapon.shoot();
        }

        // Apply movement if not dashing
        if (!this.movement.isDashing) {
            this.vel = this.movement.calculateVelocity(speed, strafe);
        } else {
            this.vel = Vector.Zero;
        }
    }

    takeHit(damage = 10) {
        if (this.isInvulnerable) {
            console.log("Player hit but invulnerable!");
            return;
        }

        this.currentHealth -= damage;
        this.isInvulnerable = true;
        this.invulnerabilityTimer = this.invulnerabilityTime;
        
        console.log(`Player took ${damage} damage! Health: ${this.currentHealth}/${this.maxHealth}`);
        
        // Update UI if available
        if (this.scene?.engine?.uiManager) {
            this.scene.engine.uiManager.updateHealth(this.currentHealth, this.maxHealth);
        }
        
        // Check for death
        if (this.currentHealth <= 0) {
            this.currentHealth = 0;
            this.handleDeath();
        }
    }

    handleDeath() {
        console.log("Player died!");
        // TODO: Trigger game over
        if (this.scene?.engine?.endGame) {
            this.scene.engine.endGame();
        }
    }

    // Get current health percentage
    getHealthPercentage() {
        return this.currentHealth / this.maxHealth;
    }

    // Heal player
    heal(amount) {
        const oldHealth = this.currentHealth;
        this.currentHealth = Math.min(this.maxHealth, this.currentHealth + amount);
        console.log(`Player healed ${amount}! Health: ${this.currentHealth}/${this.maxHealth}`);
        
        // Update UI if available
        if (this.scene?.engine?.uiManager) {
            this.scene.engine.uiManager.updateHealth(this.currentHealth, this.maxHealth);
        }
    }
}
