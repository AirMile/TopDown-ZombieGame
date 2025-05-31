import { Player } from "../../player/player.js";
import { getEntitiesByType } from "../../utils/index.js"; // Import specific function

export class ZombieCollision {
    constructor(zombie) {
        this.zombie = zombie;
        this.lastCollisionState = false;
        
        console.log("ZombieCollision system created");
    }

    // Check for collision with player and return collision status
    checkPlayerCollision(engine) {
        // Use getEntitiesByType to find player
        const players = getEntitiesByType(engine, Player);
        const player = players.length > 0 ? players[0] : null;
        
        if (!player) {
            this.lastCollisionState = false;
            return null;
        }
        
        // Make sure collision bodies are initialized
        if (!this.zombie.collider || !player.collider) {
            this.lastCollisionState = false;
            return null;
        }
        
        // Check if zombie and player collision bodies are overlapping
        const zombieBody = this.zombie.collider.bounds;
        const playerBody = player.collider.bounds;
        
        const isCurrentlyColliding = zombieBody.overlaps(playerBody);
        
        // Log collision state changes for debugging
        if (isCurrentlyColliding !== this.lastCollisionState) {
            console.log(`ZombieCollision: Collision state changed to ${isCurrentlyColliding}`);
            this.lastCollisionState = isCurrentlyColliding;
        }
        
        if (isCurrentlyColliding) {
            return {
                isColliding: true,
                player: player,
                zombiePosition: { x: this.zombie.pos.x, y: this.zombie.pos.y },
                playerPosition: { x: player.pos.x, y: player.pos.y }
            };
        }
        
        return {
            isColliding: false,
            player: player
        };
    }

    // Get distance to player
    getDistanceToPlayer(engine) {
        const player = engine.currentScene.actors.find(actor => actor instanceof Player);
        
        if (!player) return Infinity;
        
        const distance = this.zombie.pos.distance(player.pos);
        return distance;
    }

    // Get direction to player
    getDirectionToPlayer(engine) {
        const player = engine.currentScene.actors.find(actor => actor instanceof Player);
        
        if (!player) return null;
        
        return player.pos.sub(this.zombie.pos).normalize();
    }

    // Check if player is in range
    isPlayerInRange(engine, range) {
        return this.getDistanceToPlayer(engine) <= range;
    }
}
