import { Player } from "../../player/player.js";
import { getEntitiesByType } from "../../utils/index.js"; // Import specific function

export class ZombieCollision {
    constructor(zombie) {
        this.zombie = zombie;
        this.lastCollisionState = false;
        // console.log("ZombieCollision system created");
    }

    // Controleer collision met speler en return collision status
    checkPlayerCollision(engine) {
        const player = this._getPlayer(engine);
        if (!player || !this._hasColliders(this.zombie, player)) {
            this.lastCollisionState = false;
            return null;
        }

        const zombieBody = this.zombie.collider.bounds;
        const playerBody = player.collider.bounds;
        const isCurrentlyColliding = zombieBody.overlaps(playerBody);

        if (isCurrentlyColliding !== this.lastCollisionState) {
            // console.log(`ZombieCollision: Collision state changed to ${isCurrentlyColliding}`);
            this.lastCollisionState = isCurrentlyColliding;
        }

        return isCurrentlyColliding
            ? {
                isColliding: true,
                player: player,
                zombiePosition: { x: this.zombie.pos.x, y: this.zombie.pos.y },
                playerPosition: { x: player.pos.x, y: player.pos.y }
            }
            : { isColliding: false, player: player };
    }

    getDistanceToPlayer(engine) {
        const player = this._getPlayer(engine);
        if (!player) return { distance: Infinity, player: null };
        return { distance: this.zombie.pos.distance(player.pos), player };
    }

    getDirectionToPlayer(engine) {
        const player = this._getPlayer(engine);
        if (!player) return null;
        return player.pos.sub(this.zombie.pos).normalize();
    }

    isPlayerInRange(engine, range) {
        const { distance, player } = this.getDistanceToPlayer(engine);
        return player && distance <= range;
    }

    // Private helper om de speler te vinden
    _getPlayer(engine) {
        const players = getEntitiesByType(engine, Player);
        return players.length > 0 ? players[0] : null;
    }

    // Private helper om te checken of beide entiteiten een collider hebben
    _hasColliders(entityA, entityB) {
        return !!(entityA && entityA.collider && entityB && entityB.collider);
    }
}
