// Zombie-specific configuration values
export const ZombieConfig = {
    // Base zombie properties
    BASE_WIDTH: 24,
    BASE_HEIGHT: 24,
    DEFAULT_MAX_HEALTH: 30,
    DEFAULT_MOVEMENT_SPEED: 50,
    
    // Zombie types configuration
    SLOW_ZOMBIE: {
        MOVEMENT_SPEED: 50, // Inherited from base
        MAX_HEALTH: 30,
        DAMAGE: 15,
        SPRITE_SCALE: { x: 0.5, y: 0.5 },
        TINT_COLOR: { r: 100, g: 200, b: 255 }, // Light blue tint
        STARTING_POS: { x: 500, y: 300 }
    },
    
    FAST_ZOMBIE: {
        MOVEMENT_SPEED: 100,
        MAX_HEALTH: 10,
        DAMAGE: 25,
        SPRITE_SCALE: { x: 0.5, y: 0.5 },
        TINT_COLOR: { r: 255, g: 80, b: 80 }, // Reddish tint
        STARTING_POS: { x: 800, y: 300 },
        STARTING_VELOCITY: { x: -15, y: 0 }
    },
    
    // Collision detection
    COLLIDER_WIDTH: 80,
    COLLIDER_HEIGHT_SLOW: 35,
    COLLIDER_HEIGHT_FAST: 33,
    
    // Damage system
    DAMAGE_COOLDOWN: 500, // ms between damage applications
    INITIALIZATION_DELAY: 1000, // ms delay before zombie can deal damage
    
    // Knockback system
    KNOCKBACK_DURATION: 200, // ms
    KNOCKBACK_FRICTION: 0.95, // velocity reduction per frame during knockback
    
    // Death/drop system
    AMMO_DROP_CHANCE: 0.25, // 25% chance to drop ammo
    KILL_POINTS: 15 // Points awarded for killing any zombie
};
