import { Actor, Vector, Color, CollisionType } from "excalibur";

export class Bullet extends Actor {
    startPos;
    range = 800;
    lifetime = 5000;

    constructor(x, y, richting) {
        super({ 
            x, 
            y, 
            width: 5, 
            height: 5, 
            color: Color.Yellow,
            collisionType: CollisionType.Active
        });
        this.vel = richting.normalize().scale(400);
        this.startPos = new Vector(x, y);
        console.log("Bullet created at", x, y);
    }    onPreUpdate(engine, delta) {
        // Update lifetime
        this.lifetime -= delta;
        if (this.lifetime <= 0) {
            this.kill();
            console.log("Bullet expired");
            return;
        }

        // Check range
        if (this.pos.distance(this.startPos) > this.range) {
            this.kill();
            console.log("Bullet out of range");
        }
    }
}
