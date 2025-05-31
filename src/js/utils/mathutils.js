// filepath: d:\Users\mzeil\VSCode school\TopDown-ZombieGame\src\js\utils\mathutils.js
// Hulpfuncties voor wiskundige berekeningen

/**
 * Beperkt een waarde binnen een gespecificeerd bereik.
 * @param {number} value - De waarde om te beperken.
 * @param {number} min - De minimale waarde.
 * @param {number} max - De maximale waarde.
 * @returns {number} De beperkte waarde.
 */
export function clamp(value, min, max) {
    const result = Math.min(Math.max(value, min), max);
    console.log(`clamp: value=${value}, min=${min}, max=${max}, result=${result}`);
    return result;
}

/**
 * Voert lineaire interpolatie uit tussen twee waarden.
 * @param {number} start - De startwaarde.
 * @param {number} end - De eindwaarde.
 * @param {number} amount - De interpolatiehoeveelheid (meestal tussen 0 en 1).
 * @returns {number} De geïnterpoleerde waarde.
 */
export function lerp(start, end, amount) {
    const result = start * (1 - amount) + end * amount;
    console.log(`lerp: start=${start}, end=${end}, amount=${amount}, result=${result}`);
    return result;
}

/**
 * Genereert een willekeurig drijvendekommagetal binnen een gespecificeerd bereik.
 * @param {number} min - De minimale waarde.
 * @param {number} max - De maximale waarde.
 * @returns {number} Een willekeurig getal tussen min (inclusief) en max (exclusief).
 */
export function randomInRange(min, max) {
    const result = Math.random() * (max - min) + min;
    console.log(`randomInRange: min=${min}, max=${max}, result=${result}`);
    return result;
}

/**
 * Genereert een willekeurig geheel getal binnen een gespecificeerd bereik.
 * @param {number} min - De minimale waarde (inclusief).
 * @param {number} max - De maximale waarde (inclusief).
 * @returns {number} Een willekeurig geheel getal tussen min en max.
 */
export function randomIntInRange(min, max) {
    const result = Math.floor(Math.random() * (max - min + 1)) + min;
    console.log(`randomIntInRange: min=${min}, max=${max}, result=${result}`);
    return result;
}

/**
 * Berekent het kortste verschil tussen twee hoeken (in radialen).
 * Zorgt ervoor dat het resultaat altijd tussen -PI en PI ligt.
 * @param {number} angle1 - De eerste hoek in radialen.
 * @param {number} angle2 - De tweede hoek in radialen.
 * @returns {number} Het kortste verschil tussen de hoeken.
 */
export function angleDifference(angle1, angle2) {
    let diff = (angle2 - angle1 + Math.PI) % (2 * Math.PI) - Math.PI;
    if (diff < -Math.PI) {
        diff += 2 * Math.PI;
    }
    console.log(`angleDifference: angle1=${angle1}, angle2=${angle2}, difference=${diff}`);
    return diff;
}
