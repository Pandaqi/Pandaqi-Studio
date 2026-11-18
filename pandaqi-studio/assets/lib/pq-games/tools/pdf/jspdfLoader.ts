/* jsPDF is ~350 KB minified and is only needed at the very end of a generation, when the PDF is built.
   It used to be imported statically by PdfBuilder, so every generator page downloaded and parsed it on
   load. Now it is fetched the first time a PDF is actually created.

   The vendored file is a UMD bundle. Imported as an ES module it finds neither `exports` nor `define`,
   so it assigns itself to `globalThis.jspdf` — hence a side-effect import plus reading that global. */

const DEFAULT_JSPDF_URL = "/lib/pq-games/tools/pdf/jspdf.js";

// A native dynamic import, kept out of the bundler's reach: the page bundle is an IIFE and must not try
// to inline a module it cannot see at build time.
const importModule = new Function("url", "return import(url)") as (url:string) => Promise<any>;

let loadPromise:Promise<any> = null;
let configuredUrl = DEFAULT_JSPDF_URL;

// Lets a host serve the file from somewhere else (the benchmark harness does). Must be called before the
// first load.
export const setJsPdfUrl = (url:string) => { configuredUrl = url; loadPromise = null; }

export const loadJsPdf = async () : Promise<any> =>
{
    // a host that already loaded it (a test harness, or a page that includes the UMD script itself)
    const existing = (globalThis as any).jspdf?.jsPDF;
    if(existing) { return existing; }

    if(!loadPromise)
    {
        loadPromise = importModule(configuredUrl).then(() => {
            const lib = (globalThis as any).jspdf?.jsPDF;
            if(!lib) { throw new Error(`[jspdfLoader] ${configuredUrl} did not expose jsPDF.`); }
            return lib;
        }).catch((error) => {
            loadPromise = null; // a failed fetch can be a fluke: allow the next PDF to retry
            throw error;
        });
    }

    return await loadPromise;
}
