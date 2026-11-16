import { TextConfig, TextWeight } from "lib/pq-games";

export const CONFIG = 
{
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