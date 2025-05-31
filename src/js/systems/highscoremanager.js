
export class HighScoreManager {
    constructor() {
        this.storageKey = 'zombieShooterHighScore';
        this.highScore = this.loadHighScore();
        
        console.log(`HighScore Manager initialized with current high score: ${this.highScore}`);
    }

    // Laad de hoogste score uit localStorage
    loadHighScore() {
        try {
            const saved = localStorage.getItem(this.storageKey);
            const score = saved ? parseInt(saved, 10) : 0;
            console.log(`Loaded high score from localStorage: ${score}`);
            return score;
        } catch (error) {
            console.log(`Could not load high score from localStorage: ${error.message}`);
            return 0;
        }
    }

    // Sla nieuwe hoogste score op
    saveHighScore(score) {
        try {
            localStorage.setItem(this.storageKey, score.toString());
            console.log(`✅ New high score saved: ${score}`);
            return true;
        } catch (error) {
            console.log(`❌ Could not save high score: ${error.message}`);
            return false;
        }
    }

    // Check of score een nieuwe hoogste score is en sla op indien nodig
    checkAndUpdateHighScore(newScore) {
        console.log(`=== HIGH SCORE CHECK ===`);
        console.log(`Current score: ${newScore}`);
        console.log(`Current high score: ${this.highScore}`);
        
        if (newScore > this.highScore) {
            const oldHighScore = this.highScore;
            this.highScore = newScore;
            this.saveHighScore(newScore);
            
            console.log(`🎉 NEW HIGH SCORE! ${oldHighScore} → ${newScore}`);
            console.log(`=== END HIGH SCORE CHECK ===\n`);
            return true; // Nieuwe hoogste score
        } else {
            console.log(`No new high score. Current remains: ${this.highScore}`);
            console.log(`=== END HIGH SCORE CHECK ===\n`);
            return false; // Geen nieuwe hoogste score
        }
    }

    // Get huidige hoogste score
    getHighScore() {
        return this.highScore;
    }

    // Reset hoogste score (voor debugging)
    resetHighScore() {
        this.highScore = 0;
        try {
            localStorage.removeItem(this.storageKey);
            console.log(`High score reset to 0`);
            return true;
        } catch (error) {
            console.log(`Could not reset high score: ${error.message}`);
            return false;
        }
    }

    // Get score statistieken voor display
    getScoreStats(currentScore) {
        return {
            currentScore: currentScore,
            highScore: this.highScore,
            isNewHighScore: currentScore > this.highScore,
            improvement: currentScore - this.highScore
        };
    }
}
