import { Actor, Label, Font, Color, TextAlign, Vector, CoordPlane } from "excalibur";
import { UIConfig } from "../../config/uiconfig.js";

export class AmmoCounter {
    constructor(engine) {
        this.engine = engine;
        this.label = null;
    }

    // Create ammo counter display
    create() {
        this.label = new Label({
            text: "Ammo: 35/35 | Total: 250",
            pos: new Vector(this.engine.drawWidth - UIConfig.AMMO_COUNTER.X_OFFSET, UIConfig.AMMO_COUNTER.Y),
            font: new Font({
                family: UIConfig.AMMO_COUNTER.FONT_FAMILY,
                size: UIConfig.AMMO_COUNTER.FONT_SIZE,
                color: Color.White,
                textAlign: TextAlign.Right
            }),
            anchor: new Vector(1, 0),
            coordPlane: CoordPlane.Screen,
            zIndex: UIConfig.AMMO_COUNTER.Z_INDEX
        });
        
        this.engine.add(this.label);
        console.log("AmmoCounter created");
        
        return this.label;
    }

    // Update ammo display with current, max and total ammo
    update(current, max, total = null) {
        if (!this.label) return;
        
        if (total !== null) {
            this.label.text = `Ammo: ${current}/${max} | Total: ${total}`;
            
            // Verander kleur op basis van totale ammo
            if (total > UIConfig.AMMO_COLOR_THRESHOLDS.HIGH) {
                this.label.font.color = Color.White;
            } else if (total > UIConfig.AMMO_COLOR_THRESHOLDS.MEDIUM) {
                this.label.font.color = Color.Yellow;
            } else {
                this.label.font.color = Color.Red;
            }
            
            console.log(`AmmoCounter updated: ${current}/${max} | Total: ${total}, color: ${this.label.font.color}`);
        } else {
            this.label.text = `Ammo: ${current}/${max}`;
            this.label.font.color = Color.White;
            console.log(`AmmoCounter updated: ${current}/${max}`);
        }
    }

    // Destroy the ammo counter
    destroy() {
        if (this.label) {
            this.engine.remove(this.label);
            this.label = null;
            console.log("AmmoCounter destroyed");
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
