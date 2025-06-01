import { Player } from "../player/player.js";
import { SlowZombie } from "../zombies/slowzombie.js";
import { FastZombie } from "../zombies/fastzombie.js";
import { Bullet } from "../weapons/bullet.js";
import { AmmoPickup } from "../items/ammopickup.js";

export class CollisionManager {
    #collisionHandlers = new Map();
    #score = 0;

    constructor(engine, gameInstance = null) {
        this.engine = engine;
        this.gameInstance = gameInstance;
        this.setupDefaultHandlers();
        console.log('CollisionManager initialized with private fields');
    }

    // Getters voor read-only access
    get score() {
        return this.#score;
    }

    getScore() {
        return this.#score;
    }

    // Setter voor score manipulation
    addScore(points) {
        this.#score += points;
        console.log(`Score added: +${points}, total: ${this.#score}`);
        
        if (this.gameInstance?.uiManager) {
            this.gameInstance.uiManager.updateScore(this.#score);
        }
    }
    
    resetScore() {
        this.#score = 0;
        console.log('Score reset to 0');
    }    
    setupDefaultHandlers() {        
        // Bullet vs Zombie botsing
        this.registerHandler('bullet-zombie', (bullet, zombie) => {
            // Geef schade aan zombie (punten worden toegekend in zombie's takeDamage methode)
            const damageDealt = 10;
            zombie.takeDamage(damageDealt);
            console.log(`Bullet hit zombie: ${damageDealt} damage dealt`);
            
            // Vernietigt bullet
            bullet.kill();
        });        
        
        // Player vs Zombie botsing
        this.registerHandler('player-zombie', (player, zombie) => {
            console.log(`Player collision with zombie: zombie damage=${zombie.damage || 10}, player health=${player.currentHealth}/${player.maxHealth}`);
            
            if (typeof player.takeHit === 'function') {
                player.takeHit(zombie.damage || 10);
                
                if (player.currentHealth <= 0) {
                    console.log('Player died from zombie collision');
                } else {
                    console.log(`Player survived collision: health=${player.currentHealth}/${player.maxHealth}`);
                }
            } else {
                console.warn('Player takeHit method not found');
            }
        });
        
        // Player vs AmmoPickup botsing
        this.registerHandler('player-ammo', (player, pickup) => {
            console.log(`Player collected ammo pickup: ${pickup.ammoAmount} ammo`);
            // AmmoPickup handelt de botsing af in zijn eigen onInitialize
            // Deze handler is alleen voor logging/extra logica indien nodig
        });
    }
    
    registerHandler(type, handler) {
        this.#collisionHandlers.set(type, handler);
        console.log(`Collision handler registered: ${type}`);
    }
    
    setupCollisions() {
        this.engine.on('collisionstart', (event) => {
            this.handleCollision(event.target, event.other);
        });
        console.log('Collision system setup complete');
    }

    handleCollision(actorA, actorB) {
        // Controleer voor bullet vs zombie
        if (actorA instanceof Bullet && (actorB instanceof SlowZombie || actorB instanceof FastZombie)) {
            const handler = this.#collisionHandlers.get('bullet-zombie');
            if (handler) {
                handler(actorA, actorB);
                return;
            }
        }

        // Controleer voor zombie vs bullet (omgekeerde volgorde)
        if ((actorA instanceof SlowZombie || actorA instanceof FastZombie) && actorB instanceof Bullet) {
            const handler = this.#collisionHandlers.get('bullet-zombie');
            if (handler) {
                handler(actorB, actorA);
                return;
            }
        }

        // Controleer voor player vs zombie
        if (actorA instanceof Player && (actorB instanceof SlowZombie || actorB instanceof FastZombie)) {
            const handler = this.#collisionHandlers.get('player-zombie');
            if (handler) {
                handler(actorA, actorB);
                return;
            }
        }
          
        // Controleer voor zombie vs player (omgekeerde volgorde)
        if ((actorA instanceof SlowZombie || actorA instanceof FastZombie) && actorB instanceof Player) {
            const handler = this.#collisionHandlers.get('player-zombie');
            if (handler) {
                handler(actorB, actorA);
                return;
            }
        }
        
        // Controleer voor player vs ammo pickup
        if (actorA instanceof Player && actorB instanceof AmmoPickup) {
            const handler = this.#collisionHandlers.get('player-ammo');
            if (handler) {
                handler(actorA, actorB);
                return;
            }
        }
        
        // Controleer voor ammo pickup vs player (omgekeerde volgorde)
        if (actorA instanceof AmmoPickup && actorB instanceof Player) {
            const handler = this.#collisionHandlers.get('player-ammo');
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
        if (this.#collisionHandlers.has(type)) {
            this.#collisionHandlers.delete(type);
            console.log(`Collision handler removed: ${type}`);
        }
    }

    getHandlers() {
        return Array.from(this.#collisionHandlers.keys());
    }
}
