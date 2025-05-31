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
        });

        // Add player tag for identification
        this.tags.add('player');

        // Initialize sprite
        const sprite = Resources.Player.toSprite();
        sprite.scale = new Vector(0.9, 0.9);
        sprite.rotation = -Math.PI / 2;
        this.graphics.use(sprite);
        
        this.pos = new Vector(100, 100);
        this.vel = new Vector(0, 0);        // Initialize subsystems
        this.weapon = new PlayerWeapon(this);
        this.movement = new PlayerMovement(this);
        this.input = new PlayerInput(this);        // Initialize health system
        this.maxHealth = 100;
        this.currentHealth = this.maxHealth;
        
        console.log(`Player initialized with health: ${this.currentHealth}/${this.maxHealth}`);
        this.isInvulnerable = false;
        this.invulnerabilityTime = 1000; // 1 second
        this.invulnerabilityTimer = 0;        // Initialize shooting delay system
        this.shootingEnabled = false;
        this.shootingDelayTime = 500; // 500ms delay before shooting is enabled
        this.shootingDelayTimer = 0;

        // Initialize dash system
        this.isDashing = false;
        this.dashStartPosition = new Vector(0, 0);
        this.dashTargetPosition = new Vector(0, 0);
        this.dashProgress = 0;
        this.dashDuration = 0.2; // 200ms voor snelle dash
        this.dashDistance = 80; // Pixels om te dashen
        this.dashCooldown = 0;
        this.dashCooldownTime = 500; // 500ms cooldown tussen dashes
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
        
        console.log(`Player collider ingesteld op ${colliderWidth}x${colliderHeight} (gecentreerd en draait mee)`);
        
        // Extra debug: log de daadwerkelijke collider bounds
        console.log(`Player collider bounds: width=${this.collider.bounds.width}, height=${this.collider.bounds.height}`);
          // Maak collider zichtbaar voor debug (zodat je kunt zien dat hij meedraait)
        this.graphics.showDebug = true;
        console.log(`Player collider debug ingeschakeld - collider draait nu echt mee met rotatie!`);

        // Setup input handlers
        engine.input.keyboard.on('press', (evt) => {
            // R key for manual reload - VERBETERDE VERSIE
            if (evt.key === Keys.R) {
                this.handleReloadInput();
            }
        });
    }

    // Nieuwe method voor reload handling
    handleReloadInput() {
        console.log(`=== RELOAD INPUT DETECTED ===`);
        console.log(`Current magazine ammo: ${this.weapon.getCurrentAmmo()}/${this.weapon.maxBullets}`);
        console.log(`Total ammo: ${this.weapon.getTotalAmmo()}`);
        console.log(`Currently reloading: ${this.weapon.reloading}`);
        
        if (!this.weapon) {
            console.log(`❌ No weapon found!`);
            return;
        }
        
        // Get UI manager for feedback
        const uiManager = this.scene?.engine?.uiManager;
        
        // Check of reload mogelijk is
        if (this.weapon.reloading) {
            console.log(`❌ Already reloading - cannot reload again`);
            if (uiManager) {
                uiManager.createReloadFeedback("Already Reloading!", "Orange");
            }
            return;
        }
        
        if (this.weapon.getCurrentAmmo() >= this.weapon.maxBullets) {
            console.log(`❌ Magazine is already full (${this.weapon.getCurrentAmmo()}/${this.weapon.maxBullets})`);
            if (uiManager) {
                uiManager.createReloadFeedback("Magazine Full!", "Yellow");
            }
            return;
        }
        
        if (this.weapon.getTotalAmmo() <= 0) {
            console.log(`❌ No total ammo remaining (${this.weapon.getTotalAmmo()})`);
            if (uiManager) {
                uiManager.createReloadFeedback("No Ammo Left!", "Red");
            }
            return;
        }
        
        // Trigger reload
        const reloadSuccess = this.weapon.manualReload();
        
        if (reloadSuccess) {
            console.log(`✅ Manual reload started successfully`);
            if (uiManager) {
                uiManager.createReloadFeedback("Reloading...", "Green", 2500);
            }
        } else {
            console.log(`❌ Manual reload failed`);
            if (uiManager) {
                uiManager.createReloadFeedback("Reload Failed!", "Red");
            }
        }
        
        console.log(`=== END RELOAD INPUT ===\n`);
    }

    onPreUpdate(engine, delta) {        // Update invulnerability timer
        if (this.isInvulnerable) {
            this.invulnerabilityTimer -= delta;
            if (this.invulnerabilityTimer <= 0) {
                this.isInvulnerable = false;
            }
        }        // Update subsystems
        this.weapon.update(delta);
        this.movement.update(delta);
        this.input.update(engine, delta);

        // Update dash animation
        this.updateDash(delta);// Handle regular rotation input
        if (engine.input.keyboard.isHeld(Keys.Right)) {
            this.rotation += 0.02;
        }
        if (engine.input.keyboard.isHeld(Keys.Left)) {
            this.rotation -= 0.02;
        }// Get movement input (nu inclusief isShooting)
        const { speed, strafe, isSprinting, isShooting } = this.input.getMovementInput(engine);        // Handle shooting - alleen wanneer spatiebalk ingedrukt is
        if (isShooting && !isSprinting && this.weapon.canShoot() && this.shootingEnabled) {
            this.weapon.shoot();
            console.log(`Player shooting: ammo=${this.weapon.getCurrentAmmo()}`);
        }

        // Apply movement (alleen als niet aan het dashen)
        if (!this.isDashing) {
            this.vel = this.movement.calculateVelocity(speed, strafe);
        } else {
            // Tijdens dash geen normale beweging
            this.vel = Vector.Zero;
        }
    }    takeHit(damage = 10) {
        console.log(`=== PLAYER TAKING DAMAGE ===`);
        console.log(`Damage amount: ${damage}`);
        console.log(`Player health before damage: ${this.currentHealth}/${this.maxHealth}`);
        console.log(`Player invulnerable: ${this.isInvulnerable}`);
        
        if (this.isInvulnerable) {
            console.log(`❌ Player is invulnerable - damage blocked!`);
            return;
        }        this.currentHealth -= damage;
        
        // Zorgen dat health nooit onder 0 komt
        if (this.currentHealth < 0) {
            this.currentHealth = 0;
        }
        
        this.isInvulnerable = true;
        this.invulnerabilityTimer = this.invulnerabilityTime;
        
        console.log(`✅ Player took ${damage} damage`);
        console.log(`Player health after damage: ${this.currentHealth}/${this.maxHealth}`);
        console.log(`Player invulnerability activated for ${this.invulnerabilityTime}ms`);
        
        // Update UI if available
        if (this.scene?.engine?.uiManager) {
            this.scene.engine.uiManager.updateHealth(this.currentHealth, this.maxHealth);
        }
        
        // Check for death
        if (this.currentHealth <= 0) {
            this.currentHealth = 0;
            console.log(`💀 PLAYER HEALTH REACHED ZERO - TRIGGERING DEATH!`);
            this.handleDeath();
        }
        
        console.log(`=== END PLAYER DAMAGE ===\n`);
    }    handleDeath() {
        console.log(`=== PLAYER DEATH SEQUENCE ===`);
        console.log(`Player final health: ${this.currentHealth}`);
        console.log(`Player position: x=${this.pos.x.toFixed(1)}, y=${this.pos.y.toFixed(1)}`);
        console.log(`Triggering game over...`);
        
        // Stop player movement immediately
        this.vel = Vector.Zero;
        
        // Disable player controls to prevent further input
        if (this.input) {
            this.input.enabled = false;
        }
        
        // Trigger game over (this will kill all entities including this player)
        if (this.scene?.engine?.endGame) {
            this.scene.engine.endGame();
            console.log(`✅ Game over triggered successfully`);
        } else {
            console.log(`❌ Could not trigger game over - endGame method not found`);
        }
        
        console.log(`=== END PLAYER DEATH ===\n`);
    }

    // Get current health percentage
    getHealthPercentage() {
        return this.currentHealth / this.maxHealth;
    }

    // Heal player
    heal(amount) {
        const oldHealth = this.currentHealth;
        this.currentHealth = Math.min(this.maxHealth, this.currentHealth + amount);
        
        // Update UI if available
        if (this.scene?.engine?.uiManager) {
            this.scene.engine.uiManager.updateHealth(this.currentHealth, this.maxHealth);
        }
    }    // Start een dash animatie
    startDash(direction) {
        if (this.isDashing || this.dashCooldown > 0) {
            console.log(`Dash not available - isDashing: ${this.isDashing}, cooldown: ${this.dashCooldown.toFixed(0)}ms`);
            return;
        }
        
        console.log(`Starting dash ${direction}: ${this.dashDistance}px`);        // Bereken dash richting gebaseerd op huidige rotatie
        let dashDirection = new Vector(0, 0);
        if (direction === 'forward') {
            // Forward = richting waar player naar kijkt (player kijkt in rotatie richting)
            dashDirection = new Vector(
                Math.cos(this.rotation),
                Math.sin(this.rotation)
            );
        } else if (direction === 'backward') {
            // Backward = tegenovergestelde richting
            dashDirection = new Vector(
                -Math.cos(this.rotation),
                -Math.sin(this.rotation)
            );
        } else if (direction === 'left') {
            // Left = 90 graden naar links van de huidige rotatie
            dashDirection = new Vector(
                Math.cos(this.rotation - Math.PI / 2),
                Math.sin(this.rotation - Math.PI / 2)
            );
        } else if (direction === 'right') {
            // Right = 90 graden naar rechts van de huidige rotatie
            dashDirection = new Vector(
                Math.cos(this.rotation + Math.PI / 2),
                Math.sin(this.rotation + Math.PI / 2)
            );
        }
        
        this.isDashing = true;
        this.dashStartPosition = new Vector(this.pos.x, this.pos.y);
        this.dashTargetPosition = this.dashStartPosition.add(dashDirection.scale(this.dashDistance));
        this.dashProgress = 0;
        
        console.log(`Dash: from (${this.dashStartPosition.x.toFixed(1)}, ${this.dashStartPosition.y.toFixed(1)}) to (${this.dashTargetPosition.x.toFixed(1)}, ${this.dashTargetPosition.y.toFixed(1)})`);
    }
    
    // Update dash animatie
    updateDash(delta) {
        // Update cooldown
        if (this.dashCooldown > 0) {
            this.dashCooldown -= delta;
            if (this.dashCooldown <= 0) {
                this.dashCooldown = 0;
            }
        }
        
        if (!this.isDashing) return;
        
        // Update progress (0 to 1)
        this.dashProgress += delta / 1000 / this.dashDuration;
        
        if (this.dashProgress >= 1) {
            // Dash compleet
            this.dashProgress = 1;
            this.pos = new Vector(this.dashTargetPosition.x, this.dashTargetPosition.y);
            this.isDashing = false;
            this.dashCooldown = this.dashCooldownTime;
            console.log(`Dash completed at (${this.pos.x.toFixed(1)}, ${this.pos.y.toFixed(1)}) - cooldown: ${this.dashCooldownTime}ms`);
        } else {
            // Smooth interpolatie met easing voor snappy beweging
            const easeProgress = this.easeOutQuad(this.dashProgress);
            this.pos = new Vector(
                this.dashStartPosition.x + (this.dashTargetPosition.x - this.dashStartPosition.x) * easeProgress,
                this.dashStartPosition.y + (this.dashTargetPosition.y - this.dashStartPosition.y) * easeProgress
            );
        }
    }
    
    // Easing function voor dash (sneller begin, slower eind)
    easeOutQuad(t) {
        return 1 - (1 - t) * (1 - t);
    }
}
