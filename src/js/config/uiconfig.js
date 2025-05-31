// UI configuration values
export const UIConfig = {
    // Health bar settings
    HEALTH_BAR: {
        WIDTH: 200,
        HEIGHT: 20,
        X: 20,
        Y: 20,
        BACKGROUND_COLOR: { r: 50, g: 50, b: 50 }, // Dark gray
        FOREGROUND_COLOR: 'Green',
        Z_INDEX_BG: 98,
        Z_INDEX_FG: 99
    },
    
    // Ammo counter settings
    AMMO_COUNTER: {
        FONT_SIZE: 24,
        FONT_FAMILY: 'Arial',
        COLOR: 'White',
        X_OFFSET: 20, // Distance from right edge
        Y: 20,
        Z_INDEX: 99
    },
    
    // Score counter settings
    SCORE_COUNTER: {
        FONT_SIZE: 24,
        FONT_FAMILY: 'Arial',
        COLOR: 'White',
        X: 20,
        Y: 60,
        Z_INDEX: 99
    },
    
    // Reload indicator settings
    RELOAD_INDICATOR: {
        FONT_SIZE: 32,
        FONT_FAMILY: 'Arial',
        COLOR: 'Orange',
        Z_INDEX: 100
    },
    
    // Reload feedback settings
    RELOAD_FEEDBACK: {
        DEFAULT_DURATION: 1500, // ms
        RELOAD_DURATION: 2500, // ms for actual reload feedback
        FONT_SIZE: 24,
        FONT_FAMILY: 'Arial',
        Y_OFFSET: 100, // Distance below center
        Z_INDEX: 101,
        COLORS: {
            GREEN: 'Green',
            ORANGE: 'Orange',
            YELLOW: 'Yellow',
            RED: 'Red',
            WHITE: 'White'
        }
    },
    
    // Ammo color thresholds
    AMMO_COLOR_THRESHOLDS: {
        HIGH: 100, // Above this = white
        MEDIUM: 50 // Between medium and high = yellow, below medium = red
    }
};
