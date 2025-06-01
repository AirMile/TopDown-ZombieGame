import { Actor, Vector } from "excalibur"
import { Resources } from "../resources.js"
import { Player } from "../player/player.js"; // Importeer Player
import { AmmoPickup } from "../items/ammopickup.js"; // Importeer AmmoPickup

export class Zombie extends Actor {    movementSpeed = 50; // Standaard snelheid, kan overschreven worden door subklassen
    constructor(options) { // Accepteer options object
        super({ // Geef alle options door aan de Actor constructor
            ...options, 
        });
        
        // Graphics worden ingesteld in subklassen
        this.pos = new Vector(500, 300)
        // this.vel = new Vector(-10, 0) // Verwijderd, snelheid wordt dynamisch berekend
        this.maxHealth = 30; // Standaard health, overschreven in subklassen
        this.health = this.maxHealth;
          // Knockback systeem
        this.isKnockedBack = false;
        this.knockbackTimer = 0;
        this.knockbackDuration = 200; // 200ms knockback duur
    }
    
    onInitialize(engine) {
        // Algemene collision logic voor zombies kan hier, of in subclasses.
    }    onPreUpdate(engine, delta) {
        // Update knockback timer
        if (this.isKnockedBack) {
            this.knockbackTimer -= delta;
            
            // Pas wrijving toe tijdens knockback
            const frictionForce = 0.95; // 5% snelheidsvermindering per frame
            this.vel = this.vel.scale(frictionForce);
            
            if (this.knockbackTimer <= 0) {                this.isKnockedBack = false;
                // console.log(`Zombie knockback ended: position=${this.pos.x.toFixed(2)},${this.pos.y.toFixed(2)}`);
            }
            // Tijdens knockback, overschrijf velocity niet - laat knockback physics werken
            return;
        }
        
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
    }    // Methode voor het nemen van schade van bullets
    takeDamage(damage) {
        // Voorkom schade als al dood
        if (this.health <= 0) {
            return;
        }
        
        this.health -= damage;
        
        if (this.health <= 0) {
            
            // Ken punten toe gebaseerd op zombie type
            this.awardKillPoints();
            
            // Drop ammo pickup (25% kans)
            this.dropAmmoPickup();
            
            this.kill();
        }
    }
      // Methode voor het toepassen van knockback
    applyKnockback(direction, strength) {
        // Start knockback status
        this.isKnockedBack = true;
        this.knockbackTimer = this.knockbackDuration;
        
        // Pas knockback velocity toe
        const knockbackVelocity = direction.scale(strength);
        this.vel = this.vel.add(knockbackVelocity);
          // console.log(`Zombie knockback applied: direction=${direction.x.toFixed(2)},${direction.y.toFixed(2)}, strength=${strength}, newVel=${this.vel.x.toFixed(2)},${this.vel.y.toFixed(2)}`);
    }    // Ken punten toe wanneer zombie wordt gedood
    awardKillPoints() {
        // Vind de collision manager om punten toe te kennen
        const collisionManager = this.scene?.engine?.collisionManager;
        
        if (collisionManager) {
            let points = 15; // Beide zombie types geven nu 15 punten
            
            collisionManager.addScore(points);
        } 
    }
      // Drop ammo pickup wanneer zombie wordt gedood
    dropAmmoPickup() {
        // 8% kans om ammo pickup te droppen (meer schaars gemaakt)
        const dropChance = 0.25;
        const randomValue = Math.random();
        
        if (randomValue < dropChance) {
            
            // Spawn ammo pickup op zombie positie
            const pickup = new AmmoPickup(this.pos.x, this.pos.y);
            
            if (this.scene?.engine) {
                this.scene.engine.add(pickup);
            } 
        } 
        
    }
    

}
