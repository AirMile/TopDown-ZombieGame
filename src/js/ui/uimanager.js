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
    }

    // Create ammo counter
    createAmmoCounter() {
        const ammoLabel = new Label({
            text: "Ammo: 35/35",
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
    }

    // Update ammo display
    updateAmmo(current, max) {
        const ammo = this.elements.get('ammo');        if (ammo) {
            ammo.text = `Ammo: ${current}/${max}`;
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
    }

    // Create game over screen
    createGameOverScreen() {
        const gameOverLabel = new Label({
            text: "GAME OVER!",
            pos: new Vector(this.engine.drawWidth / 2, this.engine.drawHeight / 2),
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
        
        this.engine.add(gameOverLabel);
        this.elements.set('gameOver', gameOverLabel);
        
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

    // Remove all UI elements
    clearAll() {
        this.elements.forEach((element, key) => {
            this.engine.remove(element);
            
        });
        this.elements.clear();
        
    }

    // Get UI element by name
    getElement(name) {
        return this.elements.get(name);
    }

    // Check if element exists
    hasElement(name) {
        return this.elements.has(name);
    }
}
