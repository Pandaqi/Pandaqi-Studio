import { TerrainType, DinoType } from "../js_shared/dict"

export default class DominoSide
{
    terrain:TerrainType
    dino:DinoType

    setTerrain(t:TerrainType) { this.terrain = t; }
    setDinosaur(d:DinoType) { this.dino = d; }
}