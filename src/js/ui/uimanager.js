import { 
    AmmoCounter, 
    HealthBar, 
    ScoreCounter, 
    ReloadIndicator, 
    GameOverScreen, 
    MainMenu, 
    WaveAnnouncement 
} from "./components/index.js";

export class UIManager {
    constructor(engine) {
        this.engine = engine;
        
        // UI component instances
        this.ammoCounter = new AmmoCounter(engine);
        this.healthBar = new HealthBar(engine);
        this.scoreCounter = new ScoreCounter(engine);
        this.reloadIndicator = new ReloadIndicator(engine);
        this.gameOverScreen = new GameOverScreen(engine);
        this.mainMenu = new MainMenu(engine);
        this.waveAnnouncement = new WaveAnnouncement(engine);
        
        console.log("UIManager created with component-based architecture");
    }    // Create ammo counter
    createAmmoCounter() {
        return this.ammoCounter.create();
    }

    // Create reload indicator
    createReloadIndicator() {
        return this.reloadIndicator.create();
    }

    // Create health bar display
    createHealthCounter(currentHealth, maxHealth) {
        return this.healthBar.create(currentHealth, maxHealth);
    }

    // Create score display
    createScoreCounter() {
        return this.scoreCounter.create();
    }

    // Update ammo display
    updateAmmo(current, max, total = null) {
        this.ammoCounter.update(current, max, total);
    }

    // Update health bar display
    updateHealth(current, max) {
        this.healthBar.update(current, max);
    }

    // Update score display
    updateScore(score) {
        this.scoreCounter.update(score);
    }

    // Show/hide reload indicator
    showReloadIndicator(show) {
        this.reloadIndicator.show(show);
    }

    // Create reload feedback messages
    createReloadFeedback(message, colorName = "White", duration) {
        return this.reloadIndicator.createFeedback(message, colorName, duration);
    }

    // Create game over screen
    createGameOverScreen(finalScore = 0, highScore = 0, isNewHighScore = false) {
        // First clear all existing UI elements
        this.clearAll();
        return this.gameOverScreen.create(finalScore, highScore, isNewHighScore);
    }

    // Create wave announcement
    createWaveAnnouncement(text, duration = 3000) {
        return this.waveAnnouncement.create(text, duration);
    }

    // Create main menu
    createMainMenu() {
        return this.mainMenu.create();
    }    // Remove all UI elements
    clearAll() {
        this.ammoCounter.destroy();
        this.healthBar.destroy();
        this.scoreCounter.destroy();
        this.reloadIndicator.destroy();
        this.gameOverScreen.destroy();
        this.mainMenu.destroy();
        this.waveAnnouncement.destroy();
        
        console.log("UIManager: All UI components cleared");
    }

    // Get UI element by component type and name
    getElement(componentType, name = null) {
        switch(componentType) {
            case 'ammo':
                return this.ammoCounter.getElement();
            case 'health':
                return this.healthBar.getElement();
            case 'score':
                return this.scoreCounter.getElement();
            case 'reload':
                return this.reloadIndicator.getElement();
            case 'gameOver':
                return this.gameOverScreen.getElements();
            case 'mainMenu':
                return this.mainMenu.getElements();
            case 'wave':
                return this.waveAnnouncement.getElement();
            default:
                console.warn(`UIManager: Unknown component type: ${componentType}`);
                return null;
        }
    }

    // Check if component exists
    hasElement(componentType) {
        switch(componentType) {
            case 'ammo':
                return this.ammoCounter.exists();
            case 'health':
                return this.healthBar.exists();
            case 'score':
                return this.scoreCounter.exists();
            case 'reload':
                return this.reloadIndicator.exists();
            case 'gameOver':
                return this.gameOverScreen.exists();
            case 'mainMenu':
                return this.mainMenu.exists();
            case 'wave':
                return this.waveAnnouncement.exists();
            default:
                return false;
        }
    }
}
