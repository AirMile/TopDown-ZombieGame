// Game-brede configuratie waarden
export const GameConfig = {
    // Scherm/Display instellingen
    SCREEN_WIDTH: 1280,
    SCREEN_HEIGHT: 720,
    MAX_FPS: 60,
    
    // Game states
    GAME_STATES: {
        MENU: 'MENU',
        PLAYING: 'PLAYING',
        GAME_OVER: 'GAME_OVER'
    },
    
    // Game wereld instellingen
    WORLD_WIDTH: 20000,
    WORLD_HEIGHT: 20000,
    
    // Camera instellingen
    CAMERA_ROTATION_OFFSET: Math.PI / 2 + Math.PI, // 180 graden
    
    // Game timing
    SHOOTING_DELAY_TIME: 500, 
    
    // Debug instellingen
    SHOW_DEBUG_GRAPHICS: true
};
