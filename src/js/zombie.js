import { Actor, Vector } from "excalibur"
import { Resources } from "./resources.js"

export class Zombie extends Actor {
    constructor() {
        super()
        this.graphics.use(Resources.Fish.toSprite())
        this.pos = new Vector(500, 300)
        this.vel = new Vector(-10, 0)
    }
}
