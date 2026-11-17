import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { basename, join } from "node:path";
import { joinDocument, readListField, setListField, splitDocument } from "../lib/frontmatter";
import { relPosix, walk } from "../lib/files";
import { convertToWebp, type ConversionResult } from "../lib/webp";
import type { ProjectInfo } from "./inspect";
import type { AuditStageResult } from "./audit";

// Marketing material, end to end:
//   the generator already ran in the audit stage and its PDFs were saved;
//   --render captured pages spread across each PDF as JPEG previews;
//   those previews become small WebP files inside the project's own page bundle;
//   the `media` list in _index.md gains their page-relative paths.
//
// Re-running is safe: the audit stage clears this project's renders, so only previews from this run
// are used, and existing screenshots and media entries are never overwritten. A published project
// with two screenshots simply gains the ones it was missing.

export interface MediaCandidate
{
    src: string;
    pdf: string;
    page: number;
}

export interface MediaStageResult
{
    status: "pass" | "warn" | "fail" | "skipped";
    detail: string;
    files: ConversionResult[];
    added: string[];
    notes: string[];
}

// Files named `.../page-003.jpg` are the third page of that PDF.
//
// `exclude` holds project-relative folders that are projects of their own: a collection's render
// folder also contains every game inside it, and those materials are not the collection's gallery.
export const collectCandidates = (renderRoot:string, exclude:string[] = []) : MediaCandidate[] =>
{
    const out:MediaCandidate[] = [];
    for(const file of walk(renderRoot, path => /\.jpe?g$/i.test(path)))
    {
        const relative = relPosix(renderRoot, file);
        if(exclude.some(prefix => relative === prefix || relative.startsWith(`${prefix}/`))) { continue; }
        const match = basename(file).match(/page-(\d+)/i);
        if(!match) { continue; }
        out.push({
            src: file,
            pdf: relative.includes("/") ? relative.slice(0, relative.lastIndexOf("/")) : "document",
            page: Number(match[1]),
        });
    }
    return out.sort((a, b) => a.pdf === b.pdf ? a.page - b.page : a.pdf.localeCompare(b.pdf));
};

// Four pages read as a gallery; three read as an accident. `--min-media` can raise this, never lower it.
export const GALLERY_MINIMUM = 4;

// A PDF's opening page is a cover or a title, and four near-identical openings are not a gallery, so
// the pages further down each file are preferred. Never at the cost of the gallery: a two-page PDF
// still offers what it has.
const deeperPages = (candidates:MediaCandidate[], count:number) =>
{
    const firstOf = new Map<string, number>();
    for(const candidate of candidates)
    {
        const first = firstOf.get(candidate.pdf);
        if(first === undefined || candidate.page < first) { firstOf.set(candidate.pdf, candidate.page); }
    }
    const deeper = candidates.filter(candidate => candidate.page !== firstOf.get(candidate.pdf));
    return deeper.length >= count ? deeper : candidates;
};

const shuffled = <T,>(items:T[], random:() => number) : T[] =>
{
    const out = [...items];
    for(let i = out.length - 1; i > 0; i--)
    {
        const j = Math.floor(random() * (i + 1));
        const swap = out[i];
        out[i] = out[j];
        out[j] = swap;
    }
    return out;
};

// How many images the gallery still needs, and which page previews to use. Pure (the random source is
// a parameter), so it is testable without a browser or a PDF.
//
// Which pages get picked is free within the deeper pages of every file, so two releases of the same
// game do not ship the same screenshots; the materials take turns, so no single PDF fills the gallery.
export const planMedia = (
    existing:number,
    minMedia:number,
    force:boolean,
    candidates:MediaCandidate[],
    random:() => number = Math.random,
) =>
{
    const target = Math.max(GALLERY_MINIMUM, minMedia);
    const needed = force ? target : Math.max(0, target - existing);
    if(needed <= 0 || candidates.length === 0) { return { target, needed: 0, chosen: [] as MediaCandidate[] }; }

    const count = Math.min(needed, candidates.length);
    const remaining = new Map<string, MediaCandidate[]>();
    for(const candidate of deeperPages(candidates, count))
    {
        const list = remaining.get(candidate.pdf);
        if(list) { list.push(candidate); } else { remaining.set(candidate.pdf, [candidate]); }
    }

    const chosen:MediaCandidate[] = [];
    const pdfs = shuffled([...remaining.keys()], random);
    while(chosen.length < count)
    {
        let took = false;
        for(const pdf of pdfs)
        {
            if(chosen.length >= count) { break; }
            const list = remaining.get(pdf) as MediaCandidate[];
            if(list.length === 0) { continue; }
            chosen.push(list.splice(Math.floor(random() * list.length), 1)[0]);
            took = true;
        }
        if(!took) { break; }
    }
    return { target, needed: count, chosen };
};

