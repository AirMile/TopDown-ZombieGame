import { Label, Font, Color, TextAlign, Vector, CoordPlane } from "excalibur";

export class GameOverScreen {
    constructor(engine) {
        this.engine = engine;
        this.elements = [];
    }

    // Create complete game over screen with score and instructions
    create(finalScore = 0, highScore = 0, isNewHighScore = false) {
        // Clear any existing elements first
        this.destroy();
        
        // Main game over title
        const gameOverLabel = new Label({
            text: "GAME OVER!",
            pos: new Vector(this.engine.drawWidth / 2, this.engine.drawHeight / 2 - 120),
            font: new Font({
                family: 'Arial',
                size: 72,
                color: Color.Red,
                textAlign: TextAlign.Center
            }),
            anchor: new Vector(0.5, 0.5),
            coordPlane: CoordPlane.Screen,
            zIndex: 200
        });
        
        // Score display
        const scoreLabel = new Label({
            text: `Jouw Score: ${finalScore}`,
            pos: new Vector(this.engine.drawWidth / 2, this.engine.drawHeight / 2 - 50),
            font: new Font({
                family: 'Arial',
                size: 36,
                color: Color.Yellow,
                textAlign: TextAlign.Center
            }),
            anchor: new Vector(0.5, 0.5),
            coordPlane: CoordPlane.Screen,
            zIndex: 200
        });
        
        // High score display
        const highScoreColor = isNewHighScore ? Color.fromRGB(255, 215, 0) : Color.fromRGB(150, 150, 150);
        const highScoreText = isNewHighScore ? `🎉 NIEUWE HOOGSTE SCORE: ${highScore}! 🎉` : `Hoogste Score: ${highScore}`;
        
        const highScoreLabel = new Label({
            text: highScoreText,
            pos: new Vector(this.engine.drawWidth / 2, this.engine.drawHeight / 2 - 10),
            font: new Font({
                family: 'Arial',
                size: isNewHighScore ? 28 : 24,
                color: highScoreColor,
                textAlign: TextAlign.Center
            }),
            anchor: new Vector(0.5, 0.5),
            coordPlane: CoordPlane.Screen,
            zIndex: 200
        });
        
        // Play again instruction
        const playAgainLabel = new Label({
            text: "Druk op SPATIE voor nieuw spel | ESC voor hoofdmenu",
            pos: new Vector(this.engine.drawWidth / 2, this.engine.drawHeight / 2 + 50),
            font: new Font({
                family: 'Arial',
                size: 24,
                color: Color.White,
                textAlign: TextAlign.Center
            }),
            anchor: new Vector(0.5, 0.5),
            coordPlane: CoordPlane.Screen,
            zIndex: 200
        });
        
        // Add all elements to engine and store references
        this.elements = [gameOverLabel, scoreLabel, highScoreLabel, playAgainLabel];
        this.elements.forEach(element => {
            this.engine.add(element);
        });
        
        console.log(`GameOverScreen created: finalScore=${finalScore}, highScore=${highScore}, isNewRecord=${isNewHighScore}`);
        
        return gameOverLabel;
    }

    // Destroy all game over screen elements
    destroy() {
        this.elements.forEach(element => {
            if (element) {
                this.engine.remove(element);
            }
        });
        this.elements = [];
        console.log("GameOverScreen destroyed");
    }

    // Check if screen exists
    exists() {
        return this.elements.length > 0;
    }

    // Get all screen elements
    getElements() {
        return this.elements;
    }
}
