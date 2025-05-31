import { Player } from "../player/player.js";
import { SlowZombie } from "../zombies/slowzombie.js";
import { FastZombie } from "../zombies/fastzombie.js";
import { Bullet } from "../weapons/bullet.js";
import { AmmoPickup } from "../items/ammopickup.js";

export class CollisionManager {
    constructor(engine, gameInstance = null) {
        this.engine = engine;
        this.gameInstance = gameInstance;
        this.collisionHandlers = new Map();
        this.score = 0;
        this.setupDefaultHandlers();
    }    setupDefaultHandlers() {
        // Bullet vs Zombie collision
        this.registerHandler('bullet-zombie', (bullet, zombie) => {
            // Deal damage to zombie (points will be awarded in zombie's takeDamage method)
            const damageDealt = 10;
            zombie.takeDamage(damageDealt);
            
            // Kill bullet
            bullet.kill();
        });        // Player vs Zombie collision
        this.registerHandler('player-zombie', (player, zombie) => {





            
            if (typeof player.takeHit === 'function') {
                player.takeHit(zombie.damage || 10);


                
                if (player.currentHealth <= 0) {

                } else {

                }
            } else {

            }

        });
        
        // Player vs AmmoPickup collision
        this.registerHandler('player-ammo', (player, pickup) => {


            
            // AmmoPickup handles the collision in its own onInitialize
            // This handler is just for logging/additional logic if needed

        });
    }
    
    addScore(points) {
        this.score += points;
        
        if (this.gameInstance?.uiManager) {
            this.gameInstance.uiManager.updateScore(this.score);
        }
    }

    getScore() {
        return this.score;
    }
    
    resetScore() {
        this.score = 0;
    }
    
    registerHandler(type, handler) {
        this.collisionHandlers.set(type, handler);
    }
    
    setupCollisions() {
        this.engine.on('collisionstart', (event) => {
            this.handleCollision(event.target, event.other);
        });
    }

    handleCollision(actorA, actorB) {
        // Check for bullet vs zombie
        if (actorA instanceof Bullet && (actorB instanceof SlowZombie || actorB instanceof FastZombie)) {
            const handler = this.collisionHandlers.get('bullet-zombie');
            if (handler) {
                handler(actorA, actorB);
                return;
            }
        }

        // Check for zombie vs bullet (reverse order)
        if ((actorA instanceof SlowZombie || actorA instanceof FastZombie) && actorB instanceof Bullet) {
            const handler = this.collisionHandlers.get('bullet-zombie');
            if (handler) {
                handler(actorB, actorA);
                return;
            }
        }

        // Check for player vs zombie
        if (actorA instanceof Player && (actorB instanceof SlowZombie || actorB instanceof FastZombie)) {
            const handler = this.collisionHandlers.get('player-zombie');
            if (handler) {
                handler(actorA, actorB);
                return;
            }
        }
          // Check for zombie vs player (reverse order)
        if ((actorA instanceof SlowZombie || actorA instanceof FastZombie) && actorB instanceof Player) {
            const handler = this.collisionHandlers.get('player-zombie');
            if (handler) {
                handler(actorB, actorA);
                return;
            }
        }
        
        // Check for player vs ammo pickup
        if (actorA instanceof Player && actorB instanceof AmmoPickup) {
            const handler = this.collisionHandlers.get('player-ammo');
            if (handler) {
                handler(actorA, actorB);
                return;
            }
        }
        
        // Check for ammo pickup vs player (reverse order)
        if (actorA instanceof AmmoPickup && actorB instanceof Player) {
            const handler = this.collisionHandlers.get('player-ammo');
            if (handler) {
                handler(actorB, actorA);
                return;
            }
        }
    }

    addHandler(type, handler) {
        this.registerHandler(type, handler);
    }
    
    removeHandler(type) {
        if (this.collisionHandlers.has(type)) {
            this.collisionHandlers.delete(type);
        }
    }

    getHandlers() {
        return Array.from(this.collisionHandlers.keys());
    }
}
