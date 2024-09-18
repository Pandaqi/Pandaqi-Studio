import Point from "js/pq_games/tools/geometry/point"

const DISKS =
{
    handheld:
    {
        fonts:
        {
            heading: "wildebyte",
            body: "karla",
        },

        texts:
        {
            author: "Tiamo Pastoor is a Dutch/English writer with a background in game design. With the Wildebyte Arcades, he aims to tell amazing adventures within the world of video games, while secretly teaching you how they work behind the scenes. Well, not so secret now that he told you.",
            restart: "Want more? Check out other Wildebyte books. You can read them in any order, if you want. Each book tells a standalone adventure in a different game. The novel you're holding right now is book %num% in release order."
        },

        back:
        {
            sectionStartY: 0.1117,
            sectionJumpY: 0.2313,
            textColor: "#FFFFFF",
            textStrokeColor: "#000000",
            textStrokeWidth: 2,
            alternateFlipHeadings: true,
            headingFontSize: 72,
            contentFontSize: 48,
            textBoxDims: new Point(0.775, 0.5),
            sections: [
                { title: "NEW GAME", text: "" },
                { title: "AUTHOR", text: "" },
                { title: "RESTART", text: "" }
            ],
        },

        bg:
        {
            paintingAlpha: 0.2,
            color: "#2E0132"
        },

        titleText:
        {
            posY: 0.1431,
            fontSize: 225,
            lineHeight: 1.0,
            lineHeightLowerCase: 0.8,
            textColor: "#000000",
            textColorOverlay: "#2B2B2B",
            strokeWidth: 12,
            strokeColor: "#FFFFFF",
            glowRadius: 36,
            gradientColors: ["#6E2D7E", "#000000"],
            offsetY:
            {
                overlay: 55,
                shadow: 30,
                front: 0
            }
        },

        electricityLines:
        {
            composite: "soft-light",
            alpha: 0.35
        },

        metadata:
        {
            yPos: 0.826, // ~sizeY
        },

        badge:
        {
            yPos: 0.834, // ~sizeY
            smallFontSize: 32,
            bigFontSize: 72,
            smallTextColor: "#FFFFFF",
            bigTextColor: "#FFFFFF",
            composite: "overlay",
            smallTextOffsetY: -0.35, // ~badgeSizeY, anchor from center
            bigTextOffsetY: 0.225, // ~badgeSizeY, anchor from center
            choiceStoryOffsetY: 0.366, // ~badgeSizeY, anchor from center
        },

        framing:
        {
            yPos: 0.419, // ~sizeY
            fullPaintingScaleFactor: 0.95, // how much the full painting scales down behind the framing graphic
        },

        overlayGradient:
        {
            alpha: 1.0
        },

        spine:
        {
            titleFontSize: 84,
            authorFontSize: 64,
            textColor: "#FDDDFF",
            iconSize: new Point(96, 96),
            strokeColor: "#000000",
            strokeWidth: 8,
            authorAlpha: 1.0,
            iconEdgeOffset: 0.107, // ~sizeY
            glowRadius: 12,
        }
    }
}

export default DISKS