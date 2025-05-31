import { Zombie } from "./zombie.js"
import { Vector, Color, CollisionType, Shape, vec } from "excalibur"
import { Resources } from "../resources.js"
import { Player } from "../player/player.js";
import { Bullet } from "../weapons/bullet.js";

export class FastZombie extends Zombie {    
    constructor() {
        super({
            width: 24, // even smaller for better scaling
            height: 24,
            collisionType: CollisionType.Active // Make zombie collidable
        });
        this.movementSpeed = 100; // Langzame zombies bewegen langzamer
        // Zombie properties
        this.damage = 25; // Fast zombies deal more damage
        this.maxHealth = 10; // Fast zombies have 10 health
        this.health = this.maxHealth;        // Damage cooldown system
        this.damageTimer = 0; // Timer voor damage cooldown
        this.damageCooldown = 500; // 0.5 seconds in milliseconds
        this.initializationDelay = 1000; // 1 second delay before damage can be applied        // Kies random sprite
        const fastSprites = [
            Resources.FastZombie1,
            Resources.FastZombie2,
            Resources.FastZombie3,
            Resources.FastZombie4
        ];        const spriteIndex = Math.floor(Math.random() * fastSprites.length);
        const sprite = fastSprites[spriteIndex].toSprite();
        sprite.scale = new Vector(0.5, 0.5); // Scale sprite to 50%
        sprite.tint = Color.fromRGB(255, 80, 80); // Roodachtige tint op sprite zelf!
        this.graphics.use(sprite);
        this.pos = new Vector(800, 300)
        this.vel = new Vector(-15, 0)
        

    }    onPreUpdate(engine, delta) {
        super.onPreUpdate(engine, delta);
        
        // Update initialization delay
        if (this.initializationDelay > 0) {
            this.initializationDelay -= delta;
        }
        
        // Update damage timer
        if (this.damageTimer > 0) {
            this.damageTimer -= delta;
        }
        
        // Log rotatie voor debug (elke 60 frames = ongeveer 1x per seconde)
        if (Math.random() < 0.016) { // ~1/60 kans per frame
            const rotationDegrees = (this.rotation * 180 / Math.PI).toFixed(1);
        }
        
        // Only check for collision after initialization delay
        if (this.initializationDelay <= 0) {
            this.checkPlayerCollision(engine, delta);
        } else if (this.initializationDelay <= 900) { // Log once when almost ready
        }
    }
      checkPlayerCollision(engine, delta) {
        // Find player in the scene using the same method as base zombie class
        const player = engine.currentScene.actors.find(actor => actor instanceof Player);
        
        if (!player) return;
        
        // Make sure collision bodies are initialized
        if (!this.collider || !player.collider) return;
        
        // Check if zombie and player collision bodies are overlapping
        const zombieBody = this.collider.bounds;
        const playerBody = player.collider.bounds;
        
        const isCurrentlyColliding = zombieBody.overlaps(playerBody);
        
        if (isCurrentlyColliding) {
            // We are colliding with player
            if (this.damageTimer <= 0) {

                // Apply damage to player
                player.takeHit(this.damage);
                
                // Reset damage timer
                this.damageTimer = this.damageCooldown;

            }
        }    }    onInitialize(engine) {
        super.onInitialize(engine); // Call base class onInitialize        
        
        // Vergroot collider naar schouder-breedte (veel breder voor échte schouder-tot-schouder)
        const colliderWidth = 80;  // Veel breder voor schouder-tot-schouder
        const colliderHeight = 33; // Ook hoger voor betere coverage
        
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
