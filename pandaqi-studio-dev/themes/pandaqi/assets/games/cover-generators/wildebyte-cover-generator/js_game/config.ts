import TARGETS from "./targetData";
import BOOK_DATA from "./bookData";
import { Vector2, TextConfig, TextStyle, TextWeight } from "lib/pq-games";

const CONFIG = 
{
    debug:
    {
        noPDF: false, // @DEBUGGING (should be false)
        noImage: false, // @DEBUGGING (should be false)
        noCover: false, // @DEBUGGING (should be false)
        targets: [], // @DEBUGGING (should be empty)
    },

    pageSize: new Vector2(5.5, 8.5), // inches
    targets: TARGETS,
    bookData: BOOK_DATA,

    assetsBase: "/cover-generators/wildebyte-cover-generator/assets/",
    assets:
    {
        // FONTS
        karla:
        {
            path: "fonts/Karla-Regular.ttf"
        },

        karla_italic:
        {
            key: "karla",
            path: "fonts/Karla-Italic.ttf",
            textConfig: new TextConfig({ style: TextStyle.ITALIC })
        },

        karla_bold:
        {
            key: "karla",
            path: "fonts/Karla-ExtraBold.ttf",
            textConfig: new TextConfig({ weight: TextWeight.BOLD })
        },

        wildebyte:
        {
            path: "fonts/Wildebyte-Cover.ttf"
        },

        // SHARED
        electric_lines:
        {
            path: "shared/electric_lines.webp"
        },

        overlay_gradient:
        {
            path: "shared/overlay_gradient.webp"
        },

        // the thing that "frames" the full painting, e.g. the tablet for Handheld Disk
        framing_graphic:
        {
            path: "shared/framing_graphic.webp"
        },

        metadata:
        {
            path: "shared/metadata.webp"
        },
        
        wildebyte_badge:
        {
            path: "shared/wildebyte_badge.webp"
        },

        spine_background:
        {
            path: "shared/spine_background.webp"
        },

        wildebyte_logo_simplified:
        {
            path: "shared/wildebyte_logo_simplified.webp"
        },

        back_heading:
        {
            path: "shared/back_heading.webp"
        },

        choice_story:
        {
            path: "shared/choice_story.webp"
        },

        // UNIQUE (to the specific book/game)
        full_painting:
        {
            path: "book/full_size_painting.webp"
        },

        spine_icon:
        {
            path: "book/spine_icon.webp"
        }
    }
}

export default CONFIG;