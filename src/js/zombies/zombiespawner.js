import { Vector } from "excalibur";
import { SlowZombie } from "./slowzombie.js";
import { FastZombie } from "./fastzombie.js";

export class ZombieSpawner {
    constructor(engine) {
        this.engine = engine;
        this.spawnConfigs = [];
        console.log("ZombieSpawner initialized");
    }

    // Configure spawn patterns
    addSpawnConfig(config) {
        this.spawnConfigs.push({
            type: config.type,
            count: config.count,
            startX: config.startX,
            startY: config.startY,
            spreadX: config.spreadX || 60,
            spreadY: config.spreadY || 200,
            delay: config.delay || 0
        });
        console.log("Added spawn config:", config);
    }

    // Spawn all configured zombies
    spawnAll() {
        this.spawnConfigs.forEach(config => {
            if (config.delay > 0) {
                setTimeout(() => this.spawnGroup(config), config.delay);
            } else {
                this.spawnGroup(config);
            }
        });
    }

    // Spawn a group of zombies
    spawnGroup(config) {
        console.log(`Spawning ${config.count} ${config.type} zombies`);
        
        for (let i = 0; i < config.count; i++) {
            const zombie = this.createZombie(config.type);
            
            // Calculate position with spread
            const x = config.startX + i * config.spreadX;
            const y = config.startY + (Math.random() - 0.5) * config.spreadY;
            zombie.pos = new Vector(x, y);
            
            this.engine.add(zombie);
            console.log(`${config.type} zombie spawned at (${x.toFixed(0)}, ${y.toFixed(0)})`);
        }
    }

    // Factory method for creating zombies
    createZombie(type) {
        switch (type) {
            case 'slow':
                return new SlowZombie();
            case 'fast':
                return new FastZombie();
            default:
                console.error(`Unknown zombie type: ${type}`);
                return new SlowZombie();
        }
    }

    // Spawn single zombie at specific position
    spawnZombieAt(type, x, y) {
        const zombie = this.createZombie(type);
        zombie.pos = new Vector(x, y);
        this.engine.add(zombie);
        console.log(`${type} zombie spawned at (${x}, ${y})`);
        return zombie;
    }
}
