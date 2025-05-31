import { Label, Font, Color, TextAlign, Vector, CoordPlane } from "excalibur";

export class WaveAnnouncement {
    constructor(engine) {
        this.engine = engine;
        this.currentAnnouncement = null;
    }

    // Create wave announcement that auto-removes after duration
    create(text, duration = 3000) {
        // Remove any existing announcement first
        this.destroy();
        
        this.currentAnnouncement = new Label({
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
        
        this.engine.add(this.currentAnnouncement);
        console.log(`WaveAnnouncement created: "${text}" (${duration}ms)`);
        
        // Auto-remove after duration
        setTimeout(() => {
            this.destroy();
        }, duration);
        
        return this.currentAnnouncement;
    }

    // Destroy current announcement
    destroy() {
        if (this.currentAnnouncement) {
            this.engine.remove(this.currentAnnouncement);
            this.currentAnnouncement = null;
            console.log("WaveAnnouncement destroyed");
        }
    }

    // Check if announcement exists
    exists() {
        return this.currentAnnouncement !== null;
    }

    // Get current announcement element
    getElement() {
        return this.currentAnnouncement;
    }
}
