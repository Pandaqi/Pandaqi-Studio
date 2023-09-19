export default class FontLoader {
    constructor() {}
    async load()
    {
        // @TODO: dangerous relative links, but works for now
        const fontURL1 = "assets/fonts/Rowdies-Regular.woff2";
        const fontFile1 = new FontFace("Rowdies", "url(" + fontURL1 + ")");

        const fontURL2 = "assets/fonts/YanoneKaffeesatz-Regular.woff2";
        const fontFile2 = new FontFace("Yanone Kaffeesatz", "url(" + fontURL2 + ")");
        
        // @ts-ignore
        document.fonts.add(fontFile1);
        // @ts-ignore
        document.fonts.add(fontFile2);

        await fontFile1.load();
        await fontFile2.load();
    }
}