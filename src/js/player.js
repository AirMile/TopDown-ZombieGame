import { Actor, Vector, Engine, Keys } from "excalibur"
import { Resources } from "./resources.js"
import { Bullet } from "./bullet.js"

export class Player extends Actor {
    moveSpeed
    ammo
    health
    shootDirection
    game
    fireCooldown = 0; // tijd tot volgende schot in ms
    _wantsToShoot = false; // interne flag voor click-spam blokkade

    constructor() {
        super({ width: 50, height: 50 })
        this.graphics.use(Resources.Player.toSprite())
        this.pos = new Vector(100, 100)
        this.vel = new Vector(0, 0)
    }

    onInitialize(engine) {
        // Voeg event listener toe voor muisknoppen (alleen rotatie)
        engine.input.pointers.on('down', (evt) => {
            if (evt.button === 0) { // Linker muisknop
                this.rotation -= 0.05;
            }
            if (evt.button === 2) { // Rechter muisknop
                this.rotation += 0.05;
            }
        });
        // Voeg event listener toe voor spatiebalk (schieten)
        engine.input.keyboard.on('press', (evt) => {
            if (evt.key === Keys.Space) {
                this.shoot();
            }
        });
        // Voeg event listener toe voor pijl-omlaag toets (schieten)
        engine.input.keyboard.on('press', (evt) => {
            if (evt.key === Keys.Down) {
                this.shoot();
            }
        });
        // Spacebar of pijltje-omlaag indrukken: wil schieten
        engine.input.keyboard.on('press', (evt) => {
            if (evt.key === Keys.Space || evt.key === Keys.Down) {
                this._wantsToShoot = true;
            }
        });
        // Spacebar of pijltje-omlaag loslaten: wil niet meer schieten
        engine.input.keyboard.on('release', (evt) => {
            if (evt.key === Keys.Space || evt.key === Keys.Down) {
                this._wantsToShoot = false;
            }
        });
        // ...eventuele andere initialisatie code...
    }

    onPreUpdate(engine, delta) {
        let speed = 0;
        let strafe = 0;
        if (engine.input.keyboard.isHeld(Keys.W)) {
            speed = (this.moveSpeed ?? 150);
        }
        if (engine.input.keyboard.isHeld(Keys.S)) {
            speed = -(this.moveSpeed ?? 150);
        }
        if (engine.input.keyboard.isHeld(Keys.D)) {
            strafe = (this.moveSpeed ?? 150);
        }
        if (engine.input.keyboard.isHeld(Keys.A)) {
            strafe = -(this.moveSpeed ?? 150);
        }
        if (engine.input.keyboard.isHeld(Keys.Right)) {
            this.rotation += 0.05;
        }
        if (engine.input.keyboard.isHeld(Keys.Left)) {
            this.rotation -= 0.05;
        }
        // FIRE RATE LOGICA
        if (this.fireCooldown > 0) {
            this.fireCooldown -= delta;
        }
        // Alleen schieten als fireCooldown <= 0
        if (
            (engine.input.keyboard.isHeld(Keys.Space) || engine.input.keyboard.isHeld(Keys.Down) || this._wantsToShoot)
            && this.fireCooldown <= 0
        ) {
            this.shoot();
            this.fireCooldown = 300; // 0.3 seconde in ms
            this._wantsToShoot = false; // reset zodat je niet kan spammen met press
        }
        // Vooruit/achteruit in kijkrichting, strafe haaks erop
        const forward = Vector.fromAngle(this.rotation).scale(speed);
        const right = Vector.fromAngle(this.rotation + Math.PI / 2).scale(strafe);
        this.vel = forward.add(right);
    }

    shoot() {
        if (this.fireCooldown > 0) return; // Extra beveiliging tegen spam
        // Bepaal direction op basis van huidige rotatie
        const direction = Vector.fromAngle(this.rotation);
        // Startpositie iets voor de speler
        const bulletStart = this.pos.add(direction.scale(this.width / 2 + 5));
        const bullet = new Bullet(bulletStart.x, bulletStart.y, direction);
        // Voeg bullet toe aan de game/engine
        if (this.scene && this.scene.engine) {
            this.scene.engine.add(bullet);
        } else if (this.game) {
            this.game.add(bullet);
        } else {
            // fallback: probeer parent
            this.parent?.add(bullet);
        }
    }

    takeHit() {
        // ...take hit logic...
    }

    collectAmmo(amount) {
        // ...collect ammo logic...
    }

    updateAimDirection(direction) {
        // Verwacht een Vector als direction
        if (direction instanceof Vector) {
            this.rotation = direction.toAngle();
        }
    }
}
