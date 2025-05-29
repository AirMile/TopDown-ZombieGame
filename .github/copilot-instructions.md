# Copilot Instructions - Excalibur Game Development

## Project Setup
- **Tech stack**: JavaScript (ES6+), Excalibur.js, Vite
- **Project structure**: `/src/js/` for all game files, `/public/images/` for assets
- **Import style**: Named imports, no global "ex." namespace
- **Resources**: Images are defined in `/src/js/resources.js` as variables

## Code Style & Conventions
- **Classes**: PascalCase (e.g. `GameManager`, `PlayerController`)
- **Variables/functions**: camelCase (e.g. `currentHealth`, `movePlayer()`)
- **Files**: lowercase only (e.g. `player.js`, `gamemanager.js`)
- **Private members**: Use `#` prefix for private variables and functions
- **Functions**: Many small functions with clear names, prefer new function over messy code

## Excalibur.js Specifics
```javascript
// Correct import pattern
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
```

## Game State & Data
- **Use classes** for game state and data management
- **Static images** without animation (no sprites/spritesheets)
- **Lifecycle methods** like `onInitialize()`, `onPreUpdate()`, `onPostUpdate()`

## Console Logging Requirements
- **Always add console.log** for new features to test functionality
- **Include all relevant data** that affects if-statements:
```javascript
if (this.#health <= 0 && !this.#isDead) {
    console.log(`Player died: health=${this.#health}, isDead=${this.#isDead}, position=${this.pos.x},${this.pos.y}`);
    this.#handleDeath();
}
```

## Code Examples Format
- **Complete, working examples** (no pseudocode fragments)
- **Dutch comments** for logic explanation
- **Keep English technical terms**
- **No error handling** examples unless specifically requested

## What NOT to include
- Global "ex." namespace usage
- Error handling (unless requested)
- Sprite/animation code
- Complex folder structures
- TypeScript interfaces

## Current Project Context
- **Zombie shooter game** (Excalibur, deadline Sunday, for arcade cabinet)
- **Focus**: Clean code structure, repository organization, working features with debugging output