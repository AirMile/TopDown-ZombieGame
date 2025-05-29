import '../css/style.css';
import { Engine, DisplayMode } from "excalibur";
import { ResourceLoader } from './resources.js';
import { Player } from './player/player.js';
import { ZombieSpawner } from './zombies/zombiespawner.js';
import { ZombieWaveManager } from './zombies/zombiewave.js';
import { UIManager } from './ui/uimanager.js';
import { CollisionManager } from './systems/collisionmanager.js';

export class Game extends Engine {
    constructor() {
        super({ 
            width: 1280,
            height: 720,
            maxFps: 60,
            displayMode: DisplayMode.FitScreen
        });
        
        // Game state
        this.gameTimeRemaining = 180; // 3 minutes
        this.isGameOver = false;
        
        // Initialize systems
        this.player = null;
        this.spawner = null;
        this.waveManager = null;
        this.uiManager = null;
        this.collisionManager = null;
        
        this.start(ResourceLoader).then(() => this.startGame());
    }    startGame() {
        // Initialize systems
        this.initializePlayer();
        this.initializeSpawner();
        this.initializeUI();
        this.initializeCollisions();
        this.setupCamera();
        
        // Start the game
        this.spawnInitialZombies();
    }    initializePlayer() {
        this.player = new Player();
        this.add(this.player);
    }

    initializeSpawner() {
        this.spawner = new ZombieSpawner(this);
        this.waveManager = new ZombieWaveManager(this.spawner, this.uiManager);
        
        // Configure waves (optional - voor later gebruik)
        this.waveManager.addWave({
            enemies: [
                { type: 'slow', count: 5, startX: 200, startY: 300 },
                { type: 'fast', count: 3, startX: 800, startY: 300 }
            ],
            delay: 0,
            message: "Wave 1: Warm-up"
        });
        
        this.waveManager.addWave({
            enemies: [
                { type: 'slow', count: 8, startX: 200, startY: 200 },
                { type: 'fast', count: 5, startX: 900, startY: 400 }
            ],
            delay: 30000, // 30 seconds after wave 1            message: "Wave 2: Getting Serious"
        });
    }

    initializeUI() {
        this.uiManager = new UIManager(this);
        this.uiManager.createTimer(this.gameTimeRemaining);
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

    setupCamera() {
        this.currentScene.camera.strategy.lockToActor(this.player);
    }

    spawnInitialZombies() {
        // Spawn initial zombies using the spawner
        this.spawner.addSpawnConfig({
            type: 'slow',
            count: 10,
            startX: 200,
            startY: 300,
            spreadX: 60,
            spreadY: 200
        });
        
        this.spawner.addSpawnConfig({
            type: 'fast',
            count: 10,
            startX: 800,
            startY: 300,
            spreadX: 60,
            spreadY: 200
        });
          this.spawner.spawnAll();
        
        // Optionally start wave system instead
        // this.waveManager.startWaves();
    }

    onPreUpdate(engine, delta) {
        super.onPreUpdate(engine, delta);

        if (this.isGameOver) return;

        // Update game timer
        this.updateGameTimer(delta);
        
        // Update camera rotation
        this.updateCamera();
        
        // Update UI
        this.updateUI();
    }

    updateGameTimer(delta) {
        this.gameTimeRemaining -= delta / 1000;
        
        if (this.gameTimeRemaining <= 0) {
            this.gameTimeRemaining = 0;
            this.endGame();
        }
    }

    updateCamera() {
        if (this.player) {
            // Camera rotation follows player with 180 degree offset
            this.currentScene.camera.rotation = -this.player.rotation + Math.PI / 2 + Math.PI;
        }
    }

    updateUI() {
        // Update timer
        this.uiManager.updateTimer(this.gameTimeRemaining);
        
        // Update ammo counter if player weapon exists
        if (this.player?.weapon) {
            const currentAmmo = this.player.weapon.maxBullets - this.player.weapon.bulletsFired;
            this.uiManager.updateAmmo(currentAmmo, this.player.weapon.maxBullets);
            this.uiManager.showReloadIndicator(this.player.weapon.reloading);
        }
    }

    endGame() {        this.isGameOver = true;
        this.uiManager.createGameOverScreen();
        
        // Stop any ongoing waves
        if (this.waveManager) {
            this.waveManager.stopWaves();
        }
    }

    // Helper method to spawn zombies during gameplay
    spawnZombieAt(type, x, y) {
        return this.spawner.spawnZombieAt(type, x, y);
    }

    // Method to start wave-based gameplay
    startWaveMode() {
        this.waveManager.startWaves();
    }

    // Helper method to get current game statistics
    getGameStats() {
        return {
            timeRemaining: this.gameTimeRemaining,
            playerHealth: this.player?.currentHealth || 0,
            playerMaxHealth: this.player?.maxHealth || 100,
            score: this.collisionManager?.getScore() || 0,
            currentWave: this.waveManager?.getCurrentWave() || 0,
            totalWaves: this.waveManager?.getTotalWaves() || 0
        };
    }    // Debug method to spawn test zombies
    spawnTestZombies() {
        this.spawner.spawnZombieAt('slow', 200, 150);
        this.spawner.spawnZombieAt('fast', 250, 150);
    }
}

// Start the game
new Game();
