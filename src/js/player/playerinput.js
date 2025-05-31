import { Keys } from "excalibur";

export class PlayerInput {    constructor(player) {
        this.player = player;
    }    update(engine, delta) {
        // Input handling voor movement
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
    }
}
