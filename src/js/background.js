import { Actor, Vector } from "excalibur";
import { Resources } from "./resources.js";

export class Background extends Actor {
    constructor(mapWidth, mapHeight) {
        // Plaats het midden van de Actor op het midden van de map
        super({
            pos: new Vector(mapWidth / 2, mapHeight / 2),
            width: mapWidth,
            height: mapHeight,
            z: -100 // Zorg dat hij altijd achter alles staat
        });
        this.mapWidth = mapWidth;
        this.mapHeight = mapHeight;
        

    }

    onInitialize(engine) {

        this.createTiledBackground(engine);
    }

    createTiledBackground(engine) {
        // Haal de background sprite op
        const backgroundSprite = Resources.Background.toSprite();
        
        if (!backgroundSprite) {
            return;
        }

        // Gebruik linksboven als anchor voor tegelen
        backgroundSprite.anchor = new Vector(0, 0);



        const tileW = backgroundSprite.width;
        const tileH = backgroundSprite.height;

        // Bereken hoeveel tiles we nodig hebben
        const tilesX = Math.ceil(this.mapWidth / tileW);
        const tilesY = Math.ceil(this.mapHeight / tileH);



        let tilesCreated = 0;

        // Maak alle tiles als losse Actors
        for (let x = 0; x < tilesX; x++) {
            for (let y = 0; y < tilesY; y++) {
                // Bereken absolute positie (vanaf linksboven van de map)
                const tileX = (x * tileW) - (this.mapWidth / 2);
                const tileY = (y * tileH) - (this.mapHeight / 2);
                
                // Maak een nieuwe tile actor
                const tile = new Actor({
                    pos: new Vector(tileX + (tileW / 2), tileY + (tileH / 2)), // Plaats op midden van tile
                    width: tileW,
                    height: tileH,
                    anchor: new Vector(0.5, 0.5), // Anchor op midden voor Actor
                    z: -101 // Zorg dat deze altijd achter alle andere elementen staat
                });

                // Clone de sprite en zet deze op de tile
                const tileSprite = backgroundSprite.clone();
                tileSprite.anchor = new Vector(0.5, 0.5); // Sprite anchor op midden
                tile.graphics.use(tileSprite);

                // Voeg tile toe aan de scene
                engine.add(tile);
                tilesCreated++;
            }
        }

        // Zet deze container actor zelf onzichtbaar (we gebruiken alleen de tiles)
        this.graphics.visible = false;
    }
}
