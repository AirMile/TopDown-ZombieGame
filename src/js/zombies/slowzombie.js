import { Zombie } from "./zombie.js";
import { Vector, Color, CollisionType, Shape, vec } from "excalibur"
import { Resources } from "../resources.js"
import { Player } from "../player/player.js";
import { Bullet } from "../weapons/bullet.js";

export class SlowZombie extends Zombie {
    #damage = 15; // Slow zombies deal moderate damage
    #damageTimer = 0; // Timer voor damage cooldown
    #damageCooldown = 500; // 0.5 seconds in milliseconds
    #initializationDelay = 1000; // 1 second delay before damage can be applied
    
    constructor() {
        super({
            width: 24, // even smaller for better scaling
            height: 24,
            collisionType: CollisionType.Active // Make zombie collidable
        });
        
        // Set zombie eigenschappen via setters
        this.maxHealth = 30; // Slow zombies have 30 health// Kies willekeurige sprite
        const slowSprites = [
            Resources.SlowZombie1,
            Resources.SlowZombie2
        ];const spriteIndex = Math.floor(Math.random() * slowSprites.length);
        const sprite = slowSprites[spriteIndex].toSprite();
        sprite.scale = new Vector(0.5, 0.5); // Scale sprite to 50%        sprite.tint = Color.fromRGB(100, 200, 255); // Lichtblauw tint op sprite zelf!
        this.graphics.use(sprite);
        this.pos = new Vector(500, 300) // Moved further away from player
    }onPreUpdate(engine, delta) {
        super.onPreUpdate(engine, delta);
        
        // Update initialisatie vertraging
        if (this.#initializationDelay > 0) {
            this.#initializationDelay -= delta;
            // Console.log voor initialisatievertraging
            if (this.#initializationDelay <= 0) {
                console.log(`SlowZombie initialization complete. pos: ${this.pos.x.toFixed(1)},${this.pos.y.toFixed(1)}`);
            }
        }
        
        // Update damage timer
        if (this.#damageTimer > 0) {
            this.#damageTimer -= delta;
        }
        
        // Log rotatie voor debug (elke 60 frames = ongeveer 1x per seconde)
        if (Math.random() < 0.016) { // ~1/60 kans per frame
            const rotationDegrees = (this.rotation * 180 / Math.PI).toFixed(1);
            console.log(`SlowZombie rotation: ${rotationDegrees} degrees, pos: ${this.pos.x.toFixed(1)},${this.pos.y.toFixed(1)}, initializationDelay: ${this.#initializationDelay > 0}, damageTimer: ${this.#damageTimer > 0}`);
        }
        
        // Controleer alleen op collision na initialisatie vertraging
        if (this.#initializationDelay <= 0) {
            this.checkPlayerCollision(engine, delta);
        }
    }

    checkPlayerCollision(engine, delta) {
        // Zoek player in de scene met dezelfde methode als base zombie class
        const player = engine.currentScene.actors.find(actor => actor instanceof Player);
        
        if (!player) return;
        
        // Controleer of collision bodies geïnitialiseerd zijn
        if (!this.collider || !player.collider) return;
        
        // Controleer of zombie en player collision bodies overlappen
        const zombieBody = this.collider.bounds;
        const playerBody = player.collider.bounds;
        
        const isCurrentlyColliding = zombieBody.overlaps(playerBody);
        
        if (isCurrentlyColliding) {
            // We zijn aan het botsen met player
            if (this.#damageTimer <= 0) {
                const playerHealthBefore = player.currentHealth; // Assuming player has a getter for currentHealth
                // Breng damage toe aan player
                player.takeHit(this.#damage);
                console.log(`SlowZombie dealing damage: damage=${this.#damage}, playerHealthBefore=${playerHealthBefore}, playerHealthAfter=${player.currentHealth}, damageTimer=${this.#damageTimer}, damageCooldown=${this.#damageCooldown}, pos: ${this.pos.x.toFixed(1)},${this.pos.y.toFixed(1)}`);
                
                // Reset damage timer
                this.#damageTimer = this.#damageCooldown;
            }
        }
    }    onInitialize(engine) {
        super.onInitialize(engine); // Roep base class onInitialize aan        
        
        // Vergroot collider naar schouder-breedte (veel breder voor échte schouder-tot-schouder)
        const colliderWidth = 80;  // Veel breder voor schouder-tot-schouder
        const colliderHeight = 35; // Ook hoger voor betere coverage
        
        // Centreer de collider en zorg dat hij meedraait met rotatie
        const boxShape = Shape.Box(colliderWidth, colliderHeight);
        this.collider.set(boxShape);
        
        // BELANGRIJK: Schakel rotatie in voor de collider zodat hij meedraait
        this.collider.useBoxCollision = true;
        this.body.useBoxCollision = true;
          // Extra debug: log de daadwerkelijke collider bounds

        
        // Maak collider zichtbaar voor debug (zodat je kunt zien dat hij meedraait)
        this.graphics.showDebug = true;
    }
}
