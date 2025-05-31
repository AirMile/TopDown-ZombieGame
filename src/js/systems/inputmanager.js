import { Keys } from 'excalibur';
import { GameConfig } from '../config/index.js';

export class InputManager {
    #engine
    #gameState
    #callbacks
    #currentHandlers

    constructor(engine, gameState) {
        this.#engine = engine;
        this.#gameState = gameState;
        this.#callbacks = {};
        this.#currentHandlers = [];
        
        console.log('InputManager initialized');
    }

    // Handler registration methods
    registerCallback(event, callback) {
        if (!this.#callbacks[event]) {
            this.#callbacks[event] = [];
        }
        
        this.#callbacks[event].push(callback);
        
        console.log(`Callback registered for event: ${event}`);
    }

    // Clear all input handlers
    clearAllHandlers() {
        // Remove all keyboard event listeners
        this.#engine.input.keyboard.off('press');
        this.#engine.input.keyboard.off('hold');
        this.#engine.input.keyboard.off('release');
        
        // Clear handler tracking
        this.#currentHandlers = [];
        
        console.log('All input handlers cleared');
    }

    // Menu input setup
    setupMainMenuInput(startGameCallback) {
        this.clearAllHandlers();
        
        const handler = (evt) => {
            if (this.#gameState.isMenu() && evt.key === Keys.Space) {
                console.log('Space pressed in main menu - starting game');
                startGameCallback();
            }
        };
        
        this.#engine.input.keyboard.on('press', handler);
        this.#currentHandlers.push({ event: 'press', handler });
        
        console.log('Main menu input handlers setup');
    }

    // Game over input setup
    setupGameOverInput(restartCallback, menuCallback) {
        this.clearAllHandlers();
        
        const handler = (evt) => {
            if (this.#gameState.isGameOver()) {
                if (evt.key === Keys.Space) {
                    console.log('Space pressed in game over - restarting game');
                    restartCallback();
                } else if (evt.key === Keys.Escape) {
                    console.log('Escape pressed in game over - returning to menu');
                    menuCallback();
                }
            }
        };
        
        this.#engine.input.keyboard.on('press', handler);
        this.#currentHandlers.push({ event: 'press', handler });
        
        console.log('Game over input handlers setup');
    }

    // Gameplay input setup (mainly for pause/menu functionality)
    setupGameplayInput(pauseCallback, menuCallback) {
        // Note: Player movement and shooting is handled in player classes
        // This is for game-level controls like pause, menu, etc.
        
        const handler = (evt) => {
            if (this.#gameState.isPlaying()) {
                if (evt.key === Keys.Escape) {
                    console.log('Escape pressed during gameplay');
                    if (menuCallback) {
                        menuCallback();
                    }
                } else if (evt.key === Keys.P) {
                    console.log('P pressed - pause requested');
                    if (pauseCallback) {
                        pauseCallback();
                    }
                }
            }
        };
        
        this.#engine.input.keyboard.on('press', handler);
        this.#currentHandlers.push({ event: 'press', handler });
        
        console.log('Gameplay input handlers setup');
    }

    // Debug input setup
    setupDebugInput(debugCallbacks = {}) {
        const handler = (evt) => {
            // Debug keys work in any state
            switch (evt.key) {
                case Keys.F1:
                    console.log('F1 pressed - debug info');
                    if (debugCallbacks.showDebugInfo) {
                        debugCallbacks.showDebugInfo();
                    }
                    break;
                    
                case Keys.F2:
                    console.log('F2 pressed - spawn test zombies');
                    if (debugCallbacks.spawnTestZombies) {
                        debugCallbacks.spawnTestZombies();
                    }
                    break;
                    
                case Keys.F3:
                    console.log('F3 pressed - god mode toggle');
                    if (debugCallbacks.toggleGodMode) {
                        debugCallbacks.toggleGodMode();
                    }
                    break;
                    
                case Keys.F4:
                    console.log('F4 pressed - reset game');
                    if (debugCallbacks.resetGame) {
                        debugCallbacks.resetGame();
                    }
                    break;
            }
        };
        
        this.#engine.input.keyboard.on('press', handler);
        this.#currentHandlers.push({ event: 'press', handler, isDebug: true });
        
        console.log('Debug input handlers setup');
    }

    // Input state checking methods
    isKeyPressed(key) {
        return this.#engine.input.keyboard.wasPressed(key);
    }

    isKeyHeld(key) {
        return this.#engine.input.keyboard.isHeld(key);
    }

    isKeyReleased(key) {
        return this.#engine.input.keyboard.wasReleased(key);
    }

    // Movement input helpers (for player systems)
    getMovementInput() {
        const input = {
            up: this.isKeyHeld(Keys.W) || this.isKeyHeld(Keys.Up),
            down: this.isKeyHeld(Keys.S) || this.isKeyHeld(Keys.Down),
            left: this.isKeyHeld(Keys.A) || this.isKeyHeld(Keys.Left),
            right: this.isKeyHeld(Keys.D) || this.isKeyHeld(Keys.Right)
        };
        
        return input;
    }

    // Action input helpers
    getActionInput() {
        const input = {
            shoot: this.isKeyHeld(Keys.Space),
            reload: this.isKeyPressed(Keys.R),
            interact: this.isKeyPressed(Keys.E)
        };
        
        return input;
    }

    // State management
    getCurrentState() {
        return this.#gameState.getState();
    }

    // Handler info for debugging
    getActiveHandlers() {
        return this.#currentHandlers.map(h => ({
            event: h.event,
            isDebug: h.isDebug || false
        }));
    }

    // Validation methods
    validateInputState() {
        const handlerCount = this.#currentHandlers.length;
        const gameState = this.#gameState.getState();
        
        console.log(`Input validation: ${handlerCount} handlers active, game state: ${gameState}`);
        
        return handlerCount > 0;
    }

    // Cleanup
    destroy() {
        this.clearAllHandlers();
        this.#callbacks = {};
        
        console.log('InputManager destroyed');
    }
}
