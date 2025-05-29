import { ImageSource, Sound, Resource, Loader } from 'excalibur'

// voeg hier jouw eigen resources toe
const Resources = {
    Player: new ImageSource('images/femalePlayer.png'),
    SlowZombie: new ImageSource('images/fish.png'),
    FastZombie: new ImageSource('images/fish.png'),
    // New fast zombies
    FastZombie1: new ImageSource('images/fastZombie1.png'),
    FastZombie2: new ImageSource('images/fastZombie2.png'),
    FastZombie3: new ImageSource('images/fastZombie3.png'),
    FastZombie4: new ImageSource('images/fastZombie4.png'),
    // New slow zombies
    SlowZombie1: new ImageSource('images/slowZombie1.png'),
    SlowZombie2: new ImageSource('images/slowZombie2.png'),
    Background: new ImageSource('images/background.png')
}

const ResourceLoader = new Loader()
for (let res of Object.values(Resources)) {
    ResourceLoader.addResource(res)
}

export { Resources, ResourceLoader }