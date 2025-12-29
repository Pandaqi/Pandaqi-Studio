import { loadRulebook } from "lib/pq-rulebook";
import { ACTIONS } from "../shared/dict";

const CONFIG_RULEBOOK = 
{
    tables:
    {
        "glidy-gifts":
        {
            icons:
            {
                config:
                {
                    sheetURL: "actions.webp",
                    sheetWidth: 8,
                    base: "/slippery-slopes/assets/"
                }
            },
            
            data: ACTIONS
        },
    }
}

loadRulebook(CONFIG_RULEBOOK);