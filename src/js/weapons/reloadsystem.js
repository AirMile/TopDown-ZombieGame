import { WeaponConfig } from '../config/index.js';

export class ReloadSystem {
    #isReloading;
    #reloadTime;
    #reloadTimer;
    #ammoSystem;
    #onReloadStartCallback;
    #onReloadCompleteCallback;
    #onReloadProgressCallback;
    #uiManager;

    constructor(ammoSystem, weaponConfig = WeaponConfig.PLAYER_WEAPON) {
        this.#ammoSystem = ammoSystem;
        this.#isReloading = false;
        this.#reloadTime = weaponConfig.RELOAD_TIME;
        this.#reloadTimer = 0;
        this.#onReloadStartCallback = null;
        this.#onReloadCompleteCallback = null;
        this.#onReloadProgressCallback = null;
        this.#uiManager = null;
        
        console.log(`ReloadSystem initialized: reloadTime=${this.#reloadTime}ms, ammoSystem=${ammoSystem ? 'provided' : 'null'}`);
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
        let canReload = true;
        let reason = 'Ready to reload';

        if (this.#isReloading) {
            canReload = false;
            reason = 'Already reloading';
        } else if (this.#ammoSystem.isMagazineFull()) {
            canReload = false;
            reason = 'Magazine already full';
        } else if (!this.#ammoSystem.hasAmmoForReload()) {
            canReload = false;
            reason = 'No ammo available';
        }
        console.log(`canStartReload called: canReload=${canReload}, reason='${reason}', isReloading=${this.#isReloading}, magazineFull=${this.#ammoSystem.isMagazineFull()}, hasAmmoForReload=${this.#ammoSystem.hasAmmoForReload()}`);
        return { canReload, reason };
    }

    // Update methode voor timers
    update(delta) {
        if (this.#isReloading) {
            this.#reloadTimer -= delta;
            
            if (this.#onReloadProgressCallback) {
                this.#onReloadProgressCallback(this.getReloadProgress());
            }
            
            if (this.#reloadTimer <= 0) {
                console.log('Reload timer reached zero, completing reload.');
                this.#completeReload();
            }
        }
    }

    // Handmatige reload trigger
    startReload(isManual = false) {
        const reloadCheck = this.canStartReload();
        
        if (!reloadCheck.canReload) {
            console.log(`Reload blocked: reason='${reloadCheck.reason}', isManual=${isManual}`);
            
            if (isManual && this.#uiManager) {
                this.#showReloadFeedback(reloadCheck.reason, 'Orange');
            }
            return false;
        }

        this.#isReloading = true;
        this.#reloadTimer = this.#reloadTime;
        console.log(`Reload started: duration=${this.#reloadTime}ms, isManual=${isManual}, reloadTimer=${this.#reloadTimer}`);
        
        if (this.#onReloadStartCallback) {
            console.log('Calling onReloadStartCallback.');
            this.#onReloadStartCallback(isManual);
        }
        
        if (this.#uiManager) {
            console.log('Showing reload indicator and feedback via UIManager.');
            this.#uiManager.showReloadIndicator(true);
            this.#showReloadFeedback('Reloading...', 'Green', this.#reloadTime);
        }
        return true;
    }

    triggerAutoReload() {
        console.log(`triggerAutoReload called: magazineEmpty=${this.#ammoSystem.isMagazineEmpty()}`);
        if (this.#ammoSystem.isMagazineEmpty()) {
            return this.startReload(false);
        }
        return false;
    }

    triggerManualReload() {
        console.log('triggerManualReload called.');
        return this.startReload(true);
    }

    #completeReload() {
        if (!this.#isReloading) {
            console.log('#completeReload called but not currently reloading. Aborting.');
            return;
        }

        const reloadSuccess = this.#ammoSystem.performReload();
        if (reloadSuccess) {
            console.log(`Reload completed successfully: ammoSystem.performReload returned=${reloadSuccess}`);
        } else {
            console.warn(`Reload completed but no ammo was loaded: ammoSystem.performReload returned=${reloadSuccess}`);
        }

