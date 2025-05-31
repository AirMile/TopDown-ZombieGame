import { Actor, Vector, Keys, CollisionType, Shape, vec } from "excalibur";
import { Resources } from "../resources.js";
import { PlayerWeapon } from "./playerweapon.js";
import { PlayerMovement } from "./playermovement.js";
import { PlayerInput } from "./playerinput.js";
import { PlayerHealth } from "./playerhealth.js";
import { PlayerAnimation } from "./playeranimation.js";
import { SlowZombie } from "../zombies/slowzombie.js";
import { FastZombie } from "../zombies/fastzombie.js";
import { PlayerConfig } from "../config/playerconfig.js";

export class Player extends Actor {
    constructor() {
        super({ 
            width: PlayerConfig.WIDTH,
            height: PlayerConfig.HEIGHT,
            collisionType: CollisionType.Active
        });

        // Add player tag for identification
        this.tags.add('player');

        this.pos = new Vector(PlayerConfig.START_X, PlayerConfig.START_Y);
        this.vel = new Vector(0, 0);

        // Initialize subsystems
        this.weapon = new PlayerWeapon(this);
        this.movement = new PlayerMovement(this);
        this.input = new PlayerInput(this);
        this.health = new PlayerHealth(this);
        this.animation = new PlayerAnimation(this);

        // Setup health callbacks
        this.health.setOnDeathCallback(() => this.handleDeath());
        this.health.setOnHealthChangeCallback((current, max) => this.updateHealthUI(current, max));

        // Initialize shooting delay system
        this.shootingEnabled = false;
        this.shootingDelayTime = PlayerConfig.SHOOTING_DELAY_TIME || 500; // fallback for compatibility
        this.shootingDelayTimer = 0;
        
        console.log('Player initialized with new subsystem architecture');
    }

    onInitialize(engine) {
        // Setup betere collider voor player (groter voor betere collision detection)
        const colliderWidth = PlayerConfig.COLLIDER_WIDTH;
        const colliderHeight = PlayerConfig.COLLIDER_HEIGHT;
        
        // Positioneer de collider iets meer op het lichaam
        const offsetX = PlayerConfig.COLLIDER_OFFSET_X;
        const offsetY = PlayerConfig.COLLIDER_OFFSET_Y;
        
        const boxShape = Shape.Box(colliderWidth, colliderHeight, vec(offsetX, offsetY));
        this.collider.set(boxShape);
        
        // BELANGRIJK: Schakel rotatie in voor de collider zodat hij meedraait
        this.collider.useBoxCollision = true;
        this.body.useBoxCollision = true;
        
        // Maak collider zichtbaar voor debug (zodat je kunt zien dat hij meedraait)
        this.graphics.showDebug = true;

        // Setup input handlers
        engine.input.keyboard.on('press', (evt) => {
            // R key for manual reload - VERBETERDE VERSIE
            if (evt.key === Keys.R) {
                this.handleReloadInput();
            }
        });
    }    // Nieuwe method voor reload handling
    handleReloadInput() {
        if (!this.weapon) {
            return;
        }
        
        // Get UI manager for feedback
        const uiManager = this.scene?.engine?.uiManager;
          // Check of reload mogelijk is
        if (this.weapon.reloading) {
            if (uiManager) {
                uiManager.createReloadFeedback("Already Reloading!", "Orange");
            }
            return;
        }
        
        if (this.weapon.getCurrentAmmo() >= this.weapon.maxBullets) {
            if (uiManager) {
                uiManager.createReloadFeedback("Magazine Full!", "Yellow");
            }
            return;
        }
        
        if (this.weapon.getTotalAmmo() <= 0) {
            if (uiManager) {
                uiManager.createReloadFeedback("No Ammo Left!", "Red");
            }
            return;
        }
          // Trigger reload
        const reloadSuccess = this.weapon.manualReload();
        
        if (reloadSuccess) {
            if (uiManager) {
                uiManager.createReloadFeedback("Reloading...", "Green", 2500);
            }
        } else {
            if (uiManager) {
                uiManager.createReloadFeedback("Reload Failed!", "Red");
            }
        }
    }    onPreUpdate(engine, delta) {
        // Update all subsystems
        this.health.update(delta);
        this.animation.update(delta);
        this.weapon.update(delta);
        this.movement.update(delta);
        this.input.update(engine, delta);

        // Handle regular rotation input
        if (engine.input.keyboard.isHeld(Keys.Right)) {
            this.rotation += PlayerConfig.ROTATION_SPEED;
        }
        if (engine.input.keyboard.isHeld(Keys.Left)) {
            this.rotation -= PlayerConfig.ROTATION_SPEED;
        }

        // Get movement input (nu inclusief isShooting)
        const { speed, strafe, isSprinting, isShooting } = this.input.getMovementInput(engine);

        // Handle shooting - alleen wanneer spatiebalk ingedrukt is
        if (isShooting && !isSprinting && this.weapon.canShoot() && this.shootingEnabled) {
            this.weapon.shoot();
            this.animation.triggerShootingAnimation(); // Trigger animation when shooting
        }

        // Apply movement
        this.vel = this.movement.calculateVelocity(speed, strafe);
    }    takeHit(damage = 10, source = 'zombie') {
        return this.health.takeDamage(damage, source);
    }

    // Health system delegation methods
    get currentHealth() {
        return this.health.getCurrentHealth();
    }

    get maxHealth() {
        return this.health.getMaxHealth();
    }

    get isInvulnerable() {
        return this.health.isInvulnerable();
    }

    updateHealthUI(current, max) {
        // Update UI if available
        if (this.scene?.engine?.uiManager) {
            this.scene.engine.uiManager.updateHealth(current, max);
        }
    }    handleDeath() {
        // Stop player movement immediately
        this.vel = Vector.Zero;
        
        // Disable player controls to prevent further input
        if (this.input) {
            this.input.enabled = false;
        }
        
        // Trigger game over (this will kill all entities including this player)
        if (this.scene?.engine?.endGame) {
            this.scene.engine.endGame();
        }
    }

    // Health delegation methods
    getHealthPercentage() {
        return this.health.getHealthPercentage();
    }

    heal(amount, source = 'pickup') {
        return this.health.heal(amount, source);
    }

    // Animation delegation methods (for backwards compatibility)
    get isShooting() {
        return this.animation.isShooting();
    }

    startShootingAnimation() {
        this.animation.triggerShootingAnimation();
    }
    
    stopShootingAnimation() {
        this.animation.stopShootingAnimation();
    }
}
