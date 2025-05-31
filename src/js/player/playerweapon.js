import { Vector } from "excalibur";
import { Bullet } from "../weapons/bullet.js";

export class PlayerWeapon {
    fireCooldown = 0;
    bulletsFired = 0;
    reloading = false;
    reloadTime = 2500;
    maxBullets = 35; // Magazijn grootte
    fireRate = 100; // ms tussen schoten
    uiManager = null; // Reference to UI manager
      // Nieuw ammo systeem - UNLIMITED
    totalAmmo = 250; // Start ammo - kan oneindig groeien via pickups

    constructor(player, uiManager = null) {
        this.player = player;
        this.uiManager = uiManager;
          console.log(`PlayerWeapon initialized: Magazine=${this.maxBullets}, Starting ammo=${this.totalAmmo} (UNLIMITED)`);
        
        // Update initial ammo display
        this.updateAmmoUI();
    }

    update(delta) {
        if (this.fireCooldown > 0) {
            this.fireCooldown -= delta;
        }
    }    canShoot() {
        return !this.reloading && this.fireCooldown <= 0 && this.getCurrentAmmo() > 0;
    }

    shoot() {
        if (!this.canShoot()) return;

        const direction = Vector.fromAngle(this.player.rotation);
        const bulletStart = this.player.pos.add(direction.scale(this.player.width / 2 + 5));
        const bullet = new Bullet(bulletStart.x, bulletStart.y, direction);
        
        if (this.player.scene?.engine) {
            this.player.scene.engine.add(bullet);
        }

        this.bulletsFired++;
        this.fireCooldown = this.fireRate;
        
        console.log(`Shot fired: Magazine ammo=${this.getCurrentAmmo()}, Total ammo=${this.totalAmmo}`);

        // Update ammo UI
        this.updateAmmoUI();

        if (this.bulletsFired >= this.maxBullets) {
            this.startReload();
        }
    }    startReload() {
        // Check of we genoeg totaal ammo hebben voor reload
        if (this.totalAmmo <= 0) {
            console.log(`❌ Cannot reload: No total ammo remaining (${this.totalAmmo})`);
            return;
        }
        
        this.reloading = true;
        
        console.log(`🔄 Reload started: Magazine=${this.getCurrentAmmo()}, Total=${this.totalAmmo}`);
        
        // Show reload indicator in UI
        if (this.uiManager) {
            this.uiManager.showReloadIndicator(true);
            // Toon automatische reload feedback
            this.uiManager.createReloadFeedback("Reloading...", "Green", 2500);
        }
          setTimeout(() => {
            // Bereken hoeveel kogels we nodig hebben voor vol magazijn
            const bulletsNeeded = this.bulletsFired;
            const bulletsToReload = Math.min(bulletsNeeded, this.totalAmmo);
            
            // Update ammo counts
            this.totalAmmo -= bulletsToReload;
            // Bug fix: correcte berekening voor bulletsFired gebaseerd op werkelijk geladen kogels
            this.bulletsFired = this.bulletsFired - bulletsToReload;
            
            this.reloading = false;
            
            console.log(`✅ Reload complete: Magazine=${this.getCurrentAmmo()}, Total=${this.totalAmmo}, Bullets reloaded=${bulletsToReload}`);
            
            // Hide reload indicator and update ammo UI
            if (this.uiManager) {
                this.uiManager.showReloadIndicator(false);
                this.updateAmmoUI();
            }
        }, this.reloadTime);
    }    // Manual reload (can be triggered by R key)
    manualReload() {
        if (!this.reloading && this.bulletsFired > 0 && this.totalAmmo > 0) {
            console.log(`Manual reload triggered: Current magazine=${this.getCurrentAmmo()}, Total ammo=${this.totalAmmo}`);
            this.startReload();
            return true;
        }
        return false;
    }

    // Get current ammo count in magazine
    getCurrentAmmo() {
        return this.maxBullets - this.bulletsFired;
    }

    // Get total ammo remaining
    getTotalAmmo() {
        return this.totalAmmo;
    }    // Add ammo from pickup - UNLIMITED AMMO
    addAmmo(amount) {
        const oldTotal = this.totalAmmo;
        this.totalAmmo += amount; // Geen maximum limiet meer!
        const actualAdded = this.totalAmmo - oldTotal;
        
        console.log(`=== UNLIMITED AMMO ADDED ===`);
        console.log(`Pickup amount: ${amount}`);
        console.log(`Total ammo before: ${oldTotal}`);
        console.log(`Total ammo after: ${this.totalAmmo} (NO LIMIT)`);
        console.log(`Actually added: ${actualAdded}`);
        console.log(`=== END AMMO ADD ===\n`);
        
        // Update UI
        this.updateAmmoUI();
        
        return actualAdded;
    }

    // Get reload progress (0-1)
    getReloadProgress() {
        // This could be used for a reload progress bar in the future
        return this.reloading ? 0.5 : 1.0; // Simplified for now
    }    // Update ammo display in UI
    updateAmmoUI() {
        if (this.uiManager) {
            const currentAmmo = this.maxBullets - this.bulletsFired;
            this.uiManager.updateAmmo(currentAmmo, this.maxBullets, this.totalAmmo);
        }
    }

    // Set UI manager reference
    setUIManager(uiManager) {
        this.uiManager = uiManager;
        this.updateAmmoUI();
        
    }
}
