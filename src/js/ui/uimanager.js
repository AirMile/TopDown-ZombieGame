import { Label, Font, Color, Vector, CoordPlane, TextAlign } from "excalibur";

export class UIManager {
    
    constructor(engine) {
        this.engine = engine;
        this.elements = new Map();
    }

    // Create timer display
    createTimer(initialTime) {
        const timer = new Label({
            text: this.formatTime(initialTime),
            pos: new Vector(this.engine.drawWidth - 20, 20),
            font: new Font({
                family: 'Arial',
                size: 32,
                color: Color.White,
                textAlign: TextAlign.Right
            }),
            anchor: new Vector(1, 0),
            coordPlane: CoordPlane.Screen,
            zIndex: 99
        });
        
        this.engine.add(timer);
        this.elements.set('timer', timer);
        return timer;
    }    // Create ammo counter
    createAmmoCounter() {
        const ammoLabel = new Label({
            text: "Ammo: 35/35 | Total: 250",
            pos: new Vector(this.engine.drawWidth - 20, 60),
            font: new Font({
                family: 'Arial',
                size: 24,
                color: Color.White,
                textAlign: TextAlign.Right
            }),
            anchor: new Vector(1, 0),
            coordPlane: CoordPlane.Screen,
            zIndex: 99
        });
        
        this.engine.add(ammoLabel);
        this.elements.set('ammo', ammoLabel);
        
        return ammoLabel;
    }

    // Create reload indicator
    createReloadIndicator() {
        const reloadLabel = new Label({
            text: "RELOADING",
            pos: new Vector(this.engine.drawWidth / 2, this.engine.drawHeight / 2 + 100),
            font: new Font({
                family: 'Arial',
                size: 36,
                color: Color.Red,
                textAlign: TextAlign.Center
            }),
            anchor: new Vector(0.5, 0.5),
            coordPlane: CoordPlane.Screen,
            zIndex: 100,
            visible: false
        });
        
        this.engine.add(reloadLabel);
        this.elements.set('reload', reloadLabel);
        
        return reloadLabel;
    }

    // Create health display
    createHealthCounter(currentHealth, maxHealth) {
        const healthLabel = new Label({
            text: `Health: ${currentHealth}/${maxHealth}`,
            pos: new Vector(20, 20),
            font: new Font({
                family: 'Arial',
                size: 24,
                color: Color.Green,
                textAlign: TextAlign.Left
            }),
            anchor: new Vector(0, 0),
            coordPlane: CoordPlane.Screen,
            zIndex: 99
        });
        
        this.engine.add(healthLabel);
        this.elements.set('health', healthLabel);
        
        return healthLabel;
    }

    // Create score display
    createScoreCounter() {
        const scoreLabel = new Label({
            text: "Score: 0",
            pos: new Vector(20, 60),
            font: new Font({
                family: 'Arial',
                size: 24,
                color: Color.White,
                textAlign: TextAlign.Left
            }),
            anchor: new Vector(0, 0),
            coordPlane: CoordPlane.Screen,
            zIndex: 99
        });
        
        this.engine.add(scoreLabel);
        this.elements.set('score', scoreLabel);
        
        return scoreLabel;
    }

    // Update timer display
    updateTimer(timeRemaining) {
        const timer = this.elements.get('timer');        if (timer) {
            timer.text = this.formatTime(timeRemaining);
        }
    }    // Update ammo display
    updateAmmo(current, max, total = null) {
        const ammo = this.elements.get('ammo');
        if (ammo) {
            if (total !== null) {
                ammo.text = `Ammo: ${current}/${max} | Total: ${total}`;
                
                // Change color based on total ammo
                if (total > 100) {
                    ammo.font.color = Color.White;
                } else if (total > 50) {
                    ammo.font.color = Color.Yellow;
                } else {
                    ammo.font.color = Color.Red;
                }
            } else {
                ammo.text = `Ammo: ${current}/${max}`;
                ammo.font.color = Color.White;
            }
        }
    }

