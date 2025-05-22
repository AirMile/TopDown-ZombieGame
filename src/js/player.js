import { Actor, Vector, Engine, Keys } from "excalibur"
import { Resources } from "./resources.js"
import { Bullet } from "./bullet.js"

export class Player extends Actor {
    moveSpeed
    ammo
    health
    shootDirection
    game

    constructor() {
        super({ width: 50, height: 50 })
        this.graphics.use(Resources.Player.toSprite())
        this.pos = new Vector(100, 100)
        this.vel = new Vector(0, 0)
    }

    onInitialize(engine) {
        // Voeg event listener toe voor linker muisknop
        engine.input.pointers.on('down', (evt) => {
            this.shoot();
        });
        // ...eventuele andere initialisatie code...
    }

    onPreUpdate(engine, delta) {
        let speed = 0;
        if (engine.input.keyboard.isHeld(Keys.W)) {
            speed = (this.moveSpeed ?? 150);
        }
        if (engine.input.keyboard.isHeld(Keys.D)) {
            this.rotation += 0.05;
        }
        if (engine.input.keyboard.isHeld(Keys.A)) {
            this.rotation -= 0.05;
        }
        if (engine.input.keyboard.isHeld(Keys.S)) {
            speed = -(this.moveSpeed ?? 150);
        }
        this.vel = Vector.fromAngle(this.rotation).scale(speed);
    }

    shoot() {
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
