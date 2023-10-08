import PDF from "./pdf/main";
import PHASER from "./website/phaser";
import SETTINGS from "./website/settings";
import TOOLS from "./tools/main";
import Color from "./layout/color/color";
import ResourceLoader from "./layout/resources/resourceLoader";
import GridMapper from "./layout/gridMapper";

// @ts-ignore
window.PQ_GAMES = {
    SETTINGS: SETTINGS,
    PHASER: PHASER,
    PDF: PDF,
    TOOLS: TOOLS,

    Color: Color,
    ResourceLoader: ResourceLoader,
    GridMapper: GridMapper,
};
