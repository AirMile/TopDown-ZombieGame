// Game-wide configuration values
export const GameConfig = {
    // Screen/Display settings
    SCREEN_WIDTH: 1280,
    SCREEN_HEIGHT: 720,
    MAX_FPS: 60,
    
    // Game states
    GAME_STATES: {
        MENU: 'MENU',
        PLAYING: 'PLAYING',
        GAME_OVER: 'GAME_OVER'
    },
    
    // Game world settings
    WORLD_WIDTH: 20000,
    WORLD_HEIGHT: 20000,
    
    // Camera settings
    CAMERA_ROTATION_OFFSET: Math.PI / 2 + Math.PI, // 180 degree offset from player
    
    // Game timing
    SHOOTING_DELAY_TIME: 500, // ms delay before shooting is enabled after game start
    
    // Debug settings
    SHOW_DEBUG_GRAPHICS: true
};
