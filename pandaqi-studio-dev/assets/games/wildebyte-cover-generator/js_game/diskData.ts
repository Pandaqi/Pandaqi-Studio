
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
            alternateFlipHeadings: true,
            sections: [
                { title: "New Game", text: "" },
                { title: "Author", text: "" },
                { title: "Restart", text: "" }
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
            fontSize: 73.47
        },

        electricityLines:
        {
            composite: "soft-light",
            alpha: 0.35
        },

        badge:
        {
            yPos: 0.834, // ~sizeY
            smallFontSize: 12,
            bigFontSize: 24.1,
            smallTextColor: "#FFFFFF",
            bigTextColor: "#FFFFFF",
            composite: "overlay",
            smallTextOffsetY: -0.4, // ~badgeSizeY, anchor from center
            bigTextOffsetY: 0.275, // ~badgeSizeY, anchor from center
            choiceStoryOffsetY: 0.35, // ~badgeSizeY, anchor from center
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
            titleFontSize: 29.7,
            authorFontSize: 21.6,
            textColor: "#FDDDFF",
            strokeColor: "#000000",
            strokeWidth: 12,
            iconEdgeOffset: 0.107, // ~sizeY
        }
    }
}

export default DISKS