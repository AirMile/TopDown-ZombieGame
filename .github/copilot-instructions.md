I am using the excaliburjs library at https://github.com/excaliburjs/Excalibur and object oriented programming, to create a game. 
Please use the following code examples to format classes in the game. I use vite to test and build the game. 
I do not use the global "ex." namespace for excalibur.
Please add console.logs when adding new features to see if everything works.

import {Engine, Actor, Vector} from "excalibur";
import {Player} from "./player.js";
import {Enemy} from "./enemy.js";

export class Game extends Engine {
    enemy
    player
    startGame() {
        this.player = new Player()
        this.add(this.player)
        this.enemy = new Enemy()
        this.add(this.enemy)
    }
}

export class Enemy extends Actor {
    constructor(){
        super({width:100, height:100})
        this.pos = new Vector(100,100)
        this.vel = new Vector(5,0)
    }
}