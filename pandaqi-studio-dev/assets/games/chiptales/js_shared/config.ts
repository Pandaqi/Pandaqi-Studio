import TextConfig, { TextWeight } from "js/pq_games/layout/text/textConfig";
import autoLoadFontCSS from "js/pq_games/website/autoLoadFontCSS";

const CONFIG:any = 
{
    fonts:
    {
        heading: "klarissa",
        body: "cooper",
    },

    // assets
    assetsBase: "/chiptales/assets/",
    assets:
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

autoLoadFontCSS(CONFIG);

export default CONFIG