import { TextConfig, TextWeight } from "lib/pq-games";


export const CONFIG = 
{
    _resources:
    {    
        base: "/the-domino-diaries/assets/",
        files:
        {
            spacegrotesk:
            {
                path: "fonts/SpaceGrotesk-Regular.woff2",
            },

            spacegrotesk_bold:
            {
                key: "spacegrotesk",
                path: "fonts/SpaceGrotesk-Bold.woff2",
                textConfig: new TextConfig({ weight: TextWeight.BOLD })
            },

            domino:
            {
                path: "fonts/Domino-Regular.woff2",
            },
        },
    },

    _drawing:
    {
        fonts:
        {
            heading: "domino",
            body: "spacegrotesk"
        },
    }
}