import { Keys } from "excalibur";

export class PlayerInput {
    turnSpeed = 4;
    turnRightOnSpace = true;
    spaceTurnCooldown = 0;
    spaceTurnCooldownTime = 1000;
    isTurning = false;
    targetRotation = null;
    lastSDoublePressTime = 0;
    sPressCount = 0;
    doubleSPressThreshold = 300;

    constructor(player) {
        this.player = player;
        console.log("PlayerInput initialized");
    }

    update(engine, delta) {
        if (this.spaceTurnCooldown > 0) {
            this.spaceTurnCooldown -= delta;
        }

        // Update turn direction preference
        if (!this.isTurning) {
            if (engine.input.keyboard.isHeld(Keys.D)) {
                this.turnRightOnSpace = true;
            } else if (engine.input.keyboard.isHeld(Keys.A)) {
                this.turnRightOnSpace = false;
            }
        }

        // Handle 180 turn
        if (!this.isTurning && this.spaceTurnCooldown <= 0 && engine.input.keyboard.isHeld(Keys.Space)) {
            this.start180Turn();
        }

        // Animate turn
        if (this.isTurning && this.targetRotation !== null) {
            this.animateTurn(delta);
        }
    }

    getMovementInput(engine) {
        if (this.isTurning) {
            return { speed: 0, strafe: 0, isSprinting: false };
        }

        const baseSpeed = this.player.movement.baseSpeed;
        let speed = 0;
        let strafe = 0;
        const isSprinting = engine.input.keyboard.isHeld(Keys.ShiftLeft);

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
        }

        return { speed, strafe, isSprinting };
    }

    start180Turn() {
        this.isTurning = true;
        this.spaceTurnCooldown = this.spaceTurnCooldownTime;
        const turnAmount = this.turnRightOnSpace ? Math.PI : -Math.PI;
        this.targetRotation = this.normalizeAngle(this.player.rotation + turnAmount);
        console.log("Starting 180 turn");
    }

    animateTurn(delta) {
        const step = this.turnSpeed * (delta / 1000);
        let diff = this.normalizeAngle(this.targetRotation - this.player.rotation);
        
        if (this.turnRightOnSpace && diff < 0) diff += 2 * Math.PI;
        else if (!this.turnRightOnSpace && diff > 0) diff -= 2 * Math.PI;
        
        if (Math.abs(diff) <= step) {
            this.player.rotation = this.targetRotation;
            this.isTurning = false;
            this.targetRotation = null;
            console.log("180 turn completed");
        } else {
            this.player.rotation = this.normalizeAngle(this.player.rotation + Math.sign(diff) * step);
        }
    }

    normalizeAngle(angle) {
        while (angle > Math.PI) angle -= 2 * Math.PI;
        while (angle < -Math.PI) angle += 2 * Math.PI;
        return angle;
    }
}
