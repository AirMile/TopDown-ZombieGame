import { Actor, Rectangle, Color, Vector, CoordPlane } from "excalibur";
import { UIConfig } from "../../config/uiconfig.js";
import { lerp } from "../../utils/index.js";

export class HealthBar {
    constructor(engine) {
        this.engine = engine;
        this.backgroundActor = null;
        this.foregroundActor = null;
        this.foregroundRect = null;
        this.config = null;
    }

    // Create health bar display with background and foreground
    create(currentHealth, maxHealth) {
        const barWidth = UIConfig.HEALTH_BAR.WIDTH;
        const barHeight = UIConfig.HEALTH_BAR.HEIGHT;
        const barX = UIConfig.HEALTH_BAR.X;
        const barY = UIConfig.HEALTH_BAR.Y;
        
        // Health bar achtergrond (donker)
        const backgroundRect = new Rectangle({
            width: barWidth,
            height: barHeight,
            color: Color.fromRGB(
                UIConfig.HEALTH_BAR.BACKGROUND_COLOR.r, 
                UIConfig.HEALTH_BAR.BACKGROUND_COLOR.g, 
                UIConfig.HEALTH_BAR.BACKGROUND_COLOR.b
            )
        });
        
        // Health bar voorgrond (verandert met health)
        this.foregroundRect = new Rectangle({
            width: barWidth,
            height: barHeight,
            color: Color.Green
        });
        
        // Container actor voor de achtergrond
        this.backgroundActor = new Actor({
            pos: new Vector(barX, barY),
            coordPlane: CoordPlane.Screen,
            anchor: new Vector(0, 0),
            zIndex: UIConfig.HEALTH_BAR.Z_INDEX_BG
        });
        this.backgroundActor.graphics.use(backgroundRect);
        
        // Container actor voor de voorgrond
        this.foregroundActor = new Actor({
            pos: new Vector(barX, barY),
            coordPlane: CoordPlane.Screen,
            anchor: new Vector(0, 0),
            zIndex: UIConfig.HEALTH_BAR.Z_INDEX_FG
        });
        this.foregroundActor.graphics.use(this.foregroundRect);
        
        // Voeg bars toe aan engine
        this.engine.add(this.backgroundActor);
        this.engine.add(this.foregroundActor);
        
        // Store bar dimensions voor updates
        this.config = {
            width: barWidth,
            height: barHeight,
            x: barX,
            y: barY
        };
        
        console.log(`HealthBar created: ${barWidth}x${barHeight} at (${barX}, ${barY})`);
        
        return this.backgroundActor;
    }    // Update health bar with current and max health
    update(current, max) {
        if (!this.foregroundRect || !this.config) {
            console.log("HealthBar update failed: missing foregroundRect or config");
            return;
        }
        
        // Bereken health percentage
        const healthPercent = max > 0 ? lerp(0, 1, current / max) : 0; // Gebruik lerp en voorkom delen door nul
        console.log(`HealthBar updating: ${current}/${max} = ${(healthPercent * 100).toFixed(1)}%`);
        
        // Update voorgrond breedte en kleur
        const newWidth = this.config.width * healthPercent;
        const healthColor = this.#calculateHealthColor(healthPercent);
        
        this.foregroundRect.width = newWidth;
        this.foregroundRect.color = healthColor;
        
        console.log(`HealthBar updated: width=${newWidth.toFixed(1)}, color=${healthColor.toString()}`);
    }

    // Destroy the health bar
    destroy() {
        if (this.backgroundActor) {
            this.engine.remove(this.backgroundActor);
            this.backgroundActor = null;
        }
        
        if (this.foregroundActor) {
            this.engine.remove(this.foregroundActor);
            this.foregroundActor = null;
        }
        
        this.foregroundRect = null;
        this.config = null;
        console.log("HealthBar destroyed");
    }

    // Get the background actor element
    getElement() {
        return this.backgroundActor;
    }

    // Check if health bar exists
    exists() {
        return this.backgroundActor !== null && this.foregroundActor !== null;
    }

    // Private helper method om kleur te berekenen op basis van health percentage
    #calculateHealthColor(healthPercent) {
        if (healthPercent >= 1.0) {
            return Color.Green; // Volledig groen bij 100%
        } else if (healthPercent <= 0.0) {
            return Color.Red; // Volledig rood bij 0%
        }
        
        // Interpolatie tussen groen en rood
        // Groen: RGB(0, 255, 0), Rood: RGB(255, 0, 0)
        const red = Math.floor(255 * (1 - healthPercent));
        const green = Math.floor(255 * healthPercent);
        const blue = 0;
        
        return Color.fromRGB(red, green, blue);
    }
}
