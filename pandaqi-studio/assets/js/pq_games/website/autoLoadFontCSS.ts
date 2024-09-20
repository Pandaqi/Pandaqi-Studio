import LocalStorage from "./localStorage";

export default async (cfg) =>
{
    const data = new LocalStorage();
    if(data.get("simpleMode")) { return; }

    const fontNames = Object.values(cfg.fonts);
    const bodyFont = cfg.fonts.body ?? cfg.fonts.heading;
    const headerFont = cfg.fonts.heading ?? cfg.fonts.body;
    const specialFont = cfg.fonts.special;
    for(const [key,data] of Object.entries(cfg.assets))
    {
        const keyFinal = data.key ?? key;
        const isFont = fontNames.includes(keyFinal);
        if(!isFont) { continue; }

        const pathFinal = (cfg.assetsBase ?? "/") + data.path;
        const textConfigData = data.textConfig ? data.textConfig.getFontFaceDescriptors() : {};
        const myFont = new FontFace(keyFinal, "url(" + pathFinal + ")", textConfigData);

        try {
            await myFont.load();
            document.fonts.add(myFont);
        } catch (e) {
            console.error("Could not load font: ", keyFinal);
        }     
    }

    document.body.style.setProperty("--body-font", bodyFont);
    document.body.style.setProperty("--header-font", headerFont);
    if(specialFont)
    {
        document.body.style.setProperty("--special-font", specialFont);
    }
}