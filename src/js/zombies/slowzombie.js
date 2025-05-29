import { Zombie } from "./zombie.js";
import { Vector, Color, CollisionType } from "excalibur"
import { Resources } from "../resources.js"
import { Player } from "../player/player.js";
import { Bullet } from "../weapons/bullet.js";

export class SlowZombie extends Zombie {    constructor() {
        super({
            width: 24, // even smaller for better scaling
            height: 24,
            collisionType: CollisionType.Active // Make zombie collidable
        });        
        this.movementSpeed = 20; // Langzame zombies bewegen langzamer
        // Zombie properties
        this.damage = 15; // Slow zombies deal moderate damage
        this.maxHealth = 30; // Slow zombies have 30 health
        this.health = this.maxHealth;

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
        // this.vel = new Vector(-2, 0) // Verwijderd, snelheid wordt dynamisch berekend in Zombie base class
    }
      onInitialize(engine) {
        super.onInitialize(engine); // Call base class onInitialize
          // Listen for collisions with bullets
        this.on('collisionstart', (event) => {
            // Get the actual actor from the collider
            const otherActor = event.other.owner;
            
            if (otherActor instanceof Bullet) {
                // Take damage
                this.takeDamage(10);
                
                // Kill the bullet
                otherActor.kill();
            }
        });
    }
}