        this.#isReloading = false;
        this.#reloadTimer = 0;
        console.log(`Reload status reset: isReloading=${this.#isReloading}, reloadTimer=${this.#reloadTimer}`);
        
        if (this.#onReloadCompleteCallback) {
            console.log('Calling onReloadCompleteCallback.');
            this.#onReloadCompleteCallback(reloadSuccess);
        }
        
        if (this.#uiManager) {
            console.log('Hiding reload indicator via UIManager.');
            this.#uiManager.showReloadIndicator(false);
        }
    }

    cancelReload() {
        if (this.#isReloading) {
            const oldTimer = this.#reloadTimer;
            this.#isReloading = false;
            this.#reloadTimer = 0;
            console.log(`Reload cancelled: wasReloading=true, oldTimer=${oldTimer.toFixed(0)}, newTimer=${this.#reloadTimer}`);
            
            if (this.#uiManager) {
                console.log('Hiding reload indicator and showing cancel feedback via UIManager.');
                this.#uiManager.showReloadIndicator(false);
                this.#showReloadFeedback('Reload Cancelled', 'Red');
            }
        } else {
            console.log('cancelReload called but not currently reloading.');
        }
    }

    setUIManager(uiManager) {
        this.#uiManager = uiManager;
        console.log(`UIManager ${uiManager ? 'set' : 'cleared'} for ReloadSystem.`);
    }

    #showReloadFeedback(message, color, duration = 1500) {
        if (this.#uiManager && this.#uiManager.createReloadFeedback) {
            console.log(`Showing reload feedback: message='${message}', color='${color}', duration=${duration}`);
            this.#uiManager.createReloadFeedback(message, color, duration);
        } else {
            console.log(`Cannot show reload feedback: UIManager or createReloadFeedback not available. Message='${message}'`);
        }
    }

    setOnReloadStartCallback(callback) {
        this.#onReloadStartCallback = callback;
        console.log(`onReloadStartCallback ${callback ? 'set' : 'cleared'}.`);
    }

    setOnReloadCompleteCallback(callback) {
        this.#onReloadCompleteCallback = callback;
        console.log(`onReloadCompleteCallback ${callback ? 'set' : 'cleared'}.`);
    }

    setOnReloadProgressCallback(callback) {
        this.#onReloadProgressCallback = callback;
        console.log(`onReloadProgressCallback ${callback ? 'set' : 'cleared'}.`);
    }

    setReloadTime(reloadTime) {
        const oldReloadTime = this.#reloadTime;
        this.#reloadTime = reloadTime;
        console.log(`Reload time set: oldTime=${oldReloadTime}ms, newTime=${this.#reloadTime}ms`);
    }

    applyReloadSpeedModifier(multiplier) {
        const oldReloadTime = this.#reloadTime;
        const newReloadTime = this.#reloadTime * multiplier;
        this.setReloadTime(newReloadTime);
        console.log(`Reload speed modified: multiplier=${multiplier}x, oldTime=${oldReloadTime.toFixed(0)}ms, newTime=${this.#reloadTime.toFixed(0)}ms`);
    }

    reset(weaponConfig = null) {
        const wasReloading = this.#isReloading;
        this.#isReloading = false;
        this.#reloadTimer = 0;
        
        if (weaponConfig) {
            const oldConfigTime = this.#reloadTime;
            this.#reloadTime = weaponConfig.RELOAD_TIME;
            console.log(`ReloadSystem reset: wasReloading=${wasReloading}, newReloadTime=${this.#reloadTime}ms (from weaponConfig), oldConfigTime=${oldConfigTime}ms`);
        } else {
            console.log(`ReloadSystem reset: wasReloading=${wasReloading}, reloadTime remains ${this.#reloadTime}ms (no weaponConfig provided)`);
        }
        
        if (this.#uiManager) {
            console.log('Hiding reload indicator on reset via UIManager.');
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
