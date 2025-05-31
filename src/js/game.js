import '../css/style.css';
import { Engine, DisplayMode, Keys } from "excalibur";
import { ResourceLoader } from './resources.js';
import { Background } from './background.js';
import { Player } from './player/player.js';
import { ZombieSpawner } from './zombies/zombiespawner.js';
import { UIManager } from './ui/uimanager.js';
import { CollisionManager } from './systems/collisionmanager.js';
import { HighScoreManager } from './systems/highscoremanager.js';

export class Game extends Engine {
    constructor() {
        super({ 
            width: 1280,
            height: 720,
            maxFps: 60,
            displayMode: DisplayMode.FitScreen
        });
          // Game states
        this.gameState = 'MENU'; // 'MENU', 'PLAYING', 'GAME_OVER'
        this.isGameOver = false;
          // Initialize systems
        this.player = null;
        this.spawner = null;
        this.uiManager = null;
        this.collisionManager = null;
        this.highScoreManager = new HighScoreManager();
        
        this.start(ResourceLoader).then(() => this.showMainMenu());
    }
    
    showMainMenu() {
        this.gameState = 'MENU';
        this.clearGame();
        
        // Initialize UI manager for main menu
        this.uiManager = new UIManager(this);
        this.uiManager.createMainMenu();
        
        // Setup main menu input handlers
        this.setupMainMenuInput();
    }
    
    setupMainMenuInput() {
        this.input.keyboard.on('press', (evt) => {
            if (this.gameState === 'MENU' && evt.key === Keys.Space) {
                this.startNewGame();
            }
        });
    }
    
    startNewGame() {
        this.gameState = 'PLAYING';
        this.clearGame();
        this.resetGameState();
        this.startGame();
    }
      resetGameState() {
        this.isGameOver = false;
        
        // Clear all actors from the scene
        this.currentScene.clear();
    }
      clearGame() {
        
        // Remove all actors from current scene
        if (this.currentScene) {
            this.currentScene.clear();
        }
        
        // Clear UI
        if (this.uiManager) {
            this.uiManager.clearAll();
        }
        
        // Reset collision manager score
        if (this.collisionManager) {
            this.collisionManager.resetScore();
        }

        // Stop spawner
        if (this.spawner) {
            this.spawner.stop();
        }
          // Reset references
        this.player = null;
        this.spawner = null;
        this.collisionManager = null;
        this.background = null;
        
    }    startGame() {
        // Initialize background first (behind everything)
        this.initializeBackground();
        
        // Initialize systems
        this.initializePlayer();
        this.initializeSpawner();
        this.initializeUI();
        this.initializeCollisions();
        this.setupCamera();
        
        // Setup input handlers for gameplay
        this.setupGameOverInput();
        
        // Start the game
        this.spawnInitialZombies();
    }initializePlayer() {
        this.player = new Player();
        this.add(this.player);
        
        // Enable shooting after the delay to prevent immediate shooting when starting with SPACE
        this.enablePlayerShootingAfterDelay();
    }

    initializeBackground() {
        // Maak een enorme map van 20000x20000 pixels voor veel ruimte om te bewegen
        const mapWidth = 20000;
        const mapHeight = 20000;
        
        
        this.background = new Background(mapWidth, mapHeight);
        this.add(this.background);
        
    }initializeSpawner() {
        this.spawner = new ZombieSpawner(this);
    }    initializeUI() {
        this.uiManager = new UIManager(this);
        this.uiManager.createAmmoCounter();
        this.uiManager.createReloadIndicator();
        this.uiManager.createHealthCounter(this.player.currentHealth, this.player.maxHealth);
        this.uiManager.createScoreCounter();
          // Connect UI to player weapon system
        if (this.player && this.player.weapon) {
            this.player.weapon.setUIManager(this.uiManager);
        }
    }

    initializeCollisions() {
        this.collisionManager = new CollisionManager(this, this);
        this.collisionManager.setupCollisions();
    }

