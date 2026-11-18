export interface CliOptions
{
    project: string;
    dryRun: boolean;
    skip: Set<string>;
    fixText: boolean;
    format: boolean;
    minMedia: number;
    forceMedia: boolean;
    replaceMedia: boolean;
    captureRulebook: boolean;
    setDate: boolean;
    keepDraft: boolean;
    edits: string | null;
    pdfFull: boolean;
    help: boolean;
}

export const USAGE = `
Release one game project: text review, code checks, audit, marketing media, final page.

  bun run release <project> [flags]        from audit/, or from this folder

  <project>   content-relative folder of the project:
                mountain-miners
                chiptales/bet/noble-flood
                easter-eggventures/play/bunny-bidding

Flags
  --dry-run              do every check, write nothing (audit still runs)
  --skip <stages>        comma list of: text, code, audit, media, finalize
  --no-fix               report text mistakes, do not apply the safe ones
  --no-format            do not run the formatter (type check and lint still run)
  --min-media <n>        images the gallery must have (default 4)
  --force-media          add fresh screenshots even when the gallery is full
  --replace-media        replace the gallery's screenshots with the new ones instead of adding
  --capture-rulebook     also screenshot the rulebook's first screen and add it to the gallery
  --set-date             set the project date to today even when it has one
  --keep-draft           never remove \`draft: true\`
  --edits <file>         apply a review JSON from the agent pass (see review/edits.example.json)
  --pdf-full             generate marketing PDFs at production quality (slower)

Output: audit-artifacts/release/<project>/report.md (+ report.json, review/)

Exit codes: 0 = released (warnings allowed), 2 = blocking errors, 3 = internal failure.
`;

export const parseCli = (argv:string[]) : CliOptions =>
{
    const options:CliOptions = {
        project: "",
        dryRun: false,
        skip: new Set(),
        fixText: true,
        format: true,
        minMedia: 4,
        forceMedia: false,
        replaceMedia: false,
        captureRulebook: false,
        setDate: false,
        keepDraft: false,
        edits: null,
        pdfFull: false,
        help: false,
    };

    for(let i = 0; i < argv.length; i++)
    {
        const raw = argv[i];
        const separator = raw.indexOf("=");
        const flag = separator >= 0 ? raw.slice(0, separator) : raw;
        const inline = separator >= 0 ? raw.slice(separator + 1) : null;

        // `--min-media 5` and `--min-media=5` are the same flag; a separate value is consumed only
        // when it was not attached with `=`, so the next flag is never eaten.
        const value = () =>
        {
            if(inline !== null) { return inline; }
            const next = argv[i + 1];
            if(!next || next.startsWith("--")) { return null; }
            i++;
            return next;
        };

        switch(flag)
        {
            case "--help": case "-h": options.help = true; break;
            case "--dry-run": options.dryRun = true; break;
            case "--no-fix": options.fixText = false; break;
            case "--no-format": options.format = false; break;
            case "--force-media": options.forceMedia = true; break;
            case "--replace-media": options.replaceMedia = true; break;
            case "--capture-rulebook": options.captureRulebook = true; break;
            case "--set-date": options.setDate = true; break;
            case "--keep-draft": options.keepDraft = true; break;
            case "--pdf-full": options.pdfFull = true; break;

            case "--skip":
                for(const name of (value() ?? "").split(","))
                {
                    if(name.trim()) { options.skip.add(name.trim()); }
                }
                break;

            case "--min-media":
            {
                const parsed = Number(value());
                if(Number.isFinite(parsed) && parsed >= 0) { options.minMedia = Math.floor(parsed); }
                break;
            }

            case "--edits":
                options.edits = value();
                break;

            default:
                // An unknown flag is ignored rather than mistaken for a project name.
                if(flag.startsWith("-")) { break; }
                if(!options.project) { options.project = raw.replace(/^\/+|\/+$/g, ""); }
        }
    }

    return options;
};
