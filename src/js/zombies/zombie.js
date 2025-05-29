import { Actor, Vector } from "excalibur"
import { Resources } from "../resources.js"

export class Zombie extends Actor {    constructor(options) { // Accept options object
        super({ // Pass all options to the Actor constructor
            ...options, 
        });
        
        // Graphics are set in subclasses
        this.pos = new Vector(500, 300)
        this.vel = new Vector(-10, 0)
        this.maxHealth = 30; // Default health, overschreven in subklassen
        this.health = this.maxHealth;
    }
    
    onInitialize(engine) {
        // Algemene collision logic voor zombies kan hier, of in subclasses.
    }
    
    // Method for taking damage from bullets
    takeDamage(damage) {
        this.health -= damage;
        
        if (this.health <= 0) {
            this.kill();
        }
    }
    
    // kill() { // Implementeer een kill methode als die nog niet bestaat of in Actor zit
    //     super.kill(); // Roep de kill methode van Actor aan
    // }
}
