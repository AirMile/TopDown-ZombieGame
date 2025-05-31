import { Actor, Vector, Keys, CollisionType, Shape, vec } from "excalibur";
import { Resources } from "../resources.js";
import { PlayerWeapon } from "./playerweapon.js";
import { PlayerMovement } from "./playermovement.js";
import { PlayerInput } from "./playerinput.js";
import { SlowZombie } from "../zombies/slowzombie.js";
import { FastZombie } from "../zombies/fastzombie.js";

export class Player extends Actor {
    constructor() {
        super({ 
            width: 32,
            height: 32,
            collisionType: CollisionType.Active
        });        // Add player tag for identification
        this.tags.add('player');        // Initialize sprites
        this.normalSprite = Resources.Player.toSprite();
        if (this.normalSprite) {
            this.normalSprite.scale = new Vector(0.9, 0.9);
            this.normalSprite.rotation = -Math.PI / 2;
        }        this.shootingSprite = Resources.Shooting.toSprite();
        if (this.shootingSprite) {
            this.shootingSprite.scale = new Vector(2.2, 2.2); // Much bigger scale for shooting sprite
            this.shootingSprite.rotation = 0; // 90 degrees to the right from the normal sprite (-PI/2 + PI/2 = 0)
            this.shootingSprite.offset = new Vector(0, 0); // Offset to the left by 0.1
        }
        
        // Start with normal sprite
        if (this.normalSprite) {
            this.graphics.use(this.normalSprite);
        }
        
        // Start with normal sprite
        this.graphics.use(this.normalSprite);
        
        // Shooting animation state
        this.isShooting = false;
        this.shootingAnimationDuration = 150; // 150ms shooting animation
        this.shootingAnimationTimer = 0;
        
        this.pos = new Vector(100, 100);
        this.vel = new Vector(0, 0);// Initialize subsystems
        this.weapon = new PlayerWeapon(this);
        this.movement = new PlayerMovement(this);
        this.input = new PlayerInput(this);        // Initialize health system
        this.maxHealth = 100;
        this.currentHealth = this.maxHealth;
        
        this.isInvulnerable = false;
        this.invulnerabilityTime = 1000; // 1 second
        this.invulnerabilityTimer = 0;        // Initialize shooting delay system
        this.shootingEnabled = false;
        this.shootingDelayTime = 500; // 500ms delay before shooting is enabled
        this.shootingDelayTimer = 0;
    }

    onInitialize(engine) {
        // Setup betere collider voor player (groter voor betere collision detection)
        const colliderWidth = 10;  // Veel groter horizontaal voor betere coverage
        const colliderHeight = 10; // Veel groter verticaal voor betere coverage
        
        // Positioneer de collider iets meer op het lichaam
        const offsetX = 2;    // Horizontaal gecentreerd
        const offsetY = 1.25;   // Iets naar boven verschoven naar lichaam/borst gebied
          const boxShape = Shape.Box(colliderWidth, colliderHeight, vec(offsetX, offsetY));
        this.collider.set(boxShape);
        
        // BELANGRIJK: Schakel rotatie in voor de collider zodat hij meedraait
        this.collider.useBoxCollision = true;
        this.body.useBoxCollision = true;
          // Extra debug: log de daadwerkelijke collider bounds
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
    }

    onPreUpdate(engine, delta) {        // Update invulnerability timer
        if (this.isInvulnerable) {
            this.invulnerabilityTimer -= delta;
            if (this.invulnerabilityTimer <= 0) {
                this.isInvulnerable = false;
            }
        }
        
        // Update shooting animation timer
        if (this.isShooting) {
            this.shootingAnimationTimer -= delta;
            if (this.shootingAnimationTimer <= 0) {
                this.stopShootingAnimation();
            }
        }// Update subsystems
        this.weapon.update(delta);
        this.movement.update(delta);
        this.input.update(engine, delta);

        // Handle regular rotation input
        if (engine.input.keyboard.isHeld(Keys.Right)) {
            this.rotation += 0.02;
        }
        if (engine.input.keyboard.isHeld(Keys.Left)) {
            this.rotation -= 0.02;
        }// Get movement input (nu inclusief isShooting)
        const { speed, strafe, isSprinting, isShooting } = this.input.getMovementInput(engine);        // Handle shooting - alleen wanneer spatiebalk ingedrukt is
        if (isShooting && !isSprinting && this.weapon.canShoot() && this.shootingEnabled) {
            this.weapon.shoot();
        }        // Apply movement
        this.vel = this.movement.calculateVelocity(speed, strafe);
    }    takeHit(damage = 10) {
        if (this.isInvulnerable) {
            return;
        }        this.currentHealth -= damage;
        
        // Zorgen dat health nooit onder 0 komt
        if (this.currentHealth < 0) {
            this.currentHealth = 0;
        }        this.isInvulnerable = true;
        this.invulnerabilityTimer = this.invulnerabilityTime;
        
        console.log(`Player took damage: ${damage}, health=${this.currentHealth}/${this.maxHealth}`);
        
        // Update UI if available
        if (this.scene?.engine?.uiManager) {
            this.scene.engine.uiManager.updateHealth(this.currentHealth, this.maxHealth);
        }        // Check for death
        if (this.currentHealth <= 0) {
            this.currentHealth = 0;
            
            console.log(`Player died: health=${this.currentHealth}`);
            
            this.handleDeath();
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

    // Get current health percentage
    getHealthPercentage() {
        return this.currentHealth / this.maxHealth;
    }

    // Heal player
    heal(amount) {
        const oldHealth = this.currentHealth;
        this.currentHealth = Math.min(this.maxHealth, this.currentHealth + amount);        // Update UI if available
        if (this.scene?.engine?.uiManager) {
            this.scene.engine.uiManager.updateHealth(this.currentHealth, this.maxHealth);
        }
    }
      // Start shooting animation
    startShootingAnimation() {
        if (!this.isShooting && this.shootingSprite) {
            this.isShooting = true;
            this.shootingAnimationTimer = this.shootingAnimationDuration;
            this.graphics.use(this.shootingSprite);
            
            console.log(`Player shooting animation started: duration=${this.shootingAnimationDuration}ms`);
        }
    }
    
    // Stop shooting animation and return to normal sprite
    stopShootingAnimation() {
        if (this.isShooting && this.normalSprite) {
            this.isShooting = false;
            this.shootingAnimationTimer = 0;
            this.graphics.use(this.normalSprite);
            
            console.log(`Player shooting animation stopped: returning to normal sprite`);
        }
    }
}
