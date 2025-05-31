import { WeaponConfig } from '../config/index.js';

export class AmmoSystem {
    #maxBullets
    #bulletsFired
    #totalAmmo
    #onAmmoChangeCallback

    constructor(weaponConfig = WeaponConfig.PLAYER_WEAPON) {
        this.#maxBullets = weaponConfig.MAX_BULLETS;
        this.#bulletsFired = 0;
        this.#totalAmmo = weaponConfig.STARTING_TOTAL_AMMO;
        this.#onAmmoChangeCallback = null;
        
        console.log(`AmmoSystem initialized: ${this.getCurrentAmmo()}/${this.#maxBullets} in magazine, ${this.#totalAmmo} total`);
    }

    // Ammo getters
    getCurrentAmmo() {
        return this.#maxBullets - this.#bulletsFired;
    }

    getMaxBullets() {
        return this.#maxBullets;
    }

    getTotalAmmo() {
        return this.#totalAmmo;
    }

    getBulletsFired() {
        return this.#bulletsFired;
    }

    // Ammo state checks
    canShoot() {
        return this.getCurrentAmmo() > 0;
    }

    isMagazineEmpty() {
        return this.#bulletsFired >= this.#maxBullets;
    }

    isMagazineFull() {
        return this.#bulletsFired === 0;
    }

    hasAmmoForReload() {
        return this.#totalAmmo > 0;
    }

    needsReload() {
        return this.#bulletsFired > 0 && this.#totalAmmo > 0;
    }

    // Shooting ammo consumption
    consumeBullet() {
        if (!this.canShoot()) {
            console.warn('Cannot consume bullet: no ammo available');
            return false;
        }

        this.#bulletsFired++;
        
        console.log(`Bullet consumed: ${this.getCurrentAmmo()}/${this.#maxBullets} remaining in magazine`);
        
        this.#notifyAmmoChange();
        
        return true;
    }

    // Reload system
    calculateReloadAmount() {
        const bulletsNeeded = this.#bulletsFired;
        const bulletsToReload = Math.min(bulletsNeeded, this.#totalAmmo);
        
        return {
            needed: bulletsNeeded,
            available: this.#totalAmmo,
            willReload: bulletsToReload
        };
    }

    performReload() {
        const reloadInfo = this.calculateReloadAmount();
        
        if (reloadInfo.willReload <= 0) {
            console.warn('Cannot reload: no ammo available or magazine already full');
            return false;
        }

        // Update ammo counts
        this.#totalAmmo -= reloadInfo.willReload;
        this.#bulletsFired -= reloadInfo.willReload;
        
        console.log(`Reload completed: loaded ${reloadInfo.willReload} bullets, ${this.getCurrentAmmo()}/${this.#maxBullets} in magazine, ${this.#totalAmmo} total remaining`);
        
        this.#notifyAmmoChange();
        
        return true;
    }

    // Ammo pickup system
    addAmmo(amount, source = 'pickup') {
        if (amount <= 0) {
            console.warn('Cannot add ammo: invalid amount', amount);
            return 0;
        }

        const oldTotal = this.#totalAmmo;
        this.#totalAmmo += amount; // Unlimited ammo system
        const actualAdded = this.#totalAmmo - oldTotal;
        
        console.log(`Ammo added: +${actualAdded} from ${source}, total: ${this.#totalAmmo}`);
        
        this.#notifyAmmoChange();
        
        return actualAdded;
    }

    // Ammo statistics
    getAmmoStats() {
        return {
            currentAmmo: this.getCurrentAmmo(),
            maxBullets: this.#maxBullets,
            totalAmmo: this.#totalAmmo,
            bulletsFired: this.#bulletsFired,
            magazinePercentage: this.getCurrentAmmo() / this.#maxBullets,
            canShoot: this.canShoot(),
            isMagazineEmpty: this.isMagazineEmpty(),
            isMagazineFull: this.isMagazineFull(),
            hasAmmoForReload: this.hasAmmoForReload(),
            needsReload: this.needsReload()
        };
    }

    // Magazine management
    emptyMagazine() {
        this.#bulletsFired = this.#maxBullets;
        this.#notifyAmmoChange();
        
        console.log('Magazine emptied');
    }

    fillMagazine() {
        this.#bulletsFired = 0;
        this.#notifyAmmoChange();
        
        console.log('Magazine filled');
    }

    // Callback system
    setOnAmmoChangeCallback(callback) {
        this.#onAmmoChangeCallback = callback;
    }

    #notifyAmmoChange() {
        if (this.#onAmmoChangeCallback) {
            this.#onAmmoChangeCallback(this.getAmmoStats());
        }
    }

    // Configuration methods
    setMaxBullets(maxBullets) {
        this.#maxBullets = maxBullets;
        
        // Ensure bulletsFired doesn't exceed new max
        if (this.#bulletsFired > this.#maxBullets) {
            this.#bulletsFired = this.#maxBullets;
        }
        
        this.#notifyAmmoChange();
        
        console.log(`Max bullets set to: ${maxBullets}`);
    }

    setTotalAmmo(totalAmmo) {
        this.#totalAmmo = Math.max(0, totalAmmo);
        this.#notifyAmmoChange();
        
        console.log(`Total ammo set to: ${this.#totalAmmo}`);
    }

    // Reset system
    reset(weaponConfig = null) {
        if (weaponConfig) {
            this.#maxBullets = weaponConfig.MAX_BULLETS;
            this.#totalAmmo = weaponConfig.STARTING_TOTAL_AMMO;
        }
        
        this.#bulletsFired = 0;
        
        console.log('AmmoSystem reset');
        
        this.#notifyAmmoChange();
    }

    // Debug methods
    getDebugInfo() {
        return {
            ...this.getAmmoStats(),
            reloadInfo: this.calculateReloadAmount()
        };
    }

    // Validation
    validate() {
        const issues = [];
        
        if (this.#bulletsFired < 0) {
            issues.push('Bullets fired cannot be negative');
        }
        
        if (this.#bulletsFired > this.#maxBullets) {
            issues.push('Bullets fired exceeds magazine capacity');
        }
        
        if (this.#totalAmmo < 0) {
            issues.push('Total ammo cannot be negative');
        }
        
        if (issues.length > 0) {
            console.warn('AmmoSystem validation issues:', issues);
        }
        
        return issues.length === 0;
    }
}
