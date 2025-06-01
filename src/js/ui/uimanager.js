import { Label, Font, Color, Vector, CoordPlane, TextAlign, Rectangle, Actor } from "excalibur";

export class UIManager {
    constructor(engine) {
        this.engine = engine;
        this.elements = new Map();
        this.healthFgRect = null; // Reference voor health bar Rectangle
        this.healthBarConfig = null; // Config voor health bar dimensions
    }

    // Maak ammo counter
    createAmmoCounter() {
        const ammoLabel = new Label({
            text: "Ammo: 35/35 | Total: 250",
            pos: new Vector(this.engine.drawWidth - 20, 20),
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

    // Maak reload indicator
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
    }    // Update ammo weergave
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
        const healthPercent = Math.max(0, current / max);        // console.log(`Updating health bar: ${current}/${max} = ${(healthPercent * 100).toFixed(1)}%`);        // Update voorgrond breedte en kleur
        const newWidth = this.healthBarConfig.width * healthPercent;
        const healthColor = this.calculateHealthColor(healthPercent);
        this.healthFgRect.width = newWidth;
        this.healthFgRect.color = healthColor;        // Geen tekstlabel meer
        
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

    // Maak reload feedback berichten
    createReloadFeedback(message, colorName = "White", duration = 1500) {
        // Kleur mapping
        const colorMap = {
            "Red": Color.Red,
            "Green": Color.Green,
            "Yellow": Color.Yellow,
            "Orange": Color.Orange,
            "White": Color.White
        };

        const feedbackColor = colorMap[colorName] || Color.White;

        const feedbackLabel = new Label({
            text: message,
            pos: new Vector(this.engine.drawWidth / 2, this.engine.drawHeight / 2 + 150),
            font: new Font({
                family: 'Arial',
                size: 32,
                color: feedbackColor,
                textAlign: TextAlign.Center
            }),
            anchor: new Vector(0.5, 0.5),
            coordPlane: CoordPlane.Screen,
            zIndex: 150
        });
        
        this.engine.add(feedbackLabel);
        
        // Auto-remove after duration
        setTimeout(() => {
            this.engine.remove(feedbackLabel);
        }, duration);
          // console.log(`Reload feedback shown: "${message}" (${colorName}, ${duration}ms)`);
        
        return feedbackLabel;
    }

    // Maak game over scherm
    createGameOverScreen(finalScore = 0, highScore = 0, isNewHighScore = false) {
        // First clear all existing UI elements
        this.clearAll();
        

          // Hoofdtitel game over
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
            zIndex: 200        });
        
        // Score weergave
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
            zIndex: 200        });
        
        // High score weergave
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
            zIndex: 200        });
        
        // Speel opnieuw instructie
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

    // Maak wave aankondiging
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

    // Maak hoofdmenu
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
            zIndex: 200        });        // Controls info - multiple lines for all features
        const controlsLabel1 = new Label({
            text: "WASD: Move | WASD x 2: Dash | Shift + W: Sprint | Left/Right Arrow: Rotate | Space: Shoot | R: Reload",
            pos: new Vector(this.engine.drawWidth / 2, this.engine.drawHeight / 2 + 50),
            font: new Font({
                family: 'Arial',
                size: 16,
                color: Color.LightGray,
                textAlign: TextAlign.Center
            }),
            anchor: new Vector(0.5, 0.5),
            coordPlane: CoordPlane.Screen,
            zIndex: 200
        });        this.engine.add(titleLabel);
        this.engine.add(playLabel);
        this.engine.add(controlsLabel1);
        
        this.elements.set('menuTitle', titleLabel);
        this.elements.set('menuPlay', playLabel);
        this.elements.set('menuControls1', controlsLabel1);
        
        return titleLabel;
    }    // Verwijder alle UI elementen
    clearAll() {

        
        this.elements.forEach((element, key) => {

            this.engine.remove(element);
        });
        
        this.elements.clear();        this.healthBarConfig = null; // Reset health bar configuratie
        this.healthFgRect = null; // Reset Rectangle referentie

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
        // Kleur interpolatie van groen (100%) naar rood (0%)
        
        if (healthPercent >= 1.0) {
            return Color.Green; // Volledig groen bij 100%
        } else if (healthPercent <= 0.0) {
            return Color.Red; // Volledig rood bij 0%
        }
        
        // Interpolatie tussen groen en rood
        // Groen: RGB(0, 255, 0)
        // Rood: RGB(255, 0, 0)
        
        const red = Math.floor(255 * (1 - healthPercent));
        const green = Math.floor(255 * healthPercent);
        const blue = 0;
        
        return Color.fromRGB(red, green, blue);
    }
}
