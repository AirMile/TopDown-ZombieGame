import { WeaponConfig } from '../config/index.js';

export class ReloadSystem {
    #isReloading
    #reloadTime
    #reloadTimer
    #ammoSystem
    #onReloadStartCallback
    #onReloadCompleteCallback
    #onReloadProgressCallback
    #uiManager

    constructor(ammoSystem, weaponConfig = WeaponConfig.PLAYER_WEAPON) {
        this.#ammoSystem = ammoSystem;
        this.#isReloading = false;
        this.#reloadTime = weaponConfig.RELOAD_TIME;
        this.#reloadTimer = 0;
        this.#onReloadStartCallback = null;
        this.#onReloadCompleteCallback = null;
        this.#onReloadProgressCallback = null;
        this.#uiManager = null;
        
        console.log(`ReloadSystem initialized: ${this.#reloadTime}ms reload time`);
    }

    // Reload status getters
    isReloading() {
        return this.#isReloading;
    }

    getReloadTime() {
        return this.#reloadTime;
    }

    getReloadTimeRemaining() {
        return Math.max(0, this.#reloadTimer);
    }

    getReloadProgress() {
        if (!this.#isReloading) {
            return 1.0;
        }
        
        return 1.0 - (this.#reloadTimer / this.#reloadTime);
    }

    // Reload capability checks
    canStartReload() {
        if (this.#isReloading) {
            return { canReload: false, reason: 'Already reloading' };
        }
        
        if (this.#ammoSystem.isMagazineFull()) {
            return { canReload: false, reason: 'Magazine already full' };
        }
        
        if (!this.#ammoSystem.hasAmmoForReload()) {
            return { canReload: false, reason: 'No ammo available' };
        }
        
        return { canReload: true, reason: 'Ready to reload' };
    }

    // Update methode voor timers
    update(delta) {
        if (this.#isReloading) {
            this.#reloadTimer -= delta;
            
            // Informeer voortgang als callback is ingesteld
            if (this.#onReloadProgressCallback) {
                this.#onReloadProgressCallback(this.getReloadProgress());
            }
            
            // Controleer of reload compleet is
            if (this.#reloadTimer <= 0) {
                this.#completeReload();
            }
        }
    }

    // Handmatige reload trigger
    startReload(isManual = false) {
        const reloadCheck = this.canStartReload();
        
        if (!reloadCheck.canReload) {
            console.log(`Reload blocked: ${reloadCheck.reason}`);
            
            // Toon UI feedback voor handmatige reloads
            if (isManual && this.#uiManager) {
                this.#showReloadFeedback(reloadCheck.reason, 'Orange');
            }
            
            return false;
        }

        // Start reload proces
        this.#isReloading = true;
        this.#reloadTimer = this.#reloadTime;
        
        console.log(`Reload started: ${this.#reloadTime}ms duration, manual=${isManual}`);
        
        // Informeer callbacks
        if (this.#onReloadStartCallback) {
            this.#onReloadStartCallback(isManual);
        }
        
        // Show UI feedback
        if (this.#uiManager) {
            this.#uiManager.showReloadIndicator(true);
            this.#showReloadFeedback('Reloading...', 'Green', this.#reloadTime);
        }
        
        return true;
    }

    // Automatische reload (wanneer magazine leeg is)
    triggerAutoReload() {
        if (this.#ammoSystem.isMagazineEmpty()) {
            return this.startReload(false);
        }
        
        return false;
    }

    // Handmatige reload (getriggerd door player input)
    triggerManualReload() {
        return this.startReload(true);
    }

    // Voltooi reload proces
    #completeReload() {
        if (!this.#isReloading) {
            return;
        }

        // Voer de daadwerkelijke ammo reload uit
        const reloadSuccess = this.#ammoSystem.performReload();
        
        if (reloadSuccess) {
            console.log('Reload completed successfully');
        } else {
            console.warn('Reload completed but no ammo was loaded');
        }

        // Reset reload status
        this.#isReloading = false;
        this.#reloadTimer = 0;
        
        // Informeer callbacks
        if (this.#onReloadCompleteCallback) {
            this.#onReloadCompleteCallback(reloadSuccess);
        }
        
        // Update UI
        if (this.#uiManager) {
            this.#uiManager.showReloadIndicator(false);
        }
    }

    // Forceer reload annulering (voor noodgevallen)
    cancelReload() {
        if (this.#isReloading) {
            this.#isReloading = false;
            this.#reloadTimer = 0;
            
            console.log('Reload cancelled');
            
            // Update UI
            if (this.#uiManager) {
                this.#uiManager.showReloadIndicator(false);
                this.#showReloadFeedback('Reload Cancelled', 'Red');
            }
        }
    }

    // UI integration
    setUIManager(uiManager) {
        this.#uiManager = uiManager;
    }

    #showReloadFeedback(message, color, duration = 1500) {
        if (this.#uiManager && this.#uiManager.createReloadFeedback) {
            this.#uiManager.createReloadFeedback(message, color, duration);
        }
    }

    // Callback setters
    setOnReloadStartCallback(callback) {
        this.#onReloadStartCallback = callback;
    }

    setOnReloadCompleteCallback(callback) {
        this.#onReloadCompleteCallback = callback;
    }

    setOnReloadProgressCallback(callback) {
        this.#onReloadProgressCallback = callback;
    }

    // Configuratie methodes
    setReloadTime(reloadTime) {
        this.#reloadTime = reloadTime;
        
        console.log(`Reload time set to: ${reloadTime}ms`);
    }

    // Reload snelheid modifiers (voor upgrades/power-ups)
    applyReloadSpeedModifier(multiplier) {
        const newReloadTime = this.#reloadTime * multiplier;
        this.setReloadTime(newReloadTime);
        
        console.log(`Reload speed modified by ${multiplier}x: ${this.#reloadTime}ms`);
    }

    // Reset systeem
    reset(weaponConfig = null) {
        this.#isReloading = false;
        this.#reloadTimer = 0;
        
        if (weaponConfig) {
            this.#reloadTime = weaponConfig.RELOAD_TIME;
        }
        
        console.log('ReloadSystem reset');
        
        // Update UI
        if (this.#uiManager) {
            this.#uiManager.showReloadIndicator(false);
        }
    }

    // Statistics
    getReloadStats() {
        return {
            isReloading: this.#isReloading,
            reloadTime: this.#reloadTime,
            timeRemaining: this.getReloadTimeRemaining(),
            progress: this.getReloadProgress(),
            canStartReload: this.canStartReload()
        };
    }

    // Debug methodes
    getDebugInfo() {
        return {
            ...this.getReloadStats(),
            ammoStats: this.#ammoSystem.getAmmoStats()
        };
    }

    // Validatie
    validate() {
        const issues = [];
        
        if (this.#reloadTime <= 0) {
            issues.push('Reload time must be positive');
        }
        
        if (this.#isReloading && this.#reloadTimer < 0) {
            issues.push('Reload timer cannot be negative during reload');
        }
        
        if (!this.#ammoSystem) {
            issues.push('AmmoSystem reference is required');
        }
        
        if (issues.length > 0) {
            console.warn('ReloadSystem validation issues:', issues);
        }
        
        return issues.length === 0;
    }
}
