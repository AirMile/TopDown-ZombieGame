import { GameConfig } from '../config/index.js';

export class SceneManager {
    #engine
    #gameState
    
    constructor(engine, gameState) {
        this.#engine = engine;
        this.#gameState = gameState;
        
        console.log('SceneManager initialized');
    }

    // Scene clearing methods
    clearCurrentScene() {
        const scene = this.#engine.currentScene;
        
        if (scene) {
            const actorCount = scene.actors.length;
            scene.clear();
            
            console.log(`Scene cleared: ${actorCount} actors removed`);
        }
    }

    clearAllActors() {
        const scene = this.#engine.currentScene;
        
        if (scene) {
            const allActors = scene.actors;
            const actorCount = allActors.length;
            
            // Kill all actors individually first
            allActors.forEach(actor => {
                if (actor && typeof actor.kill === 'function') {
                    actor.kill();
                }
            });
            
            // Then clear the scene
            scene.clear();
            
            console.log(`All actors killed and scene cleared: ${actorCount} entities removed`);
        }
    }

    removeActor(actor) {
        if (actor && this.#engine.currentScene) {
            this.#engine.currentScene.remove(actor);
            
            console.log('Actor removed from scene:', actor.constructor.name);
        }
    }

    addActor(actor) {
        if (actor && this.#engine.currentScene) {
            this.#engine.currentScene.add(actor);
            
            console.log('Actor added to scene:', actor.constructor.name);
        }
    }

    // Scene transition methods
    prepareForNewGame() {
        console.log('Preparing scene for new game...');
        
        // Clear everything
        this.clearAllActors();
        
        // Reset camera
        this.resetCamera();
        
        console.log('Scene prepared for new game');
    }

    prepareForMenu() {
        console.log('Preparing scene for main menu...');
        
        // Clear game entities but preserve UI
        this.clearCurrentScene();
        
        console.log('Scene prepared for main menu');
    }

    prepareForGameOver() {
        console.log('Preparing scene for game over...');
        
        // Kill all entities but keep them visible for dramatic effect
        this.killAllGameEntities();
        
        console.log('Scene prepared for game over');
    }

    // Camera management
    setupCamera(targetActor) {
        if (targetActor && this.#engine.currentScene) {
            this.#engine.currentScene.camera.strategy.lockToActor(targetActor);
            
            console.log('Camera locked to actor:', targetActor.constructor.name);
        }
    }

    updateCameraRotation(targetActor) {
        if (targetActor && this.#engine.currentScene) {
            // Camera rotation follows player with 180 degree offset
            this.#engine.currentScene.camera.rotation = -targetActor.rotation + Math.PI / 2 + Math.PI;
        }
    }

    resetCamera() {
        if (this.#engine.currentScene) {
            this.#engine.currentScene.camera.rotation = 0;
            this.#engine.currentScene.camera.pos.x = 0;
            this.#engine.currentScene.camera.pos.y = 0;
            
            console.log('Camera reset to default position');
        }
    }

    // Entity management helpers
    killAllGameEntities() {
        const scene = this.#engine.currentScene;
        
        if (scene) {
            const gameEntities = scene.actors.filter(actor => 
                this.#isGameEntity(actor)
            );
            
            gameEntities.forEach(entity => {
                if (typeof entity.kill === 'function') {
                    entity.kill();
                }
            });
            
            console.log(`Killed ${gameEntities.length} game entities`);
        }
    }

    #isGameEntity(actor) {
        // Check if actor is a game entity (not UI or background)
        const gameEntityTypes = ['Player', 'Zombie', 'SlowZombie', 'FastZombie', 'Bullet'];
        return gameEntityTypes.includes(actor.constructor.name);
    }

    getSceneActorCount() {
        const scene = this.#engine.currentScene;
        return scene ? scene.actors.length : 0;
    }

    getGameEntityCount() {
        const scene = this.#engine.currentScene;
        
        if (!scene) return 0;
        
        return scene.actors.filter(actor => this.#isGameEntity(actor)).length;
    }

    // Scene state validation
    validateSceneState() {
        const scene = this.#engine.currentScene;
        
        if (!scene) {
            console.warn('No current scene available');
            return false;
        }

        const actorCount = scene.actors.length;
        const gameEntityCount = this.getGameEntityCount();
        
        console.log(`Scene validation: ${actorCount} total actors, ${gameEntityCount} game entities`);
        
        return true;
    }

    // Debug methods
    logSceneContents() {
        const scene = this.#engine.currentScene;
        
        if (!scene) {
            console.log('No current scene');
            return;
        }

        const actorTypes = scene.actors.map(actor => actor.constructor.name);
        const typeCounts = {};
        
        actorTypes.forEach(type => {
            typeCounts[type] = (typeCounts[type] || 0) + 1;
        });
        
        console.log('Scene contents:', typeCounts);
    }
}
