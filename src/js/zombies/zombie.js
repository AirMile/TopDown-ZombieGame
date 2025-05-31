import { Actor, Vector } from "excalibur";
import { Resources } from "../resources.js";
import { Player } from "../player/player.js";
import { AmmoPickup } from "../items/ammopickup.js";
import { ZombieConfig } from "../config/zombieconfig.js";
import { ZombieDamage, ZombieCollision, ZombieGraphics, ZombieMovement } from "./systems/index.js";

export class Zombie extends Actor {
    constructor(options) {
        super({
            ...options, 
        });
        
        // Default zombie properties (can be overridden by subclasses)
        this.pos = new Vector(500, 300);
        this.maxHealth = ZombieConfig.DEFAULT_MAX_HEALTH;
        this.health = this.maxHealth;
        this.movementSpeed = ZombieConfig.DEFAULT_MOVEMENT_SPEED;
        
        // Knockback system
        this.isKnockedBack = false;
        this.knockbackTimer = 0;
        this.knockbackDuration = ZombieConfig.KNOCKBACK_DURATION;
        
        // Initialize subsystems (will be setup in subclasses)
        this.damageSystem = null;
        this.collisionSystem = null;
        this.graphicsSystem = null;
        this.movementSystem = null;
        
        console.log("Base Zombie created with subsystem architecture");
    }
      // Initialize subsystems (called by subclasses)
    initializeSubsystems(damage, movementSpeed) {
        this.damageSystem = new ZombieDamage(this, damage);
        this.collisionSystem = new ZombieCollision(this);
        this.graphicsSystem = new ZombieGraphics(this);
        this.movementSystem = new ZombieMovement(this, movementSpeed);
        
        console.log(`Zombie subsystems initialized: damage=${damage}, speed=${movementSpeed}`);
    }

    onInitialize(engine) {
        // Base initialization - specific collision setup in subclasses
        console.log("Base Zombie initialized");
    }

    onPreUpdate(engine, delta) {
        // Update knockback timer first
        if (this.isKnockedBack) {
            this.knockbackTimer -= delta;
            
            // Apply friction during knockback
            const frictionForce = ZombieConfig.KNOCKBACK_FRICTION;
            this.vel = this.vel.scale(frictionForce);
            
            if (this.knockbackTimer <= 0) {
                this.isKnockedBack = false;
                console.log(`Zombie knockback ended: position=${this.pos.x.toFixed(2)},${this.pos.y.toFixed(2)}`);
            }
            // During knockback, don't update other systems
            return;
        }
        
        // Update subsystems if they exist
        if (this.damageSystem) {
            this.damageSystem.update(delta);
        }
        
        if (this.movementSystem && !this.isKnockedBack) {
            this.movementSystem.update(engine, delta);
        }
        
        // Handle player collision and damage (implemented in subclasses)
        this.handlePlayerInteraction(engine, delta);
    }

    // Template method for player interaction (implemented by subclasses)
    handlePlayerInteraction(engine, delta) {
        // Default implementation does nothing
        // Subclasses should override this to handle collision and damage
    }// Method for taking damage from bullets
    takeDamage(damage) {
        // Prevent damage if already dead
        if (this.health <= 0) {
            return;
        }
        
        this.health -= damage;
        
        if (this.health <= 0) {
            
            // Award points based on zombie type
            this.awardKillPoints();
            
            // Drop ammo pickup (25% kans)
            this.dropAmmoPickup();
            
            this.kill();
        }
    }
    
    // Method for applying knockback
    applyKnockback(direction, strength) {
        // Start knockback state
        this.isKnockedBack = true;
        this.knockbackTimer = this.knockbackDuration;
        
        // Apply knockback velocity
        const knockbackVelocity = direction.scale(strength);
        this.vel = this.vel.add(knockbackVelocity);
        
        console.log(`Zombie knockback applied: direction=${direction.x.toFixed(2)},${direction.y.toFixed(2)}, strength=${strength}, newVel=${this.vel.x.toFixed(2)},${this.vel.y.toFixed(2)}`);
    }
      // Award points when zombie is killed
    awardKillPoints() {
        // Find the collision manager to award points
        const collisionManager = this.scene?.engine?.collisionManager;
        
        if (collisionManager) {
            let points = ZombieConfig.KILL_POINTS; // Beide zombie types geven nu dezelfde punten
            
            collisionManager.addScore(points);
        } 
    }
      // Drop ammo pickup when zombie is killed
    dropAmmoPickup() {
        // Kans om ammo pickup te droppen
        const dropChance = ZombieConfig.AMMO_DROP_CHANCE;
        const randomValue = Math.random();
        
        if (randomValue < dropChance) {
            // Spawn ammo pickup op zombie positie
            const pickup = new AmmoPickup(this.pos.x, this.pos.y);
            
            if (this.scene?.engine) {
                this.scene.engine.add(pickup);
            } 
        } 
    }
}
