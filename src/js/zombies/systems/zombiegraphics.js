import { Vector, Color } from "excalibur";
import { Resources } from "../../resources.js";

export class ZombieGraphics {
    constructor(zombie) {
        this.zombie = zombie;
        
        console.log("ZombieGraphics system created");
    }

    // Setup sprite for slow zombie with random sprite selection
    setupSlowZombieSprite(scale, tintColor) {
        const slowSprites = [
            Resources.SlowZombie1,
            Resources.SlowZombie2
        ];
        
        const spriteIndex = Math.floor(Math.random() * slowSprites.length);
        const sprite = slowSprites[spriteIndex].toSprite();
        
        sprite.scale = new Vector(scale.x, scale.y);
        sprite.tint = Color.fromRGB(tintColor.r, tintColor.g, tintColor.b);
        
        this.zombie.graphics.use(sprite);
        
        console.log(`ZombieGraphics: Slow zombie sprite setup (index: ${spriteIndex}, scale: ${scale.x}x${scale.y})`);
        return sprite;
    }

    // Setup sprite for fast zombie with random sprite selection
    setupFastZombieSprite(scale, tintColor) {
        const fastSprites = [
            Resources.FastZombie1,
            Resources.FastZombie2,
            Resources.FastZombie3,
            Resources.FastZombie4
        ];
        
        const spriteIndex = Math.floor(Math.random() * fastSprites.length);
        const sprite = fastSprites[spriteIndex].toSprite();
        
        sprite.scale = new Vector(scale.x, scale.y);
        sprite.tint = Color.fromRGB(tintColor.r, tintColor.g, tintColor.b);
        
        this.zombie.graphics.use(sprite);
        
        console.log(`ZombieGraphics: Fast zombie sprite setup (index: ${spriteIndex}, scale: ${scale.x}x${scale.y})`);
        return sprite;
    }

    // Setup custom sprite from resource array
    setupCustomSprite(spriteResources, scale, tintColor) {
        if (!spriteResources || spriteResources.length === 0) {
            console.warn("ZombieGraphics: No sprite resources provided");
            return null;
        }
        
        const spriteIndex = Math.floor(Math.random() * spriteResources.length);
        const sprite = spriteResources[spriteIndex].toSprite();
        
        sprite.scale = new Vector(scale.x, scale.y);
        sprite.tint = Color.fromRGB(tintColor.r, tintColor.g, tintColor.b);
        
        this.zombie.graphics.use(sprite);
        
        console.log(`ZombieGraphics: Custom sprite setup (index: ${spriteIndex}, scale: ${scale.x}x${scale.y})`);
        return sprite;
    }

    // Change sprite tint color
    changeTint(tintColor) {
        if (this.zombie.graphics.current) {
            this.zombie.graphics.current.tint = Color.fromRGB(tintColor.r, tintColor.g, tintColor.b);
            console.log(`ZombieGraphics: Tint changed to RGB(${tintColor.r}, ${tintColor.g}, ${tintColor.b})`);
        }
    }

    // Change sprite scale
    changeScale(scale) {
        if (this.zombie.graphics.current) {
            this.zombie.graphics.current.scale = new Vector(scale.x, scale.y);
            console.log(`ZombieGraphics: Scale changed to ${scale.x}x${scale.y}`);
        }
    }

    // Enable/disable debug graphics
    showDebug(enabled) {
        this.zombie.graphics.showDebug = enabled;
        console.log(`ZombieGraphics: Debug graphics ${enabled ? 'enabled' : 'disabled'}`);
    }
}