    enablePlayerShootingAfterDelay() {
        // Enable shooting after a short delay to prevent immediate shooting when starting with SPACE
        setTimeout(() => {
            if (this.player) {
                this.player.shootingEnabled = true;
            }
        }, this.player.shootingDelayTime);
    }

    setupCamera() {
        this.currentScene.camera.strategy.lockToActor(this.player);
    }    spawnInitialZombies() {
        // Start het continuous spawning systeem
        this.spawner.start();
        
    }    onPreUpdate(engine, delta) {
        super.onPreUpdate(engine, delta);

        // Only update game logic when actually playing
        if (this.gameState !== 'PLAYING' || this.isGameOver) {
            return;
        }

        // Update spawner
        if (this.spawner) {
            this.spawner.update(delta);
        }

        // Update camera rotation
        this.updateCamera();
        
        // Update UI
        this.updateUI();
    }    updateCamera() {
        if (this.player) {
            // Camera rotation follows player with 180 degree offset
            this.currentScene.camera.rotation = -this.player.rotation + Math.PI / 2 + Math.PI;
        }
    }    updateUI() {
        // Update ammo counter if player weapon exists
        if (this.player?.weapon) {
            const currentAmmo = this.player.weapon.getCurrentAmmo();
            const totalAmmo = this.player.weapon.getTotalAmmo();
            this.uiManager.updateAmmo(currentAmmo, this.player.weapon.maxBullets, totalAmmo);
            this.uiManager.showReloadIndicator(this.player.weapon.reloading);
        }
    }endGame() {
        this.gameState = 'GAME_OVER';
        this.isGameOver = true;
        
        
        const finalScore = this.collisionManager.getScore();
        
        // Check en update high score
        const isNewHighScore = this.highScoreManager.checkAndUpdateHighScore(finalScore);
        

        // Stop spawner
        if (this.spawner) {
            this.spawner.stop();
        }
        
        // Kill all entities including player
        this.killAllEntities();
        
        // Create game over screen met high score info
        this.uiManager.createGameOverScreen(finalScore, this.highScoreManager.getHighScore(), isNewHighScore);
        
        // Setup game over input handlers
        this.setupGameOverInput();
        
    }
    
    killAllEntities() {
        
        // Get all actors in the current scene
        const allActors = this.currentScene.actors;
        const entityCount = allActors.length;
        
        
        // Kill all actors (including player, zombies, bullets)
        allActors.forEach(actor => {
            if (actor && typeof actor.kill === 'function') {
                actor.kill();
            }
        });
        
        // Clear the scene completely
        this.currentScene.clear();
        
    }    setupGameOverInput() {
        // Remove existing input handlers to avoid conflicts
        this.input.keyboard.off('press');
          this.input.keyboard.on('press', (evt) => {
            if (this.gameState === 'GAME_OVER') {
                if (evt.key === Keys.Space) {
                    // Restart game
                    this.startNewGame();
                } else if (evt.key === Keys.Escape) {
                    // Return to main menu
                    this.showMainMenu();
                }
            }
        });
    }

    // Helper method to spawn zombies during gameplay
    spawnZombieAt(type, x, y) {
        return this.spawner.spawnZombieAt(type, x, y);
    }

    // Method to start wave-based gameplay
    startWaveMode() {
        this.spawner.start();
    }    // Helper method to get current game statistics
    getGameStats() {
        return {
            playerHealth: this.player?.currentHealth || 0,
            playerMaxHealth: this.player?.maxHealth || 100,
            score: this.collisionManager?.getScore() || 0,
            difficulty: this.spawner?.difficulty || 1,
            spawnInterval: this.spawner?.spawnInterval || 2000
        };
    }// Debug method to spawn test zombies
    spawnTestZombies() {
        this.spawner.spawnZombieAt('slow', 200, 150);
        this.spawner.spawnZombieAt('fast', 250, 150);
    }
}

// Start the game
new Game();
