import { Actor, Vector, Color, CollisionType } from "excalibur";
import { Player } from "../player/player.js";

export class AmmoPickup extends Actor {
    #ammoAmount;
    #bobSpeed = 3; 
    #bobHeight = 5; 
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
        
        // Genereer random ammo tussen 20 en 35
        this.#ammoAmount = Math.floor(Math.random() * (35 - 20 + 1)) + 20;
        this.#startY = y;
        console.log(`AmmoPickup created at (${x}, ${y}) with ${this.#ammoAmount} ammo`);
    }

    get ammoAmount() {
        return this.#ammoAmount;
    }    
    
    onInitialize(engine) {
        // Luister naar botsingen met de speler
        this.on('collisionstart', (event) => {
            const otherActor = event.other.owner;
            
            if (otherActor instanceof Player) {
                console.log(`AmmoPickup collision with player, giving ${this.#ammoAmount} ammo`);
                
                // Geef ammo direct aan de speler (niet meer via weapon)
                if (typeof otherActor.addAmmo === 'function') {
                    const ammoAdded = otherActor.addAmmo(this.#ammoAmount);
                    console.log(`Ammo pickup: ${ammoAdded} ammo added to player`);
                } else {
                    console.warn('AmmoPickup: Player addAmmo method missing');
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