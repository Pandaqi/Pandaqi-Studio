import { CONFIG } from "../shared/config";
import { OBJECTS, STALLS } from "../shared/dict";

CONFIG._rulebook =
{
    tables:
    {
        objects:
        {
            icons:
            {
                config:
                {
                    sheetURL: CONFIG.assets.objects.path,
                    sheetWidth: 4,
                    base: CONFIG.assetsBase,
                },
            },
            data: OBJECTS
        },

        stalls:
        {
            icons:
            {
                config:
                {
                    sheetWidth: 4,
                    base: CONFIG.assetsBase,
                },
            },
            data: STALLS
        },
    }
}

loadRulebook(CONFIG._rulebook);