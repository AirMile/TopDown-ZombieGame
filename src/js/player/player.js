import { Actor, Vector, Keys, CollisionType, Shape, vec } from "excalibur";
import { Resources } from "../resources.js";
import { PlayerWeapon } from "./playerweapon.js";
import { PlayerMovement } from "./playermovement.js";
import { PlayerInput } from "./playerinput.js";
import { SlowZombie } from "../zombies/slowzombie.js";
import { FastZombie } from "../zombies/fastzombie.js";

export class Player extends Actor {
    // Private fields voor encapsulation
    #maxHealth = 100;
    #currentHealth = this.#maxHealth;
    #isInvulnerable = false;
    #invulnerabilityTime = 1000; 
    #invulnerabilityTimer = 0;
    #shootingEnabled = false;
    #shootingDelayTime = 500; 
    #shootingDelayTimer = 0;
    #isShooting = false;
    #shootingAnimationDuration = 150; 
    #shootingAnimationTimer = 0;

    constructor() {
        super({ 
            width: 32,
            height: 32,
            collisionType: CollisionType.Active
        });        
        // Voeg player tag toe voor identificatie
        this.tags.add('player');        
        
        // Initialiseer sprites
        this.normalSprite = Resources.Player.toSprite();
        if (this.normalSprite) {
            this.normalSprite.scale = new Vector(0.9, 0.9);
            this.normalSprite.rotation = -Math.PI / 2;
        }        
        
        this.shootingSprite = Resources.Shooting.toSprite();
        if (this.shootingSprite) {
            this.shootingSprite.scale = new Vector(2.2, 2.2); 
            this.shootingSprite.rotation = 0; 
            this.shootingSprite.offset = new Vector(0, 0); 
        }
        
        // Begin met de normale sprite
        this.graphics.use(this.normalSprite);
        
        this.pos = new Vector(100, 100);
        this.vel = new Vector(0, 0);
        
        // Initialiseer subsystemen
        this.weapon = new PlayerWeapon(this);
        this.movement = new PlayerMovement(this);
        this.input = new PlayerInput(this);
    }

    // Getters voor read-only access
    get currentHealth() {
        return this.#currentHealth;
    }

    get maxHealth() {
        return this.#maxHealth;
    }

    get isInvulnerable() {
        return this.#isInvulnerable;
    }

    get shootingEnabled() {
        return this.#shootingEnabled;
    }

    set shootingEnabled(value) {
        this.#shootingEnabled = value;
        console.log(`Player shooting enabled: ${value}`);
    }

    get shootingDelayTime() {
        return this.#shootingDelayTime;
    }

    get isShooting() {
        return this.#isShooting;
    }

