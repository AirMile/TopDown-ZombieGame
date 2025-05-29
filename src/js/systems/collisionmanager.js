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
        console.log("CollisionManager initialized");
    }

    setupDefaultHandlers() {
        // Bullet vs Zombie collision
        this.registerHandler('bullet-zombie', (bullet, zombie) => {
            console.log('KOGEL RAAKT ZOMBIE! (CollisionManager)');
            
            // Add score based on zombie type
            if (zombie.constructor.name === 'FastZombie') {
                this.addScore(20);
            } else if (zombie.constructor.name === 'SlowZombie') {
                this.addScore(10);
            }
            
            zombie.takeDamage(1);
            bullet.kill();
        });

        // Player vs Zombie collision
        this.registerHandler('player-zombie', (player, zombie) => {
            console.log('SPELER RAAKT ZOMBIE! (CollisionManager)');
            if (typeof player.takeHit === 'function') {
                player.takeHit(zombie.damage || 10);
            }
        });
    }

    // Add score and notify game instance
    addScore(points) {
        this.score += points;
        console.log(`Score added: +${points}, Total: ${this.score}`);
        
        // Update UI if game instance exists
        if (this.gameInstance?.uiManager) {
            this.gameInstance.uiManager.updateScore(this.score);
        }
    }

    // Get current score
    getScore() {
        return this.score;
    }

    // Reset score
    resetScore() {
        this.score = 0;
        console.log("Score reset to 0");
    }

    registerHandler(type, handler) {
        this.collisionHandlers.set(type, handler);
        console.log(`Collision handler registered: ${type}`);
    }

    setupCollisions() {
        // Setup global collision handling
        this.engine.on('collisionstart', (event) => {
            this.handleCollision(event.target, event.other);
        });
        console.log("Global collision handling setup complete");
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

        // Log unhandled collisions for debugging
        console.log(`Unhandled collision: ${actorA.constructor.name} vs ${actorB.constructor.name}`);
    }

    // Add custom collision handler
    addHandler(type, handler) {
        this.registerHandler(type, handler);
    }

    // Remove collision handler
    removeHandler(type) {
        if (this.collisionHandlers.has(type)) {
            this.collisionHandlers.delete(type);
            console.log(`Collision handler removed: ${type}`);
        }
    }

    // Get all registered handlers
    getHandlers() {
        return Array.from(this.collisionHandlers.keys());
    }
}
