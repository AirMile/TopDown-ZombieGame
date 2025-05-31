import { Actor, Vector } from "excalibur"
import { Resources } from "../resources.js"
import { Player } from "../player/player.js"; // Import Player
import { AmmoPickup } from "../items/ammopickup.js"; // Import AmmoPickup

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
            const directionToPlayer = player.pos.sub(this.pos).normalize();            // Stel de snelheid in de richting van de speler in
            this.vel = directionToPlayer.scale(this.movementSpeed);
            
            // Optioneel: Zombie kijkt naar de speler
            this.rotation = directionToPlayer.toAngle() - Math.PI / 2;
        } else {
            // Als er geen speler is, stop de zombie (of ander gedrag)
            this.vel = Vector.Zero;        }
    }    // Method for taking damage from bullets
    takeDamage(damage) {
        // Prevent damage if already dead
        if (this.health <= 0) {
            return;
        }
        
        this.health -= damage;
        
        if (this.health <= 0) {
            console.log(`=== ZOMBIE KILLED ===`);
            console.log(`Zombie type: ${this.constructor.name} killed!`);
            
            // Award points based on zombie type
            this.awardKillPoints();
            
            // Drop ammo pickup (25% kans)
            this.dropAmmoPickup();
            
            console.log(`=== END ZOMBIE KILL ===\n`);
            this.kill();
        }
    }
      // Award points when zombie is killed
    awardKillPoints() {
        // Find the collision manager to award points
        const collisionManager = this.scene?.engine?.collisionManager;
        
        if (collisionManager) {
            let points = 15; // Beide zombie types geven nu 15 punten
            
            collisionManager.addScore(points);
            console.log(`Added ${points} points for killing ${this.constructor.name}. Total score: ${collisionManager.getScore()}`);
        } else {
            console.log(`❌ Could not award points - collision manager not found`);
        }
    }
    
    // Drop ammo pickup when zombie is killed
    dropAmmoPickup() {
        // 25% kans om ammo pickup te droppen
        const dropChance = 0.25;
        const randomValue = Math.random();
        
        console.log(`=== AMMO DROP CHECK ===`);
        console.log(`Drop chance: ${dropChance * 100}%`);
        console.log(`Random value: ${randomValue.toFixed(3)}`);
        
        if (randomValue < dropChance) {
            console.log(`✅ Ammo pickup will be dropped!`);
            
            // Spawn ammo pickup op zombie positie
            const pickup = new AmmoPickup(this.pos.x, this.pos.y);
            
            if (this.scene?.engine) {
                this.scene.engine.add(pickup);
                console.log(`Ammo pickup spawned at x=${this.pos.x.toFixed(1)}, y=${this.pos.y.toFixed(1)}`);
            } else {
                console.log(`❌ Could not spawn ammo pickup - no engine reference`);
            }
        } else {
            console.log(`❌ No ammo pickup dropped (${randomValue.toFixed(3)} >= ${dropChance})`);
        }
        
        console.log(`=== END AMMO DROP CHECK ===\n`);
    }
    
    // kill() { // Implementeer een kill methode als die nog niet bestaat of in Actor zit
    //     super.kill(); // Roep de kill methode van Actor aan
    // }
}
