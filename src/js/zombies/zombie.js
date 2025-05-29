import { Actor, Vector } from "excalibur"
import { Resources } from "../resources.js"
import { Player } from "../player/player.js"; // Import Player

export class Zombie extends Actor {
    movementSpeed = 50; // Default speed, can be overridden by subclasses
    constructor(options) { // Accept options object
        super({ // Pass all options to the Actor constructor
            ...options, 
        });
        
        // Graphics are set in subclasses
        this.pos = new Vector(500, 300)
        // this.vel = new Vector(-10, 0) // Verwijderd, snelheid wordt dynamisch berekend
        this.maxHealth = 30; // Default health, overschreven in subklassen
        this.health = this.maxHealth;
    }
    
    onInitialize(engine) {
        // Algemene collision logic voor zombies kan hier, of in subclasses.
    }

    onPreUpdate(engine, delta) {
        // Zoek de speler in de scene
        const player = engine.currentScene.actors.find(actor => actor instanceof Player);

        if (player) {
            // Bereken de richting naar de speler
            const directionToPlayer = player.pos.sub(this.pos).normalize();
            // Stel de snelheid in de richting van de speler in
            this.vel = directionToPlayer.scale(this.movementSpeed);

            // Optioneel: Zombie kijkt naar de speler
            this.rotation = directionToPlayer.toAngle() - Math.PI / 2; // Correctie: 180 graden gedraaid t.o.v. vorige aanpassing
        } else {
            // Als er geen speler is, stop de zombie (of ander gedrag)
            this.vel = Vector.Zero;
        }
        console.log(`Zombie update: pos=(${this.pos.x.toFixed(2)}, ${this.pos.y.toFixed(2)}), vel=(${this.vel.x.toFixed(2)}, ${this.vel.y.toFixed(2)}), speed=${this.movementSpeed}`);
    }    // Method for taking damage from bullets
    takeDamage(damage) {
        // Prevent damage if already dead
        if (this.health <= 0) {
            return;
        }
        
        this.health -= damage;
        
        if (this.health <= 0) {
            this.kill();
        }
    }
    
    // kill() { // Implementeer een kill methode als die nog niet bestaat of in Actor zit
    //     super.kill(); // Roep de kill methode van Actor aan
    // }
}
