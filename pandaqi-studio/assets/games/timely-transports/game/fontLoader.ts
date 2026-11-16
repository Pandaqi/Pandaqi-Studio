import { CONFIG } from "../shared/config";

export default class FontLoader 
{
    constructor() {}
    async load()
    {
        const fontURL1 = CONFIG._resources.base + "fonts/Rowdies-Regular.woff2";
        const fontFile1 = new FontFace("rowdies", "url(" + fontURL1 + ")");

        const fontURL2 = CONFIG._resources.base + "fonts/YanoneKaffeesatz-Regular.woff2";
        const fontFile2 = new FontFace("yanone", "url(" + fontURL2 + ")");
        
        // @ts-ignore
        document.fonts.add(fontFile1);
        // @ts-ignore
        document.fonts.add(fontFile2);

        await fontFile1.load();
        await fontFile2.load();
    }
}