import { Zombie } from "./zombie.js"
import { Vector, Color, CollisionType } from "excalibur"
import { Resources } from "../resources.js"
import { Player } from "../player/player.js";
import { Bullet } from "../weapons/bullet.js";

export class FastZombie extends Zombie {    
    constructor() {
        super({
            width: 24, // even smaller for better scaling
            height: 24,
            collisionType: CollisionType.Active // Make zombie collidable
        });
        this.movementSpeed = 100; // Langzame zombies bewegen langzamer
        // Zombie properties
        this.damage = 25; // Fast zombies deal more damage
        this.maxHealth = 10; // Fast zombies have 10 health
        this.health = this.maxHealth;        // Damage cooldown system
        this.damageTimer = 0; // Timer voor damage cooldown
        this.damageCooldown = 500; // 0.5 seconds in milliseconds
        this.initializationDelay = 1000; // 1 second delay before damage can be applied

        // Kies random sprite
        const fastSprites = [
            Resources.FastZombie1,
            Resources.FastZombie2,
            Resources.FastZombie3,
            Resources.FastZombie4
        ];
        const spriteIndex = Math.floor(Math.random() * fastSprites.length);
        const sprite = fastSprites[spriteIndex].toSprite();
        sprite.scale = new Vector(0.5, 0.5); // Scale sprite to 50%
        this.graphics.use(sprite);
          this.graphics.current.tint = Color.fromRGB(255, 80, 80) // Roodachtige tint
        this.pos = new Vector(800, 300)
        this.vel = new Vector(-15, 0)
        
        console.log(`FastZombie created at position: x=${this.pos.x}, y=${this.pos.y}`);
    }        onPreUpdate(engine, delta) {
        super.onPreUpdate(engine, delta);
        
        // Update initialization delay
        if (this.initializationDelay > 0) {
            this.initializationDelay -= delta;
        }
        
        // Update damage timer
        if (this.damageTimer > 0) {
            this.damageTimer -= delta;
        }
          // Only check for collision after initialization delay
        if (this.initializationDelay <= 0) {
            this.checkPlayerCollision(engine, delta);
        } else if (this.initializationDelay <= 900) { // Log once when almost ready
            console.log(`FastZombie collision detection starting in ${(this.initializationDelay / 1000).toFixed(1)} seconds`);
        }
    }
      checkPlayerCollision(engine, delta) {
        // Find player in the scene using the same method as base zombie class
        const player = engine.currentScene.actors.find(actor => actor instanceof Player);
        
        if (!player) return;
        
        // Make sure collision bodies are initialized
        if (!this.collider || !player.collider) return;
        
        // Check if zombie and player collision bodies are overlapping
        const zombieBody = this.collider.bounds;
        const playerBody = player.collider.bounds;
        
        const isCurrentlyColliding = zombieBody.overlaps(playerBody);
        
        if (isCurrentlyColliding) {
            // We are colliding with player
            if (this.damageTimer <= 0) {
                console.log(`=== FAST ZOMBIE CONTINUOUS DAMAGE ===`);
                console.log(`FastZombie position: x=${this.pos.x.toFixed(1)}, y=${this.pos.y.toFixed(1)}`);
                console.log(`Player position: x=${player.pos.x.toFixed(1)}, y=${player.pos.y.toFixed(1)}`);
                console.log(`FastZombie damage dealt: ${this.damage}`);
                console.log(`Player health before damage: ${player.currentHealth}/${player.maxHealth}`);
                
                // Apply damage to player
                player.takeHit(this.damage);
                
                // Reset damage timer
                this.damageTimer = this.damageCooldown;
                console.log(`=== DAMAGE TIMER RESET TO ${this.damageCooldown}ms ===\n`);
            }
        }
    }onInitialize(engine) {
        super.onInitialize(engine); // Call base class onInitialize
        
        // Listen for collisions with bullets
        this.on('collisionstart', (event) => {
            // Get the actual actor from the collider
            const otherActor = event.other.owner;
            
            if (otherActor instanceof Bullet) {
                // Take damage
                this.takeDamage(10);
                
                // Kill the bullet
                otherActor.kill();
            }
        });
    }
}
