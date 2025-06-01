import { Actor, Vector, Color, CollisionType } from "excalibur";
import { SlowZombie } from "../zombies/slowzombie.js";
import { FastZombie } from "../zombies/fastzombie.js";

export class Bullet extends Actor {
    #startPos;
    #range = 800;
    #lifetime = 5000;
    
    constructor(x, y, direction) {
        super({ 
            x, 
            y, 
            width: 5, 
            height: 5, 
            color: Color.Yellow,
            collisionType: CollisionType.Active
        });
        this.vel = direction.normalize().scale(400);
        this.#startPos = new Vector(x, y);
    }

    // Alleen-lezen properties voor startpositie, bereik en levensduur
    get startPos() {
        return this.#startPos;
    }

    get range() {
        return this.#range;
    }

    get lifetime() {
        return this.#lifetime;
    }

    onInitialize(engine) {
        this.on('collisionstart', (event) => {
            const otherActor = event.other.owner;
            if (otherActor instanceof SlowZombie || otherActor instanceof FastZombie) {
                // Knockback richting: vector van bullet naar zombie
                const knockbackDirection = otherActor.pos.sub(this.pos).normalize();
                const knockbackStrength = 80;
                otherActor.applyKnockback(knockbackDirection, knockbackStrength);
                otherActor.takeDamage(10);
                this.kill();
            }
        });
    }

    onPreUpdate(engine, delta) {
        // Bullet verdwijnt als levensduur op is of buiten bereik is
        this.#lifetime -= delta;
        const outOfLifetime = this.#lifetime <= 0;
        const outOfRange = this.pos.distance(this.#startPos) > this.#range;
        if (outOfLifetime || outOfRange) {
            this.kill();
            return;
        }
    }
}