    onInitialize(engine) {        // Stel een betere collider in voor de speler (groter voor betere botsingsdetectie)
        const colliderWidth = 10;  
        const colliderHeight = 10; 
        
        // Positioneer de collider iets meer op het lichaam
        const offsetX = 2;    
        const offsetY = 1.25;   
        const boxShape = Shape.Box(colliderWidth, colliderHeight, vec(offsetX, offsetY));
        this.collider.set(boxShape);
        
        // Alleen collider.useBoxCollision is meestal voldoende
        this.collider.useBoxCollision = true;

        this.graphics.showDebug = true;

        // Controleer of de reload-listener al is toegevoegd
        if (!engine.input.keyboard._playerReloadListenerAdded) {
            engine.input.keyboard.on('press', (evt) => {
                if (evt.key === Keys.R) {
                    this.handleReloadInput();
                }
            });
            engine.input.keyboard._playerReloadListenerAdded = true;
        }
    }    
    handleReloadInput() {
        if (!this.weapon) {
            return;
        }
        
        // Haal UI manager op voor feedback
        const uiManager = this.scene?.engine?.uiManager;
          // Controleer of herladen mogelijk is
        if (this.weapon.reloading) {
            return;
        }
        
        if (this.weapon.getCurrentAmmo() >= this.weapon.maxBullets) {
            return;
        }
        
        if (this.weapon.getTotalAmmo() <= 0) {
            if (uiManager) {
                uiManager.createReloadFeedback("No Ammo Left!", "Red");
            }
            return;
        }
          // Activeer herladen
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
        // Update invulnerabilityTimer
        if (this.#isInvulnerable) {
            this.#invulnerabilityTimer -= delta;
            if (this.#invulnerabilityTimer <= 0) {
                this.#isInvulnerable = false;
            }
        }
        
        // Update shootingAnimationTimer
        if (this.#isShooting) {
            this.#shootingAnimationTimer -= delta;
            if (this.#shootingAnimationTimer <= 0) {
                this.stopShootingAnimation();
            }
        }
        
        // Update subsystemen
        this.weapon.update(delta);
        this.movement.update(delta);
        this.input.update(engine, delta);

        // Behandel normale rotatie-input
        if (engine.input.keyboard.isHeld(Keys.Right)) {
            this.rotation += 0.02;
        }
        if (engine.input.keyboard.isHeld(Keys.Left)) {
            this.rotation -= 0.02;
        }
        
        // Haal bewegingsinput op (nu inclusief isShooting)
        const { speed, strafe, isSprinting, isShooting } = this.input.getMovementInput(engine);        
        
        // Behandel schieten - alleen wanneer spatiebalk ingedrukt is
        if (isShooting && !isSprinting && this.weapon.canShoot() && this.#shootingEnabled) {
            this.weapon.shoot();
        }        
        
        // Pas beweging toe
        this.vel = this.movement.calculateVelocity(speed, strafe);
    }    takeHit(damage = 10) {
        if (this.#isInvulnerable) {
            return;
        }        
        
        this.#currentHealth -= damage;
        
        // Zorg ervoor dat health nooit onder 0 komt
        if (this.#currentHealth < 0) {
            this.#currentHealth = 0;
        }        
        
        this.#isInvulnerable = true;
        this.#invulnerabilityTimer = this.#invulnerabilityTime;
          
        // console.log(`Player took damage: ${damage}, health=${this.#currentHealth}/${this.#maxHealth}`);
        
        // Update UI indien beschikbaar
        if (this.scene?.engine?.uiManager) {
            this.scene.engine.uiManager.updateHealth(this.#currentHealth, this.#maxHealth);
        }        
        
        // Controleer op dood
        if (this.#currentHealth <= 0) {
            this.#currentHealth = 0;
              
            // console.log(`Player died: health=${this.#currentHealth}`);
            
            this.handleDeath();
        }
    }handleDeath() {
        // Stop de beweging van de speler onmiddellijk
        this.vel = Vector.Zero;
        
        // Schakel de besturing van de speler uit om verdere input te voorkomen
        if (this.input) {
            this.input.enabled = false;
        }
        
        // Activeer game over (dit zal alle entiteiten, inclusief deze speler, doden)
        if (this.scene?.engine?.endGame) {
            this.scene.engine.endGame();
        }
    }    // Haal het huidige health-percentage op
    getHealthPercentage() {
        return this.#currentHealth / this.#maxHealth;
    }

    // Heal de speler
    heal(amount) {
        const oldHealth = this.#currentHealth;
        this.#currentHealth = Math.min(this.#maxHealth, this.#currentHealth + amount);        
        
        // Update UI indien beschikbaar
        if (this.scene?.engine?.uiManager) {
            this.scene.engine.uiManager.updateHealth(this.#currentHealth, this.#maxHealth);
        }
    }      
    
    // Start de schietanimatie
    startShootingAnimation() {
        if (!this.#isShooting && this.shootingSprite) {
            this.#isShooting = true;
            this.#shootingAnimationTimer = this.#shootingAnimationDuration;
            this.graphics.use(this.shootingSprite);
              
            // console.log(`Player shooting animation started: duration=${this.#shootingAnimationDuration}ms`);
        }
    }
    
    // Stop shooting animatie en keer terug naar normale sprite
    stopShootingAnimation() {
        if (this.#isShooting && this.normalSprite) {
            this.#isShooting = false;
            this.#shootingAnimationTimer = 0;
            this.graphics.use(this.normalSprite);
              
            // console.log(`Player shooting animation stopped: returning to normal sprite`);
        }
    }
}
