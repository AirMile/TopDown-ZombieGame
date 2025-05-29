import { Vector } from "excalibur";
import { Bullet } from "./bullet.js";

export class PlayerWeapon {
    fireCooldown = 0;
    bulletsFired = 0;
    reloading = false;
    reloadTime = 2500;
    maxBullets = 35;
    fireRate = 100; // ms tussen schoten

    constructor(player) {
        this.player = player;
        console.log("PlayerWeapon initialized");
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
        }

        this.bulletsFired++;
        this.fireCooldown = this.fireRate;
        console.log(`Schot afgevuurd! Kogels: ${this.bulletsFired}/${this.maxBullets}`);

        if (this.bulletsFired >= this.maxBullets) {
            this.startReload();
        }
    }

    startReload() {
        this.reloading = true;
        console.log("Reloading...");
        setTimeout(() => {
            this.bulletsFired = 0;
            this.reloading = false;
            console.log("Reload complete!");
        }, this.reloadTime);
    }
}
