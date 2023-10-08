import TextConfig from "../layout/text/textConfig";

export default (textConfig:TextConfig) =>
{
    return {
        fontSize: textConfig.size + "px",
        fontFamily: textConfig.font,
        fontStyle: textConfig.getStyleString(),
        align: textConfig.getAlignString(),
        lineSpacing: textConfig.size * textConfig.lineHeight,
        wordWrap: {},
        color: "#FFFFFF",
        stroke: "#000000",
        strokeThickness: 0
    }
}