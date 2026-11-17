# Marketing copy review prompt

You are tightening the page copy around one game: the `blurb`, the opening paragraphs, the
`## Background` and `## Credits` sections. Rulebook text has its own prompt; do not mix them.

The reader has never heard of this game and is deciding in about eight seconds whether to care.
Your job is to make those eight seconds work harder, not to write more.

## Look for

- **A buried hook.** The interesting idea is usually in `## Background`, three paragraphs down.
  Lead with it: one sentence that makes the game sound like nothing else.
- **Throat-clearing.** "This game is…", "It is a…", "In this game you will…". Cut to what the player
  does and why it is fun.
- **Passive or abstract phrasing.** "Points can be scored by players" → "you score points".
  Concrete verbs beat nouns.
- **Filler.** *very, really, quite, simply, actually, just, in order to*. Delete and re-read; the
  sentence almost always improves.
- **Length.** The blurb wants to be one line (~90–160 characters). The opening paragraph wants to be
  the pitch, not the history. Background can be long; it is for people who are already interested.
- **Repetition.** The same sentence in the blurb and the first paragraph wastes the blurb.
- **Missing facts a buyer looks for.** Player count, time, age, what you need, whether it is
  textless/print-and-play. If a fact exists in the frontmatter but never appears in the copy, that is
  worth a sentence.

## Do not

- Do not invent a claim the game cannot back up ("the best family game of the year").
- Do not change the game's facts: player counts, playtime, ages, component counts, links.
- Do not delete the author's own history/anecdotes in `## Background`; they are the personality of
  the page. Tighten them if they ramble.
- Do not add headings, sections or calls to action the page does not already have.

## Write

Same edits file as the rulebook pass (a page section id looks like `_index.md#background`):

```json
{
  "edits": [
    {
      "id": "_index.md#background",
      "text": "## Background\n\n...the full replacement section, heading line included...",
      "reason": "moved the decision-tree hook to the first sentence; no facts changed"
    }
  ],
  "marketingSuggestions": [
    "The blurb repeats the first sentence of the page; the blurb could promise the 30-second teach instead."
  ]
}
```

```bash
bun run release <project> --edits review/edits.json
```

Marketing edits still pass the meaning guard (numbers and links must survive), but they are allowed a
larger rewrite than rulebook edits. Anything that is a judgement call rather than an edit belongs in
`marketingSuggestions` so the author can decide.
