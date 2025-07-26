import ResourceImage from "../layout/resources/resourceImage";
import ResourceLoader from "../layout/resources/resourceLoader";
import imageResourceToPhaserPreload from "./imageResourceToPhaserPreload";
// @ts-ignore
import { Loader } from "./phaser.esm";

// @NOTE: fonts aren't loaded by phaser itself but assumed to be available in context
// hence, this only needs to load IMAGES (and AUDIO in the future @TODO)
export default (resLoader: ResourceLoader, game: any) =>
{
    const resources = resLoader.resourcesLoaded;
    for(const [key,res] of Object.entries(resources))
    {
        if(!(res instanceof ResourceImage)) { continue; }
        imageResourceToPhaserPreload(res, game);
    }
    
    const promise = new Promise((resolve, reject) => {
        game.load.once(Loader.Events.COMPLETE, () => {
            resolve(true);
        })
    })

    game.load.start();
    return promise;
}