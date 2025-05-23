import { Actor, Vector, Engine, Keys, PointerButton, CollisionType } from "excalibur"
import { Resources } from "./resources.js"
import { Bullet } from "./bullet.js"
import { SlowZombie } from "./slowzombie.js"; 
import { FastZombie } from "./fastzombie.js"; 

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
    reloadTime = 2500; // reload tijd in ms
    maxBullets = 35; // max aantal kogels voor reload
    isTurning = false;
    targetRotation = null;
    turnSpeed = 4; // radians per second (adjust for faster/slower turn)
    turnRightOnSpace = true; // default to right
    spaceTurnCooldown = 0; // ms
    spaceTurnCooldownTime = 1000; // 3 second cooldown in ms
    isSprinting = false;
    dashDistance = 100; // Distance for the backward dash
    dashCooldown = 0; // Cooldown timer for dashing
    dashCooldownTime = 1500; // 1.5 seconds cooldown for dash
    isDashing = false; // Whether player is currently dashing
    dashSpeed = 800; // Speed during dash animation
    dashDirection = null; // Direction of the dash
    dashRemaining = 0; // Remaining distance to dash
    lastSDoublePressTime = 0;
    sPressCount = 0;
    doubleSPressThreshold = 300; // ms

    constructor() {
        super({ 
            width: 32, // keep logical size
            height: 32,
            collisionType: CollisionType.Active
        })
        const sprite = Resources.Player.toSprite();
        sprite.scale = new Vector(0.9, 0.9); // Scale sprite to 90%
        sprite.rotation = -Math.PI / 2; // Rotate sprite to face up
        this.graphics.use(sprite)
        this.pos = new Vector(100, 100)
        this.vel = new Vector(0, 0)
        console.log("Player constructor voltooid. Sprite scale: 0.9, facing up");
    }

    onInitialize(engine) {
        console.log("Player onInitialize aangeroepen.");
        // Verwijder event listener voor muisknoppen (alleen rotatie)
        // engine.input.pointers.on('down', ...)
        // engine.input.pointers.on('up', ...)
        engine.input.keyboard.on('press', (evt) => {
            if (evt.key === Keys.D && !this.isTurning) {
                this.turnRightOnSpace = true;
            }
            if (evt.key === Keys.A && !this.isTurning) {
                this.turnRightOnSpace = false;
            }
            // Double-press S for dash
            if (evt.key === Keys.S) {
                const now = Date.now();
                if (now - this.lastSDoublePressTime < this.doubleSPressThreshold) {
                    this.sPressCount++;
                } else {
                    this.sPressCount = 1;
                }
                this.lastSDoublePressTime = now;
                if (this.sPressCount === 2) {
                    if (this.dashCooldown <= 0 && !this.isTurning && !this.isDashing) {
                        console.log("Player double-pressed S for backward dash!");
                        this.isDashing = true;
                        this.dashDirection = Vector.fromAngle(this.rotation).scale(-1);
                        this.dashRemaining = this.dashDistance;
                        this.dashCooldown = this.dashCooldownTime;
                    }
                    this.sPressCount = 0;
                }
            }
        });
        this.on('collisionstart', (event) => {
            if (event.other instanceof SlowZombie || event.other instanceof FastZombie) {
                console.log('SPELER RAAKT ZOMBIE! (Gedetecteerd door Player)');
                // Hier kun je logica toevoegen, bijv. this.takeHit();
            }
        });
        console.log("Player collision logic initialized (Active by default)!");
        // ...eventuele andere initialisatie code...
    }

    // Helper to normalize angle between -PI and PI
    normalizeAngle(angle) {
        while (angle > Math.PI) angle -= 2 * Math.PI;
        while (angle < -Math.PI) angle += 2 * Math.PI;
        return angle;
    }
    onPreUpdate(engine, delta) {
        // Tijdens reload kan niet geschoten worden, maar bewegen moet wel kunnen
        let speed = 0;
        let strafe = 0;
        const baseSpeed = (this.moveSpeed ?? 150);

        this.isSprinting = engine.input.keyboard.isHeld(Keys.ShiftLeft);

        
        // Disable WASD movement during turn animation
        if (!this.isTurning) {
            if (engine.input.keyboard.isHeld(Keys.W)) {
                speed = this.isSprinting ? baseSpeed * 2 : baseSpeed;
            }
            if (engine.input.keyboard.isHeld(Keys.S)) {
                speed = -baseSpeed; // Sprinting does not affect backward movement
            }
            if (engine.input.keyboard.isHeld(Keys.D)) {
                strafe = baseSpeed; // Sprinting does not affect strafing
            }
            if (engine.input.keyboard.isHeld(Keys.A)) {
                strafe = -baseSpeed; // Sprinting does not affect strafing
            }
        }
        if (engine.input.keyboard.isHeld(Keys.Right)) {
            this.rotation += 0.02; 
        }
        if (engine.input.keyboard.isHeld(Keys.Left) ) {
            this.rotation -= 0.02; 
        }
        if (engine.input.keyboard.isHeld(Keys.ShiftLeft) || engine.input.keyboard.isHeld(Keys.ShiftRight)) { // Added back shift check
            // This console log is now handled by the isSprinting logic
        }
        if (this.spaceTurnCooldown > 0) {
            this.spaceTurnCooldown -= delta;
        }

        if (this.dashCooldown > 0) {
            this.dashCooldown -= delta;
        }

        // Handle Dash
        if (engine.input.keyboard.wasPressed(Keys.Down) && this.dashCooldown <= 0 && !this.isTurning && !this.isDashing) {
            console.log("Player started backward dash!");
            this.isDashing = true;
            this.dashDirection = Vector.fromAngle(this.rotation).scale(-1); // Opposite of current facing direction
            this.dashRemaining = this.dashDistance;
            this.dashCooldown = this.dashCooldownTime;
        }

        // Animate the dash
        if (this.isDashing) {
            const dashStep = this.dashSpeed * (delta / 1000); // Speed * time = distance
            
            if (dashStep >= this.dashRemaining) {
                // Dash is complete
                this.pos = this.pos.add(this.dashDirection.scale(this.dashRemaining));
                this.isDashing = false;
                this.dashDirection = null;
                this.dashRemaining = 0;
                console.log("Player dash completed!");
            } else {
                // Continue dashing
                this.pos = this.pos.add(this.dashDirection.scale(dashStep));
                this.dashRemaining -= dashStep;
            }
            
            // During dash, override normal velocity
            this.vel = Vector.Zero;
            return; // Skip the rest of movement logic during dash
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
        // Ook niet schieten tijdens sprinten of 180 graden draai
        if (!this.reloading && !this.isSprinting && !this.isTurning && this.fireCooldown <= 0) {
            this.shoot();
            this.bulletsFired++;
            this.fireCooldown = 100// 0.3 seconde in ms
            if (this.bulletsFired >= this.maxBullets) {
                this.startReload();
            }
        }
        // Vooruit/achteruit in kijkrichting, strafe haaks erop
        const forward = Vector.fromAngle(this.rotation).scale(speed);
        const right = Vector.fromAngle(this.rotation + Math.PI / 2).scale(strafe);
        this.vel = forward.add(right);

        if (this.isRotatingLeft) {
            this.rotation -= 0.02;
        }
        if (this.isRotatingRight) {
            this.rotation += 0.02;
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
