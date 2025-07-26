import autoLoadFontCSS from "lib/pq-games/website/autoLoadFontCSS"
import TextConfig, { TextWeight } from "lib/pq-games/layout/text/textConfig"

const CONFIG:any = 
{
    assetsBase: "/the-domino-diaries/assets/",

    fonts:
    {
        heading: "domino",
        body: "spacegrotesk"
    },

    assets:
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
    }
}

autoLoadFontCSS(CONFIG);

export default CONFIG