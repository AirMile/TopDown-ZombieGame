// Weapon and bullet configuration values
export const WeaponConfig = {
    // Player weapon settings
    PLAYER_WEAPON: {
        MAX_BULLETS: 35, // Magazine size
        FIRE_RATE: 100, // ms between shots
        RELOAD_TIME: 2500, // ms for reload
        STARTING_TOTAL_AMMO: 250,
        BULLET_OFFSET: 5 // Distance from player center when spawning bullet
    },
    
    // Bullet properties
    BULLET: {
        RANGE: 800, // Maximum distance bullet can travel
        LIFETIME: 5000, // ms before bullet expires
        DAMAGE: 10, // Damage dealt to zombies
        KNOCKBACK_STRENGTH: 80 // Force applied to zombies on hit
    },
    
    // Ammo pickup system
    AMMO_PICKUP: {
        AMMO_AMOUNT: 50 // Ammo added per pickup
    }
};