    // Update health display
    updateHealth(current, max) {
        const health = this.elements.get('health');
        if (health) {
            health.text = `Health: ${current}/${max}`;
            
            // Change color based on health percentage
            const healthPercent = current / max;            if (healthPercent > 0.6) {
                health.font.color = Color.Green;
            } else if (healthPercent > 0.3) {
                health.font.color = Color.Yellow;
            } else {
                health.font.color = Color.Red;
            }
        }
    }

    // Update score display
    updateScore(score) {
        const scoreElement = this.elements.get('score');        if (scoreElement) {
            scoreElement.text = `Score: ${score}`;
        }
    }

    // Show/hide reload indicator
    showReloadIndicator(show) {
        const reload = this.elements.get('reload');        if (reload) {
            reload.visible = show;
        }
    }

    // Format time helper
    formatTime(seconds) {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = Math.floor(seconds % 60);
        const formattedSeconds = remainingSeconds < 10 ? '0' + remainingSeconds : remainingSeconds;
        return `Time: ${minutes}:${formattedSeconds}`;
    }    // Create game over screen
    createGameOverScreen(finalScore = 0, highScore = 0, isNewHighScore = false) {
        // First clear all existing UI elements
        this.clearAll();
        
        console.log(`Creating game over screen with score: ${finalScore}, high score: ${highScore}, new: ${isNewHighScore}`);
        
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
        
        this.engine.add(gameOverLabel);
        this.engine.add(scoreLabel);
        this.engine.add(highScoreLabel);
        this.engine.add(playAgainLabel);
        
        this.elements.set('gameOver', gameOverLabel);
        this.elements.set('gameOverScore', scoreLabel);
        this.elements.set('gameOverHighScore', highScoreLabel);
        this.elements.set('playAgain', playAgainLabel);
        
        return gameOverLabel;
    }

    // Create wave announcement
    createWaveAnnouncement(text, duration = 3000) {
        const announcement = new Label({
            text: text,
            pos: new Vector(this.engine.drawWidth / 2, 100),
            font: new Font({
                family: 'Arial',
                size: 48,
                color: Color.Yellow,
                textAlign: TextAlign.Center
            }),
            anchor: new Vector(0.5, 0.5),
            coordPlane: CoordPlane.Screen,
            zIndex: 150
        });
        
        this.engine.add(announcement);
        
        // Auto-remove after duration
        setTimeout(() => {
            this.engine.remove(announcement);
            
        }, duration);
        
        
        return announcement;
    }

    // Show game over with timer text
    showGameOver() {
        const timer = this.elements.get('timer');
        if (timer) {
            timer.text = "Game Over!";
            
        }
        this.createGameOverScreen();
    }

    // Create main menu
    createMainMenu() {
        // Main title
        const titleLabel = new Label({
            text: "ZOMBIE SHOOTER",
            pos: new Vector(this.engine.drawWidth / 2, this.engine.drawHeight / 2 - 100),
            font: new Font({
                family: 'Arial',
                size: 64,
                color: Color.White,
                textAlign: TextAlign.Center
            }),
            anchor: new Vector(0.5, 0.5),
            coordPlane: CoordPlane.Screen,
            zIndex: 200
        });
        
        // Play instruction
        const playLabel = new Label({
            text: "Press SPACE to Play Game",
            pos: new Vector(this.engine.drawWidth / 2, this.engine.drawHeight / 2),
            font: new Font({
                family: 'Arial',
                size: 32,
                color: Color.Green,
                textAlign: TextAlign.Center
            }),
            anchor: new Vector(0.5, 0.5),
            coordPlane: CoordPlane.Screen,
            zIndex: 200
        });
        
        // Controls info
        const controlsLabel = new Label({
            text: "WASD: Move | Mouse: Aim | Left Click: Shoot | R: Reload",
            pos: new Vector(this.engine.drawWidth / 2, this.engine.drawHeight / 2 + 60),
            font: new Font({
                family: 'Arial',
                size: 18,
                color: Color.LightGray,
                textAlign: TextAlign.Center
            }),
            anchor: new Vector(0.5, 0.5),
            coordPlane: CoordPlane.Screen,
            zIndex: 200
        });
        
        this.engine.add(titleLabel);
        this.engine.add(playLabel);
        this.engine.add(controlsLabel);
        
        this.elements.set('menuTitle', titleLabel);
        this.elements.set('menuPlay', playLabel);
        this.elements.set('menuControls', controlsLabel);
        
        return titleLabel;
    }    // Remove all UI elements
    clearAll() {
        console.log(`Clearing ${this.elements.size} UI elements...`);
        
        this.elements.forEach((element, key) => {
            console.log(`Removing UI element: ${key}`);
            this.engine.remove(element);
        });
        
        this.elements.clear();
        console.log(`All UI elements cleared`);
    }

