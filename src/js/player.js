import { Actor, Vector, Engine, Keys, PointerButton } from "excalibur"
import { Resources } from "./resources.js"
import { Bullet } from "./bullet.js"

export class Player extends Actor {
    moveSpeed
    ammo
    health
    shootDirection
    game
    fireCooldown = 0; // tijd tot volgende schot in ms
    isRotatingLeft = false;
    isRotatingRight = false;
    bulletsFired = 0; // aantal kogels sinds laatste reload
    reloading = false; // reload status
    reloadTime = 1000; // reload tijd in ms
    maxBullets = 7; // max aantal kogels voor reload
    isTurning = false;
    targetRotation = null;
    turnSpeed = 4; // radians per second (adjust for faster/slower turn)
    turnRightOnSpace = true; // default to right
    spaceTurnCooldown = 0; // ms
    spaceTurnCooldownTime = 3000; // 3 second cooldown in ms

    constructor() {
        super({ width: 50, height: 50 })
        this.graphics.use(Resources.Player.toSprite())
        this.graphics.flipHorizontal = true; // Flip the sprite horizontally again
        this.pos = new Vector(100, 100)
        this.vel = new Vector(0, 0)
    }

    onInitialize(engine) {
        // Voeg event listener toe voor muisknoppen (alleen rotatie)
        engine.input.pointers.on('down', (evt) => {
            if (evt.button === PointerButton.Left) { // Linker muisknop
                this.isRotatingLeft = true;
            }
            if (evt.button === PointerButton.Right) { // Rechter muisknop
                evt.nativeEvent.preventDefault(); // voorkom contextmenu
                this.isRotatingRight = true;
            }
        });
        engine.input.pointers.on('up', (evt) => {
            if (evt.button === PointerButton.Left) {
                this.isRotatingLeft = false;
            }
            if (evt.button === PointerButton.Right) {
                this.isRotatingRight = false;
            }
        });        engine.input.keyboard.on('press', (evt) => {
            if (evt.key === Keys.D && !this.isTurning) {
                this.turnRightOnSpace = true;
                console.log('D pressed: turnRightOnSpace = true');
            }
            if (evt.key === Keys.A && !this.isTurning) {
                this.turnRightOnSpace = false;
                console.log('A pressed: turnRightOnSpace = false');
            }
        });
        // ...eventuele andere initialisatie code...
    }

    // Helper to normalize angle between -PI and PI
    normalizeAngle(angle) {
        while (angle > Math.PI) angle -= 2 * Math.PI;
        while (angle < -Math.PI) angle += 2 * Math.PI;
        return angle;
    }    onPreUpdate(engine, delta) {
        // Tijdens reload kan niet geschoten worden, maar bewegen moet wel kunnen
        let speed = 0;
        let strafe = 0;
        
        // Disable WASD movement during turn animation
        if (!this.isTurning) {
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
        }
        if (engine.input.keyboard.isHeld(Keys.Right)) {
            this.rotation += 0.0225; 
        }
        if (engine.input.keyboard.isHeld(Keys.Left) ) {
            this.rotation -= 0.025; 
        }
        if (engine.input.keyboard.isHeld(Keys.ShiftLeft) || engine.input.keyboard.isHeld(Keys.ShiftRight)) { // Added back shift check
        }
        if (this.spaceTurnCooldown > 0) {
            this.spaceTurnCooldown -= delta;
        }
        // Update turnRightOnSpace based on currently held keys, but NOT during turn animation
        if (!this.isTurning) {
            if (engine.input.keyboard.isHeld(Keys.D)) {
                this.turnRightOnSpace = true;
            } else if (engine.input.keyboard.isHeld(Keys.A)) {
                this.turnRightOnSpace = false;
            }
        }
        if (!this.isTurning && this.spaceTurnCooldown <= 0 && engine.input.keyboard.isHeld(Keys.Space)) {
            this.isTurning = true;
            this.spaceTurnCooldown = this.spaceTurnCooldownTime;
            if (this.turnRightOnSpace) {
                this.targetRotation = this.normalizeAngle(this.rotation + Math.PI);
            } else {
                this.targetRotation = this.normalizeAngle(this.rotation - Math.PI);
            }
        }
        // Animate turn if needed
        if (this.isTurning && this.targetRotation !== null) {
            const step = this.turnSpeed * (delta / 1000); // delta in ms
            let diff = this.normalizeAngle(this.targetRotation - this.rotation);
            
            // Force the direction based on turnRightOnSpace to avoid shortest path issues
            if (this.turnRightOnSpace) {
                // Force clockwise rotation (positive direction)
                if (diff < 0) diff += 2 * Math.PI;
            } else {
                // Force counter-clockwise rotation (negative direction) 
                if (diff > 0) diff -= 2 * Math.PI;
            }
            
            if (Math.abs(diff) <= step) {
                this.rotation = this.targetRotation;
                this.isTurning = false;
                this.targetRotation = null;
            } else {
                this.rotation = this.normalizeAngle(this.rotation + Math.sign(diff) * step);
            }
        }
        // FIRE RATE LOGICA
        if (this.fireCooldown > 0) {
            this.fireCooldown -= delta;
        }

        // Tijdens reload kan niet geschoten worden, maar bewegen mag wel
        if (!this.reloading && this.fireCooldown <= 0) {
            this.shoot();
            this.bulletsFired++;
            this.fireCooldown = 300; // 0.3 seconde in ms
            if (this.bulletsFired >= this.maxBullets) {
                this.startReload();
            }
        }
        // Vooruit/achteruit in kijkrichting, strafe haaks erop
        const forward = Vector.fromAngle(this.rotation).scale(speed);
        const right = Vector.fromAngle(this.rotation + Math.PI / 2).scale(strafe);
        this.vel = forward.add(right);

        if (this.isRotatingLeft) {
            this.rotation -= 0.0275;
        }
        if (this.isRotatingRight) {
            this.rotation += 0.0275;
        }
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

    startReload() {
        this.reloading = true;
        setTimeout(() => {
            this.bulletsFired = 0;
            this.reloading = false;
        }, this.reloadTime);
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
