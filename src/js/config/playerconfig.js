// Player-specific configuration values
export const PlayerConfig = {
    // Physical properties
    WIDTH: 32,
    HEIGHT: 32,
    
    // Starting position
    START_X: 100,
    START_Y: 100,
    
    // Health system
    MAX_HEALTH: 100,
    INVULNERABILITY_TIME: 1000, // 1 second in ms
    
    // Movement settings
    BASE_SPEED: 150,
    ROTATION_SPEED: 0.02, // radians per frame
    
    // Sprite scaling
    NORMAL_SPRITE_SCALE: { x: 0.9, y: 0.9 },
    SHOOTING_SPRITE_SCALE: { x: 2.2, y: 2.2 },
    
    // Sprite rotation offsets
    NORMAL_SPRITE_ROTATION: -Math.PI / 2,
    SHOOTING_SPRITE_ROTATION: 0,
      // Animation timing
    SHOOTING_ANIMATION_DURATION: 150, // ms
    SHOOTING_DELAY_TIME: 500, // ms delay before shooting is enabled after game start
    
    // Collider settings
    COLLIDER_WIDTH: 10,
    COLLIDER_HEIGHT: 10,
    COLLIDER_OFFSET_X: 2,
    COLLIDER_OFFSET_Y: 1.25
};
