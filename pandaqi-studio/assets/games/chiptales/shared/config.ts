import { TextConfig, TextWeight } from "lib/pq-games";

export const CONFIG = 
{
    // Without _settings the framework treats the whole config as raw settings (the V1 API).
    _settings: {},

    _drawing:
    {
        fonts:
        {
            heading: "klarissa",
            body: "cooper",
        },
    },

    // assets
    _resources:
    {    
        base: "/chiptales/assets/",
        files:
        {
            cooper:
            {
                path: "fonts/Cooper-Regular.woff2",
            },

            cooper_bold:
            {
                key: "cooper",
                path: "fonts/Cooper-Black.woff2",
                textConfig: new TextConfig({ weight: TextWeight.BOLD }),
            },

            klarissa:
            {
                path: "fonts/Klarissa.woff2",
            },
        },
    }
}