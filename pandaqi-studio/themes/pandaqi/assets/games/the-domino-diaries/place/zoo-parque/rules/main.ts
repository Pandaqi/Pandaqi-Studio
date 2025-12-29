import { loadRulebook } from "lib/pq-rulebook";
import { CONFIG } from "../shared/config";
import { OBJECTS, STALLS } from "../shared/dict";

const CONFIG_RULEBOOK =
{
    tables:
    {
        objects:
        {
            icons:
            {
                config:
                {
                    sheetURL: CONFIG._resources.files.objects.path,
                    sheetWidth: 4,
                    base: CONFIG._resources.base,
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
                    base: CONFIG._resources.base,
                },
            },
            data: STALLS
        },
    }
}

loadRulebook(CONFIG_RULEBOOK);