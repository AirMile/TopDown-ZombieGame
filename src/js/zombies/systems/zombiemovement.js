import { Vector } from "excalibur";
import { Player } from "../../player/player.js";
import { getEntitiesByType, randomInRange } from "../../utils/index.js"; // Import specific functions

export class ZombieMovement {
    constructor(zombie, movementSpeed) {
        this.zombie = zombie;
        this.movementSpeed = movementSpeed;
        this.targetPlayer = null;
        this.lastPlayerPosition = null;
        
        console.log(`ZombieMovement created: speed=${movementSpeed}`);
    }

    // Update zombie movement towards player
    update(engine, delta) {
        // Use getEntitiesByType to find player
        const players = getEntitiesByType(engine, Player);
        const player = players.length > 0 ? players[0] : null;
        
        if (!player) {
            // No player found, stop movement
            this.zombie.vel = Vector.Zero;
            this.targetPlayer = null;
            return;
        }
        
        this.targetPlayer = player;
        this.lastPlayerPosition = player.pos.clone();
        
        // Calculate direction to player
        const directionToPlayer = player.pos.sub(this.zombie.pos).normalize();
        
        // Set velocity towards player
        this.zombie.vel = directionToPlayer.scale(this.movementSpeed);
        
        // Rotate zombie to face player direction
        this.zombie.rotation = directionToPlayer.toAngle() - Math.PI / 2; // Excalibur's toAngle() is often what's needed
        
        // Debug log occasionally
        if (randomInRange(0,1) < 0.001) { // Very rare logging, using randomInRange
            const distance = this.zombie.pos.distance(player.pos);
            console.log(`ZombieMovement: Distance to player: ${distance.toFixed(1)}, direction: ${directionToPlayer.x.toFixed(2)},${directionToPlayer.y.toFixed(2)}`);
        }
    }

    // Set new movement speed
    setSpeed(newSpeed) {
        this.movementSpeed = newSpeed;
        console.log(`ZombieMovement: Speed changed to ${newSpeed}`);
    }

    // Get current movement speed
    getSpeed() {
        return this.movementSpeed;
    }

    // Get distance to target player
    getDistanceToPlayer() {
        if (!this.targetPlayer) return Infinity;
        return this.zombie.pos.distance(this.targetPlayer.pos);
    }

    // Get direction to target player
    getDirectionToPlayer() {
        if (!this.targetPlayer) return Vector.Zero;
        return this.targetPlayer.pos.sub(this.zombie.pos).normalize();
    }

    // Stop zombie movement
    stop() {
        this.zombie.vel = Vector.Zero;
        console.log("ZombieMovement: Stopped");
    }

    // Check if zombie is moving
    isMoving() {
        return !this.zombie.vel.equals(Vector.Zero);
    }

    // Advanced movement patterns (for future AI enhancement)
    
    // Move in a wandering pattern when no player is nearby
    wander(wanderRadius = 50, wanderDistance = 100) {
        // Simple wandering implementation
        const randomAngle = Math.random() * Math.PI * 2;
        const wanderDirection = Vector.fromAngle(randomAngle);
        
        this.zombie.vel = wanderDirection.scale(this.movementSpeed * 0.3); // Slower wandering
        this.zombie.rotation = randomAngle - Math.PI / 2;
        
        console.log("ZombieMovement: Wandering");
    }

    // Move to a specific position
    moveToPosition(targetPosition, speed = null) {
        const useSpeed = speed || this.movementSpeed;
        const direction = targetPosition.sub(this.zombie.pos).normalize();
        
        this.zombie.vel = direction.scale(useSpeed);
        this.zombie.rotation = direction.toAngle() - Math.PI / 2;
        
        console.log(`ZombieMovement: Moving to position ${targetPosition.x},${targetPosition.y}`);
    }
}
