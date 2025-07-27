
import TextConfig, { TextWeight } from "js/pq_games/layout/text/textConfig"

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


export default CONFIG