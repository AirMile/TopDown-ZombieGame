import { Actor, Vector, Color, CollisionType } from "excalibur";
import { Player } from "../player/player.js";

export class AmmoPickup extends Actor {
    #ammoAmount = 20; // Hoeveelheid ammo die deze pickup geeft
    #bobSpeed = 3; // Snelheid van de bob-animatie
    #bobHeight = 5; // Hoogte van de bob-beweging
    #startY;
    #bobTimer = 0;

    constructor(x, y) {
        super({ 
            x, 
            y, 
            width: 16, 
            height: 16, 
            color: Color.Orange,
            collisionType: CollisionType.Passive
        });
          
        this.#startY = y;
        console.log(`AmmoPickup created at (${x}, ${y}) with ${this.#ammoAmount} ammo`);
    }

    // Getters voor read-only access
    get ammoAmount() {
        return this.#ammoAmount;
    }    onInitialize(engine) {
        // Luister naar botsingen met de speler
        this.on('collisionstart', (event) => {
            const otherActor = event.other.owner;
            
            if (otherActor instanceof Player) {
                console.log(`AmmoPickup collision with player, giving ${this.#ammoAmount} ammo`);
                
                // Geef ammo aan de speler
                if (otherActor.weapon && typeof otherActor.weapon.addAmmo === 'function') {
                    const ammoAdded = otherActor.weapon.addAmmo(this.#ammoAmount);
                    console.log(`Ammo pickup: ${ammoAdded} ammo added to player`);
                } else {
                    console.warn('AmmoPickup: Player weapon not found or addAmmo method missing');
                }
                
                // Verwijder de pickup
                this.kill();                
            }
        });
    }    
    
    onPreUpdate(engine, delta) {
        // Bob-animatie - pickup beweegt lichtjes op en neer
        this.#bobTimer += delta / 1000;
        const bobOffset = Math.sin(this.#bobTimer * this.#bobSpeed) * this.#bobHeight;
        this.pos = new Vector(this.pos.x, this.#startY + bobOffset);
    }
}
