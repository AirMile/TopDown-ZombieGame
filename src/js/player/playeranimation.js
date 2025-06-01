import { Vector } from 'excalibur';
import { Resources } from '../resources.js';
import { PlayerConfig } from '../config/index.js';

export class PlayerAnimation {
    #player
    #normalSprite
    #shootingSprite
    #currentState
    #animationTimer
    #animationDuration

    constructor(player) {
        this.#player = player;
        this.#currentState = 'normal';
        this.#animationTimer = 0;
        this.#animationDuration = PlayerConfig.SHOOTING_ANIMATION_DURATION;
        
        this.#initializeSprites();
        
        console.log('PlayerAnimation initialized with sprites');
    }

    #initializeSprites() {
        // Initialiseer normale sprite
        this.#normalSprite = Resources.Player.toSprite();
        if (this.#normalSprite) {
            this.#normalSprite.scale = new Vector(
                PlayerConfig.NORMAL_SPRITE_SCALE.x, 
                PlayerConfig.NORMAL_SPRITE_SCALE.y
            );
            this.#normalSprite.rotation = PlayerConfig.NORMAL_SPRITE_ROTATION;
            
            console.log('Normal sprite initialized with scale:', PlayerConfig.NORMAL_SPRITE_SCALE);
        }

        // Initialiseer shooting sprite
        this.#shootingSprite = Resources.Shooting.toSprite();
        if (this.#shootingSprite) {
            this.#shootingSprite.scale = new Vector(
                PlayerConfig.SHOOTING_SPRITE_SCALE.x, 
                PlayerConfig.SHOOTING_SPRITE_SCALE.y
            );
            this.#shootingSprite.rotation = PlayerConfig.SHOOTING_SPRITE_ROTATION;
            this.#shootingSprite.offset = new Vector(0, 0);
            
            console.log('Shooting sprite initialized with scale:', PlayerConfig.SHOOTING_SPRITE_SCALE);
        }

        // Stel initiële sprite direct in, omzeil setNormalState's conditionele logica voor initialisatie
        if (this.#normalSprite && this.#player.graphics) {
            this.#player.graphics.use(this.#normalSprite);
            // this.#currentState is already 'normal' due to constructor initialization.
            console.log('Player animation: Initial sprite set to normal in #initializeSprites');
        } else {
            console.warn('PlayerAnimation: Could not set initial normal sprite in #initializeSprites. Player graphics or normal sprite missing.');
        }
        // The original call to this.setNormalState() is removed as it wouldn't apply the sprite initially.
    }

    // Update animatie timers
    update(delta) {
        if (this.#currentState === 'shooting') {
            this.#animationTimer -= delta;
            
            if (this.#animationTimer <= 0) {
                this.setNormalState();
            }
        }
    }

    // Animatie status setters
    setNormalState() {
        if (this.#currentState !== 'normal') {
            this.#currentState = 'normal';
            this.#animationTimer = 0;
            
            if (this.#normalSprite && this.#player.graphics) {
                this.#player.graphics.use(this.#normalSprite);
                
                console.log('Player animation: switched to normal state');
            }
        }
    }

    setShootingState() {
        if (this.#currentState !== 'shooting') {
            this.#currentState = 'shooting';
            this.#animationTimer = this.#animationDuration;
            
            if (this.#shootingSprite && this.#player.graphics) {
                this.#player.graphics.use(this.#shootingSprite);
                
                console.log(`Player animation: switched to shooting state (${this.#animationDuration}ms)`);
            }
        } else {
            // Reset timer als al aan het schieten
            this.#animationTimer = this.#animationDuration;
            
            console.log('Player animation: shooting state timer reset');
        }
    }

    // Animatie status getters
    getCurrentState() {
        return this.#currentState;
    }

    isShooting() {
        return this.#currentState === 'shooting';
    }

    isNormal() {
        return this.#currentState === 'normal';
    }

    getAnimationTimeLeft() {
        return Math.max(0, this.#animationTimer);
    }

    // Animation control methods
    triggerShootingAnimation() {
        this.setShootingState();
    }

    stopShootingAnimation() {
        this.setNormalState();
    }

    // Forceer animatie status (voor speciale effecten)
    forceNormalState() {
        this.#currentState = 'normal';
        this.#animationTimer = 0;
        
        if (this.#normalSprite && this.#player.graphics) {
            this.#player.graphics.use(this.#normalSprite);
        }
        
        console.log('Player animation: forced to normal state');
    }

    forceShootingState(duration = null) {
        this.#currentState = 'shooting';
        this.#animationTimer = duration || this.#animationDuration;
        
        if (this.#shootingSprite && this.#player.graphics) {
            this.#player.graphics.use(this.#shootingSprite);
        }
        
        console.log(`Player animation: forced to shooting state (${this.#animationTimer}ms)`);
    }

    // Sprite management
    getSprites() {
        return {
            normal: this.#normalSprite,
            shooting: this.#shootingSprite
        };
    }

    hasValidSprites() {
        return this.#normalSprite !== null && this.#shootingSprite !== null;
    }

    // Configuratie methodes
    setAnimationDuration(duration) {
        this.#animationDuration = duration;
        
        console.log(`Animation duration set to: ${duration}ms`);
    }

    getAnimationDuration() {
        return this.#animationDuration;
    }

    // Animation effects
    flashSprite(flashCount = 3, flashDuration = 100) {
        // Voor invulnerability effect
        let flashes = 0;
        const originalSprite = this.#player.graphics.current;
        
        const flashInterval = setInterval(() => {
            if (flashes >= flashCount * 2) {
                clearInterval(flashInterval);
                this.#player.graphics.use(originalSprite);
                return;
            }
            
            if (flashes % 2 === 0) {
                this.#player.graphics.opacity = 0.3;
            } else {
                this.#player.graphics.opacity = 1.0;
            }
            
            flashes++;
        }, flashDuration);
        
        console.log(`Sprite flash effect started: ${flashCount} flashes, ${flashDuration}ms each`);
    }

    // Reset animatie systeem
    reset() {
        this.#currentState = 'normal';
        this.#animationTimer = 0;
        this.setNormalState();
        
        console.log('Player animation system reset');
    }

    // Debug methodes
    getDebugInfo() {
        return {
            currentState: this.#currentState,
            animationTimer: this.#animationTimer,
            animationDuration: this.#animationDuration,
            timeLeft: this.getAnimationTimeLeft(),
            isShooting: this.isShooting(),
            hasValidSprites: this.hasValidSprites()
        };
    }

    // Validatie
    validate() {
        const issues = [];
        
        if (!this.#normalSprite) {
            issues.push('Normal sprite not loaded');
        }
        
        if (!this.#shootingSprite) {
            issues.push('Shooting sprite not loaded');
        }
        
        if (!this.#player.graphics) {
            issues.push('Player graphics not available');
        }
        
        if (issues.length > 0) {
            console.warn('PlayerAnimation validation issues:', issues);
        }
        
        return issues.length === 0;
    }
}
