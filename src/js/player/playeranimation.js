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
    }

    // Private helper voor sprite instellen
    #setPlayerSprite(sprite) {
        this.#player.graphics?.use?.(sprite);
    }

    // Private helper voor state wissel
    #switchState(state, sprite, timer = 0) {
        this.#currentState = state;
        this.#animationTimer = timer;
        this.#setPlayerSprite(sprite);
    }

    #initializeSprites() {
        this.#normalSprite = Resources.Player.toSprite();
        if (this.#normalSprite) {
            this.#normalSprite.scale = new Vector(
                PlayerConfig.NORMAL_SPRITE_SCALE.x, 
                PlayerConfig.NORMAL_SPRITE_SCALE.y
            );
            this.#normalSprite.rotation = PlayerConfig.NORMAL_SPRITE_ROTATION;
        }

        this.#shootingSprite = Resources.Shooting.toSprite();
        if (this.#shootingSprite) {
            this.#shootingSprite.scale = new Vector(
                PlayerConfig.SHOOTING_SPRITE_SCALE.x, 
                PlayerConfig.SHOOTING_SPRITE_SCALE.y
            );
            this.#shootingSprite.rotation = PlayerConfig.SHOOTING_SPRITE_ROTATION;
            this.#shootingSprite.offset = new Vector(0, 0);
        }

        this.#setPlayerSprite(this.#normalSprite);
    }

    update(delta) {
        if (this.#currentState === 'shooting') {
            this.#animationTimer -= delta;
            if (this.#animationTimer <= 0) {
                this.setNormalState();
            }
        }
    }

    setNormalState() {
        if (this.#currentState !== 'normal') {
            this.#switchState('normal', this.#normalSprite, 0);
        }
    }

    setShootingState() {
        if (this.#currentState !== 'shooting') {
            this.#switchState('shooting', this.#shootingSprite, this.#animationDuration);
        } else {
            this.#animationTimer = this.#animationDuration;
        }
    }

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

    triggerShootingAnimation() {
        this.setShootingState();
    }

    stopShootingAnimation() {
        this.setNormalState();
    }

    forceNormalState() {
        this.#switchState('normal', this.#normalSprite, 0);
    }

    forceShootingState(duration = null) {
        this.#switchState('shooting', this.#shootingSprite, duration || this.#animationDuration);
    }

    getSprites() {
        return {
            normal: this.#normalSprite,
            shooting: this.#shootingSprite
        };
    }

    hasValidSprites() {
        return this.#normalSprite !== null && this.#shootingSprite !== null;
    }

    setAnimationDuration(duration) {
        this.#animationDuration = duration;
    }

    getAnimationDuration() {
        return this.#animationDuration;
    }

    flashSprite(flashCount = 3, flashDuration = 100) {
        let flashes = 0;
        const originalSprite = this.#player.graphics?.current;
        const flashInterval = setInterval(() => {
            if (flashes >= flashCount * 2) {
                clearInterval(flashInterval);
                this.#player.graphics?.use?.(originalSprite);
                if (this.#player.graphics) this.#player.graphics.opacity = 1.0;
                return;
            }
            if (flashes % 2 === 0) {
                if (this.#player.graphics) this.#player.graphics.opacity = 0.3;
            } else {
                if (this.#player.graphics) this.#player.graphics.opacity = 1.0;
            }
            flashes++;
        }, flashDuration);
    }

    reset() {
        this.#currentState = 'normal';
        this.#animationTimer = 0;
        this.setNormalState();
    }

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
