import { editDistance, normalizeSentence, proseParagraphsOf, sentencesOf, stripToProse, wordCount } from "./markdown";

// The text stage has exactly two jobs, and they are kept strictly apart:
//
//   fixes    objective, *visible* mistakes with one correct answer: a doubled word, a space in front
//            of a comma, a missing space after one. These are applied. None of them can change what
//            a rule means.
//   advice   anything that needs a judgement (a long sentence, an ambiguous "some", a marketing
//            opener that is 60 words long). These are only ever reported.
//
// Invisible whitespace (a trailing space, two spaces between words) is reported but not rewritten:
// it changes rendering in markdown, so it is the author's call, and fixing it only creates churn in
// a published rulebook.
//
// Nothing in here rewrites a sentence to "sound better": a rulebook change that shifts meaning is
// the one thing this pipeline must never do on its own.

export type Severity = "error" | "warn" | "info";
export type Scope = "rulebook" | "page";

export interface Finding
{
    code: string;
    severity: Severity;
    scope: Scope;
    file: string;
    line: number;
    message: string;
    // the offending text, so the report is readable without opening the file
    excerpt?: string;
}

export interface Fix
{
    code: string;
    file: string;
    line: number;
    before: string;
    after: string;
    reason: string;
}

// Words that are legitimately doubled ("had had", "that that") are rare enough to leave alone.
const ALLOWED_DOUBLES = new Set(["had", "that", "is", "no", "ha", "him", "she", "her", "he"]);

