// EventSysteem voor het afhandelen van game-gebeurtenissen

export class EventSystem {
    #listeners = {};

    // Definieer hier veelvoorkomende game-gebeurtenissen als constanten
    static PLAYER_DIED = 'playerDied';
    static ENEMY_KILLED = 'enemyKilled';
    static WAVE_STARTED = 'waveStarted';
    static WAVE_ENDED = 'waveEnded';
    static AMMO_PICKUP = 'ammoPickup';
    static SCORE_UPDATED = 'scoreUpdated';
    static HEALTH_UPDATED = 'healthUpdated';
    static GAME_OVER = 'gameOver';
    static GAME_STARTED = 'gameStarted';
    static PLAYER_SHOOT = 'playerShoot';
    static RELOAD_STARTED = 'reloadStarted';
    static RELOAD_ENDED = 'reloadEnded';

    constructor() {
        console.log("EventSystem geïnitialiseerd");
    }

    /**
     * Abonneer op een gebeurtenis.
     * @param {string} eventName - De naam van de gebeurtenis.
     * @param {Function} callback - De functie die wordt aangeroepen wanneer de gebeurtenis wordt geactiveerd.
     */
    on(eventName, callback) {
        if (typeof callback !== 'function') {
            console.warn(`EventSystem: Poging tot registreren van ongeldige callback voor event '${eventName}'. Callback was:`, callback);
            return;
        }
        if (!this.#listeners[eventName]) {
            this.#listeners[eventName] = [];
        }
        this.#listeners[eventName].push(callback);
        console.log(`EventSystem: Listener geregistreerd voor '${eventName}'`);
    }

    /**
     * Zeg het abonnement op een gebeurtenis op.
     * @param {string} eventName - De naam van de gebeurtenis.
     * @param {Function} callback - De callback-functie om te verwijderen.
     */
    off(eventName, callback) {
        if (!this.#listeners[eventName]) {
            console.warn(`EventSystem: Geen listeners gevonden voor event '${eventName}' om te verwijderen.`);
            return;
        }

        this.#listeners[eventName] = this.#listeners[eventName].filter(
            (listener) => listener !== callback
        );
        console.log(`EventSystem: Listener verwijderd voor '${eventName}'`);
        if (this.#listeners[eventName].length === 0) {
            delete this.#listeners[eventName];
            console.log(`EventSystem: Geen listeners meer voor '${eventName}', event verwijderd.`);
        }
    }

    /**
     * Activeer een gebeurtenis en stel alle abonnees op de hoogte.
     * @param {string} eventName - De naam van de gebeurtenis.
     * @param {*} [data] - Optionele gegevens om door te geven aan de callbacks.
     */
    emit(eventName, data) {
        if (!this.#listeners[eventName]) {
            // console.log(`EventSystem: Geen listeners voor event '${eventName}', niets te doen.`);
            return; // Niet noodzakelijk een waarschuwing, kan normaal zijn
        }

        console.log(`EventSystem: Event '${eventName}' geactiveerd met data:`, data);
        this.#listeners[eventName].forEach((callback) => {
            try {
                callback(data);
            } catch (error) {
                console.error(`EventSystem: Fout in listener voor event '${eventName}':`, error);
                console.error(`  Callback:`, callback.toString());
                console.error(`  Data:`, data);
            }
        });
    }

    /**
     * Hulpmethode om alle huidige listeners te zien (voor debuggen).
     */
    listListeners() {
        console.log("EventSystem: Huidige listeners:", this.#listeners);
    }
}
