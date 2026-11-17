import { describe, expect, test } from "bun:test";
import { joinDocument, readField, readListField, removeField, setField, setListField, splitDocument } from "../src/lib/frontmatter";

const sample = [
    "---",
    "type: \"project\"",
    "",
    "title: \"Test Game\"",
    "blurb: \"A test.\"",
    "date: 2025-01-02",
    "media: [assets/screenshots/a, assets/screenshots/b]",
    "---",
    "",
    "Body here.",
    "",
].join("\n");

describe("splitDocument", () =>
{
    test("round-trips a page byte for byte", () =>
    {
        const doc = splitDocument(sample);
        expect(doc.hasFrontmatter).toBe(true);
        expect(doc.body).toBe("\nBody here.\n");
        expect(joinDocument(doc, doc.frontmatter, doc.body)).toBe(sample);
    });

    test("keeps CRLF files CRLF", () =>
    {
        const text = "---\r\ntype: \"rules\"\r\n---\r\n\r\nText.\r\n";
        const doc = splitDocument(text);
        expect(doc.eol).toBe("\r\n");
        expect(joinDocument(doc, doc.frontmatter, doc.body)).toBe(text);
    });

    test("a file without frontmatter is returned untouched", () =>
    {
        const doc = splitDocument("# Title\n\nText\n");
        expect(doc.hasFrontmatter).toBe(false);
        expect(joinDocument(doc, doc.frontmatter, doc.body)).toBe("# Title\n\nText\n");
    });
});

describe("fields", () =>
{
    test("reads scalars and inline lists", () =>
    {
        const lines = splitDocument(sample).frontmatter.split("\n");
        expect(readField(lines, "title")).toBe("Test Game");
        expect(readField(lines, "draft")).toBeNull();
        expect(readListField(lines, "media")).toEqual(["assets/screenshots/a", "assets/screenshots/b"]);
    });

    test("reads block lists", () =>
    {
        const lines = ["type: project", "media:", "  - assets/screenshots/a", "  - assets/screenshots/b", "title: X"];
        expect(readListField(lines, "media")).toEqual(["assets/screenshots/a", "assets/screenshots/b"]);
    });

    test("appends to an inline list in the project's own style", () =>
    {
        const lines = splitDocument(sample).frontmatter.split("\n");
        const next = setListField(lines, "media", ["assets/screenshots/a", "assets/screenshots/b", "assets/screenshots/c"]);
        expect(next).toContain("media: [assets/screenshots/a, assets/screenshots/b, assets/screenshots/c]");
        expect(next.join("\n")).not.toContain("a, assets/screenshots/b, assets/screenshots/c]\n  - ");
    });

    test("appends to a block list without turning it into an inline one", () =>
    {
        const lines = ["type: project", "media:", "  - assets/screenshots/a"];
        const next = setListField(lines, "media", ["assets/screenshots/a", "assets/screenshots/b"]);
        expect(next).toEqual(["type: project", "media:", "  - assets/screenshots/a", "  - assets/screenshots/b"]);
    });

    test("adds a missing field at the end", () =>
    {
        const next = setListField(["type: project"], "media", ["assets/screenshots/a"]);
        expect(next).toEqual(["type: project", "media: [assets/screenshots/a]"]);
    });

    test("sets and removes a scalar without touching its neighbours", () =>
    {
        const lines = ["type: project", "date: 2020-01-01", "draft: true", "title: X"];
        const dated = setField(lines, "date", "2026-11-17");
        expect(dated).toEqual(["type: project", "date: 2026-11-17", "draft: true", "title: X"]);
        expect(removeField(dated, "draft")).toEqual(["type: project", "date: 2026-11-17", "title: X"]);
    });
});
