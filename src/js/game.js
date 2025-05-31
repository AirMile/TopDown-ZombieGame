import '../css/style.css';
import { Engine, DisplayMode } from "excalibur";
import { ResourceLoader } from './resources.js';
import { UIManager } from './ui/uimanager.js';
import { CollisionManager } from './systems/collisionmanager.js';
import { HighScoreManager } from './systems/highscoremanager.js';
import { GameState } from './systems/gamestate.js';
import { SceneManager } from './systems/scenemanager.js';
import { InputManager } from './systems/inputmanager.js';
import { EntityManager } from './systems/entitymanager.js';
import { GameConfig } from './config/index.js';

export class Game extends Engine {
    constructor() {
        super({ 
            width: GameConfig.SCREEN_WIDTH,
            height: GameConfig.SCREEN_HEIGHT,
            maxFps: GameConfig.MAX_FPS,
            displayMode: DisplayMode.FitScreen
        });
        
        // Initialize management systems
        this.gameState = new GameState();
        this.sceneManager = new SceneManager(this, this.gameState);
        this.inputManager = new InputManager(this, this.gameState);
        this.entityManager = new EntityManager(this, this.gameState, this.sceneManager);
        
        // Initialize game systems
        this.uiManager = null;
        this.collisionManager = null;
        this.highScoreManager = new HighScoreManager();
        
        console.log('Game engine initialized with management systems');
        
        this.start(ResourceLoader).then(() => this.showMainMenu());
    }
    showMainMenu() {
        this.gameState.setState('MENU');
        this.clearGame();
        
        // Initialize UI manager for main menu
        this.uiManager = new UIManager(this);
        this.uiManager.createMainMenu();
        
        // Setup main menu input handlers
        this.inputManager.setupMainMenuInput(() => this.startNewGame());
        
        console.log('Main menu displayed');
    }
    
    startNewGame() {
        this.gameState.setState('PLAYING');
        this.clearGame();
        this.resetGameState();
        this.startGame();
        
        console.log('New game started');
    }
    
    resetGameState() {
        this.gameState.resetGame();
        
        // Prepare scene for new game
        this.sceneManager.prepareForNewGame();
        
        console.log('Game state reset');
    }
    
    clearGame() {
        // Clear UI
        if (this.uiManager) {
            this.uiManager.clearAll();
        }
        
        // Reset collision manager score
        if (this.collisionManager) {
            this.collisionManager.resetScore();
        }

        // Clean up all entities
        this.entityManager.cleanupAllEntities();
          console.log('Game cleared');
    }

    startGame() {
        // Initialize all game entities
        const entities = this.entityManager.initializeGameEntities();
        
        // Initialize game systems
        this.initializeUI();
        this.initializeCollisions();
        this.setupCamera();
        this.setupGameplayInput();
        
        // Start spawning
        this.entityManager.startSpawning();
        
        console.log('Game started with all systems initialized');
    }

    initializeUI() {
        const player = this.entityManager.getPlayer();
        
        this.uiManager = new UIManager(this);
        this.uiManager.createAmmoCounter();
        this.uiManager.createReloadIndicator();
        this.uiManager.createHealthCounter(player.currentHealth, player.maxHealth);
        this.uiManager.createScoreCounter();
        
        // Connect UI to player weapon system
        if (player && player.weapon) {
            player.weapon.setUIManager(this.uiManager);
        }
        
        console.log('UI initialized');
    }

    initializeCollisions() {
        this.collisionManager = new CollisionManager(this, this);
        this.collisionManager.setupCollisions();
        
        console.log('Collision system initialized');
    }

    setupCamera() {
        const player = this.entityManager.getPlayer();
        this.sceneManager.setupCamera(player);
        
        console.log('Camera setup completed');
    }

    setupGameplayInput() {
        // Setup debug input for testing
        this.inputManager.setupDebugInput({
            showDebugInfo: () => this.showDebugInfo(),
            spawnTestZombies: () => this.entityManager.spawnTestZombies(),
            toggleGodMode: () => this.toggleGodMode(),
            resetGame: () => this.startNewGame()
        });
        
        // Setup gameplay input (pause, menu, etc.)
        this.inputManager.setupGameplayInput(
            () => this.pauseGame(),
            () => this.showMainMenu()
        );
        
        console.log('Gameplay input setup completed');    }

    onPreUpdate(engine, delta) {
        super.onPreUpdate(engine, delta);

        // Only update game logic when actually playing
        if (!this.gameState.canUpdate()) {
            return;
        }

        // Update entities through entity manager
        this.entityManager.updateEntities(delta);

        // Update camera rotation
        this.updateCamera();
        
        // Update UI
        this.updateUI();
    }

    updateCamera() {
        const player = this.entityManager.getPlayer();
        if (player) {
            // Use config for camera rotation offset
            this.sceneManager.updateCameraRotation(player);
        }
    }

    updateUI() {
        const player = this.entityManager.getPlayer();
        
        // Update ammo counter if player weapon exists
        if (player?.weapon) {
            const currentAmmo = player.weapon.getCurrentAmmo();
            const totalAmmo = player.weapon.getTotalAmmo();
            this.uiManager.updateAmmo(currentAmmo, player.weapon.maxBullets, totalAmmo);
            this.uiManager.showReloadIndicator(player.weapon.reloading);
        }
    }

    endGame() {
        this.gameState.setGameOver(true);
        
        const finalScore = this.collisionManager.getScore();
        
        // Check and update high score
        const isNewHighScore = this.highScoreManager.checkAndUpdateHighScore(finalScore);
        
        // Stop spawning
        this.entityManager.stopSpawning();
        
        // Kill all entities for dramatic effect
        this.sceneManager.prepareForGameOver();
        
        // Create game over screen with high score info
        this.uiManager.createGameOverScreen(finalScore, this.highScoreManager.getHighScore(), isNewHighScore);
        
        // Setup game over input handlers
        this.inputManager.setupGameOverInput(
            () => this.startNewGame(),
            () => this.showMainMenu()
        );
        
        console.log(`Game ended - Final score: ${finalScore}, New high score: ${isNewHighScore}`);
    }

    // Helper methods for entity management
    spawnZombieAt(type, x, y) {
        return this.entityManager.spawnZombieAt(type, x, y);
    }

    startWaveMode() {
        this.entityManager.startSpawning();
    }

    // Get current game statistics
    getGameStats() {
        const player = this.entityManager.getPlayer();
        const spawner = this.entityManager.getSpawner();
        
        return {
            playerHealth: player?.currentHealth || 0,
            playerMaxHealth: player?.maxHealth || 100,
            score: this.collisionManager?.getScore() || 0,
            difficulty: spawner?.difficulty || 1,
            spawnInterval: spawner?.spawnInterval || 2000,
            gameState: this.gameState.getState(),
            entityCounts: this.entityManager.getEntityCounts()
        };
    }

    // Debug methods
    showDebugInfo() {
        const stats = this.getGameStats();
        const gameStateInfo = this.gameState.getDebugInfo();
        const entityInfo = this.entityManager.getTrackedEntities();
        
        console.log('=== DEBUG INFO ===');
        console.log('Game Stats:', stats);
        console.log('Game State:', gameStateInfo);
        console.log('Entities:', entityInfo);
        console.log('==================');
    }

    toggleGodMode() {
        const player = this.entityManager.getPlayer();
        if (player) {
            player.godMode = !player.godMode;
            console.log('God mode:', player.godMode ? 'ENABLED' : 'DISABLED');
        }
    }

    pauseGame() {
        // TODO: Implement pause functionality
        console.log('Pause requested (not yet implemented)');
    }
}

// Start the game
new Game();
