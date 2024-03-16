import TextConfig, { TextStyle, TextWeight } from "js/pq_games/layout/text/textConfig";

const ASSETS =
{
    // FONTS
    wildebyte_font:
    {
        key: "wildebyte",
        path: "fonts/Wildebyte-Cover.ttf"
    },

    karla_font:
    {
        key: "karla",
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

    // SHARED
    electric_lines:
    {
        path: "shared/electric_lines.webp"
    },

    // the thing that "frames" the full painting, e.g. the tablet for Handheld Disk
    framing_graphic:
    {
        path: "shared/frame_graphic.webp"
    },

    overlay_gradient:
    {
        path: "shared/overlay_gradient.webp"
    },

    choice_story:
    {
        path: "shared/choice_story.webp"
    },

    metadata:
    {
        path: "shared/metadata.webp"
    },
    
    spine_background:
    {
        path: "shared/spine_background.webp"
    },

    wildebyte_badge:
    {
        path: "shared/wildebyte_badge.webp"
    },

    wildebyte_logo_simplified:
    {
        path: "shared/wildebyte_logo_simplified.webp"
    },

    back_heading:
    {
        path: "shared/back_heading.webp"
    },

    // UNIQUE (to the specific book/game)
    full_painting:
    {
        path: "book/full_painting.webp"
    },

    spine_icon:
    {
        path: "book/spine_icon.webp"
    }
}

export default async (resLoader) =>
{
    resLoader.planLoadMultiple(ASSETS)
    await resLoader.loadPlannedResources();
}