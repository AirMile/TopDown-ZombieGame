import { Vector } from "excalibur";
import { SlowZombie } from "./slowzombie.js";
import { FastZombie } from "./fastzombie.js";
import { Player } from "../player/player.js";
import { SpawnerConfig } from "../config/spawnerconfig.js";

export class ZombieSpawner {
    constructor(engine) {
        this.engine = engine;
        
        // Continuous spawning configuration (veel agressiever gemaakt)
        this.spawnInterval = SpawnerConfig.INITIAL_SPAWN_INTERVAL; // Start waarde
        this.minSpawnInterval = SpawnerConfig.MIN_SPAWN_INTERVAL; // Minimale spawn interval
        this.difficulty = SpawnerConfig.DIFFICULTY.STARTING_DIFFICULTY; // Start moeilijkheidsgraad
        this.difficultyIncreaseRate = SpawnerConfig.DIFFICULTY.INCREASE_RATE; // Snellere moeilijkheidsverhoging
        this.spawnDistanceFromScreen = SpawnerConfig.SPAWN_DISTANCE_FROM_SCREEN;
        this.fastZombieChance = SpawnerConfig.FAST_ZOMBIE_CHANCE.INITIAL; // Kans op fast zombie
        
        // Timer systeem (snellere progressie)
        this.spawnTimer = 0;
        this.difficultyTimer = 0;
        this.difficultyIncreaseInterval = SpawnerConfig.DIFFICULTY.INCREASE_INTERVAL; // Hoe vaak difficulty stijgt
        
        // Status
        this.isActive = false;
    }

    start() {
        this.isActive = true;
        this.spawnTimer = 0;
        this.difficultyTimer = 0;
    }

    stop() {
        this.isActive = false;
    }

    update(delta) {
        if (!this.isActive) return;

        // Update difficulty timer
        this.difficultyTimer += delta;
        if (this.difficultyTimer >= this.difficultyIncreaseInterval) {
            this.increaseDifficulty();
            this.difficultyTimer = 0;
        }

        // Update spawn timer
        this.spawnTimer += delta;
        if (this.spawnTimer >= this.spawnInterval) {
            this.spawnZombieWave();
            this.spawnTimer = 0;
        }
    }    increaseDifficulty() {
        this.difficulty += this.difficultyIncreaseRate;
        
        // Bereken nieuwe spawn interval (sneller dan voorheen)
        this.spawnInterval = Math.max(this.minSpawnInterval, SpawnerConfig.INITIAL_SPAWN_INTERVAL / this.difficulty);
        
        // Update fast zombie kans (sneller stijgend)
        this.fastZombieChance = Math.min(
            SpawnerConfig.FAST_ZOMBIE_CHANCE.MAX, 
            SpawnerConfig.FAST_ZOMBIE_CHANCE.INITIAL + (this.difficulty - 1) * SpawnerConfig.FAST_ZOMBIE_CHANCE.INCREASE_RATE
        );
    }

    spawnZombieWave() {
        const player = this.findPlayer();
        if (!player) {
            return;
        }

        // Bereken aantal zombies voor deze wave (meer agressief)
        const baseZombies = 1 + Math.floor((this.difficulty - 1) * SpawnerConfig.DIFFICULTY.BASE_ZOMBIES_MULTIPLIER);
        const totalZombies = Math.min(SpawnerConfig.DIFFICULTY.MAX_ZOMBIES_PER_WAVE, baseZombies);
        
        // Kies random spawn patroon
        const patterns = ['single', 'line', 'circle', 'cluster'];
        const selectedPattern = patterns[Math.floor(Math.random() * patterns.length)];
        
        // Spawn zombies volgens het gekozen patroon
        this.spawnPattern(selectedPattern, totalZombies, player);
    }

    findPlayer() {
        // Methode 1: Zoek via tags
        const taggedPlayers = this.engine.currentScene.actors.filter(actor => actor.tags && actor.tags.has('player'));
        if (taggedPlayers.length > 0) {
            return taggedPlayers[0];
        }

        // Methode 2: Zoek via instanceof Player
        const playerInstances = this.engine.currentScene.actors.filter(actor => actor instanceof Player);
        if (playerInstances.length > 0) {
            return playerInstances[0];
        }

        // Methode 3: Zoek via properties (fallback)
        const playerLikeActors = this.engine.currentScene.actors.filter(actor => 
            actor.weapon && actor.movement && actor.currentHealth !== undefined
        );
        if (playerLikeActors.length > 0) {
            return playerLikeActors[0];
        }

        return null;
    }