const FENCE_RE = /^\s*(```|~~~)/;

const stripCodeFences = (lines:string[]) =>
{
    let inFence = false;
    return lines.map(line =>
    {
        if(FENCE_RE.test(line)) { inFence = !inFence; return { line, skip: true }; }
        return { line, skip: inFence };
    });
};

interface SpacingStep
{
    code: string;
    reason: string;
    pattern: RegExp;
    // `$1`-style replacement for the first capture group
    replacement: string;
}

const SPACING_STEPS:SpacingStep[] = [
    {
        code: "SPACE_BEFORE_PUNCTUATION",
        reason: "a space in front of punctuation",
        pattern: /\s+([,;:!?])(?=\s|$|[A-Za-z])/g,
        replacement: "$1",
    },
    {
        code: "SPACE_BEFORE_PUNCTUATION",
        reason: "a space in front of a full stop",
        // `.` followed by a digit is a decimal, followed by a letter could be an abbreviation
        pattern: /\s+\.(?=\s|$)/g,
        replacement: ".",
    },
    {
        code: "MISSING_SPACE_AFTER_PUNCTUATION",
        reason: "missing space after a comma or semicolon",
        pattern: /([,;])([A-Za-z])/g,
        replacement: "$1 $2",
    },
];

const doubledWordPattern = /\b([A-Za-z][A-Za-z'-]{1,})(\s+)\1\b/gi;

export interface MechanicalResult
{
    text: string;
    fixes: Fix[];
    findings: Finding[];
}

export const mechanicalFixes = (body:string, file:string, scope:Scope, lineOffset = 0) : MechanicalResult =>
{
    const eol = body.includes("\r\n") ? "\r\n" : "\n";
    const lines = body.split(/\r?\n/);
    const scanned = stripCodeFences(lines);
    const fixes:Fix[] = [];

    const next = scanned.map((entry, index) =>
    {
        if(entry.skip) { return entry.line; }
        const lineNumber = index + 1 + lineOffset;
        let line = entry.line;

        const deduped = line.replace(doubledWordPattern, (match, word:string) =>
            ALLOWED_DOUBLES.has(word.toLowerCase()) ? match : word
        );
        if(deduped !== line)
        {
            fixes.push({
                code: "DOUBLED_WORD", file, line: lineNumber,
                before: line.trim(), after: deduped.trim(), reason: "the same word is written twice",
            });
            line = deduped;
        }

        const beforeSpacing = line;
        const applied:string[] = [];
        for(const step of SPACING_STEPS)
        {
            const replaced = line.replace(step.pattern, step.replacement);
            if(replaced !== line) { line = replaced; applied.push(step.reason); }
        }
        if(line !== beforeSpacing)
        {
            fixes.push({
                code: SPACING_STEPS.find(step => applied.includes(step.reason))?.code ?? "SPACING",
                file, line: lineNumber,
                before: beforeSpacing.trim(), after: line.trim(),
                reason: Array.from(new Set(applied)).join(" and "),
            });
        }
        return line;
    });

    const text = next.join(eol);
    const findings = inspect(text, file, scope, lineOffset);
    return { text, fixes, findings };
};

// Report-only analysis of one document body.
export const inspect = (body:string, file:string, scope:Scope, lineOffset = 0) : Finding[] =>
{
    const findings:Finding[] = [];
    const add = (code:string, severity:Severity, line:number, message:string, excerpt?:string) =>
        findings.push({ code, severity, scope, file, line: line + lineOffset, message, excerpt });

    const lines = body.split(/\r?\n/);
    const scanned = stripCodeFences(lines);

    // Whitespace is counted per file instead of listed per line: ten identical "trailing space"
    // notes bury the two findings that actually matter.
    let trailingCount = 0;
    let trailingLine = 0;
    let doubleCount = 0;
    let doubleLine = 0;

    scanned.forEach((entry, index) =>
    {
        if(entry.skip) { return; }
        const line = entry.line;

        const bold = (line.match(/\*\*/g) ?? []).length;
        if(bold % 2 === 1)
        {
            add("UNBALANCED_EMPHASIS", "warn", index + 1, "an odd number of `**` on this line: the bold text runs on", line.trim());
        }
        if(/[ \t]+$/.test(line)) { trailingCount++; trailingLine ||= index + 1; }
        if(/\S {2,}\S/.test(line)) { doubleCount++; doubleLine ||= index + 1; }
    });

    if(trailingCount > 0)
    {
        add("TRAILING_WHITESPACE", "info", trailingLine, `${trailingCount} line(s) end in whitespace (two of them are a markdown hard line break)`);
    }
    if(doubleCount > 0)
    {
        add("DOUBLE_SPACE", "info", doubleLine, `${doubleCount} line(s) have two or more spaces between words`);
    }

    const paragraphs = proseParagraphsOf(body);
    const seenParagraphs = new Set<string>();
    for(const paragraph of paragraphs)
    {
        const key = normalizeSentence(paragraph);
        if(key.length < 30) { continue; }
        if(seenParagraphs.has(key))
        {
            add("DUPLICATE_PARAGRAPH", "warn", lineOfText(lines, paragraph), "this paragraph already appears earlier in the file", paragraph.slice(0, 120));
        }
        seenParagraphs.add(key);
    }

    const seenSentences = new Set<string>();
    for(const sentence of sentencesOf(body))
    {
        const key = normalizeSentence(sentence);
        if(key.length < 40) { continue; }
        if(seenSentences.has(key))
        {
            add("DUPLICATE_SENTENCE", "warn", lineOfText(lines, sentence), "the same sentence appears twice", sentence.slice(0, 120));
        }
        seenSentences.add(key);

        const words = wordCount(sentence);
        if(words > 45)
        {
            add("LONG_SENTENCE", "info", lineOfText(lines, sentence), `a ${words}-word sentence; split it in two`, sentence.slice(0, 140));
        }
    }

    // empty sections are the most common "gap": a heading whose explanation never got written
    for(const heading of lines.filter(line => /^#{1,6}\s+/.test(line)))
    {
        const index = lines.indexOf(heading);
        let hasContent = false;
        for(let i = index + 1; i < lines.length; i++)
        {
            if(/^#{1,6}\s+/.test(lines[i])) { break; }
            if(lines[i].trim().length > 0) { hasContent = true; break; }
        }
        if(!hasContent) { add("EMPTY_SECTION", "warn", index + 1, `"${heading.replace(/^#+\s*/, "")}" has no content under it`, heading); }
    }

    // Words that leave a rule open to interpretation. Rules only: in marketing copy "some" is prose.
    if(scope === "rulebook")
    {
        const ambiguity = /\b(etc\.?|and so on|some|a few|roughly|usually|normally|probably|maybe|or something)\b/gi;
        for(const match of body.matchAll(ambiguity))
        {
            add("AMBIGUOUS_WORD", "info", lineOfText(lines, match[0]), `"${match[0]}" leaves the exact rule open to interpretation`);
        }
    }

    if(scope === "page")
    {
        const weasels = /\b(very|really|quite|simply|actually|basically|just|in order to|kind of|sort of)\b/gi;
        const counts = new Map<string, number>();
        for(const match of body.matchAll(weasels))
        {
            const word = match[0].toLowerCase();
            counts.set(word, (counts.get(word) ?? 0) + 1);
        }
        if(counts.size > 0)
        {
            const summary = Array.from(counts.entries()).map(([word, count]) => `${word}×${count}`).join(", ");
            add("WEAK_WORDING", "info", 1, `filler words that can usually go: ${summary}`);
        }

        for(const paragraph of paragraphs)
        {
            const words = wordCount(paragraph);
            if(words > 120)
            {
                add("LONG_PARAGRAPH", "info", lineOfText(lines, paragraph),
                    `a ${words}-word paragraph; the page reads faster in chunks`, paragraph.slice(0, 120));
            }
        }
    }

    if(scope === "rulebook")
    {
        // One-off words that are one edit away from a word the project uses repeatedly: the cheap,
        // dependency-free half of a spell check. Inflections ("turns"/"turn") and pairs that do not
        // even start with the same letter ("piles"/"tiles") are not typos; skipping those keeps this
        // quiet enough to be worth reading. Report only: game terms and names are still false
        // positives, so this never writes anything.
        const frequency = new Map<string, number>();
        for(const word of stripToProse(body).toLowerCase().match(/[a-z][a-z'-]{3,}/g) ?? [])
        {
            frequency.set(word, (frequency.get(word) ?? 0) + 1);
        }
        const frequent = Array.from(frequency.entries()).filter(([, count]) => count >= 2).map(([word]) => word);
        for(const [word, count] of frequency)
        {
            if(count !== 1 || word.length < 5) { continue; }
            const near = frequent.find(other =>
                other !== word
                && other[0] === word[0]
                && !isInflection(word, other)
                && editDistance(word, other) === 1
            );
            if(!near) { continue; }
            add("POSSIBLE_TYPO", "info", lineOfText(lines, word), `"${word}" appears once; did you mean "${near}"?`, word);
        }
    }

    // A word that appears twice on one line would otherwise be reported twice.
    return Array.from(new Map(findings.map(finding => [`${finding.code}:${finding.line}:${finding.message}`, finding])).values());
};

const isInflection = (a:string, b:string) =>
{
    const suffixes = ["s", "es", "d", "ed", "ing", "ly", "er", "est", "n"];
    return suffixes.some(suffix => a === b + suffix || b === a + suffix);
};

// Best-effort line number for a snippet (1 when it cannot be located).
const lineOfText = (lines:string[], snippet:string) =>
{
    const needle = snippet.trim().split(/\s+/).slice(0, 6).join(" ");
    if(needle.length === 0) { return 1; }
    const probe = needle.slice(0, Math.min(40, needle.length));
    for(let i = 0; i < lines.length; i++)
    {
        if(lines[i].includes(probe)) { return i + 1; }
    }
    return 1;
};

export interface MarketingNote
{
    code: string;
    message: string;
}

// Page-level (not rulebook) observations about how the copy sells the game. Suggestions only.
export const marketingNotes = (options: { blurb:string | null, body:string }) : MarketingNote[] =>
{
    const notes:MarketingNote[] = [];
    const blurb = (options.blurb ?? "").trim();

    if(blurb.length === 0)
    {
        notes.push({ code: "NO_BLURB", message: "the page has no `blurb`; it is the one-line pitch used everywhere the game is listed" });
    }
    else if(blurb.length > 160)
    {
        notes.push({ code: "LONG_BLURB", message: `the blurb is ${blurb.length} characters; a tagline reads best under ~160` });
    }
    else if(blurb.length < 40)
    {
        notes.push({ code: "THIN_BLURB", message: `the blurb is only ${blurb.length} characters; name the hook, not just the genre` });
    }

    const paragraphs = proseParagraphsOf(options.body);
    const opening = paragraphs[0] ?? "";
    if(opening.length > 0)
    {
        const words = wordCount(opening);
        if(words > 45)
        {
            notes.push({ code: "SLOW_OPENING", message: `the first paragraph is ${words} words; the opening sentence has to do the selling` });
        }
    }

    // Only a problem when a background/credits section is the *first* thing on the page: then the
    // pitch is buried and the reader gets the making-of before the game.
    const firstHeading = options.body.match(/^##\s+(.*)$/m);
    if(firstHeading && /^(background|credits|development|history)$/i.test(firstHeading[1].trim()))
    {
        const before = options.body.slice(0, firstHeading.index ?? 0);
        if(wordCount(before) < 8)
        {
            notes.push({
                code: "LATE_HOOK",
                message: `"${firstHeading[1].trim()}" is the first section on the page; lead with what the player does before the making-of`,
            });
        }
    }

    if(/^\s*(this game is|it is a game|the game is)/im.test(options.body))
    {
        notes.push({ code: "FLAT_OPENING", message: "the copy opens with \"the game is …\"; lead with what the player does instead" });
    }

    return notes;
};
