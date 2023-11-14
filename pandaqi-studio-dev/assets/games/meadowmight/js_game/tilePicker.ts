import Tile from "./tile";

export default class TilePicker
{
    tiles: Tile[]

    constructor() {}
    get() { return this.tiles; }

    generate()
    {
        this.tiles = [];
        // @TODO
    }
}