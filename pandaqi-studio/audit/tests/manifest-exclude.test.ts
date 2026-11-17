import { describe, expect, test } from "bun:test";
import { mkdirSync, mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { buildManifest } from "../src/manifest";

// content/
//   collection/_index.md                          the collection page, built
//   collection/rules/_index.md                    its rulebook, built
//   collection/visit/crashing-cars/_index.md      a game of its own, NOT built by this segment
const makeProject = () =>
{
    const root = mkdtempSync(join(tmpdir(), "pq-manifest-"));
    const studioDir = join(root, "studio");
    const siteDir = join(root, "site");
    const write = (path:string, text:string) =>
    {
        mkdirSync(join(path, ".."), { recursive: true });
        writeFileSync(path, text, "utf8");
    };

    write(join(studioDir, "content", "collection", "_index.md"), "---\ntype: \"board\"\ntitle: \"Collection\"\n---\n");
    write(join(studioDir, "content", "collection", "rules", "_index.md"), "---\ntype: \"rules\"\n---\n");
    write(join(studioDir, "content", "collection", "visit", "crashing-cars", "_index.md"), "---\ntype: \"board\"\ntitle: \"Crashing Cars\"\n---\n");

    write(join(siteDir, "collection", "index.html"), "<html><body></body></html>");
    write(join(siteDir, "collection", "rules", "index.html"), "<html><body></body></html>");
    return { studioDir, siteDir };
};

describe("manifest excludes", () =>
{
    test("a nested game that this segment did not build is not queued or reported", () =>
    {
        const { studioDir, siteDir } = makeProject();
        const entries = buildManifest({
            studioDir, siteDir,
            filter: "collection/",
            filterExclude: ["collection/visit/crashing-cars"],
        });

        expect(entries.map(entry => entry.url)).toEqual(["/collection/", "/collection/rules/"]);
        expect(entries.some(entry => entry.missing)).toBe(false);
    });

    test("without the exclude the same page is reported as missing", () =>
    {
        const { studioDir, siteDir } = makeProject();
        const entries = buildManifest({ studioDir, siteDir, filter: "collection/" });

        expect(entries.map(entry => `${entry.url} ${entry.missing}`)).toEqual([
            "/collection/ false",
            "/collection/rules/ false",
            "/collection/visit/crashing-cars/ true",
        ]);
    });
});
