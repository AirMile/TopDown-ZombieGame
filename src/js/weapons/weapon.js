import { Vector } from 'excalibur';
import { Bullet } from './bullet.js';
import { AmmoSystem } from './ammosystem.js';
import { ReloadSystem } from './reloadsystem.js';
import { WeaponConfig } from '../config/index.js';

export class Weapon {
    #owner
    #ammoSystem
    #reloadSystem
    #fireRate
    #fireCooldown
    #bulletOffset
    #uiManager

    constructor(owner, weaponConfig = WeaponConfig.PLAYER_WEAPON) {
        this.#owner = owner;
        this.#fireRate = weaponConfig.FIRE_RATE;
        this.#fireCooldown = 0;
        this.#bulletOffset = weaponConfig.BULLET_OFFSET;
        this.#uiManager = null;
        
        // Initialize subsystems
        this.#ammoSystem = new AmmoSystem(weaponConfig);
        this.#reloadSystem = new ReloadSystem(this.#ammoSystem, weaponConfig);
        
        // Setup system callbacks
        this.#setupCallbacks();
        
        console.log('Weapon initialized with ammo and reload systems');
    }

    #setupCallbacks() {
        // Ammo system callbacks
        this.#ammoSystem.setOnAmmoChangeCallback((stats) => {
            this.#updateAmmoUI();
            
            // Auto-reload when magazine is empty
            if (stats.isMagazineEmpty && stats.hasAmmoForReload) {
                this.#reloadSystem.triggerAutoReload();
            }
        });

        // Reload system callbacks
        this.#reloadSystem.setOnReloadStartCallback((isManual) => {
            console.log(`Weapon reload started: manual=${isManual}`);
        });

        this.#reloadSystem.setOnReloadCompleteCallback((success) => {
            console.log(`Weapon reload completed: success=${success}`);
            this.#updateAmmoUI();
        });
    }

    // Update method
    update(delta) {
        // Update fire cooldown
        if (this.#fireCooldown > 0) {
            this.#fireCooldown -= delta;
        }

        // Update reload system
        this.#reloadSystem.update(delta);
    }

    // Shooting system
    canShoot() {
        return !this.#reloadSystem.isReloading() && 
               this.#fireCooldown <= 0 && 
               this.#ammoSystem.canShoot();
    }

    shoot() {
        if (!this.canShoot()) {
            return false;
        }

        // Calculate bullet spawn position and direction
        const direction = Vector.fromAngle(this.#owner.rotation);
        const bulletStart = this.#owner.pos.add(
            direction.scale(this.#owner.width / 2 + this.#bulletOffset)
        );

        // Create and spawn bullet
        const bullet = new Bullet(bulletStart.x, bulletStart.y, direction);
        
        if (this.#owner.scene?.engine) {
            this.#owner.scene.engine.add(bullet);
        }

        // Trigger shooting animation on owner
        if (this.#owner.startShootingAnimation) {
            this.#owner.startShootingAnimation();
        }

        // Consume ammo and set cooldown
        this.#ammoSystem.consumeBullet();
        this.#fireCooldown = this.#fireRate;

        console.log(`Weapon fired: ${this.#ammoSystem.getCurrentAmmo()}/${this.#ammoSystem.getMaxBullets()} ammo remaining`);

        return true;
    }

    // Reload system delegation
    manualReload() {
        return this.#reloadSystem.triggerManualReload();
    }

    get reloading() {
        return this.#reloadSystem.isReloading();
    }

    getReloadProgress() {
        return this.#reloadSystem.getReloadProgress();
    }

    // Ammo system delegation
    getCurrentAmmo() {
        return this.#ammoSystem.getCurrentAmmo();
    }

    getTotalAmmo() {
        return this.#ammoSystem.getTotalAmmo();
    }

    get maxBullets() {
        return this.#ammoSystem.getMaxBullets();
    }

    addAmmo(amount, source = 'pickup') {
        return this.#ammoSystem.addAmmo(amount, source);
    }

    // UI integration
    setUIManager(uiManager) {
        this.#uiManager = uiManager;
        this.#reloadSystem.setUIManager(uiManager);
        this.#updateAmmoUI();
    }

    #updateAmmoUI() {
        if (this.#uiManager) {
            const currentAmmo = this.#ammoSystem.getCurrentAmmo();
            const maxBullets = this.#ammoSystem.getMaxBullets();
            const totalAmmo = this.#ammoSystem.getTotalAmmo();
            
            this.#uiManager.updateAmmo(currentAmmo, maxBullets, totalAmmo);
        }
    }

    // Weapon configuration
    setFireRate(fireRate) {
        this.#fireRate = fireRate;
        console.log(`Fire rate set to: ${fireRate}ms`);
    }

    getFireRate() {
        return this.#fireRate;
    }

    setBulletOffset(offset) {
        this.#bulletOffset = offset;
        console.log(`Bullet offset set to: ${offset}`);
    }

    // Weapon upgrades/modifiers
    applyFireRateModifier(multiplier) {
        this.#fireRate = this.#fireRate * multiplier;
        console.log(`Fire rate modified by ${multiplier}x: ${this.#fireRate}ms`);
    }

    applyReloadSpeedModifier(multiplier) {
        this.#reloadSystem.applyReloadSpeedModifier(multiplier);
    }

    increaseMagazineSize(extraBullets) {
        const newMaxBullets = this.#ammoSystem.getMaxBullets() + extraBullets;
        this.#ammoSystem.setMaxBullets(newMaxBullets);
        console.log(`Magazine size increased by ${extraBullets}: ${newMaxBullets} total`);
    }

    // Weapon stats
    getWeaponStats() {
        return {
            fireRate: this.#fireRate,
            fireCooldown: this.#fireCooldown,
            canShoot: this.canShoot(),
            ammoStats: this.#ammoSystem.getAmmoStats(),
            reloadStats: this.#reloadSystem.getReloadStats()
        };
    }

    // Reset weapon
    reset(weaponConfig = null) {
        this.#fireCooldown = 0;
        this.#ammoSystem.reset(weaponConfig);
        this.#reloadSystem.reset(weaponConfig);
        
        if (weaponConfig) {
            this.#fireRate = weaponConfig.FIRE_RATE;
            this.#bulletOffset = weaponConfig.BULLET_OFFSET;
        }
        
        console.log('Weapon reset');
        
        this.#updateAmmoUI();
    }

    // Debug methods
    getDebugInfo() {
        return {
            weapon: {
                fireRate: this.#fireRate,
                fireCooldown: this.#fireCooldown,
                bulletOffset: this.#bulletOffset,
                canShoot: this.canShoot()
            },
            ammo: this.#ammoSystem.getDebugInfo(),
            reload: this.#reloadSystem.getDebugInfo()
        };
    }

    // Validation
    validate() {
        const issues = [];
        
        if (!this.#owner) {
            issues.push('Weapon owner is required');
        }
        
        if (this.#fireRate <= 0) {
            issues.push('Fire rate must be positive');
        }
        
        if (!this.#ammoSystem.validate()) {
            issues.push('AmmoSystem validation failed');
        }
        
        if (!this.#reloadSystem.validate()) {
            issues.push('ReloadSystem validation failed');
        }
        
        if (issues.length > 0) {
            console.warn('Weapon validation issues:', issues);
        }
        
        return issues.length === 0;
    }
}
