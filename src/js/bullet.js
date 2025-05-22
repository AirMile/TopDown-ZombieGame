import { Actor, Vector, Color } from "excalibur";

export class Bullet extends Actor {
    startPos;
    range;

    constructor(x, y, richting) {
        super({ x, y, width: 5, height: 5, color: Color.Yellow 
            
        });
        this.vel = richting.normalize().scale(400);
        this.startPos = new Vector(x, y); // Store the initial position
        this.range = 800; // Set the range for the bullet
    }
}
