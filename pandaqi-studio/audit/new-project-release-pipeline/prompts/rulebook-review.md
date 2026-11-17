# Rulebook review prompt

You are reviewing the rules text of one game for **mistakes and clarity only**. The rules are not
yours to improve. A rulebook that reads better but means something else is a failed review, no
matter how good the writing is.

## Read

`review/packet.md` (or `review/findings.md` for the short version). Every section carries an id like
`rules/_index.md#setup`. That id is how an edit is addressed.

## Look for

- **Mistakes** — a typo, a wrong word, a copy-paste from another game, a number that contradicts the
  same number elsewhere, "when when", "facup", a stale expansion name.
- **Ambiguity** — "some", "a few", "usually", "etc.", a pronoun with two possible owners, a step that
  does not say who does it or when. Name the two readings you found; that is the useful part.
- **Gaps** — a section that stops before saying what happens in an obvious edge case, a heading with
  no content, a term used before it is defined, a step that never says when the round ends.
- **Redundancy** — the same instruction twice, a paragraph that repeats the section above it, a rule
  restated in three places in slightly different words.
- **Inconsistency** — the same thing called two names (tile/card, score/point), second person in one
  paragraph and "players" in the next, British and American spelling mixed.

## Do not

- Do not add, remove or rebalance a rule. Not even an obviously bad one.
- Do not change a number, a cost, a score, a player count, a timing, or a component name.
- Do not change headings, section order, links, images, shortcodes or example ids: the rulebook
  markup is wired to code (`data-rulebook-example`, `rules-image src="..."`), and the audit checks it.
- Do not rewrite a paragraph because you prefer another voice. The author's voice stays.

Anything you think would make the *game* better is a suggestion, not an edit. Put it in
`designSuggestions`, one sentence each, concrete and honest about the trade-off:

```json
"designSuggestions": [
  "The SCORE action allows two tiles per action; allowing one makes the deck run out less often, at the cost of slower scoring."
]
```

## Write

An edits file, then apply it:

```json
{
  "edits": [
    {
      "id": "rules/_index.md#setup",
      "text": "## Setup\n\n...the full replacement section, heading line included...",
      "reason": "typo: \"facup\" -> \"faceup\"; no rule changed"
    }
  ],
  "designSuggestions": [],
  "marketingSuggestions": []
}
```

```bash
bun run release <project> --edits review/edits.json
```

The meaning guard checks every edit and refuses anything that changes a number, a link, a shortcode,
a heading or most of the wording. A rejection is not a failure of the pipeline: it means the edit
looked like a rule change. Read the reason, fix the edit, try again.

Prefer many small edits over one large one. If a section needs a real rewrite, say so in the report
instead of forcing it through the guard.
