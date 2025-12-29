import { TextConfig, TextWeight, TextStyle, Vector2, Bounds } from "lib/pq-games";

export const CONFIG_SHARED =
{
    files:
    {
        dejavu:
        {
            key: "dejavu",
            path: "/maybe-games/assets/fonts/DejaVuSansCondensed.woff2",
            useAbsolutePath: true
        },

        dejavu_bold:
        {
            key: "dejavu",
            path: "/maybe-games/assets/fonts/DejaVuSansCondensed-Bold.woff2",
            useAbsolutePath: true,
            textConfig: new TextConfig({ weight: TextWeight.BOLD })
        },

        dejavu_italic:
        {
            key: "dejavu",
            path: "/maybe-games/assets/fonts/DejaVuSansCondensed-Oblique.woff2",
            useAbsolutePath: true,
            textConfig: new TextConfig({ style: TextStyle.ITALIC })
        },

        dejavu_bold_italic:
        {
            key: "dejavu",
            path: "/maybe-games/assets/fonts/DejaVuSansCondensed-BoldOblique.woff2",
            useAbsolutePath: true,
            textConfig: new TextConfig({ weight: TextWeight.BOLD, style: TextStyle.ITALIC })
        },
    },

    rulebook:
    {
        cardSize: new Vector2(375, 525),
        numPlayerBounds: new Bounds(3,5)
    },

    _material:
    {
        cards:
        {
            mapper: 
            {
                autoStroke: true,
                sizeElement: new Vector2(1, 1.4),
                size: { 
                    small: new Vector2(4,4),
                    regular: new Vector2(3,3),
                    large: new Vector2(2,2)
                },  
            },
        },

        votes:
        {
            mapper:
            {
                autoStroke: true,
                sizeElement: new Vector2(1, 1.4),
                size: { 
                    small: new Vector2(6,6),
                    regular: new Vector2(5,5),
                    large: new Vector2(4,4)
                },  
            },
        }
    },

    _drawing:
    {
        fonts:
        {
            body: "dejavu"
        },
    }
}