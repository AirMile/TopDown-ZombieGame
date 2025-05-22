import '../css/style.css'
import { Actor, Engine, Vector, DisplayMode } from "excalibur"
import { Resources, ResourceLoader } from './resources.js'
import { Player } from './player.js'
import { Zombie } from './zombie.js'
import { SlowZombie } from './slowzombie.js'
import { FastZombie } from './fastzombie.js'

export class Game extends Engine {
    player // Declare player property

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
        this.player = new Player() // Assign to class property
        this.add(this.player)

        // Lock camera to player
        this.currentScene.camera.strategy.lockToActor(this.player) // Use this.player

        const slowZombie = new SlowZombie()
        this.add(slowZombie)
        const fastZombie = new FastZombie()
        this.add(fastZombie)
    }

    onPreUpdate(engine, delta) {
        super.onPreUpdate(engine, delta); // Call super method
        if (this.player) {
            // Stel camera rotatie in op de negatieve waarde van de spelerrotatie
            // plus een correctie van 90 graden (PI/2 radialen) zodat de speler naar boven kijkt,
            // en draai 180 graden (PI radialen) extra.
            this.currentScene.camera.rotation = -this.player.rotation + Math.PI / 2 + Math.PI;
        }
    }

}

new Game()
