import '../css/style.css'
import { Actor, Engine, Vector, DisplayMode } from "excalibur"
import { Resources, ResourceLoader } from './resources.js'
import { Player } from './player.js'
import { Zombie } from './zombie.js'
import { SlowZombie } from './slowzombie.js'
import { FastZombie } from './fastzombie.js'

export class Game extends Engine {

    constructor() {
        super({ 
            width: 1280,
            height: 720,
            maxFps: 60,
            displayMode: DisplayMode.FitScreen
         })
        this.start(ResourceLoader).then(() => this.startGame())
    }

    startGame() {
        console.log("start de game!")
        const player = new Player()
        this.add(player)
        const slowZombie = new SlowZombie()
        this.add(slowZombie)
        const fastZombie = new FastZombie()
        this.add(fastZombie)
    }

}

new Game()
