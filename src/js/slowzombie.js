import { Zombie } from "./zombie.js"
import { Vector, Color } from "excalibur"
import { Resources } from "./resources.js"

export class SlowZombie extends Zombie {
    constructor() {
        super()
        this.graphics.use(Resources.SlowZombie.toSprite())
        this.graphics.current.tint = Color.fromRGB(100, 200, 255) // Lichtblauw tint
        this.pos = new Vector(200, 300)
        this.vel = new Vector(-2, 0)
    }
}
