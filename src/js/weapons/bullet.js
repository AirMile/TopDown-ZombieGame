import { Actor, Vector, Color, CollisionType } from "excalibur";
import { SlowZombie } from "../zombies/slowzombie.js";
import { FastZombie } from "../zombies/fastzombie.js";

export class Bullet extends Actor {
    startPos;
    range = 800;
    lifetime = 5000;    constructor(x, y, richting) {
        super({ 
            x, 
            y, 
            width: 5, 
            height: 5, 
            color: Color.Yellow,
            collisionType: CollisionType.Active
        });
        this.vel = richting.normalize().scale(400);
        this.startPos = new Vector(x, y);    }
      onInitialize(engine) {
        // Listen for collisions on this bullet
        this.on('collisionstart', (event) => {
            // Get the actual actor from the collider
            const otherActor = event.other.owner;
            
            if (otherActor instanceof SlowZombie || otherActor instanceof FastZombie) {
                // Deal damage
                otherActor.takeDamage(10);
                
                // Kill this bullet
                this.kill();
            }
        });
    }

    onPreUpdate(engine, delta) {// Update lifetime
        this.lifetime -= delta;
        if (this.lifetime <= 0) {
            this.kill();
            return;
        }

        // Check range
        if (this.pos.distance(this.startPos) > this.range) {
            this.kill();
        }
    }
}
