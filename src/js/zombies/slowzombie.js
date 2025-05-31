import { Zombie } from "./zombie.js";
import { Vector, Color, CollisionType, Shape } from "excalibur";
import { Resources } from "../resources.js";
import { ZombieConfig } from "../config/zombieconfig.js";

export class SlowZombie extends Zombie {    
    constructor() {
        super({
            width: ZombieConfig.BASE_WIDTH,
            height: ZombieConfig.BASE_HEIGHT,
            collisionType: CollisionType.Active
        });

        // Slow zombie specific properties
        this.damage = ZombieConfig.SLOW_ZOMBIE.DAMAGE;
        this.maxHealth = ZombieConfig.SLOW_ZOMBIE.MAX_HEALTH;
        this.health = this.maxHealth;
        this.movementSpeed = ZombieConfig.SLOW_ZOMBIE.MOVEMENT_SPEED;
        
        // Initialize subsystems with slow zombie values
        this.initializeSubsystems(this.damage, this.movementSpeed);
        
        // Setup graphics using graphics system
        this.graphicsSystem.setupSlowZombieSprite(
            ZombieConfig.SLOW_ZOMBIE.SPRITE_SCALE,
            ZombieConfig.SLOW_ZOMBIE.TINT_COLOR
        );
        
        this.pos = new Vector(
            ZombieConfig.SLOW_ZOMBIE.STARTING_POS.x, 
            ZombieConfig.SLOW_ZOMBIE.STARTING_POS.y
        );
        
        console.log("SlowZombie created with subsystem architecture");
    }

    // Handle player interaction using subsystems
    handlePlayerInteraction(engine, delta) {
        // Only handle interaction if damage system is ready
        if (!this.damageSystem.isReady()) {
            return;
        }
        
        // Check for collision with player
        const collisionResult = this.collisionSystem.checkPlayerCollision(engine);
        
        if (collisionResult && collisionResult.isColliding) {
            // Deal damage to player using damage system
            this.damageSystem.dealDamageToPlayer(collisionResult.player);
        }
    }

    onInitialize(engine) {
        super.onInitialize(engine);
        
        // Setup collision shape
        const colliderWidth = ZombieConfig.COLLIDER_WIDTH;
        const colliderHeight = ZombieConfig.COLLIDER_HEIGHT_SLOW;
        
        const boxShape = Shape.Box(colliderWidth, colliderHeight);
        this.collider.set(boxShape);
        
        // Enable box collision with rotation support
        this.collider.useBoxCollision = true;
        this.body.useBoxCollision = true;
        
        // Enable debug graphics using graphics system
        this.graphicsSystem.showDebug(true);
        
        console.log(`SlowZombie initialized: collider=${colliderWidth}x${colliderHeight}`);
    }
}
