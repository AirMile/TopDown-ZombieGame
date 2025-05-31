import { Label, Font, Color, TextAlign, Vector, CoordPlane } from "excalibur";
import { UIConfig } from "../../config/uiconfig.js";

export class ScoreCounter {
    constructor(engine) {
        this.engine = engine;
        this.label = null;
    }

    // Create score counter display
    create() {
        this.label = new Label({
            text: "Score: 0",
            pos: new Vector(UIConfig.SCORE_COUNTER.X, UIConfig.SCORE_COUNTER.Y),
            font: new Font({
                family: UIConfig.SCORE_COUNTER.FONT_FAMILY,
                size: UIConfig.SCORE_COUNTER.FONT_SIZE,
                color: Color.White,
                textAlign: TextAlign.Left
            }),
            anchor: new Vector(0, 0),
            coordPlane: CoordPlane.Screen,
            zIndex: UIConfig.SCORE_COUNTER.Z_INDEX
        });
        
        this.engine.add(this.label);
        console.log("ScoreCounter created");
        
        return this.label;
    }

    // Update score display with new score value
    update(score) {
        if (!this.label) return;
        
        this.label.text = `Score: ${score}`;
        console.log(`ScoreCounter updated: ${score}`);
    }

    // Destroy the score counter
    destroy() {
        if (this.label) {
            this.engine.remove(this.label);
            this.label = null;
            console.log("ScoreCounter destroyed");
        }
    }

    // Get the label element
    getElement() {
        return this.label;
    }

    // Check if counter exists
    exists() {
        return this.label !== null;
    }
}
