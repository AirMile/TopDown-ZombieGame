import { Label, Font, Color, Vector, CoordPlane, TextAlign, Rectangle, Actor } from "excalibur";

export class UIManager {
    constructor(engine) {
        this.engine = engine;
        this.elements = new Map();
        this.healthFgRect = null; 
        this.healthBarConfig = null; 
    }

    /**
     * Helper voor het aanmaken van een Label met standaardwaarden.
     */
    createLabel({ text, pos, size, color, align, anchor = new Vector(0, 0), z = 99, visible = true }) {
        return new Label({
            text,
            pos,
            font: new Font({
                family: 'Arial',
                size,
                color,
                textAlign: align
            }),
            anchor,
            coordPlane: CoordPlane.Screen,
            zIndex: z,
            visible
        });
    }

    // Maak ammo counter
    createAmmoCounter() {
        const ammoLabel = this.createLabel({
            text: "Ammo: 35/35 | Total: 250",
            pos: new Vector(this.engine.drawWidth - 20, 20),
            size: 24,
            color: Color.White,
            align: TextAlign.Right,
            anchor: new Vector(1, 0),
            z: 99
        });
        this.engine.add(ammoLabel);
        this.elements.set('ammo', ammoLabel);
        return ammoLabel;
    }

    // Maak reload indicator
    createReloadIndicator() {
        const reloadLabel = this.createLabel({
            text: "RELOADING",
            pos: new Vector(this.engine.drawWidth / 2, this.engine.drawHeight / 2 + 100),
            size: 36,
            color: Color.Red,
            align: TextAlign.Center,
            anchor: new Vector(0.5, 0.5),
            z: 100,
            visible: false
        });
        this.engine.add(reloadLabel);
        this.elements.set('reload', reloadLabel);
        return reloadLabel;
    }

    // Maak health bar weergave
    createHealthCounter(currentHealth, maxHealth) {
        const barWidth = 200;
        const barHeight = 20;
        const barX = 20;
        const barY = 20;
        
        // Health bar achtergrond (donker)
        const healthBackground = new Rectangle({
            width: barWidth,
            height: barHeight,
            color: Color.fromRGB(50, 50, 50) // Donkergrijs
        });
        
        // Health bar voorgrond (verandert met health) - bewaar reference!
        this.healthFgRect = new Rectangle({
            width: barWidth,
            height: barHeight,
            color: Color.Green
        });
        
        // Container actor voor de achtergrond
        const healthBgActor = new Actor({
            pos: new Vector(barX, barY),
            coordPlane: CoordPlane.Screen,
            anchor: new Vector(0, 0),
            zIndex: 98
        });
        healthBgActor.graphics.use(healthBackground);
        
        // Container actor voor de voorgrond
        const healthFgActor = new Actor({
            pos: new Vector(barX, barY),
            coordPlane: CoordPlane.Screen,
            anchor: new Vector(0, 0),
            zIndex: 99
        });
        healthFgActor.graphics.use(this.healthFgRect); // Gebruik reference
        
        // Voeg alleen de bars toe aan engine (geen tekstlabel)
        this.engine.add(healthBgActor);
        this.engine.add(healthFgActor);
        
        // Store references
        this.elements.set('healthBg', healthBgActor);
        this.elements.set('healthFg', healthFgActor);
        // Geen healthText meer
        
        // Store bar dimensions voor updates
        this.healthBarConfig = {
            width: barWidth,
            height: barHeight,
            x: barX,
            y: barY
        };
          // console.log(`Health bar created: ${barWidth}x${barHeight} at (${barX}, ${barY})`);
        
        return healthBgActor;
    }

    // Maak score weergave
    createScoreCounter() {
        const scoreLabel = this.createLabel({
            text: "Score: 0",
            pos: new Vector(20, 60),
            size: 24,
            color: Color.White,
            align: TextAlign.Left,
            anchor: new Vector(0, 0),
            z: 99
        });
        this.engine.add(scoreLabel);
        this.elements.set('score', scoreLabel);
        return scoreLabel;
    }

