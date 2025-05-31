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
        this.startPos = new Vector(x, y);
        
        // Debug: log bullet direction voor troubleshooting
        console.log(`Bullet created: richting=${richting.x.toFixed(2)},${richting.y.toFixed(2)}, vel=${this.vel.x.toFixed(2)},${this.vel.y.toFixed(2)}`);
    }onInitialize(engine) {
        // Listen for collisions on this bullet
        this.on('collisionstart', (event) => {
            // Get the actual actor from the collider
            const otherActor = event.other.owner;            if (otherActor instanceof SlowZombie || otherActor instanceof FastZombie) {
                // Bereken knockback richting op basis van bullet naar zombie positie
                // Dit is betrouwbaarder dan bullet velocity omdat het altijd correct is
                const bulletToZombie = otherActor.pos.sub(this.pos).normalize();
                
                // Debug: bereken ook bullet velocity richting voor vergelijking
                const bulletDirection = this.vel.normalize();
                
                // Gebruik bullet-naar-zombie richting voor knockback
                const knockbackDirection = bulletToZombie;
                const knockbackStrength = 80; // Pas deze waarde aan voor meer/minder knockback
                
                // Debug: log alle relevante waarden
                console.log(`Bullet collision debug:`);
                console.log(`  Bullet vel direction: ${bulletDirection.x.toFixed(2)},${bulletDirection.y.toFixed(2)}`);
                console.log(`  Bullet->Zombie direction: ${bulletToZombie.x.toFixed(2)},${bulletToZombie.y.toFixed(2)}`);
                console.log(`  Using knockback direction: ${knockbackDirection.x.toFixed(2)},${knockbackDirection.y.toFixed(2)}`);
                console.log(`  Zombie pos: ${otherActor.pos.x.toFixed(2)},${otherActor.pos.y.toFixed(2)}`);
                console.log(`  Bullet pos: ${this.pos.x.toFixed(2)},${this.pos.y.toFixed(2)}`);
                
                // Apply knockback via zombie method
                otherActor.applyKnockback(knockbackDirection, knockbackStrength);
                
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
