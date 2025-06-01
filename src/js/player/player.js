import { Actor, Vector, Keys, CollisionType, Shape, vec } from "excalibur";
import { Resources } from "../resources.js";
import { PlayerMovement } from "./playermovement.js";
import { PlayerInput } from "./playerinput.js";
import { Bullet } from "../weapons/bullet.js";

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

    // Weapon system properties (voorheen in PlayerWeapon)
    #fireCooldown = 0;
    #bulletsFired = 0;
    #reloading = false;
    #reloadTime = 2500;
    #maxBullets = 35; // Magazijn grootte
    #fireRate = 100; // ms tussen schoten
    #totalAmmo = 250; // Start ammo - kan oneindig groeien via pickups
    #uiManager = null; // Reference to UI manager

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
        this.movement = new PlayerMovement(this);
        this.input = new PlayerInput(this);
        
        // Update initial ammo display
        this.updateAmmoUI();
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

    // Weapon getters (voorheen via this.weapon)
    get reloading() {
        return this.#reloading;
    }

    get maxBullets() {
        return this.#maxBullets;
    }

    onInitialize(engine) {        
        // Stel een betere collider in voor de speler (groter voor betere botsingsdetectie)
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
        // Haal UI manager op voor feedback
        const uiManager = this.scene?.engine?.uiManager;
          
        // Controleer of herladen mogelijk is
        if (this.#reloading) {
            return;
        }
        
        if (this.getCurrentAmmo() >= this.#maxBullets) {
            return;
        }
        
        if (this.getTotalAmmo() <= 0) {
            if (uiManager) {
                uiManager.createReloadFeedback("No Ammo Left!", "Red");
            }
            return;
        }
          
        // Activeer herladen
        const reloadSuccess = this.manualReload();
        
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
    
    onPreUpdate(engine, delta) {        
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
        
        // Update weapon cooldown
        if (this.#fireCooldown > 0) {
            this.#fireCooldown -= delta;
        }
        
        // Update subsystemen
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
        if (isShooting && !isSprinting && this.canShoot() && this.#shootingEnabled) {
            this.shoot();
        }        
        
        // Pas beweging toe
        this.vel = this.movement.calculateVelocity(speed, strafe);
    }
    
    // Weapon system methods (voorheen in PlayerWeapon)
    canShoot() {
        return !this.#reloading && this.#fireCooldown <= 0 && this.getCurrentAmmo() > 0;
    }
    
    shoot() {
        if (!this.canShoot()) return;

        const direction = Vector.fromAngle(this.rotation);
        const bulletStart = this.pos.add(direction.scale(this.width / 2 + 5));
        const bullet = new Bullet(bulletStart.x, bulletStart.y, direction);
        
        if (this.scene?.engine) {
            this.scene.engine.add(bullet);
        }

        // Trigger shooting animation
        this.startShootingAnimation();

        this.#bulletsFired++;
        this.#fireCooldown = this.#fireRate;

        // Update ammo UI
        this.updateAmmoUI();

        if (this.#bulletsFired >= this.#maxBullets) {
            this.startReload();
        }
    }
    
    startReload() {
        // Check of we genoeg totaal ammo hebben voor reload
        if (this.#totalAmmo <= 0) {
            return;
        }
        
        this.#reloading = true;
        
        // Show reload indicator in UI
        if (this.#uiManager) {
            this.#uiManager.showReloadIndicator(true);
            // Toon automatische reload feedback
            this.#uiManager.createReloadFeedback("Reloading...", "Green", 2500);
        }
          
        setTimeout(() => {
            // Bereken hoeveel kogels we nodig hebben voor vol magazijn
            const bulletsNeeded = this.#bulletsFired;
            const bulletsToReload = Math.min(bulletsNeeded, this.#totalAmmo);
            
            // Update ammo counts
            this.#totalAmmo -= bulletsToReload;
            // Bug fix: correcte berekening voor bulletsFired gebaseerd op werkelijk geladen kogels
            this.#bulletsFired = this.#bulletsFired - bulletsToReload;
            
            this.#reloading = false;
            
            // Hide reload indicator and update ammo UI
            if (this.#uiManager) {
                this.#uiManager.showReloadIndicator(false);
                this.updateAmmoUI();
            }
        }, this.#reloadTime);
    }
    
    // Manual reload (can be triggered by R key)
    manualReload() {
        if (!this.#reloading && this.#bulletsFired > 0 && this.#totalAmmo > 0) {
            this.startReload();
            return true;
        }
        return false;
    }

    // Get current ammo count in magazine
    getCurrentAmmo() {
        return this.#maxBullets - this.#bulletsFired;
    }

    // Get total ammo remaining
    getTotalAmmo() {
        return this.#totalAmmo;
    }
    
    // Add ammo from pickup - UNLIMITED AMMO
    addAmmo(amount) {
        const oldTotal = this.#totalAmmo;
        this.#totalAmmo += amount; // Geen maximum limiet meer!
        const actualAdded = this.#totalAmmo - oldTotal;
        
        // Update UI
        this.updateAmmoUI();
        
        return actualAdded;
    }
    
    // Update ammo display in UI
    updateAmmoUI() {
        if (this.#uiManager) {
            const currentAmmo = this.#maxBullets - this.#bulletsFired;
            this.#uiManager.updateAmmo(currentAmmo, this.#maxBullets, this.#totalAmmo);
        }
    }

    // Set UI manager reference
    setUIManager(uiManager) {
        this.#uiManager = uiManager;
        this.updateAmmoUI();
    }
    
    takeHit(damage = 10) {
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
          
        // Update UI indien beschikbaar
        if (this.scene?.engine?.uiManager) {
            this.scene.engine.uiManager.updateHealth(this.#currentHealth, this.#maxHealth);
        }        
        
        // Controleer op dood
        if (this.#currentHealth <= 0) {
            this.#currentHealth = 0;
            this.handleDeath();
        }
    }
    
    handleDeath() {
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
    }    
    
    // Haal het huidige health-percentage op
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
        }
    }
    
    // Stop shooting animatie en keer terug naar normale sprite
    stopShootingAnimation() {
        if (this.#isShooting && this.normalSprite) {
            this.#isShooting = false;
            this.#shootingAnimationTimer = 0;
            this.graphics.use(this.normalSprite);
        }
    }
}