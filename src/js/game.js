import '../css/style.css'
import { Actor, Engine, Vector, DisplayMode, Label, Font, Color, CoordPlane, TextAlign } from "excalibur"
import { Resources, ResourceLoader } from './resources.js'
import { Player } from './player.js'
import { Zombie } from './zombie.js'
import { SlowZombie } from './slowzombie.js'
import { FastZombie } from './fastzombie.js'

export class Game extends Engine {
    player // Declare player property
    gameTimeRemaining = 180; // 3 minutes in seconds
    timerLabel;
    isGameOver = false;

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

        // Initialize and display the timer
        this.timerLabel = new Label({
            text: this.formatTime(this.gameTimeRemaining),
            pos: new Vector(this.drawWidth - 20, 20), // Position from top-right edge (20px right padding, 20px top padding)
            font: new Font({
                family: 'Arial',
                size: 32,
                color: Color.White,
                textAlign: TextAlign.Right // Ensure text is right-aligned
            }),
            anchor: new Vector(1, 0), // Anchor to the top-right of the label itself
            coordPlane: CoordPlane.Screen, // Set coordinate plane to screen for UI
            zIndex: 99 // Ensure timer is drawn on top
        });
        this.add(this.timerLabel);
        console.log("Timer label added with zIndex and adjusted position.");

        // Spawn 10 slow zombies
        for (let i = 0; i < 10; i++) {
            const slowZombie = new SlowZombie()
            // Verspreid ze een beetje over het scherm
            slowZombie.pos = new Vector(200 + i * 60, 300 + Math.random() * 200 - 100)
            this.add(slowZombie)
            console.log(`SlowZombie ${i} toegevoegd op positie (${slowZombie.pos.x}, ${slowZombie.pos.y})`)
        }
        // Spawn 10 fast zombies
        for (let i = 0; i < 10; i++) {
            const fastZombie = new FastZombie()
            fastZombie.pos = new Vector(800 + i * 60, 300 + Math.random() * 200 - 100)
            this.add(fastZombie)
            console.log(`FastZombie ${i} toegevoegd op positie (${fastZombie.pos.x}, ${fastZombie.pos.y})`)
        }
    }

    onPreUpdate(engine, delta) {
        super.onPreUpdate(engine, delta); // Call super method

        if (this.isGameOver) {
            return; // Stop updates if game is over
        }

        // Update game timer
        this.gameTimeRemaining -= delta / 1000;
        if (this.gameTimeRemaining <= 0) {
            this.gameTimeRemaining = 0;
            this.isGameOver = true;
            console.log("Game Over!");
            // Potentially add game over screen or logic here
            this.timerLabel.text = "Game Over!";
        } else {
            this.timerLabel.text = this.formatTime(this.gameTimeRemaining);
        }

        if (this.player) {
            // Stel camera rotatie in op de negatieve waarde van de spelerrotatie
            // plus een correctie van 90 graden (PI/2 radialen) zodat de speler naar boven kijkt,
            // en draai 180 graden (PI radialen) extra.
            this.currentScene.camera.rotation = -this.player.rotation + Math.PI / 2 + Math.PI;
        }
    }

    formatTime(seconds) {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = Math.floor(seconds % 60);
        const formattedSeconds = remainingSeconds < 10 ? '0' + remainingSeconds : remainingSeconds;
        return `Time: ${minutes}:${formattedSeconds}`;
    }
}

new Game()
