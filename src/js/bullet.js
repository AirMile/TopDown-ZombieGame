import { Actor, Vector, Color, CollisionType } from "excalibur";
import { FastZombie } from "./fastzombie.js";
import { SlowZombie } from "./slowzombie.js";

export class Bullet extends Actor {
    startPos;
    range;
    lifetime = 5000; // 5 seconds in milliseconds

    constructor(x, y, richting) {
        super({ 
            x, 
            y, 
            width: 5, 
            height: 5, 
            color: Color.Yellow,
            collisionType: CollisionType.Active // Make bullet collidable
        });
        this.vel = richting.normalize().scale(400);
        this.startPos = new Vector(x, y); // Store the initial position
        this.range = 800; // Set the range for the bullet
        console.log("Bullet constructor voltooid.");
    }

    onInitialize(engine) {
        console.log("Bullet onInitialize aangeroepen.");
        this.on('collisionstart', (event) => {
            console.log('Bullet collisionstart event triggered. Other entity:', event.other, 'Owner of other:', event.other.owner);
            const owner = event.other.owner; // Get the owner of the collider

            console.log(`Is owner a FastZombie? ${owner instanceof FastZombie}`);
            console.log(`Is owner a SlowZombie? ${owner instanceof SlowZombie}`);

            if (owner instanceof FastZombie || owner instanceof SlowZombie) {
                console.log('KOGEL RAAKT ZOMBIE! (Gedetecteerd door Bullet, owner check)');
                if (typeof owner.kill === 'function') {
                    console.log("Attempting to kill zombie:", owner);
                    owner.kill(); 
                } else {
                    console.error("Zombie (owner) heeft geen kill() methode", owner);
                }
                console.log("Attempting to kill bullet (this):", this);
                this.kill(); // Destroy the bullet
            } else {
                console.log("Bullet hit something else (owner check):", owner);
            }
        });
        console.log("Bullet collision logic initialized!");
    }

    onPreUpdate(engine, delta) {
        this.lifetime -= delta;
        if (this.lifetime <= 0) {
            this.kill();
            console.log("Bullet killed after 5 seconds");
        }

        // Existing range check logic
        if (this.pos.distance(this.startPos) > this.range) {
            this.kill();
        }
    }
}
