import { Weapon } from "../weapons/weapon.js";
import { WeaponConfig } from "../config/weaponconfig.js";

export class PlayerWeapon extends Weapon {
    constructor(player, uiManager = null) {
        // Initialize with player weapon configuration
        super(player, WeaponConfig.PLAYER_WEAPON);
        
        // Set UI manager if provided
        if (uiManager) {
            this.setUIManager(uiManager);
        }
        
        console.log('PlayerWeapon initialized extending base Weapon class');
    }

    // Player-specific weapon methods can be added here
    // For now, all functionality is inherited from the base Weapon class
}