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
    }

    get score() {
        return this.#score;
    }

    getScore() {
        return this.#score;
    }

    addScore(points) {
        this.#score += points;
        if (this.gameInstance?.uiManager) {
            this.gameInstance.uiManager.updateScore(this.#score);
        }
    }
    
    resetScore() {
        this.#score = 0;
        console.log('Score reset to 0');
    }

    setupDefaultHandlers() {
        this.registerHandler('bullet-zombie', (bullet, zombie) => {
            const damageDealt = 10;
            zombie.takeDamage(damageDealt);
            bullet.kill();
        });
        this.registerHandler('player-zombie', (player, zombie) => {
            if (typeof player.takeHit === 'function') {
                player.takeHit(zombie.damage || 10);
            }
        });
    }
    
    registerHandler(type, handler) {
        this.#collisionHandlers.set(type, handler);
    }

    setupCollisions() {
        this.engine.on('collisionstart', (event) => {
            this.handleCollision(event.target, event.other);
        });
    }

    handleCollision(actorA, actorB) {
        const typePairs = [
            [Bullet, [SlowZombie, FastZombie], 'bullet-zombie'],
            [Player, [SlowZombie, FastZombie], 'player-zombie'],
            [Player, [AmmoPickup], 'player-ammo']
        ];

        for (const [TypeA, TypeBs, handlerKey] of typePairs) {
            if (
                (actorA instanceof TypeA && TypeBs.some(TypeB => actorB instanceof TypeB)) ||
                (actorB instanceof TypeA && TypeBs.some(TypeB => actorA instanceof TypeB))
            ) {
                const handler = this.#collisionHandlers.get(handlerKey);
                if (handler) {
                    if (actorA instanceof TypeA) {
                        handler(actorA, actorB);
                    } else {
                        handler(actorB, actorA);
                    }
                    return;
                }
            }
        }
    }

    removeHandler(type) {
        if (this.#collisionHandlers.has(type)) {
            this.#collisionHandlers.delete(type);
        }
    }

    getHandlers() {
        return Array.from(this.#collisionHandlers.keys());
    }
}