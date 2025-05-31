
export class HighScoreManager {
    constructor() {
        this.storageKey = 'zombieShooterHighScore';
        this.highScore = this.loadHighScore();
        

    }

    // Laad de hoogste score uit localStorage
    loadHighScore() {
        try {
            const saved = localStorage.getItem(this.storageKey);
            const score = saved ? parseInt(saved, 10) : 0;

            return score;
        } catch (error) {

            return 0;
        }
    }

    // Sla nieuwe hoogste score op
    saveHighScore(score) {
        try {
            localStorage.setItem(this.storageKey, score.toString());

            return true;
        } catch (error) {

            return false;
        }
    }

    // Check of score een nieuwe hoogste score is en sla op indien nodig
    checkAndUpdateHighScore(newScore) {



        
        if (newScore > this.highScore) {
            const oldHighScore = this.highScore;
            this.highScore = newScore;
            this.saveHighScore(newScore);
            


            return true; // Nieuwe hoogste score
        } else {


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

            return true;
        } catch (error) {

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
