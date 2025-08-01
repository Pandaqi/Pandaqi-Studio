import { CONFIG } from "../shared/config";
import { OBJECTS, STALLS } from "../shared/dict";

CONFIG._rulebook =
{
    tables:
    {
        objects:
        {
            config:
            {
                sheetURL: CONFIG.assets.objects.path,
                sheetWidth: 4,
                base: CONFIG.assetsBase,
            },
            icons: OBJECTS
        },

        stalls:
        {
            config:
            {
                sheetWidth: 4,
                base: CONFIG.assetsBase,
            },
            icons: STALLS
        },
    }
}

loadRulebook(CONFIG._rulebook);