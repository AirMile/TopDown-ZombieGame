// Zombie spawner configuration values
export const SpawnerConfig = {
    // Continuous spawning settings
    INITIAL_SPAWN_INTERVAL: 1500, // ms - Starting spawn rate
    MIN_SPAWN_INTERVAL: 300, // ms - Fastest possible spawn rate
    SPAWN_DISTANCE_FROM_SCREEN: 100, // pixels outside screen edge
    
    // Difficulty progression
    DIFFICULTY: {
        STARTING_DIFFICULTY: 1,
        INCREASE_RATE: 0.15, // How much difficulty increases each interval
        INCREASE_INTERVAL: 7000, // ms - How often difficulty increases
        BASE_ZOMBIES_MULTIPLIER: 1.2, // Zombies per wave = 1 + (difficulty-1) * this
        MAX_ZOMBIES_PER_WAVE: 6
    },
    
    // Zombie type chances
    FAST_ZOMBIE_CHANCE: {
        INITIAL: 0.3, // 30% at start
        MAX: 0.85, // 85% maximum
        INCREASE_RATE: 0.12 // How much it increases per difficulty level
    },
    
    // Spawn patterns
    SPAWN_PATTERNS: {
        LINE_SPACING: 40, // pixels between zombies in line pattern
        CIRCLE_RADIUS: 60, // pixels radius for circle pattern
        CLUSTER_MAX_SPREAD: 80 // pixels max spread for cluster pattern
    }
};
