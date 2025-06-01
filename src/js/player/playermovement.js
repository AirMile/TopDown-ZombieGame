import { Vector } from "excalibur";

export class PlayerMovement {
    baseSpeed = 150;

    constructor(player) {
        this.player = player;
        
    }    update(delta) {
        // Beweging update logica
    }

    calculateVelocity(speed, strafe) {
        const forward = Vector.fromAngle(this.player.rotation).scale(speed);
        const right = Vector.fromAngle(this.player.rotation + Math.PI / 2).scale(strafe);
        return forward.add(right);
    }
}
