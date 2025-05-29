import { Player } from "../player/player.js";
import { SlowZombie } from "../zombies/slowzombie.js";
import { FastZombie } from "../zombies/fastzombie.js";
import { Bullet } from "../weapons/bullet.js";

export class CollisionManager {
    constructor(engine, gameInstance = null) {
        this.engine = engine;
        this.gameInstance = gameInstance; // Reference to main game for score updates
        this.collisionHandlers = new Map();
        this.score = 0;
        this.setupDefaultHandlers();
    }setupDefaultHandlers() {
        console.log('📋 CollisionManager: Setting up default collision handlers...');
        
        // Bullet vs Zombie collision
        this.registerHandler('bullet-zombie', (bullet, zombie) => {
            console.log('=== BULLET-ZOMBIE COLLISION DETECTED ===');
            console.log(`Bullet position: x=${bullet.pos.x.toFixed(1)}, y=${bullet.pos.y.toFixed(1)}`);
            console.log(`Zombie type: ${zombie.constructor.name}`);
            console.log(`Zombie position: x=${zombie.pos.x.toFixed(1)}, y=${zombie.pos.y.toFixed(1)}`);
            console.log(`Zombie health BEFORE damage: ${zombie.health}/${zombie.maxHealth}`);
            
            // Add score based on zombie type
            let scorePoints = 0;
            if (zombie.constructor.name === 'FastZombie') {
                scorePoints = 20;
                this.addScore(20);
                console.log('FastZombie hit! Adding 20 points to score');
            } else if (zombie.constructor.name === 'SlowZombie') {
                scorePoints = 10;
                this.addScore(10);
                console.log('SlowZombie hit! Adding 10 points to score');
            }
            console.log(`Current total score: ${this.score}`);
            
            // Deal damage to zombie
            const damageDealt = 10;
            console.log(`Dealing ${damageDealt} damage to zombie...`);
            zombie.takeDamage(damageDealt);
            
            console.log(`Zombie health AFTER damage: ${zombie.health}/${zombie.maxHealth}`);
            
            // Check if zombie was killed
            if (zombie.health <= 0) {
                console.log(`🎯 ZOMBIE KILLED! ${zombie.constructor.name} destroyed`);
            } else {
                console.log(`Zombie survived with ${zombie.health} health remaining`);
            }
            
            // Kill bullet
            console.log('Destroying bullet...');
            bullet.kill();
            console.log('=== END COLLISION HANDLING ===\n');
        });
          // Player vs Zombie collision
        this.registerHandler('player-zombie', (player, zombie) => {            if (typeof player.takeHit === 'function') {
                player.takeHit(zombie.damage || 10);
            }
        });
        
        console.log(`✅ CollisionManager: Registered ${this.collisionHandlers.size} handlers: ${Array.from(this.collisionHandlers.keys()).join(', ')}`);
    }
    
    // Add score and notify game instance
    addScore(points) {
        this.score += points;
        
        // Update UI if game instance exists
        if (this.gameInstance?.uiManager) {
            this.gameInstance.uiManager.updateScore(this.score);
        }
    }    // Get current score
    getScore() {
        return this.score;
    }
    
    // Reset score
    resetScore() {
        this.score = 0;
    }
    
    registerHandler(type, handler) {
        this.collisionHandlers.set(type, handler);
    }
      setupCollisions() {
        console.log('🚀 CollisionManager: Setting up collision event listeners...');
        
        // Setup global collision handling
        this.engine.on('collisionstart', (event) => {
            console.log('🔥 COLLISION EVENT FIRED!', event);
            this.handleCollision(event.target, event.other);
        });
        
        console.log('✅ CollisionManager: Event listeners setup complete');
    }handleCollision(actorA, actorB) {
        console.log(`🔍 Collision detected between ${actorA.constructor.name} and ${actorB.constructor.name}`);
        
        // Check for bullet vs zombie
        if (actorA instanceof Bullet && (actorB instanceof SlowZombie || actorB instanceof FastZombie)) {
            console.log('✅ Bullet vs Zombie collision - calling handler');
            const handler = this.collisionHandlers.get('bullet-zombie');
            if (handler) {
                handler(actorA, actorB);
                return;
            } else {
                console.log('❌ No bullet-zombie handler found!');
            }
        }

        // Check for zombie vs bullet (reverse order)
        if ((actorA instanceof SlowZombie || actorA instanceof FastZombie) && actorB instanceof Bullet) {
            console.log('✅ Zombie vs Bullet collision (reverse) - calling handler');
            const handler = this.collisionHandlers.get('bullet-zombie');
            if (handler) {
                handler(actorB, actorA);
                return;
            } else {
                console.log('❌ No bullet-zombie handler found!');
            }
        }

        // Check for player vs zombie
        if (actorA instanceof Player && (actorB instanceof SlowZombie || actorB instanceof FastZombie)) {
            console.log('⚔️ Player vs Zombie collision - calling handler');
            const handler = this.collisionHandlers.get('player-zombie');
            if (handler) {
                handler(actorA, actorB);
                return;
            }        }
        
        // Check for zombie vs player (reverse order)
        if ((actorA instanceof SlowZombie || actorA instanceof FastZombie) && actorB instanceof Player) {
            console.log('⚔️ Zombie vs Player collision (reverse) - calling handler');
            const handler = this.collisionHandlers.get('player-zombie');
            if (handler) {
                handler(actorB, actorA);
                return;
            }
        }
        
        console.log(`❓ Unhandled collision: ${actorA.constructor.name} vs ${actorB.constructor.name}`);
    }

    // Add custom collision handler
    addHandler(type, handler) {
        this.registerHandler(type, handler);    }
    
    // Remove collision handler
    removeHandler(type) {
        if (this.collisionHandlers.has(type)) {
            this.collisionHandlers.delete(type);
        }
    }

    // Get all registered handlers
    getHandlers() {
        return Array.from(this.collisionHandlers.keys());
    }
}
