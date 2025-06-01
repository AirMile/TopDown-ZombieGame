import { Zombie } from "./zombie.js"
import { Vector, Color, CollisionType, Shape, vec } from "excalibur"
import { Resources } from "../resources.js"
import { Player } from "../player/player.js";
import { Bullet } from "../weapons/bullet.js";

export class FastZombie extends Zombie {    
    #damage = 25; 
    #damageTimer = 0; 
    #damageCooldown = 500; 
    #initializationDelay = 1000; 

    constructor() {
        super({
            width: 24, 
            height: 24,
            collisionType: CollisionType.Active 
        });
        this.movementSpeed = 100; 
        // Zombie eigenschappen
        this.maxHealth = 10;

        // Kies random sprite
        const fastSprites = [
            Resources.FastZombie1,
            Resources.FastZombie2,
            Resources.FastZombie3,
            Resources.FastZombie4
        ];const spriteIndex = Math.floor(Math.random() * fastSprites.length);
        const sprite = fastSprites[spriteIndex].toSprite();
        sprite.scale = new Vector(0.5, 0.5); 
        sprite.tint = Color.fromRGB(255, 80, 80); 
        this.graphics.use(sprite);
        this.pos = new Vector(800, 300)
        this.vel = new Vector(-15, 0)
        

    }    onPreUpdate(engine, delta) {
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
        
        // Log rotatie voor debug (elke 60 frames = ongeveer 1x per seconde)
        if (Math.random() < 0.016) { // ~1/60 kans per frame
            const rotationDegrees = (this.rotation * 180 / Math.PI).toFixed(1);
            // console.log(`FastZombie rotation: ${rotationDegrees} degrees, pos: ${this.pos.x.toFixed(1)},${this.pos.y.toFixed(1)}, initializationDelay: ${this.#initializationDelay > 0}, damageTimer: ${this.#damageTimer > 0}`);
        }
        
        // Controleer alleen op collision na initialisatie vertraging
        if (this.#initializationDelay <= 0) {
            this.checkPlayerCollision(engine, delta);
        }
    }

    checkPlayerCollision(engine, delta) {
        const player = engine.currentScene.actors.find(actor => actor instanceof Player);
        if (!player) return;

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
        const colliderWidth = 80;
        const colliderHeight = 33;
        if (this.collider) {
            const boxShape = Shape.Box(colliderWidth, colliderHeight);
            this.collider.set(boxShape);
            this.collider.useBoxCollision = true;
        }
        if (this.body) {
            this.body.useBoxCollision = true;
        }
    }
}
