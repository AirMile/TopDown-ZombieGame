import { Zombie } from "./zombie.js";
import { Vector, Color, CollisionType } from "excalibur"
import { Resources } from "./resources.js"
import { Player } from "./player.js";

export class SlowZombie extends Zombie {
    constructor() {
        super({
            width: 24, // even smaller for better scaling
            height: 24,
            collisionType: CollisionType.Active // Make zombie collidable
        })
        // Kies random sprite
        const slowSprites = [
            Resources.SlowZombie1,
            Resources.SlowZombie2
        ];
        const spriteIndex = Math.floor(Math.random() * slowSprites.length);
        const sprite = slowSprites[spriteIndex].toSprite();
        sprite.scale = new Vector(0.5, 0.5); // Scale sprite to 50%
        this.graphics.use(sprite);
        this.graphics.current.tint = Color.fromRGB(100, 200, 255) // Lichtblauw tint
        this.pos = new Vector(200, 300)
        this.vel = new Vector(-2, 0)
        console.log(`SlowZombie constructor voltooid. Sprite index: ${spriteIndex}, scale: 0.5`)
    }

    onInitialize(engine) {
        super.onInitialize(engine); // Call base class onInitialize
        this.on('collisionstart', (event) => {
            if (event.other instanceof Player) {
                console.log('SlowZombie RAAKT SPELER! (Gedetecteerd door SlowZombie)');
                // event.other.takeHit(); 
            }
        });
        console.log("SlowZombie collision logic initialized!");
    }
}
