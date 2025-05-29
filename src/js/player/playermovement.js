import { Vector } from "excalibur";

export class PlayerMovement {
    baseSpeed = 150;
    dashDistance = 100;
    dashCooldown = 0;
    dashCooldownTime = 1500;
    isDashing = false;
    dashSpeed = 800;
    dashDirection = null;
    dashRemaining = 0;

    constructor(player) {
        this.player = player;
        console.log("PlayerMovement initialized");
    }

    update(delta) {
        if (this.dashCooldown > 0) {
            this.dashCooldown -= delta;
        }

        if (this.isDashing) {
            this.animateDash(delta);
        }
    }

    calculateVelocity(speed, strafe) {
        const forward = Vector.fromAngle(this.player.rotation).scale(speed);
        const right = Vector.fromAngle(this.player.rotation + Math.PI / 2).scale(strafe);
        return forward.add(right);
    }

    startDash(direction = -1) {
        if (this.dashCooldown > 0 || this.isDashing) return false;

        console.log("Starting dash!");
        this.isDashing = true;
        this.dashDirection = Vector.fromAngle(this.player.rotation).scale(direction);
        this.dashRemaining = this.dashDistance;
        this.dashCooldown = this.dashCooldownTime;
        return true;
    }

    animateDash(delta) {
        const dashStep = this.dashSpeed * (delta / 1000);
        
        if (dashStep >= this.dashRemaining) {
            this.player.pos = this.player.pos.add(this.dashDirection.scale(this.dashRemaining));
            this.isDashing = false;
            this.dashDirection = null;
            this.dashRemaining = 0;
            console.log("Dash completed!");
        } else {
            this.player.pos = this.player.pos.add(this.dashDirection.scale(dashStep));
            this.dashRemaining -= dashStep;
        }
    }
}
