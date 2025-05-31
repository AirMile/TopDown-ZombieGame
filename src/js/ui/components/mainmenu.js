import { Label, Font, Color, TextAlign, Vector, CoordPlane } from "excalibur";

export class MainMenu {
    constructor(engine) {
        this.engine = engine;
        this.elements = [];
    }

    // Create complete main menu with title and instructions
    create() {
        // Clear any existing elements first
        this.destroy();
        
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
        
        // Controls info - comprehensive controls list
        const controlsLabel = new Label({
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
        });
        
        // Add all elements to engine and store references
        this.elements = [titleLabel, playLabel, controlsLabel];
        this.elements.forEach(element => {
            this.engine.add(element);
        });
        
        console.log("MainMenu created");
        
        return titleLabel;
    }

    // Destroy all main menu elements
    destroy() {
        this.elements.forEach(element => {
            if (element) {
                this.engine.remove(element);
            }
        });
        this.elements = [];
        console.log("MainMenu destroyed");
    }

    // Check if menu exists
    exists() {
        return this.elements.length > 0;
    }

    // Get all menu elements
    getElements() {
        return this.elements;
    }
}
