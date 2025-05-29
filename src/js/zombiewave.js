export class ZombieWaveManager {
    constructor(spawner, uiManager = null) {
        this.spawner = spawner;
        this.uiManager = uiManager;
        this.currentWave = 0;
        this.waves = [];
        this.waveTimer = null;
        console.log("ZombieWaveManager initialized");
    }

    addWave(waveConfig) {
        this.waves.push({
            number: this.waves.length + 1,
            enemies: waveConfig.enemies,
            delay: waveConfig.delay || 0,
            message: waveConfig.message || `Wave ${this.waves.length + 1}`
        });
        console.log(`Wave ${this.waves.length} added: ${waveConfig.message || `Wave ${this.waves.length}`}`);
    }

    startWaves() {
        this.currentWave = 0;
        this.spawnNextWave();
    }

    spawnNextWave() {
        if (this.currentWave >= this.waves.length) {
            console.log("All waves completed!");
            return;
        }        const wave = this.waves[this.currentWave];
        console.log(`Starting ${wave.message}`);
        
        // Show wave announcement in UI if available
        if (this.uiManager) {
            this.uiManager.createWaveAnnouncement(wave.message);
        }
        
        // Clear previous spawn configs
        this.spawner.spawnConfigs = [];
        
        // Add wave enemies
        wave.enemies.forEach(enemy => {
            this.spawner.addSpawnConfig(enemy);
        });
        
        // Spawn the wave
        this.spawner.spawnAll();
        
        // Schedule next wave
        this.currentWave++;
        if (this.currentWave < this.waves.length) {
            const nextWave = this.waves[this.currentWave];
            this.waveTimer = setTimeout(() => this.spawnNextWave(), nextWave.delay);
        }
    }

    stopWaves() {
        if (this.waveTimer) {
            clearTimeout(this.waveTimer);
            this.waveTimer = null;
            console.log("Wave timer stopped");
        }
    }

    getCurrentWave() {
        return this.currentWave;
    }

    getTotalWaves() {
        return this.waves.length;
    }
}
