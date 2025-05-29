import { Zombie } from "./zombie.js";
import { Vector, Color, CollisionType } from "excalibur"
import { Resources } from "./resources.js"
import { Player } from "./player/player.js";

export class SlowZombie extends Zombie {
    constructor() {
        super({
            width: 24, // even smaller for better scaling
            height: 24,
            collisionType: CollisionType.Active // Make zombie collidable
        })
        
        // Zombie properties
        this.damage = 15; // Slow zombies deal moderate damage

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
    }    onInitialize(engine) {
        super.onInitialize(engine); // Call base class onInitialize
        console.log("SlowZombie initialized!");
    }
}
