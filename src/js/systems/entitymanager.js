import { Player } from '../player/player.js';
import { ZombieSpawner } from '../zombies/zombiespawner.js';
import { Background } from '../background.js';
import { GameConfig } from '../config/index.js';

export class EntityManager {
    #engine
    #gameState
    #sceneManager
    
    // Entity references
    #player
    #spawner
    #background
    #entities

    constructor(engine, gameState, sceneManager) {
        this.#engine = engine;
        this.#gameState = gameState;
        this.#sceneManager = sceneManager;
        
        // Entity tracking
        this.#player = null;
        this.#spawner = null;
        this.#background = null;
        this.#entities = new Map();
        
        console.log('EntityManager initialized');
    }

    // Player management
    createPlayer() {
        if (this.#player) {
            console.warn('Player already exists, removing old player');
            this.removePlayer();
        }
        
        this.#player = new Player();
        this.#engine.add(this.#player);
        
        // Track player
        this.#entities.set('player', this.#player);
        
        console.log('Player created and added to scene');
        
        return this.#player;
    }

    getPlayer() {
        return this.#player;
    }

    removePlayer() {
        if (this.#player) {
            this.#sceneManager.removeActor(this.#player);
            this.#entities.delete('player');
            this.#player = null;
            
            console.log('Player removed');
        }
    }

    enablePlayerShootingAfterDelay() {
        if (this.#player) {
            // Gebruik de player's eigen shootingDelayTime
            setTimeout(() => {
                if (this.#player) {
                    this.#player.shootingEnabled = true;
                    console.log('Player shooting enabled after delay');
                }
            }, this.#player.shootingDelayTime);
        }
    }

    // Background management
    createBackground() {
        if (this.#background) {
            console.warn('Background already exists, removing old background');
            this.removeBackground();
        }
        
        // Create huge map for movement space
        const mapWidth = GameConfig.WORLD_WIDTH;
        const mapHeight = GameConfig.WORLD_HEIGHT;
        
        this.#background = new Background(mapWidth, mapHeight);
        this.#engine.add(this.#background);
        
        // Track background
        this.#entities.set('background', this.#background);
        
        console.log(`Background created: ${mapWidth}x${mapHeight} pixels`);
        
        return this.#background;
    }

    getBackground() {
        return this.#background;
    }

    removeBackground() {
        if (this.#background) {
            this.#sceneManager.removeActor(this.#background);
            this.#entities.delete('background');
            this.#background = null;
            
            console.log('Background removed');
        }
    }

    // Spawner management
    createSpawner() {
        if (this.#spawner) {
            console.warn('Spawner already exists, removing old spawner');
            this.removeSpawner();
        }
        
        this.#spawner = new ZombieSpawner(this.#engine);
        
        // Track spawner (spawner doesn't need to be added to scene)
        this.#entities.set('spawner', this.#spawner);
        
        console.log('Zombie spawner created');
        
        return this.#spawner;
    }

    getSpawner() {
        return this.#spawner;
    }

    removeSpawner() {
        if (this.#spawner) {
            this.#spawner.stop();
            this.#entities.delete('spawner');
            this.#spawner = null;
            
            console.log('Spawner removed and stopped');
        }
    }

    startSpawning() {
        if (this.#spawner) {
            this.#spawner.start();
            console.log('Spawning started');
        } else {
            console.warn('Cannot start spawning: no spawner available');
        }
    }

    stopSpawning() {
        if (this.#spawner) {
            this.#spawner.stop();
            console.log('Spawning stopped');
        }
    }

    // Entity lifecycle management
    initializeGameEntities() {
        console.log('Initializing all game entities...');
        
        // Create entities in proper order
        this.createBackground();
        this.createPlayer();
        this.createSpawner();
        
        // Setup player shooting delay
        this.enablePlayerShootingAfterDelay();
        
        console.log('All game entities initialized');
        
        return {
            player: this.#player,
            spawner: this.#spawner,
            background: this.#background
        };
    }

    cleanupAllEntities() {
        console.log('Cleaning up all entities...');
        
        // Stop spawner first
        this.stopSpawning();
        
        // Remove tracked entities
        this.removeSpawner();
        this.removePlayer();
        this.removeBackground();
        
        // Clear entity tracking
        this.#entities.clear();
        
        console.log('All entities cleaned up');
    }

    // Entity spawning helpers
    spawnZombieAt(type, x, y) {
        if (this.#spawner) {
            return this.#spawner.spawnZombieAt(type, x, y);
        } else {
            console.warn('Cannot spawn zombie: no spawner available');
            return null;
        }
    }

    spawnTestZombies() {
        if (this.#spawner && this.#player) {
            const playerPos = this.#player.pos;
            
            // Spawn test zombies around player
            this.spawnZombieAt('slow', playerPos.x + 200, playerPos.y + 150);
            this.spawnZombieAt('fast', playerPos.x + 250, playerPos.y + 150);
            
            console.log('Test zombies spawned');
        } else {
            console.warn('Cannot spawn test zombies: missing spawner or player');
        }
    }

    // Entity updates
    updateEntities(delta) {
        // Update spawner if playing
        if (this.#gameState.canUpdate() && this.#spawner) {
            this.#spawner.update(delta);
        }
    }

    // Entity information
    getEntityCounts() {
        const scene = this.#engine.currentScene;
        
        if (!scene) {
            return { total: 0, players: 0, zombies: 0, bullets: 0 };
        }
        
        const actors = scene.actors;
        const counts = {
            total: actors.length,
            players: 0,
            zombies: 0,
            bullets: 0,
            backgrounds: 0,
            other: 0
        };
        
        actors.forEach(actor => {
            const type = actor.constructor.name.toLowerCase();
            
            if (type.includes('player')) {
                counts.players++;
            } else if (type.includes('zombie')) {
                counts.zombies++;
            } else if (type.includes('bullet')) {
                counts.bullets++;
            } else if (type.includes('background')) {
                counts.backgrounds++;
            } else {
                counts.other++;
            }
        });
        
        return counts;
    }

    getTrackedEntities() {
        const entities = {};
        
        this.#entities.forEach((entity, key) => {
            entities[key] = entity.constructor.name;
        });
        
        return entities;
    }

    // Validation methods
    validateEntities() {
        const hasPlayer = this.#player !== null;
        const hasSpawner = this.#spawner !== null;
        const hasBackground = this.#background !== null;
        
        const entityCounts = this.getEntityCounts();
        
        console.log('Entity validation:', {
            hasPlayer,
            hasSpawner,
            hasBackground,
            sceneActors: entityCounts
        });
        
        return hasPlayer && hasSpawner;
    }

    // Debug methods
    logEntityStatus() {
        const tracked = this.getTrackedEntities();
        const counts = this.getEntityCounts();
        
        console.log('Entity Status:', {
            tracked,
            sceneCounts: counts,
            gameState: this.#gameState.getState()
        });
    }
}