const nextFreeIndex = (dir:string, slug:string) =>
{
    let highest = 0;
    if(existsSync(dir))
    {
        for(const file of readdirSync(dir))
        {
            const match = file.match(new RegExp(`^${slug}-page-(\\d+)\\.webp$`, "i"));
            if(match) { highest = Math.max(highest, Number(match[1])); }
        }
    }
    return highest + 1;
};

export const runMediaStage = async (
    info:ProjectInfo,
    audit:AuditStageResult | null,
    opts:{ dryRun:boolean, minMedia:number, forceMedia:boolean },
) : Promise<MediaStageResult> =>
{
    const notes:string[] = [];
    const target = Math.max(GALLERY_MINIMUM, opts.minMedia);
    const generators = (audit?.entries ?? []).filter(entry => entry.contract === "generator");

    if(!audit || generators.length === 0)
    {
        const detail = info.generatorEvidence
            ? "no generator page was audited, so there is no material to screenshot"
            : "no material generator was detected for this project, so there is nothing to screenshot";
        if(info.existingImages < target) { notes.push(`the gallery has ${info.existingImages} image(s) and cannot be topped up automatically: ${detail}`); }
        return { status: "warn", detail, files: [], added: [], notes };
    }

    const children = info.childProjects.map(child => child.slice(info.projectPath.length + 1));
    const candidates = collectCandidates(audit.rendersDir, children);
    if(candidates.length === 0)
    {
        return {
            status: "warn",
            detail: "the generator ran, but no PDF page previews were captured (--render produced nothing)",
            files: [], added: [], notes,
        };
    }

    const plan = planMedia(info.existingImages, target, opts.forceMedia, candidates);
    if(plan.chosen.length === 0)
    {
        return { status: "pass", detail: `gallery already has ${info.existingImages} image(s) (target ${plan.target})`, files: [], added: [], notes };
    }
    if(plan.chosen.length < plan.needed)
    {
        notes.push(`the gallery wants ${plan.needed} more image(s), but this material only produced ${plan.chosen.length} usable page preview(s)`);
    }

    const first = nextFreeIndex(info.screenshotsDir, info.slug);
    const jobs = plan.chosen.map((candidate, index) => ({
        src: candidate.src,
        dest: join(info.screenshotsDir, `${info.slug}-page-${String(first + index).padStart(3, "0")}.webp`),
    }));

    if(opts.dryRun)
    {
        return {
            status: "pass",
            detail: `would add ${jobs.length} screenshot(s) to the gallery`,
            files: [],
            added: jobs.map(job => relPosix(info.dir, job.dest)),
            notes,
        };
    }

    mkdirSync(info.screenshotsDir, { recursive: true });
    const converted = await convertToWebp(jobs, { maxWidth: 1100, quality: 0.72 });

    // Anything still heavy after that pass gets a second, cheaper one: a gallery image should be a
    // few dozen kilobytes, not a print-resolution page.
    const sourceOf = new Map(jobs.map(job => [job.dest, job.src]));
    const heavy = converted.filter(item => item.bytes > 200_000);
    if(heavy.length > 0)
    {
        const retried = await convertToWebp(heavy.map(item => ({ src: sourceOf.get(item.dest) as string, dest: item.dest })), { maxWidth: 900, quality: 0.55 });
        for(const item of retried)
        {
            const index = converted.findIndex(existing => existing.dest === item.dest);
            if(index >= 0) { converted[index] = item; }
        }
    }

    const bases = converted.map(item => `assets/screenshots/${basename(item.dest).replace(/\.webp$/i, "")}`);

    const text = readFileSync(info.indexMd, "utf8");
    const doc = splitDocument(text);
    const lines = doc.frontmatter.split(doc.eol);
    const merged = [...readListField(lines, "media")];
    for(const base of bases) { if(!merged.includes(base)) { merged.push(base); } }
    writeFileSync(info.indexMd, joinDocument(doc, setListField(lines, "media", merged).join(doc.eol), doc.body), "utf8");

    const sizeText = converted.map(item => `${(item.bytes / 1024).toFixed(0)} KB`).join(", ");
    return {
        status: "pass",
        detail: `added ${converted.length} screenshot(s) (${sizeText}) and linked them in the media gallery`,
        files: converted,
        added: bases,
        notes,
    };
};
