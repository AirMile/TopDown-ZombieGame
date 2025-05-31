import { Keys } from "excalibur";

export class PlayerInput {
    constructor(player) {
        this.player = player;
          // Double-press detection voor WASD dash mechanics
        this.wKeyPressed = false;
        this.sKeyPressed = false;
        this.aKeyPressed = false;
        this.dKeyPressed = false;
        
        this.lastWPressTime = 0;
        this.lastSPressTime = 0;
        this.lastAPressTime = 0;
        this.lastDPressTime = 0;
        
        this.doublePressWindow = 300; // 300ms window voor double press
    }    update(engine, delta) {
        // Check voor double-press dash mechanics
        this.checkDoublePressInput(engine);
    }getMovementInput(engine) {
        const baseSpeed = this.player.movement.baseSpeed;
        let speed = 0;
        let strafe = 0;
        const isSprinting = engine.input.keyboard.isHeld(Keys.ShiftLeft);
        const isShooting = engine.input.keyboard.isHeld(Keys.Space);

        if (engine.input.keyboard.isHeld(Keys.W)) {
            speed = isSprinting ? baseSpeed * 2 : baseSpeed;
        }
        if (engine.input.keyboard.isHeld(Keys.S)) {
            speed = -baseSpeed;
        }
        if (engine.input.keyboard.isHeld(Keys.D)) {
            strafe = baseSpeed;
        }
        if (engine.input.keyboard.isHeld(Keys.A)) {
            strafe = -baseSpeed;
        }        return { speed, strafe, isSprinting, isShooting };
    }    checkDoublePressInput(engine) {
        const currentTime = Date.now();

        // Check W double-press for dash forward
        if (engine.input.keyboard.wasPressed(Keys.W)) {
            if (this.wKeyPressed && (currentTime - this.lastWPressTime) < this.doublePressWindow) {
                console.log(`Double press W detected - dashing forward`);
                this.player.startDash('forward');
            }
            this.wKeyPressed = true;
            this.lastWPressTime = currentTime;
        }
        
        // Check S double-press for dash backward
        if (engine.input.keyboard.wasPressed(Keys.S)) {
            if (this.sKeyPressed && (currentTime - this.lastSPressTime) < this.doublePressWindow) {
                console.log(`Double press S detected - dashing backward`);
                this.player.startDash('backward');
            }
            this.sKeyPressed = true;
            this.lastSPressTime = currentTime;
        }
        
        // Check A double-press for dash left
        if (engine.input.keyboard.wasPressed(Keys.A)) {
            if (this.aKeyPressed && (currentTime - this.lastAPressTime) < this.doublePressWindow) {
                console.log(`Double press A detected - dashing left`);
                this.player.startDash('left');
            }
            this.aKeyPressed = true;
            this.lastAPressTime = currentTime;
        }
        
        // Check D double-press for dash right
        if (engine.input.keyboard.wasPressed(Keys.D)) {
            if (this.dKeyPressed && (currentTime - this.lastDPressTime) < this.doublePressWindow) {
                console.log(`Double press D detected - dashing right`);
                this.player.startDash('right');
            }
            this.dKeyPressed = true;
            this.lastDPressTime = currentTime;
        }
        
        // Reset flags na een tijdje
        if (currentTime - this.lastWPressTime > this.doublePressWindow) {
            this.wKeyPressed = false;
        }
        if (currentTime - this.lastSPressTime > this.doublePressWindow) {
            this.sKeyPressed = false;
        }
        if (currentTime - this.lastAPressTime > this.doublePressWindow) {
            this.aKeyPressed = false;
        }
        if (currentTime - this.lastDPressTime > this.doublePressWindow) {
            this.dKeyPressed = false;
        }
    }
}
