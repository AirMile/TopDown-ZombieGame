import { Zombie } from "./zombie.js"
import { Vector, Color } from "excalibur"
import { Resources } from "./resources.js"

export class FastZombie extends Zombie {
    constructor() {
        super()
        this.graphics.use(Resources.FastZombie.toSprite())
        this.graphics.current.tint = Color.fromRGB(255, 80, 80) // Roodachtige tint
        this.pos = new Vector(800, 300)
        this.vel = new Vector(-15, 0)
    }
}