    // Get UI element by name
    getElement(name) {
        return this.elements.get(name);
    }

    // Check if element exists
    hasElement(name) {
        return this.elements.has(name);
    }    // Show victory screen when player survives 3 minutes
    showVictoryScreen(finalScore, highScore = 0, isNewHighScore = false) {
        // Clear all existing UI elements first
        this.clearAll();
        
        console.log(`Creating victory screen with score: ${finalScore}, high score: ${highScore}, new: ${isNewHighScore}`);
        console.log(`Engine dimensions: ${this.engine.drawWidth} x ${this.engine.drawHeight}`);
        
        // Victory title
        const victoryLabel = new Label({
            text: "🎉 GEFELICITEERD! 🎉",
            pos: new Vector(this.engine.drawWidth / 2, this.engine.drawHeight / 2 - 120),
            font: new Font({
                family: 'Arial',
                size: 48,
                color: Color.fromRGB(255, 215, 0), // Goud kleur
                textAlign: TextAlign.Center
            }),
            anchor: new Vector(0.5, 0.5),
            coordPlane: CoordPlane.Screen,
            zIndex: 200
        });
        
        // Subtitle
        const subtitleLabel = new Label({
            text: "Je hebt 3 minuten overleefd!",
            pos: new Vector(this.engine.drawWidth / 2, this.engine.drawHeight / 2 - 60),
            font: new Font({
                family: 'Arial',
                size: 24,
                color: Color.fromRGB(255, 255, 255),
                textAlign: TextAlign.Center
            }),
            anchor: new Vector(0.5, 0.5),
            coordPlane: CoordPlane.Screen,
            zIndex: 200
        });
        
        // Final score display
        const scoreLabel = new Label({
            text: `Jouw Score: ${finalScore}`,
            pos: new Vector(this.engine.drawWidth / 2, this.engine.drawHeight / 2 - 20),
            font: new Font({
                family: 'Arial',
                size: 32,
                color: Color.fromRGB(0, 255, 0), // Groen voor score
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
            pos: new Vector(this.engine.drawWidth / 2, this.engine.drawHeight / 2 + 20),
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
        
        // Instructions
        const instructionsLabel = new Label({
            text: "Druk op SPATIE voor nieuw spel | ESC voor hoofdmenu",
            pos: new Vector(this.engine.drawWidth / 2, this.engine.drawHeight / 2 + 80),
            font: new Font({
                family: 'Arial',
                size: 18,
                color: Color.fromRGB(200, 200, 200),
                textAlign: TextAlign.Center
            }),
            anchor: new Vector(0.5, 0.5),
            coordPlane: CoordPlane.Screen,
            zIndex: 200
        });
        
        // Add all elements to engine and store them
        this.engine.add(victoryLabel);
        this.engine.add(subtitleLabel);
        this.engine.add(scoreLabel);
        this.engine.add(highScoreLabel);
        this.engine.add(instructionsLabel);
        
        this.elements.set('victoryTitle', victoryLabel);
        this.elements.set('victorySubtitle', subtitleLabel);
        this.elements.set('victoryScore', scoreLabel);
        this.elements.set('victoryHighScore', highScoreLabel);
        this.elements.set('victoryInstructions', instructionsLabel);
        
        console.log(`✅ Victory screen elements created and added to engine`);
        console.log(`Victory labels added: ${this.elements.size} total UI elements`);
        
        return victoryLabel;
    }
}