    calculateSpawnPosition(player) {
        const screenWidth = this.engine.drawWidth;
        const screenHeight = this.engine.drawHeight;
        const spawnDistance = this.spawnDistanceFromScreen;
        
        // Kies random kant van het scherm (0 = boven, 1 = rechts, 2 = onder, 3 = links)
        const side = Math.floor(Math.random() * 4);
        
        let spawnX, spawnY;
        
        switch (side) {
            case 0: // Boven
                spawnX = player.pos.x + (Math.random() - 0.5) * screenWidth;
                spawnY = player.pos.y - screenHeight / 2 - spawnDistance;
                break;
            case 1: // Rechts
                spawnX = player.pos.x + screenWidth / 2 + spawnDistance;
                spawnY = player.pos.y + (Math.random() - 0.5) * screenHeight;
                break;
            case 2: // Onder
                spawnX = player.pos.x + (Math.random() - 0.5) * screenWidth;
                spawnY = player.pos.y + screenHeight / 2 + spawnDistance;
                break;
            case 3: // Links
                spawnX = player.pos.x - screenWidth / 2 - spawnDistance;
                spawnY = player.pos.y + (Math.random() - 0.5) * screenHeight;
                break;
        }
        
        return new Vector(spawnX, spawnY);
    }

    spawnPattern(pattern, totalZombies, player) {
        const basePosition = this.calculateSpawnPosition(player);
        
        switch (pattern) {
            case 'single':
                this.spawnSingleZombie(basePosition);
                break;
            case 'line':
                this.spawnLinePattern(basePosition, totalZombies);
                break;
            case 'circle':
                this.spawnCirclePattern(basePosition, totalZombies);
                break;
            case 'cluster':
                this.spawnClusterPattern(basePosition, totalZombies);
                break;
        }
    }

    spawnSingleZombie(position) {
        const zombieType = Math.random() < this.fastZombieChance ? 'fast' : 'slow';
        this.createAndAddZombie(zombieType, position);
    }

    spawnLinePattern(basePosition, count) {
        const spacing = SpawnerConfig.SPAWN_PATTERNS.LINE_SPACING; // spacing tussen zombies
        const startOffset = -(count - 1) * spacing / 2;
        
        for (let i = 0; i < count; i++) {
            const offset = startOffset + i * spacing;
            const position = new Vector(basePosition.x + offset, basePosition.y);
            const zombieType = Math.random() < this.fastZombieChance ? 'fast' : 'slow';
            this.createAndAddZombie(zombieType, position);
        }
    }

    spawnCirclePattern(basePosition, count) {
        const radius = SpawnerConfig.SPAWN_PATTERNS.CIRCLE_RADIUS; // radius
        
        for (let i = 0; i < count; i++) {
            const angle = (i / count) * 2 * Math.PI;
            const x = basePosition.x + Math.cos(angle) * radius;
            const y = basePosition.y + Math.sin(angle) * radius;
            const position = new Vector(x, y);
            const zombieType = Math.random() < this.fastZombieChance ? 'fast' : 'slow';
            this.createAndAddZombie(zombieType, position);
        }
    }

    spawnClusterPattern(basePosition, count) {
        const maxSpread = SpawnerConfig.SPAWN_PATTERNS.CLUSTER_MAX_SPREAD; // max spread
        
        for (let i = 0; i < count; i++) {
            const randomX = basePosition.x + (Math.random() - 0.5) * maxSpread;
            const randomY = basePosition.y + (Math.random() - 0.5) * maxSpread;
            const position = new Vector(randomX, randomY);
            const zombieType = Math.random() < this.fastZombieChance ? 'fast' : 'slow';
            this.createAndAddZombie(zombieType, position);
        }
    }

    createAndAddZombie(type, position) {
        const zombie = this.createZombie(type);
        zombie.pos = position;
        this.engine.add(zombie);
        
    }

    // Factory method voor het maken van zombies (behouden voor compatibiliteit)
    createZombie(type) {
        switch (type) {
            case 'slow':
                return new SlowZombie();
            case 'fast':
                return new FastZombie();
            default:
                return new SlowZombie();
        }
    }

    // Legacy method voor compatibiliteit (wordt niet meer gebruikt in continuous systeem)
    spawnZombieAt(type, x, y) {
        const zombie = this.createZombie(type);
        zombie.pos = new Vector(x, y);
        this.engine.add(zombie);
        return zombie;
    }
}
