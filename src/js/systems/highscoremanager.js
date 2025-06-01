export class HighScoreManager {
    constructor() {
        this.storageKey = 'zombieShooterHighScore';
        this.highScore = this.loadHighScore();
    }

    loadHighScore() {
        try {
            const saved = localStorage.getItem(this.storageKey);
            const score = saved ? parseInt(saved, 10) : 0;
            this.highScore = score;
            return score;
        } catch (error) {
            this.highScore = 0;
            return 0;
        }
    }

    saveHighScore(score) {
        try {
            localStorage.setItem(this.storageKey, score.toString());
            this.highScore = score;
            return true;
        } catch (error) {
            return false;
        }
    }

    checkAndUpdateHighScore(newScore) {
        if (newScore > this.highScore) {
            this.saveHighScore(newScore);
            return true;
        } else {
            return false;
        }
    }

    getHighScore() {
        return this.loadHighScore();
    }

    resetHighScore() {
        this.highScore = 0;
        try {
            localStorage.removeItem(this.storageKey);
            return true;
        } catch (error) {
            return false;
        }
    }

    getScoreStats(currentScore) {
        const highScore = this.loadHighScore();
        return {
            currentScore: currentScore,
            highScore: highScore,
            isNewHighScore: currentScore > highScore,
            improvement: currentScore - highScore
        };
    }
}
