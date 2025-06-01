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
          // Debug: log bullet richting voor troubleshooting
        // console.log(`Bullet created: richting=${richting.x.toFixed(2)},${richting.y.toFixed(2)}, vel=${this.vel.x.toFixed(2)},${this.vel.y.toFixed(2)}`);
    }    onInitialize(engine) {
        // Luister naar botsingen op deze bullet
        this.on('collisionstart', (event) => {
            // Krijg de werkelijke actor van de collider
            const otherActor = event.other.owner;if (otherActor instanceof SlowZombie || otherActor instanceof FastZombie) {
                // Bereken knockback richting op basis van bullet naar zombie positie
                // Dit is betrouwbaarder dan bullet velocity omdat het altijd correct is
                const bulletToZombie = otherActor.pos.sub(this.pos).normalize();
                
                // Debug: bereken ook bullet velocity richting voor vergelijking
                const bulletDirection = this.vel.normalize();
                
                // Gebruik bullet-naar-zombie richting voor knockback
                const knockbackDirection = bulletToZombie;
                const knockbackStrength = 80; // Pas deze waarde aan voor meer/minder knockback
                
                // Debug: log alle relevante waarden                // console.log(`Bullet collision debug:`);
                // console.log(`  Bullet vel direction: ${bulletDirection.x.toFixed(2)},${bulletDirection.y.toFixed(2)}`);
                // console.log(`  Bullet->Zombie direction: ${bulletToZombie.x.toFixed(2)},${bulletToZombie.y.toFixed(2)}`);
                // console.log(`  Using knockback direction: ${knockbackDirection.x.toFixed(2)},${knockbackDirection.y.toFixed(2)}`);
                // console.log(`  Zombie pos: ${otherActor.pos.x.toFixed(2)},${otherActor.pos.y.toFixed(2)}`);
                // console.log(`  Bullet pos: ${this.pos.x.toFixed(2)},${this.pos.y.toFixed(2)}`);
                
                // Pas knockback toe via zombie methode
                otherActor.applyKnockback(knockbackDirection, knockbackStrength);
                
                // Geef schade
                otherActor.takeDamage(10);
                
                // Vernietigt deze bullet
                this.kill();
            }
        });
    }    onPreUpdate(engine, delta) {
        // Update levensduur
        this.lifetime -= delta;
        if (this.lifetime <= 0) {
            this.kill();
            return;
        }

        // Controleer bereik
        if (this.pos.distance(this.startPos) > this.range) {
            this.kill();
        }
    }
}
