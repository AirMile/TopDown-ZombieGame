import { Actor, Vector } from "excalibur"
import { Resources } from "./resources.js"

export class Zombie extends Actor {
    constructor(options) { // Accept options object
        super({ // Pass all options to the Actor constructor
            ...options, 
        });
        console.log(`Zombie base class constructor aangeroepen voor ${this.constructor.name} met options:`, options);
        // this.graphics.use(Resources.Fish.toSprite()) // Verplaatst naar subklassen
        this.pos = new Vector(500, 300)
        this.vel = new Vector(-10, 0)
    }

    onInitialize(engine) {
        console.log(`${this.constructor.name} onInitialize aangeroepen.`);
        // Algemene collision logic voor zombies kan hier, of in subclasses.
    }

    // kill() { // Implementeer een kill methode als die nog niet bestaat of in Actor zit
    //     super.kill(); // Roep de kill methode van Actor aan
    //     console.log(`"${this.constructor.name} is gedood."`);
    // }
}
