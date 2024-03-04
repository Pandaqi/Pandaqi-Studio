import MaterialVisualizer from "js/pq_games/tools/generation/materialVisualizer";

export default class MaterialEaster
{
    type: any;
    key: string;
    num?: number;
    customData?: Record<string,any>;

    getData() { return null; }
    getTypeData() { return null; }
    getText() : string { return this.getData().desc; }
    needsText(vis?:MaterialVisualizer) { return false; }
    needsEggNumber() { return false; }
    invertColors() { return false; }

    async draw(vis:MaterialVisualizer) { return null; }
}