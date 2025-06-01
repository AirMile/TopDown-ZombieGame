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
        });          // Game status
        this.gameState = 'MENU'; // 'MENU', 'PLAYING', 'GAME_OVER'
        this.isGameOver = false;
          // Initialiseer systemen
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
        // Initialiseer UI manager voor hoofdmenu
        this.uiManager = new UIManager(this);
        this.uiManager.createMainMenu();
        
        // Setup hoofdmenu input handlers
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
        this.startGame();
    }

    clearGame() {
        // Verwijder alle actors uit huidige scene
        if (this.currentScene) {
            this.currentScene.clear();
        }

        // Wis UI
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

        // Reset referenties
        this.player = null;
        this.spawner = null;
        this.collisionManager = null;
        this.background = null;
        this.isGameOver = false;
    }

    // resetGameState verwijderd, functionaliteit zit nu in clearGame
    startGame() {
        // Initialiseer achtergrond eerst (achter alles)
        this.initializeBackground();

        // Groepeer alle systeem-initialisaties in één methode
        this.initializeSystems();

        this.setupCamera();
        this.setupGameOverInput();
        this.spawnInitialZombies();
    }

    initializeSystems() {
        this.initializePlayer();
        this.initializeSpawner();
        this.initializeUI();
        this.initializeCollisions();
    }

    initializePlayer() {
        this.player = new Player();
        this.add(this.player);        
        // Schakel schieten in na de vertraging om onmiddellijk schieten te voorkomen bij starten met SPACE
        this.enablePlayerShootingAfterDelay();
    }

    initializeBackground() {
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
        this.uiManager.createScoreCounter();          // Verbind UI met player weapon systeem
        if (this.player && this.player.weapon) {
            this.player.weapon.setUIManager(this.uiManager);
        }
    }

    initializeCollisions() {
        this.collisionManager = new CollisionManager(this, this);
        this.collisionManager.setupCollisions();
    }    enablePlayerShootingAfterDelay() {
        // Schakel schieten in na een korte vertraging om onmiddellijk schieten te voorkomen bij starten met SPACE
        setTimeout(() => {
            if (this.player) {
                this.player.shootingEnabled = true;
            }
        }, this.player.shootingDelayTime);
    }

    setupCamera() {
        this.currentScene.camera.strategy.lockToActor(this.player);
    }    spawnInitialZombies() {
        // Start het continue spawning systeem
        this.spawner.start();
        
    }onPreUpdate(engine, delta) {
        super.onPreUpdate(engine, delta);

        // Update alleen game logica wanneer daadwerkelijk aan het spelen
        if (this.gameState !== 'PLAYING' || this.isGameOver) {
            return;
        }

        // Update spawner
        if (this.spawner) {
            this.spawner.update(delta);
        }

        // Update camera rotatie
        this.updateCamera();
        
        // Update UI
        this.updateUI();
    }    updateCamera() {
        if (this.player) {
            // Camera rotatie volgt player met 180 graden offset
            this.currentScene.camera.rotation = -this.player.rotation + Math.PI / 2 + Math.PI;
        }
    }    updateUI() {
        // Update ammo counter als player weapon bestaat
        if (this.player?.weapon) {
            const currentAmmo = this.player.weapon.getCurrentAmmo();
            const totalAmmo = this.player.weapon.getTotalAmmo();
            this.uiManager.updateAmmo(currentAmmo, this.player.weapon.maxBullets, totalAmmo);
            this.uiManager.showReloadIndicator(this.player.weapon.reloading);
        }
    }endGame() {
        this.gameState = 'GAME_OVER';
        this.isGameOver = true;
        
        
        const finalScore = this.collisionManager.getScore();        // Controleer en update high score
        const isNewHighScore = this.highScoreManager.checkAndUpdateHighScore(finalScore);
        


        // Stop spawner
        if (this.spawner) {
            this.spawner.stop();
        }
        
        // Vernietig alle entiteiten inclusief player
        this.killAllEntities();
          // Maak game over scherm met high score informatie
        this.uiManager.createGameOverScreen(finalScore, this.highScoreManager.getHighScore(), isNewHighScore);
        
        // Setup game over input handlers
        this.setupGameOverInput();
        
    }
      killAllEntities() {
        // Haal alle actors in de huidige scene op
        const allActors = this.currentScene.actors;
        const entityCount = allActors.length;

        // Vernietig alle actors (inclusief player, zombies, bullets)
        allActors.forEach(actor => {
            if (actor && typeof actor.kill === 'function') {
                actor.kill();
            }
        });

    }    setupGameOverInput() {
        // Verwijder bestaande input handlers om conflicten te voorkomen
        this.input.keyboard.off('press');
          this.input.keyboard.on('press', (evt) => {
            if (this.gameState === 'GAME_OVER') {
                if (evt.key === Keys.Space) {
                    // Herstart game
                    this.startNewGame();
                } else if (evt.key === Keys.Escape) {
                    // Keer terug naar hoofdmenu
                    this.showMainMenu();
                }
            }
        });
    }

    // Helper methode om zombies te spawnen tijdens gameplay
    spawnZombieAt(type, x, y) {
        return this.spawner.spawnZombieAt(type, x, y);
    }    // Helper methode om wave-gebaseerde gameplay te starten
    startWaveMode() {
        this.spawner.start();
    }    // Helper methode om huidige game statistieken op te halen
    getGameStats() {
        return {
            playerHealth: this.player?.currentHealth || 0,
            playerMaxHealth: this.player?.maxHealth || 100,
            score: this.collisionManager?.getScore() || 0,
            difficulty: this.spawner?.difficulty || 1,
            spawnInterval: this.spawner?.spawnInterval || 2000
        };
    }// Debug methode om test zombies te spawnen
    spawnTestZombies() {
        this.spawner.spawnZombieAt('slow', 200, 150);
        this.spawner.spawnZombieAt('fast', 250, 150);
    }
}

// Start het spel
new Game();
