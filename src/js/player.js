import { Actor, Vector, Keys, CollisionType } from "excalibur";
import { Resources } from "./resources.js";
import { PlayerWeapon } from "./player/playerweapon.js";
import { PlayerMovement } from "./playermovement.js";
import { PlayerInput } from "./playerinput.js";
import { SlowZombie } from "./slowzombie.js";
import { FastZombie } from "./fastzombie.js";

export class Player extends Actor {
    constructor() {
        super({ 
            width: 32,
            height: 32,
            collisionType: CollisionType.Active
        });

        // Initialize sprite
        const sprite = Resources.Player.toSprite();
        sprite.scale = new Vector(0.9, 0.9);
        sprite.rotation = -Math.PI / 2;
        this.graphics.use(sprite);
        
        this.pos = new Vector(100, 100);
        this.vel = new Vector(0, 0);

        // Initialize subsystems
        this.weapon = new PlayerWeapon(this);
        this.movement = new PlayerMovement(this);
        this.input = new PlayerInput(this);

        console.log("Player constructor voltooid met subsystems");
    }    onInitialize(engine) {
        console.log("Player onInitialize aangeroepen");
        
        // Setup input handlers
        engine.input.keyboard.on('press', (evt) => {
            // Double-S for dash
            if (evt.key === Keys.S) {
                const now = Date.now();
                if (now - this.input.lastSDoublePressTime < this.input.doubleSPressThreshold) {
                    this.input.sPressCount++;
                } else {
                    this.input.sPressCount = 1;
                }
                this.input.lastSDoublePressTime = now;
                
                if (this.input.sPressCount === 2) {
                    this.movement.startDash(-1); // Backward dash
                    this.input.sPressCount = 0;
                }
            }

            // Down arrow for dash (alternative)
            if (evt.key === Keys.Down) {
                this.movement.startDash(-1);
            }
        });

        // Collision handling
        this.on('collisionstart', (event) => {
            if (event.other instanceof SlowZombie || event.other instanceof FastZombie) {
                console.log('SPELER RAAKT ZOMBIE! (Gedetecteerd door Player)');
                // TODO: this.takeHit();
            }
        });
    }    onPreUpdate(engine, delta) {
        // Update subsystems
        this.weapon.update(delta);
        this.movement.update(delta);
        this.input.update(engine, delta);

        // Handle rotation input
        if (engine.input.keyboard.isHeld(Keys.Right)) {
            this.rotation += 0.02;
        }
        if (engine.input.keyboard.isHeld(Keys.Left)) {
            this.rotation -= 0.02;
        }

        // Get movement input
        const { speed, strafe, isSprinting } = this.input.getMovementInput(engine);

        // Handle shooting
        if (!isSprinting && !this.input.isTurning && this.weapon.canShoot()) {
            this.weapon.shoot();
        }

        // Apply movement if not dashing
        if (!this.movement.isDashing) {
            this.vel = this.movement.calculateVelocity(speed, strafe);
        } else {
            this.vel = Vector.Zero;
        }
    }

    takeHit() {
        console.log("Player took hit!");
        // TODO: Implement health system
    }
}
