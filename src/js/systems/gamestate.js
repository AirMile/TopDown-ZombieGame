import { GameConfig } from '../config/index.js';

export class GameState {
    #currentState
    #isGameOver
    #score
    #stats

    constructor() {
        this.#currentState = 'MENU'; // 'MENU', 'PLAYING', 'GAME_OVER'
        this.#isGameOver = false;
        this.#score = 0;
        this.#stats = this.#initializeStats();
        
        console.log('GameState initialized:', {
            state: this.#currentState,
            gameOver: this.#isGameOver
        });
    }

    #initializeStats() {
        return {
            playerHealth: 0,
            playerMaxHealth: 100,
            score: 0,
            difficulty: 1,
            spawnInterval: 2000,
            zombiesKilled: 0,
            bulletsShot: 0,
            timeAlive: 0
        };
    }

    // State management methods
    setState(newState) {
        const oldState = this.#currentState;
        this.#currentState = newState;
        
        console.log(`GameState changed: ${oldState} -> ${newState}`);
        
        // Reset game over flag when returning to menu or starting new game
        if (newState === 'MENU' || newState === 'PLAYING') {
            this.#isGameOver = false;
        }
    }

    getState() {
        return this.#currentState;
    }

    isMenu() {
        return this.#currentState === 'MENU';
    }

    isPlaying() {
        return this.#currentState === 'PLAYING';
    }

    isGameOver() {
        return this.#currentState === 'GAME_OVER';
    }

    // Game over management
    setGameOver(isGameOver = true) {
        this.#isGameOver = isGameOver;
        if (isGameOver) {
            this.setState('GAME_OVER');
        }
        
        console.log('Game over state set:', isGameOver);
    }

    getGameOverFlag() {
        return this.#isGameOver;
    }

    // Score management
    setScore(score) {
        this.#score = score;
        this.#stats.score = score;
        
        console.log('Score updated:', score);
    }

    getScore() {
        return this.#score;
    }

    addScore(points) {
        this.#score += points;
        this.#stats.score = this.#score;
        
        console.log('Score increased by', points, 'total:', this.#score);
    }

    // Stats management
    updateStats(newStats) {
        this.#stats = { ...this.#stats, ...newStats };
        
        console.log('Game stats updated:', this.#stats);
    }

    getStats() {
        return { ...this.#stats };
    }

    updatePlayerHealth(current, max) {
        this.#stats.playerHealth = current;
        this.#stats.playerMaxHealth = max;
    }

    updateDifficulty(difficulty) {
        this.#stats.difficulty = difficulty;
    }

    updateSpawnInterval(interval) {
        this.#stats.spawnInterval = interval;
    }

    incrementZombiesKilled() {
        this.#stats.zombiesKilled++;
        
        console.log('Zombies killed:', this.#stats.zombiesKilled);
    }

    incrementBulletsShot() {
        this.#stats.bulletsShot++;
    }

    updateTimeAlive(timeMs) {
        this.#stats.timeAlive = timeMs;
    }

    // Reset methods
    resetStats() {
        this.#stats = this.#initializeStats();
        this.#score = 0;
        
        console.log('Game stats reset');
    }

    resetGame() {
        this.resetStats();
        this.#isGameOver = false;
        
        console.log('Full game state reset');
    }

    // Utility methods
    canUpdate() {
        return this.isPlaying() && !this.#isGameOver;
    }

    shouldShowUI() {
        return this.isPlaying() || this.isGameOver();
    }

    // Debug method
    getDebugInfo() {
        return {
            state: this.#currentState,
            gameOver: this.#isGameOver,
            score: this.#score,
            stats: this.#stats
        };
    }
}
