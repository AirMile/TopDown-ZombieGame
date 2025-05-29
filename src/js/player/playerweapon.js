import { Vector } from "excalibur";
import { Bullet } from "../bullet.js";

export class PlayerWeapon {
    fireCooldown = 0;
    bulletsFired = 0;
    reloading = false;
    reloadTime = 2500;
    maxBullets = 35;
    fireRate = 100; // ms tussen schoten
    uiManager = null; // Reference to UI manager

    constructor(player, uiManager = null) {
        this.player = player;
        this.uiManager = uiManager;
        console.log("PlayerWeapon initialized");
        
        // Update initial ammo display
        this.updateAmmoUI();
    }

    update(delta) {
        if (this.fireCooldown > 0) {
            this.fireCooldown -= delta;
        }
    }

    canShoot() {
        return !this.reloading && this.fireCooldown <= 0;
    }

    shoot() {
        if (!this.canShoot()) return;

        const direction = Vector.fromAngle(this.player.rotation);
        const bulletStart = this.player.pos.add(direction.scale(this.player.width / 2 + 5));
        const bullet = new Bullet(bulletStart.x, bulletStart.y, direction);
        
        if (this.player.scene?.engine) {
            this.player.scene.engine.add(bullet);
        }        this.bulletsFired++;
        this.fireCooldown = this.fireRate;
        console.log(`Schot afgevuurd! Kogels: ${this.bulletsFired}/${this.maxBullets}`);

        // Update ammo UI
        this.updateAmmoUI();

        if (this.bulletsFired >= this.maxBullets) {
            this.startReload();
        }
    }    startReload() {
        this.reloading = true;
        console.log("Reloading...");
        
        // Show reload indicator in UI
        if (this.uiManager) {
            this.uiManager.showReloadIndicator(true);
        }
        
        setTimeout(() => {
            this.bulletsFired = 0;
            this.reloading = false;
            console.log("Reload complete!");
            
            // Hide reload indicator and update ammo UI
            if (this.uiManager) {
                this.uiManager.showReloadIndicator(false);
                this.updateAmmoUI();
            }
        }, this.reloadTime);
    }

    // Manual reload (can be triggered by R key)
    manualReload() {
        if (!this.reloading && this.bulletsFired > 0) {
            console.log("Manual reload triggered");
            this.startReload();
            return true;
        }
        return false;
    }

    // Get current ammo count
    getCurrentAmmo() {
        return this.maxBullets - this.bulletsFired;
    }

    // Get reload progress (0-1)
    getReloadProgress() {
        // This could be used for a reload progress bar in the future
        return this.reloading ? 0.5 : 1.0; // Simplified for now
    }

    // Update ammo display in UI
    updateAmmoUI() {
        if (this.uiManager) {
            const currentAmmo = this.maxBullets - this.bulletsFired;
            this.uiManager.updateAmmo(currentAmmo, this.maxBullets);
        }
    }

    // Set UI manager reference
    setUIManager(uiManager) {
        this.uiManager = uiManager;
        this.updateAmmoUI();
        console.log("UI Manager attached to weapon system");
    }
}
