import { Actor, Vector, Color } from "excalibur";

export class Bullet extends Actor {
    startPos;
    range;
    lifetime = 5000; // 5 seconds in milliseconds

    constructor(x, y, richting) {
        super({ x, y, width: 5, height: 5, color: Color.Yellow 
            
        });
        this.vel = richting.normalize().scale(400);
        this.startPos = new Vector(x, y); // Store the initial position
        this.range = 800; // Set the range for the bullet
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
