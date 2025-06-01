// Zombie-specifieke configuratie waarden
export const ZombieConfig = {
    // Base zombie properties
    BASE_WIDTH: 24,
    BASE_HEIGHT: 24,
    DEFAULT_MAX_HEALTH: 30,
    DEFAULT_MOVEMENT_SPEED: 50,
    
    // Zombie types configuratie
    SLOW_ZOMBIE: {
        MOVEMENT_SPEED: 50, 
        MAX_HEALTH: 30,
        DAMAGE: 15,
        SPRITE_SCALE: { x: 0.5, y: 0.5 },
        TINT_COLOR: { r: 100, g: 200, b: 255 }, 
        STARTING_POS: { x: 500, y: 300 }
    },
    
    FAST_ZOMBIE: {
        MOVEMENT_SPEED: 100,
        MAX_HEALTH: 10,
        DAMAGE: 25,
        SPRITE_SCALE: { x: 0.5, y: 0.5 },
        TINT_COLOR: { r: 255, g: 80, b: 80 },
        STARTING_POS: { x: 800, y: 300 },
        STARTING_VELOCITY: { x: -15, y: 0 }
    },
    
    // Collision detection
    COLLIDER_WIDTH: 80,
    COLLIDER_HEIGHT_SLOW: 35,
    COLLIDER_HEIGHT_FAST: 33,
    
    // Damage system
    DAMAGE_COOLDOWN: 500, 
    INITIALIZATION_DELAY: 1000, 
    
    // Knockback system
    KNOCKBACK_DURATION: 200, 
    KNOCKBACK_FRICTION: 0.95, 
    
    // Death/drop system
    AMMO_DROP_CHANCE: 0.25, 
    KILL_POINTS: 15 
};
