import { Label, Font, Color, TextAlign, Vector, CoordPlane } from "excalibur";
import { UIConfig } from "../../config/uiconfig.js";

export class ReloadIndicator {
    constructor(engine) {
        this.engine = engine;
        this.reloadLabel = null;
    }

    // Create reload indicator
    create() {
        this.reloadLabel = new Label({
            text: "RELOADING...",
            pos: new Vector(this.engine.drawWidth / 2, this.engine.drawHeight / 2 + 50),
            font: new Font({
                family: UIConfig.RELOAD_INDICATOR.FONT_FAMILY,
                size: UIConfig.RELOAD_INDICATOR.FONT_SIZE,
                color: Color.Orange,
                textAlign: TextAlign.Center
            }),
            anchor: new Vector(0.5, 0.5),
            coordPlane: CoordPlane.Screen,
            zIndex: UIConfig.RELOAD_INDICATOR.Z_INDEX
        });
        
        this.reloadLabel.graphics.visible = false; // Hidden by default
        this.engine.add(this.reloadLabel);
        console.log("ReloadIndicator created");
        
        return this.reloadLabel;
    }

    // Show or hide the reload indicator
    show(visible) {
        if (!this.reloadLabel) return;
        
        this.reloadLabel.graphics.visible = visible;
        console.log(`ReloadIndicator visibility: ${visible}`);
    }

    // Create temporary reload feedback message
    createFeedback(message, colorName = "White", duration = UIConfig.RELOAD_FEEDBACK.DEFAULT_DURATION) {
        // Map colorName to actual Color
        const colorMap = {
            'Green': Color.Green,
            'Orange': Color.Orange,
            'Yellow': Color.Yellow,
            'Red': Color.Red,
            'White': Color.White
        };
        
        const feedbackLabel = new Label({
            text: message,
            pos: new Vector(this.engine.drawWidth / 2, this.engine.drawHeight / 2 + UIConfig.RELOAD_FEEDBACK.Y_OFFSET),
            font: new Font({
                family: UIConfig.RELOAD_FEEDBACK.FONT_FAMILY,
                size: UIConfig.RELOAD_FEEDBACK.FONT_SIZE,
                color: colorMap[colorName] || Color.White,
                textAlign: TextAlign.Center
            }),
            anchor: new Vector(0.5, 0.5),
            coordPlane: CoordPlane.Screen,
            zIndex: UIConfig.RELOAD_FEEDBACK.Z_INDEX
        });
        
        this.engine.add(feedbackLabel);
        console.log(`ReloadIndicator feedback created: "${message}" (${colorName}, ${duration}ms)`);
        
        // Auto-remove after duration
        setTimeout(() => {
            if (feedbackLabel && feedbackLabel.scene) {
                feedbackLabel.kill();
                console.log("ReloadIndicator feedback removed");
            }
        }, duration);
        
        return feedbackLabel;
    }

    // Destroy the reload indicator
    destroy() {
        if (this.reloadLabel) {
            this.engine.remove(this.reloadLabel);
            this.reloadLabel = null;
            console.log("ReloadIndicator destroyed");
        }
    }

    // Get the reload label element
    getElement() {
        return this.reloadLabel;
    }

    // Check if indicator exists
    exists() {
        return this.reloadLabel !== null;
    }
}
