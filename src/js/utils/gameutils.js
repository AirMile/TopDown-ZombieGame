// filepath: d:\\Users\\mzeil\\VSCode school\\TopDown-ZombieGame\\src\\js\\utils\\gameutils.js
// Hulpfuncties specifiek voor de game logica

import { Actor } from 'excalibur';

/**
 * Haalt alle actieve actors van een specifiek class type op uit de huidige scene.
 * @param {import('excalibur').Engine} engine - De Excalibur engine instance.
 * @param {typeof Actor} type - Het class type om naar te zoeken (bijv. Player, Enemy).
 * @returns {Actor[]} Een array met de gevonden actors.
 */
export function getEntitiesByType(engine, type) {
    if (!engine || !engine.currentScene) {
        console.warn("getEntitiesByType: Engine of currentScene is niet beschikbaar.");
        return [];
    }
    if (!type || !(type.prototype instanceof Actor)) {
        console.warn(`getEntitiesByType: Ongeldig type meegegeven: ${type}`);
        return [];
    }

    const entities = engine.currentScene.actors.filter(actor => actor instanceof type && !actor.isKilled());
    console.log(`getEntitiesByType: Found ${entities.length} entities of type ${type.name}`);
    return entities;
}

/**
 * Controleert of een actor buiten het zichtbare schermgebied is, met een optionele marge.
 * @param {Actor} actor - De actor om te controleren.
 * @param {import('excalibur').Engine} engine - De Excalibur engine instance.
 * @param {number} [margin=0] - Een extra marge buiten het scherm.
 * @returns {boolean} True als de actor buiten het scherm + marge is, anders false.
 */
export function isActorOffScreen(actor, engine, margin = 0) {
    if (!actor || !engine || !engine.screen) {
        console.warn("isActorOffScreen: Actor, engine, of screen is niet beschikbaar.");
        return false;
    }

    const screenBounds = engine.screen.getWorldBounds();
    const actorBounds = actor.bounds;

    const isOffScreen = actorBounds.right < screenBounds.left - margin ||
                      actorBounds.left > screenBounds.right + margin ||
                      actorBounds.bottom < screenBounds.top - margin ||
                      actorBounds.top > screenBounds.bottom + margin;

    console.log(`isActorOffScreen: actor=${actor.id}, isOffScreen=${isOffScreen}, actorBounds=${JSON.stringify(actorBounds)}, screenBounds=${JSON.stringify(screenBounds)}, margin=${margin}`);
    return isOffScreen;
}
