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
          this.ammoAmount = 20; // Hoeveel ammo deze pickup geeft (verminderd van 20 naar 12)
        this.bobSpeed = 3; // Snelheid van bob animatie
        this.bobHeight = 5; // Hoogte van bob beweging
        this.startY = y;
        this.bobTimer = 0;
          console.log(`AmmoPickup created at position: x=${x}, y=${y}, ammo=${this.ammoAmount}`);
    }

    onInitialize(engine) {
        // Listen for collisions met player
        this.on('collisionstart', (event) => {
            const otherActor = event.other.owner;
            
            if (otherActor instanceof Player) {
                console.log(`=== AMMO PICKUP COLLECTED ===`);
                console.log(`Player collected ammo pickup worth ${this.ammoAmount} bullets`);
                
                // Geef ammo aan player
                if (otherActor.weapon && typeof otherActor.weapon.addAmmo === 'function') {
                    const ammoAdded = otherActor.weapon.addAmmo(this.ammoAmount);
                    console.log(`Successfully added ${ammoAdded} ammo to player`);
                } else {
                    console.log(`❌ Could not add ammo - weapon or addAmmo method not found`);
                }
                
                // Verwijder pickup
                this.kill();                console.log(`=== AMMO PICKUP CONSUMED ===\n`);
            }
        });
    }    onPreUpdate(engine, delta) {
        // Bob animatie - pickup beweegt lichtjes op en neer
        this.bobTimer += delta / 1000;
        const bobOffset = Math.sin(this.bobTimer * this.bobSpeed) * this.bobHeight;
        this.pos = new Vector(this.pos.x, this.startY + bobOffset);
    }
}
