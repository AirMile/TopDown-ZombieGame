// Main configuration file - exports all config modules
import { GameConfig } from './gameconfig.js';
import { PlayerConfig } from './playerconfig.js';
import { ZombieConfig } from './zombieconfig.js';
import { WeaponConfig } from './weaponconfig.js';
import { UIConfig } from './uiconfig.js';
import { SpawnerConfig } from './spawnerconfig.js';

// Export individual configs
export { GameConfig, PlayerConfig, ZombieConfig, WeaponConfig, UIConfig, SpawnerConfig };

// Convenience object for importing all configs at once
export const Config = {
    Game: GameConfig,
    Player: PlayerConfig,
    Zombie: ZombieConfig,
    Weapon: WeaponConfig,
    UI: UIConfig,
    Spawner: SpawnerConfig
};

console.log('Config system loaded: all magic numbers centralized in /src/js/config/');