    // Update ammo weergave
    updateAmmo(current, max, total = null) {
        const ammo = this.elements.get('ammo');
        if (ammo) {
            if (total !== null) {
                ammo.text = `Ammo: ${current}/${max} | Total: ${total}`;
                
                // Verander kleur gebaseerd op totale ammo
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

    // Update health bar weergave
    updateHealth(current, max) {
        if (!this.healthFgRect || !this.healthBarConfig) return;
        // Bereken health percentage
        const healthPercent = Math.max(0, current / max);        
        const newWidth = this.healthBarConfig.width * healthPercent;
        const healthColor = this.calculateHealthColor(healthPercent);
        this.healthFgRect.width = newWidth;
        this.healthFgRect.color = healthColor;  
        
        // console.log(`Health bar updated: width=${newWidth.toFixed(1)}, color=${healthColor.toString()}`);
    }

    // Update score weergave
    updateScore(score) {
        const scoreElement = this.elements.get('score');
        
        if (scoreElement) {
            scoreElement.text = `Score: ${score}`;
        }
    }

    // Toon/verberg reload indicator
    showReloadIndicator(show) {
        const reload = this.elements.get('reload');
        
        if (reload) {
            reload.visible = show;
        }
    }

    /**
     * Verwijdert een actor na een bepaalde tijd (ms).
     */
    removeAfter(actor, duration) {
        setTimeout(() => this.engine.remove(actor), duration);
    }

    // Maak reload feedback berichten
    createReloadFeedback(message, colorName = "White", duration = 1500) {
        const colorMap = {
            "Red": Color.Red,
            "Green": Color.Green,
            "Yellow": Color.Yellow,
            "Orange": Color.Orange,
            "White": Color.White
        };
        const feedbackColor = colorMap[colorName] || Color.White;
        const feedbackLabel = this.createLabel({
            text: message,
            pos: new Vector(this.engine.drawWidth / 2, this.engine.drawHeight / 2 + 150),
            size: 32,
            color: feedbackColor,
            align: TextAlign.Center,
            anchor: new Vector(0.5, 0.5),
            z: 150
        });
        this.engine.add(feedbackLabel);
        this.removeAfter(feedbackLabel, duration);
        return feedbackLabel;
    }

    // Kleine helpers voor losse labels van het game over scherm
    #createGameOverTitle() {
        return this.createLabel({
            text: "GAME OVER!",
            pos: new Vector(this.engine.drawWidth / 2, this.engine.drawHeight / 2 - 120),
            size: 72,
            color: Color.Red,
            align: TextAlign.Center,
            anchor: new Vector(0.5, 0.5),
            z: 200
        });
    }

    #createGameOverScore(finalScore) {
        return this.createLabel({
            text: `Jouw Score: ${finalScore}`,
            pos: new Vector(this.engine.drawWidth / 2, this.engine.drawHeight / 2 - 50),
            size: 36,
            color: Color.Yellow,
            align: TextAlign.Center,
            anchor: new Vector(0.5, 0.5),
            z: 200
        });
    }

    #createGameOverHighScore(highScore, isNewHighScore) {
        const highScoreColor = isNewHighScore ? Color.fromRGB(255, 215, 0) : Color.fromRGB(150, 150, 150);
        const highScoreText = isNewHighScore ? `🎉 NIEUWE HOOGSTE SCORE: ${highScore}! 🎉` : `Hoogste Score: ${highScore}`;
        return this.createLabel({
            text: highScoreText,
            pos: new Vector(this.engine.drawWidth / 2, this.engine.drawHeight / 2 - 10),
            size: isNewHighScore ? 28 : 24,
            color: highScoreColor,
            align: TextAlign.Center,
            anchor: new Vector(0.5, 0.5),
            z: 200
        });
    }

    #createGameOverPlayAgain() {
        return this.createLabel({
            text: "Druk op SPATIE voor nieuw spel | ESC voor hoofdmenu",
            pos: new Vector(this.engine.drawWidth / 2, this.engine.drawHeight / 2 + 50),
            size: 24,
            color: Color.White,
            align: TextAlign.Center,
            anchor: new Vector(0.5, 0.5),
            z: 200
        });
    }

    // Maak game over scherm
    createGameOverScreen(finalScore = 0, highScore = 0, isNewHighScore = false) {
        this.clearAll();
        const gameOverLabel = this.#createGameOverTitle();
        const scoreLabel = this.#createGameOverScore(finalScore);
        const highScoreLabel = this.#createGameOverHighScore(highScore, isNewHighScore);
        const playAgainLabel = this.#createGameOverPlayAgain();

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

    // Maak wave aankondiging
    createWaveAnnouncement(text, duration = 3000) {
        const announcement = this.createLabel({
            text,
            pos: new Vector(this.engine.drawWidth / 2, 100),
            size: 48,
            color: Color.Yellow,
            align: TextAlign.Center,
            anchor: new Vector(0.5, 0.5),
            z: 150
        });
        this.engine.add(announcement);
        this.removeAfter(announcement, duration);
        return announcement;
    }

    // Maak hoofdmenu
    createMainMenu() {
        const titleLabel = this.createLabel({
            text: "ZOMBIE SHOOTER",
            pos: new Vector(this.engine.drawWidth / 2, this.engine.drawHeight / 2 - 100),
            size: 64,
            color: Color.White,
            align: TextAlign.Center,
            anchor: new Vector(0.5, 0.5),
            z: 200
        });
        const playLabel = this.createLabel({
            text: "Press SPACE to Play Game",
            pos: new Vector(this.engine.drawWidth / 2, this.engine.drawHeight / 2),
            size: 32,
            color: Color.Green,
            align: TextAlign.Center,
            anchor: new Vector(0.5, 0.5),
            z: 200
        });
        const controlsLabel1 = this.createLabel({
            text: "WASD: Move | Shift + W: Sprint | Left/Right Arrow: Rotate | Space: Shoot | R: Reload",
            pos: new Vector(this.engine.drawWidth / 2, this.engine.drawHeight / 2 + 50),
            size: 16,
            color: Color.LightGray,
            align: TextAlign.Center,
            anchor: new Vector(0.5, 0.5),
            z: 200
        });
        this.engine.add(titleLabel);
        this.engine.add(playLabel);
        this.engine.add(controlsLabel1);
        this.elements.set('menuTitle', titleLabel);
        this.elements.set('menuPlay', playLabel);
        this.elements.set('menuControls1', controlsLabel1);
        return titleLabel;
    }

    // Verwijder alle UI elementen
    clearAll() {

        
        this.elements.forEach((element, key) => {

            this.engine.remove(element);
        });
        
        this.elements.clear();        this.healthBarConfig = null; 
        this.healthFgRect = null; 

    }

    // Krijg UI element bij naam
    getElement(name) {
        return this.elements.get(name);
    }

    // Controleer of element bestaat
    hasElement(name) {
        return this.elements.has(name);
    }    // Helper method om kleur te berekenen op basis van health percentage
    calculateHealthColor(healthPercent) {
        // Interpoleert van groen (100%) naar rood (0%)
        if (healthPercent >= 1.0) {
            return Color.Green;
        } else if (healthPercent <= 0.0) {
            return Color.Red;
        }
        const red = Math.floor(255 * (1 - healthPercent));
        const green = Math.floor(255 * healthPercent);
        return Color.fromRGB(red, green, 0);
    }
}
