import { Actor, Vector, Color } from "excalibur";

export class Bullet extends Actor {
    constructor(x, y, richting) {
        super({ x, y, width: 5, height: 5, color: Color.Yellow 
            
        });
        this.vel = richting.normalize().scale(400);
    }

    onPreUpdate(engine, delta) {
        if (
            this.pos.x < 0 || this.pos.x > engine.drawWidth ||
            this.pos.y < 0 || this.pos.y > engine.drawHeight
        ) {
            this.kill();
        }
    }
}
