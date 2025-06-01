import { Vector } from "excalibur";
import { SlowZombie } from "./slowzombie.js";
import { FastZombie } from "./fastzombie.js";
import { Player } from "../player/player.js";

export class ZombieSpawner {
    #engine;
    #spawnInterval; 
    #minSpawnInterval;
    #difficulty;
    #difficultyIncreaseRate;
    #spawnDistanceFromScreen;
    #fastZombieChance;
    #spawnTimer;
    #difficultyTimer;
    #difficultyIncreaseInterval;
    #isActive;

    constructor(engine) {
        this.#engine = engine;
        // Continuous spawning configuratie (veel agressiever gemaakt)
        this.#spawnInterval = 1500; 
        this.#minSpawnInterval = 300; 
        this.#difficulty = 1; 
        this.#difficultyIncreaseRate = 0.15; 
        this.#spawnDistanceFromScreen = 100;
        this.#fastZombieChance = 0.3; 
        // Timer systeem (snellere progressie)
        this.#spawnTimer = 0;
        this.#difficultyTimer = 0;
        this.#difficultyIncreaseInterval = 7000; 
        
        // Statussen
        this.#isActive = false;
        // console.log(`ZombieSpawner initialized: spawnInterval=${this.#spawnInterval}, minSpawnInterval=${this.#minSpawnInterval}, difficulty=${this.#difficulty}, fastZombieChance=${this.#fastZombieChance}`);
    }

    start() {
        this.#isActive = true;
        this.#spawnTimer = 0;
        this.#difficultyTimer = 0;
        // console.log("ZombieSpawner started.");
    }

    stop() {
        this.#isActive = false;
        // console.log("ZombieSpawner stopped.");
    }

    update(delta) {
        if (!this.#isActive) return;

        // Update moeilijkheidsgraad timer
        this.#difficultyTimer += delta;
        if (this.#difficultyTimer >= this.#difficultyIncreaseInterval) {
            this.increaseDifficulty();
            this.#difficultyTimer = 0;
        }

        // Update spawn timer
        this.#spawnTimer += delta;
        if (this.#spawnTimer >= this.#spawnInterval) {
            this.spawnZombieWave();
            this.#spawnTimer = 0;
        }
    }

    increaseDifficulty() {
        const oldDifficulty = this.#difficulty;
        const oldSpawnInterval = this.#spawnInterval;
        const oldFastZombieChance = this.#fastZombieChance;

        this.#difficulty += this.#difficultyIncreaseRate;
        
        // Bereken nieuwe spawn interval 
        this.#spawnInterval = Math.max(this.#minSpawnInterval, 1500 / this.#difficulty);
        
        // Update fast zombie kans 
        this.#fastZombieChance = Math.min(0.85, 0.3 + (this.#difficulty - 1) * 0.12);
        // console.log(`Difficulty increased: oldDifficulty=${oldDifficulty.toFixed(2)}, newDifficulty=${this.#difficulty.toFixed(2)}, oldSpawnInterval=${oldSpawnInterval.toFixed(0)}, newSpawnInterval=${this.#spawnInterval.toFixed(0)}, oldFastZombieChance=${oldFastZombieChance.toFixed(2)}, newFastZombieChance=${this.#fastZombieChance.toFixed(2)}`);
    }

    spawnZombieWave() {
        const player = this.findPlayer();
        if (!player) {
            // console.log("Player not found, skipping zombie wave.");
            return;
        }
        // Bereken aantal zombies voor deze wave 
        const baseZombies = 1 + Math.floor((this.#difficulty - 1) * 1.2); // Meer zombies per difficulty level
        const totalZombies = Math.min(6, baseZombies); // Limiet op 6 zombies per wave
        // Kies willekeurig spawn patroon
        const patterns = ['single', 'line', 'circle', 'cluster'];
        const selectedPattern = patterns[Math.floor(Math.random() * patterns.length)];
        
        // console.log(`Spawning zombie wave: totalZombies=${totalZombies}, pattern=${selectedPattern}, difficulty=${this.#difficulty.toFixed(2)}, spawnInterval=${this.#spawnInterval.toFixed(0)}`);
        // Spawn zombies volgens het gekozen patroon
        this.spawnPattern(selectedPattern, totalZombies, player);
    }

    findPlayer() {
        for (const actor of this.#engine.currentScene.actors) {
            if (actor.tags?.has('player')) return actor;
            if (actor instanceof Player) return actor;
            // Check voor player eigenschappen 
            if (actor.movement && actor.currentHealth !== undefined && actor.getCurrentAmmo !== undefined) return actor;
        }
        // console.log("Player not found by any method in findPlayer.");
        return null;
    }

    calculateSpawnPosition(player) {
        const screenWidth = this.#engine.drawWidth;
        const screenHeight = this.#engine.drawHeight;
        const spawnDistance = this.#spawnDistanceFromScreen;
        
        // Kies willekeurige kant van het scherm (0 = boven, 1 = rechts, 2 = onder, 3 = links)
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
        const zombieType = Math.random() < this.#fastZombieChance ? 'fast' : 'slow';
        // console.log(`Spawning single zombie: type=${zombieType}, posX=${position.x.toFixed(1)}, posY=${position.y.toFixed(1)}`);
        this.spawnZombie(zombieType, position);
    }

    spawnLinePattern(basePosition, count) {
        const spacing = 40; // 40px afstand tussen zombies
        const startOffset = -(count - 1) * spacing / 2;
        // console.log(`Spawning line pattern: count=${count}, baseX=${basePosition.x.toFixed(1)}, baseY=${basePosition.y.toFixed(1)}`);
        
        for (let i = 0; i < count; i++) {
            const offset = startOffset + i * spacing;
            const position = new Vector(basePosition.x + offset, basePosition.y);
            const zombieType = Math.random() < this.#fastZombieChance ? 'fast' : 'slow';
            this.spawnZombie(zombieType, position);
        }
    }

    spawnCirclePattern(basePosition, count) {
        const radius = 60;
        // console.log(`Spawning circle pattern: count=${count}, baseX=${basePosition.x.toFixed(1)}, baseY=${basePosition.y.toFixed(1)}, radius=${radius}`);
        
        for (let i = 0; i < count; i++) {
            const angle = (i / count) * 2 * Math.PI;
            const x = basePosition.x + Math.cos(angle) * radius;
            const y = basePosition.y + Math.sin(angle) * radius;
            const position = new Vector(x, y);
            const zombieType = Math.random() < this.#fastZombieChance ? 'fast' : 'slow';
            this.spawnZombie(zombieType, position);
        }
    }

    spawnClusterPattern(basePosition, count) {
        const maxSpread = 80; 
        // console.log(`Spawning cluster pattern: count=${count}, baseX=${basePosition.x.toFixed(1)}, baseY=${basePosition.y.toFixed(1)}, maxSpread=${maxSpread}`);
        
        for (let i = 0; i < count; i++) {
            const randomX = basePosition.x + (Math.random() - 0.5) * maxSpread;
            const randomY = basePosition.y + (Math.random() - 0.5) * maxSpread;
            const position = new Vector(randomX, randomY);
            const zombieType = Math.random() < this.#fastZombieChance ? 'fast' : 'slow';
            this.spawnZombie(zombieType, position);
        }
    }

    spawnZombie(type, position) {
        const zombie = this.createZombie(type);
        zombie.pos = position;
        this.#engine.add(zombie);
        // console.log(`Spawned zombie: type=${type}, x=${position.x.toFixed(1)}, y=${position.y.toFixed(1)}`);
    }

    // Factory methode voor het maken van zombies 
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
}