import { Zombie } from "./zombie.js";
import { Vector, Color, CollisionType, Shape, vec } from "excalibur"
import { Resources } from "../resources.js"
import { Player } from "../player/player.js";
import { Bullet } from "../weapons/bullet.js";

export class SlowZombie extends Zombie {
    #damage = 15; 
    #damageTimer = 0; 
    #damageCooldown = 500;
    #initializationDelay = 1000; 
    
    constructor() {
        super({
            width: 24, 
            height: 24,
            collisionType: CollisionType.Active 
        });
        
        // Set zombie eigenschappen via setters
        this.maxHealth = 30; 
        const slowSprites = [
            Resources.SlowZombie1,
            Resources.SlowZombie2
        ];const spriteIndex = Math.floor(Math.random() * slowSprites.length);
        const sprite = slowSprites[spriteIndex].toSprite();
        sprite.scale = new Vector(0.5, 0.5); 
        this.graphics.use(sprite);
        this.pos = new Vector(500, 300) 
    }onPreUpdate(engine, delta) {
        super.onPreUpdate(engine, delta);
        
        // Update initialisatie vertraging
        if (this.#initializationDelay > 0) {
            this.#initializationDelay -= delta;
            // Console.log voor initialisatievertraging
        }
        
        // Update damage timer
        if (this.#damageTimer > 0) {
            this.#damageTimer -= delta;
        }
        
        
        // Controleer alleen op collision na initialisation delay
        if (this.#initializationDelay <= 0) {
            this.checkPlayerCollision(engine, delta);
        }
    }

    checkPlayerCollision(engine, delta) {
        // Zoek player in de scene met dezelfde methode als base zombie class
        const player = engine.currentScene.actors.find(actor => actor instanceof Player);
        if (!player) return;

        // Controleer of zombie en player collision bodies overlappen
        const zombieBody = this.collider.bounds;
        const playerBody = player.collider.bounds;

        const isCurrentlyColliding = zombieBody.overlaps(playerBody);

        if (isCurrentlyColliding && this.#damageTimer <= 0) {
            player.takeHit(this.#damage);
            this.#damageTimer = this.#damageCooldown;
        }
    }

    onInitialize(engine) {
        super.onInitialize(engine);       
        // Vergroot collider naar schouder-breedte 
        const colliderWidth = 80; 
        const colliderHeight = 35; 
        const boxShape = Shape.Box(colliderWidth, colliderHeight);
        this.collider.set(boxShape);
        this.collider.useBoxCollision = true;
    }
}
