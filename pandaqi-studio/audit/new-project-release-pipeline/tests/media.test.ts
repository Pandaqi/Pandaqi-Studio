import { describe, expect, test } from "bun:test";
import { mkdirSync, mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { collectCandidates, planMedia, planReplacement, rulebookScreenshot, type MediaCandidate } from "../src/stages/media";

const candidates = (count:number, pdfs = 1) : MediaCandidate[] =>
{
    const out:MediaCandidate[] = [];
    for(let pdf = 0; pdf < pdfs; pdf++)
    {
        for(let page = 1; page <= count / pdfs; page++)
        {
            out.push({ src: `/renders/game/pdf-${pdf}/page-${String(page).padStart(3, "0")}.jpg`, pdf: `pdf-${pdf}`, page });
        }
    }
    return out;
};

describe("collectCandidates", () =>
{
    test("a collection does not take its games' material", () =>
    {
        const root = mkdtempSync(join(tmpdir(), "pq-release-renders-"));
        const write = (rel:string) =>
        {
            mkdirSync(join(root, rel, ".."), { recursive: true });
            writeFileSync(join(root, rel), "jpg", "utf8");
        };
        write("game/naivigation/deck/page-001.jpg");
        write("visit/crashing-cars/game/deck/page-001.jpg");

        const found = collectCandidates(root, ["visit/crashing-cars"]);
        expect(found.map(candidate => candidate.pdf)).toEqual(["game/naivigation/deck"]);
    });
});

describe("planMedia", () =>
{
    test("a new project gets four screenshots spread over its materials", () =>
    {
        const plan = planMedia(0, 4, false, candidates(12, 3));
        expect(plan.needed).toBe(4);
        expect(plan.chosen.length).toBe(4);
        expect(new Set(plan.chosen.map(item => item.src)).size).toBe(4);
        expect(new Set(plan.chosen.map(item => item.pdf)).size).toBe(3);
    });

    test("a gallery with two images gains exactly two", () =>
    {
        const plan = planMedia(2, 4, false, candidates(8, 2));
        expect(plan.needed).toBe(2);
        expect(plan.chosen.length).toBe(2);
    });

    test("a full gallery is left alone", () =>
    {
        const plan = planMedia(5, 4, false, candidates(9));
        expect(plan.needed).toBe(0);
        expect(plan.chosen).toEqual([]);
    });

    test("--force-media adds four even to a full gallery", () =>
    {
        const plan = planMedia(5, 4, true, candidates(8, 2));
        expect(plan.chosen.length).toBe(4);
    });

    test("a target below the floor is raised to four", () =>
    {
        expect(planMedia(0, 2, false, candidates(9)).chosen.length).toBe(4);
    });

    test("never invents pages the generator did not produce", () =>
    {
        const plan = planMedia(0, 4, false, candidates(2));
        expect(plan.chosen.length).toBe(2);
    });

    test("an empty candidate list plans nothing", () =>
    {
        const plan = planMedia(0, 4, false, []);
        expect(plan.chosen).toEqual([]);
        expect(plan.needed).toBe(0);
    });

    test("picks pages from different PDFs when several exist", () =>
    {
        const plan = planMedia(0, 4, false, candidates(12, 4));
        expect(new Set(plan.chosen.map(item => item.pdf)).size).toBe(4);
    });

    test("honours a higher --min-media", () =>
    {
        const plan = planMedia(0, 6, false, candidates(12));
        expect(plan.chosen.length).toBe(6);
    });

    test("takes pages further down the file, not the cover", () =>
    {
        const plan = planMedia(0, 4, false, candidates(6));
        expect(plan.chosen.map(item => item.page)).not.toContain(1);
    });

    test("keeps the cover when that is all there is to fill the gallery", () =>
    {
        const plan = planMedia(0, 4, false, candidates(4, 2));
        expect(plan.chosen.length).toBe(4);
    });

    test("a different random source can take different pages", () =>
    {
        const low = planMedia(0, 4, false, candidates(8), () => 0);
        const high = planMedia(0, 4, false, candidates(8), () => 0.999);
        expect(low.chosen.map(item => item.src)).not.toEqual(high.chosen.map(item => item.src));
    });
});

const galleryProject = () =>
{
    const dir = mkdtempSync(join(tmpdir(), "pq-release-replace-"));
    mkdirSync(join(dir, "assets", "screenshots"), { recursive: true });
    writeFileSync(join(dir, "assets", "screenshots", "game-page-001.webp"), "webp", "utf8");
    writeFileSync(join(dir, "assets", "screenshots", "game-page-002.webp"), "webp", "utf8");
    writeFileSync(join(dir, "assets", "cover.webp"), "webp", "utf8");
    return dir;
};

describe("planReplacement", () =>
{
    test("drops the gallery's screenshots and finds the files to delete", () =>
    {
        const dir = galleryProject();
        const plan = planReplacement(["assets/screenshots/game-page-001", "assets/screenshots/game-page-002"], dir);

        expect(plan.drop).toEqual(["assets/screenshots/game-page-001", "assets/screenshots/game-page-002"]);
        expect(plan.keep).toEqual([]);
        expect(plan.files.length).toBe(2);
    });

    test("keeps a video, an external link and an image outside the gallery", () =>
    {
        const dir = galleryProject();
        const media = ["assets/screenshots/game-page-001", "https://youtu.be/abc", "assets/cover", "assets/screenshots/game-page-002"];
        const plan = planReplacement(media, dir);

        expect(plan.keep).toEqual(["https://youtu.be/abc", "assets/cover"]);
        expect(plan.drop).toEqual(["assets/screenshots/game-page-001", "assets/screenshots/game-page-002"]);
    });

    test("drops an entry whose file is already gone instead of inventing a path", () =>
    {
        const dir = galleryProject();
        const plan = planReplacement(["assets/screenshots/game-page-009"], dir);

        expect(plan.drop).toEqual(["assets/screenshots/game-page-009"]);
        expect(plan.files).toEqual([]);
    });
});

describe("rulebookScreenshot", () =>
{
    test("takes the rulebook's page screenshot, never the generator's", () =>
    {
        const dir = mkdtempSync(join(tmpdir(), "pq-release-shot-"));
        const rulebook = join(dir, "game-rules", "default", "page.png");
        const generator = join(dir, "game", "default", "page.png");
        mkdirSync(join(dir, "game-rules", "default"), { recursive: true });
        mkdirSync(join(dir, "game", "default"), { recursive: true });
        writeFileSync(rulebook, "png", "utf8");
        writeFileSync(generator, "png", "utf8");

        expect(rulebookScreenshot([
            { contract: "generator", artifacts: [generator] },
            { contract: "rulebook", artifacts: [rulebook] },
        ])).toBe(rulebook);
    });

    test("nothing when no rulebook page was captured", () =>
    {
        expect(rulebookScreenshot([{ contract: "generator", artifacts: ["/nowhere/page.png"] }])).toBeNull();
        expect(rulebookScreenshot([])).toBeNull();
    });
});
