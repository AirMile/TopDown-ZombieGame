import { Zombie } from "./zombie.js"
import { Vector, Color, CollisionType } from "excalibur"
import { Resources } from "../resources.js"
import { Player } from "../player/player.js";

export class FastZombie extends Zombie {
    constructor() {
        super({
            width: 24, // even smaller for better scaling
            height: 24,
            collisionType: CollisionType.Active // Make zombie collidable
        });
        
        // Zombie properties
        this.damage = 25; // Fast zombies deal more damage
        this.maxHealth = 10; // Fast zombies have 10 health
        this.health = this.maxHealth;

        // Kies random sprite
        const fastSprites = [
            Resources.FastZombie1,
            Resources.FastZombie2,
            Resources.FastZombie3,
            Resources.FastZombie4
        ];
        const spriteIndex = Math.floor(Math.random() * fastSprites.length);
        const sprite = fastSprites[spriteIndex].toSprite();
        sprite.scale = new Vector(0.5, 0.5); // Scale sprite to 50%
        this.graphics.use(sprite);
        
        this.graphics.current.tint = Color.fromRGB(255, 80, 80) // Roodachtige tint
        this.pos = new Vector(800, 300)
        this.vel = new Vector(-15, 0)
    }
    
    onInitialize(engine) {
        super.onInitialize(engine); // Call base class onInitialize
    }
}
