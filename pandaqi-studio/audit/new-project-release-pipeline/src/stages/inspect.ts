import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { contentDir as studioContentDir, gamesDir, projectName } from "../config";
import { readField, readListField, splitDocument } from "../lib/frontmatter";
import { relPosix, walk } from "../lib/files";

export interface ProjectFile
{
    abs: string;
    rel: string;
    scope: "rulebook" | "page";
}

export interface ProjectInfo
{
    slug: string;
    projectPath: string;
    dir: string;
    indexMd: string;
    url: string;
    title: string;
    blurb: string;
    date: string | null;
    draft: boolean;
    media: string[];
    existingImages: number;
    rulebookFiles: ProjectFile[];
    pageFiles: ProjectFile[];
    // nested projects (`chiptales/bet/noble-flood` inside `chiptales`): their own release
    childProjects: string[];
    codeFiles: string[];
    generatorEvidence: string | null;
    assetsDir: string;
    screenshotsDir: string;
    problems: string[];
    warnings: string[];
}

const isImageEntry = (entry:string) => !/^https?:|youtube\.com|youtu\.be|\.mp4$|\.webm$/i.test(entry);

const RULES_TYPE = /^\s*type\s*:\s*["']?rules["']?\s*$/m;

// The project's own files, plus the folders that are projects of their own.
//
// A folder with its own `_index.md` is a page of its own: `naivigation/swing-by` is a game, not a
// section of `naivigation`. Every scan stops at such a folder, so releasing a collection page never
// rewrites a game that lives inside it. The rulebook's own `rules/` folder has an `_index.md` too,
// with `type: rules`, and that one belongs to this project.
const collectProjectFiles = (dir:string) =>
{
    const files:string[] = [];
    const children:string[] = [];
    const visit = (current:string) =>
    {
        for(const item of readdirSync(current, { withFileTypes: true }))
        {
            const path = join(current, item.name);
            if(!item.isDirectory()) { files.push(path); continue; }
            const index = join(path, "_index.md");
            if(existsSync(index) && !RULES_TYPE.test(readFileSync(index, "utf8").slice(0, 400))) { children.push(path); continue; }
            visit(path);
        }
    };
    visit(dir);
    return { files, children };
};

export const inspectProject = (projectArg:string, opts:{ contentDir?:string } = {}) : ProjectInfo =>
{
    const projectPath = projectArg.replace(/^\/+|\/+$/g, "").split("\\").join("/");
    const slug = projectName(projectPath);
    const root = opts.contentDir ?? studioContentDir;
    const dir = join(root, projectPath);
    const indexMd = join(dir, "_index.md");
    const url = `/${projectPath}/`;

    const problems:string[] = [];
    const warnings:string[] = [];
    const rulebookFiles:ProjectFile[] = [];
    const pageFiles:ProjectFile[] = [];
    let childDirs:string[] = [];

    if(!existsSync(dir) || !statSync(dir).isDirectory())
    {
        problems.push(`content/${projectPath} does not exist`);
    }
    else
    {
        const collected = collectProjectFiles(dir);
        childDirs = collected.children;
        for(const file of collected.files)
        {
            if(!file.endsWith(".md")) { continue; }
            const rel = relPosix(dir, file);
            const body = readFileSync(file, "utf8");
            const isRulebook = /(^|\/)rules\//.test(rel) || RULES_TYPE.test(body.slice(0, 400));
            if(isRulebook) { rulebookFiles.push({ abs: file, rel, scope: "rulebook" }); continue; }
            if(/(^|\/)_?index\.md$/.test(rel)) { pageFiles.push({ abs: file, rel, scope: "page" }); }
        }
        if(!existsSync(indexMd))
        {
            problems.push(`content/${projectPath}/_index.md is missing; a project needs that page to exist at all`);
        }
    }

    rulebookFiles.sort((a, b) => a.rel.localeCompare(b.rel));
    pageFiles.sort((a, b) => a.rel.localeCompare(b.rel));
    const childProjects = childDirs.map(child => `${projectPath}/${relPosix(dir, child)}`).sort();

    const text = existsSync(indexMd) ? readFileSync(indexMd, "utf8") : "";
    const doc = splitDocument(text);
    if(existsSync(indexMd) && !doc.hasFrontmatter)
    {
        problems.push(`content/${projectPath}/_index.md has no YAML front matter, so it cannot be edited safely`);
    }
    const lines = doc.frontmatter.length > 0 ? doc.frontmatter.split(doc.eol) : [];

    const title = readField(lines, "title") ?? slug;
    const blurb = readField(lines, "blurb") ?? "";
    const date = readField(lines, "date");
    const draft = (readField(lines, "draft") ?? "").toLowerCase() === "true";
    const media = readListField(lines, "media");

    if(rulebookFiles.length === 0)
    {
        warnings.push(
            `NO_RULEBOOK: no rulebook was detected for this project. Looked for markdown under ` +
            `content/${projectPath}/rules/ and for files with \`type: rules\`. The text review only covers ` +
            `the page copy; rulebook review, rulebook audit and rulebook screenshots are skipped.`,
        );
    }

    // --- game code --------------------------------------------------------------
    const codePaths = Array.from(new Set([projectPath, slug]));
    const childRoots = childProjects.map(child => `${child}/`);
    const codeRoot = codePaths.map(path => join(gamesDir, path)).find(path => existsSync(path)) ?? null;
    const codeFiles = codeRoot
        ? walk(codeRoot, path => /\.(ts|js)$/.test(path))
            .filter(path => !childRoots.some(child => relPosix(gamesDir, path).startsWith(child)))
        : [];

    let generatorEvidence:string | null = null;
    for(const file of codeFiles)
    {
        if(/\bloadGame\s*\(|\bgenerateMaterial\s*\(/.test(readFileSync(file, "utf8")))
        {
            generatorEvidence = relPosix(gamesDir, file);
            break;
        }
    }

    if(!generatorEvidence)
    {
        warnings.push(
            `NO_GENERATOR: no material generator was detected for this project. Looked through ` +
            `${codePaths.map(path => `assets/games/${path}/`).join(" or ")} for a call to loadGame( or generateMaterial(. ` +
            `The generator audit and the automatic marketing screenshots are skipped` +
            (codeFiles.length > 0 ? ` (${codeFiles.length} code file(s) inspected).` : " (no game code found at all)."),
        );
    }

    const assetsDir = join(dir, "assets");

    return {
        slug,
        projectPath,
        dir,
        indexMd,
        url,
        title,
        blurb,
        date,
        draft,
        media,
        existingImages: media.filter(isImageEntry).length,
        rulebookFiles,
        pageFiles,
        childProjects,
        codeFiles,
        generatorEvidence,
        assetsDir,
        screenshotsDir: join(assetsDir, "screenshots"),
        problems,
        warnings,
    };
};

export const projectSummary = (info:ProjectInfo) =>
{
    const parts = [
        `${info.projectPath}`,
        `rulebook: ${info.rulebookFiles.length > 0 ? info.rulebookFiles.map(file => file.rel).join(", ") : "none"}`,
        `generator: ${info.generatorEvidence ?? "none"}`,
        `media: ${info.existingImages} image(s)`,
        `date: ${info.date ?? "missing"}`,
    ];
    if(info.childProjects.length > 0) { parts.push(`${info.childProjects.length} nested project(s), released separately`); }
    if(info.draft) { parts.push("draft: true"); }
    return parts.join(" · ");
};
