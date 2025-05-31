import { Vector } from "excalibur";
import { PlayerConfig } from "../config/playerconfig.js";

export class PlayerMovement {
    baseSpeed = PlayerConfig.BASE_SPEED;

    constructor(player) {
        this.player = player;
        
    }    update(delta) {
        // Movement update logic
    }

    calculateVelocity(speed, strafe) {
        const forward = Vector.fromAngle(this.player.rotation).scale(speed);
        const right = Vector.fromAngle(this.player.rotation + Math.PI / 2).scale(strafe);
        return forward.add(right);
    }
}
