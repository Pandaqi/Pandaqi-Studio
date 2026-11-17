import { describe, expect, test } from "bun:test";
import { marketingNotes, mechanicalFixes } from "../src/lib/text-rules";

describe("safe fixes", () =>
{
    test("removes a doubled word", () =>
    {
        const result = mechanicalFixes("The game ends when when the deck is empty.", "rules/_index.md", "rulebook");
        expect(result.text).toBe("The game ends when the deck is empty.");
        expect(result.fixes.map(fix => fix.code)).toContain("DOUBLED_WORD");
    });

    test("leaves a legitimate double alone", () =>
    {
        const result = mechanicalFixes("Each player that that owns a tile scores it.", "rules/_index.md", "rulebook");
        expect(result.text).toBe("Each player that that owns a tile scores it.");
    });

    test("fixes spacing around punctuation but not inside numbers or times", () =>
    {
        const result = mechanicalFixes("Score 1.5 points ,then take 2 cards at 10:30.", "x.md", "rulebook");
        expect(result.text).toBe("Score 1.5 points, then take 2 cards at 10:30.");
    });

    test("never touches fenced code", () =>
    {
        const body = "Text.\n\n```ts\nconst  x = 1 ;\n```\n";
        const result = mechanicalFixes(body, "x.md", "rulebook");
        expect(result.text).toBe(body);
    });

    test("works on files with CRLF line endings", () =>
    {
        const result = mechanicalFixes("Line one .\r\nLine two\r\n", "x.md", "page");
        expect(result.text).toBe("Line one.\r\nLine two\r\n");
    });

    test("reports trailing whitespace instead of rewriting it", () =>
    {
        const result = mechanicalFixes("Text here  \nNext line.\n", "x.md", "rulebook");
        expect(result.fixes).toEqual([]);
        expect(result.findings.some(finding => finding.code === "TRAILING_WHITESPACE")).toBe(true);
    });
});

describe("findings", () =>
{
    test("flags ambiguity rather than rewriting it", () =>
    {
        const result = mechanicalFixes("Take some cards, etc.", "rules/_index.md", "rulebook");
        const codes = result.findings.map(finding => finding.code);
        expect(codes).toContain("AMBIGUOUS_WORD");
        expect(result.text).toBe("Take some cards, etc.");
    });

    test("flags a long sentence", () =>
    {
        const sentence = "This sentence keeps going and going with a great many words in it " + "and more words ".repeat(12) + "in the end.";
        const result = mechanicalFixes(sentence, "x.md", "rulebook");
        expect(result.findings.some(finding => finding.code === "LONG_SENTENCE")).toBe(true);
    });

    test("flags an empty section as a gap", () =>
    {
        const body = "## Setup\n\n## Objective\n\nScore the most points.\n";
        const result = mechanicalFixes(body, "rules/_index.md", "rulebook");
        expect(result.findings.some(finding => finding.code === "EMPTY_SECTION")).toBe(true);
    });

    test("flags unbalanced bold", () =>
    {
        const result = mechanicalFixes("Place **one tile on the table.", "rules/_index.md", "rulebook");
        expect(result.findings.some(finding => finding.code === "UNBALANCED_EMPHASIS")).toBe(true);
    });

    test("suggests a one-off word that is one letter from a word the text uses often", () =>
    {
        const body = "Place the tile facup. Everyone places tiles faceup. Keep them faceup.";
        const typos = mechanicalFixes(body, "rules/_index.md", "rulebook").findings.filter(finding => finding.code === "POSSIBLE_TYPO");
        expect(typos.map(finding => finding.excerpt)).toContain("facup");
    });

    test("does not call an inflection or a different word a typo", () =>
    {
        const body = "Take your turns in order. A turn is short.\n\nLayer the tiles. Each player scores once, then scores again.";
        const typos = mechanicalFixes(body, "rules/_index.md", "rulebook").findings.filter(finding => finding.code === "POSSIBLE_TYPO");
        expect(typos).toEqual([]);
    });
});

describe("marketing notes", () =>
{
    test("asks for a blurb when there is none", () =>
    {
        const notes = marketingNotes({ blurb: null, body: "A game about tiles." });
        expect(notes.some(note => note.code === "NO_BLURB")).toBe(true);
    });

    test("flags a blurb that is really a paragraph", () =>
    {
        const notes = marketingNotes({ blurb: "x".repeat(200), body: "" });
        expect(notes.some(note => note.code === "LONG_BLURB")).toBe(true);
    });

    test("flags a flat opening", () =>
    {
        const notes = marketingNotes({ blurb: "Short and sharp.", body: "The game is a tile game about mining." });
        expect(notes.some(note => note.code === "FLAT_OPENING")).toBe(true);
    });

    test("only calls a background section a late hook when nothing is pitched before it", () =>
    {
        const withPitch = marketingNotes({ blurb: "Short and sharp.", body: "You mine a mountain and flip it over.\n\n## Background\n\nSome history." });
        expect(withPitch.some(note => note.code === "LATE_HOOK")).toBe(false);
        const withoutPitch = marketingNotes({ blurb: "Short and sharp.", body: "## Background\n\nSome history." });
        expect(withoutPitch.some(note => note.code === "LATE_HOOK")).toBe(true);
    });
});
