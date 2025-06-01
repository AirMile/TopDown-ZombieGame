import { Actor, Vector, Color, CollisionType } from "excalibur";
import { Player } from "../player/player.js";

export class AmmoPickup extends Actor {
    constructor(x, y) {
        super({ 
            x, 
            y, 
            width: 16, 
            height: 16, 
            color: Color.Orange,
            collisionType: CollisionType.Passive
        });
          this.ammoAmount = 20; // Hoeveelheid ammo die deze pickup geeft
        this.bobSpeed = 3; // Snelheid van de bob-animatie
        this.bobHeight = 5; // Hoogte van de bob-beweging
        this.startY = y;
        this.bobTimer = 0;
    }

    onInitialize(engine) {
        // Luister naar botsingen met de speler
        this.on('collisionstart', (event) => {
            const otherActor = event.other.owner;
            
            if (otherActor instanceof Player) {
                
                // Geef ammo aan de speler
                if (otherActor.weapon && typeof otherActor.weapon.addAmmo === 'function') {
                    const ammoAdded = otherActor.weapon.addAmmo(this.ammoAmount);
                } else {
                }
                
                // Verwijder de pickup
                this.kill();                
            }
        });
    }    onPreUpdate(engine, delta) {
        // Bob-animatie - pickup beweegt lichtjes op en neer
        this.bobTimer += delta / 1000;
        const bobOffset = Math.sin(this.bobTimer * this.bobSpeed) * this.bobHeight;
        this.pos = new Vector(this.pos.x, this.startY + bobOffset);
    }
}
