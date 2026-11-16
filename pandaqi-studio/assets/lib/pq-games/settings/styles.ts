// The settings panel deliberately mirrors pq-rulebook's built-in theme: same warm paper palette,
// same accent, same restrained controls. Keep the two in sync when changing either one.
export const STYLES = `
.settings, .settings *, .settings *::before, .settings *::after
{
    box-sizing: border-box;
}

.settings
{
    max-width: 34em;
    margin: 2em auto;
    padding: 1.1em 1.25em 1.35em;
    font-family: var(--font-body);
    font-size: var(--font-size);
    line-height: 1.5;
    color: var(--text-color);
    background: var(--panel-color);
    border: 1px solid var(--border-color);
    border-top: 3px solid var(--accent-color);
    border-radius: var(--border-radius);
    box-shadow: var(--shadow);

    --border-radius: 0.375em;
    --text-color: #222222;
    --bg-color: #FCF6F0;
    --panel-color: #fffdf9;
    --mid-color: #77695e;
    --border-color: rgba(34, 17, 0, 0.14);
    --accent-color: #6d4433;
    --accent-soft: #f3e8e0;
    --input-bg: #FFFFFF;

    --font-heading: Dosis, "Trebuchet MS", Helvetica, Arial, sans-serif;
    --font-body: Raleway, "Trebuchet MS", Helvetica, Arial, sans-serif;
    --font-size: 16px;
    --shadow: 0 1px 2px rgba(34, 17, 0, 0.08), 0 4px 14px rgba(34, 17, 0, 0.06);
}

.settings h1
{
    margin: 0 0 0.15em;
    text-align: center;
    font-family: var(--font-heading);
    font-size: 1.9em;
    font-weight: 900;
    line-height: 1.1;
    letter-spacing: -0.01em;
    color: var(--text-color);
}

.settings-tools
{
    display: flex;
    flex-wrap: wrap;
    gap: 0.4em;
    margin: 0.85em 0 1em;
    padding-bottom: 0.95em;
    border-bottom: 1px solid var(--border-color);
    font-size: 1em;
}

.settings-tools button
{
    flex: 1 1 auto;
    width: auto;
    padding: 0.5em 0.7em;
    font-family: var(--font-heading);
    font-size: 0.68em;
    font-weight: 700;
    letter-spacing: 0.05em;
    text-transform: uppercase;
    line-height: 1.2;
    color: var(--accent-color);
    background: var(--accent-soft);
    border: 1px solid transparent;
    border-radius: var(--border-radius);
    cursor: pointer;
    transition: background-color 0.15s, color 0.15s, transform 0.1s;
}

.settings-tools button:hover
{
    color: var(--text-color);
    background: #ffffff;
    border-color: var(--border-color);
}

.settings-tools button:active
{
    transform: translateY(1px);
}

.settings-container,
.settings-group-content
{
    display: flex;
    flex-wrap: wrap;
    width: 100%;
}

.settings-container
{
    gap: 0;
}

.settings-group
{
    width: 100%;
    margin: 0.65em 0;
    overflow: hidden;
    background: var(--panel-color);
    border: 1px solid var(--border-color);
    border-radius: var(--border-radius);
}

.settings-group-header
{
    width: 100%;
    padding: 0.6em 0.8em;
    font-family: var(--font-heading);
    font-size: 0.76em;
    font-weight: 700;
    letter-spacing: 0.06em;
    text-align: left;
    text-transform: uppercase;
    color: var(--accent-color);
    background: var(--accent-soft);
    cursor: pointer;
    user-select: none;
    transition: background-color 0.15s;
}

.settings-group-header:hover
{
    background: #eee0d5;
}

/* show that a group header folds, without needing any extra markup */
.settings-group[data-folded="true"] > .settings-group-header::after { content: " ▸"; float: right; opacity: 0.75; }
.settings-group[data-folded="false"] > .settings-group-header::after { content: " ▾"; float: right; opacity: 0.75; }

.settings-group-content
{
    gap: 0;
    padding: 0.2em 0.85em 0.45em;
}

/* One setting = one row: the label (and its help button) on the left, the control on the right.
   Only a multi-select needs the full row, because its list of checkboxes is simply too big. */
.settings-element
{
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 0.35em 0.75em;
    width: 100%;
    padding: 0.55em 0;
    border-bottom: 1px solid rgba(34, 17, 0, 0.08);
}

.settings-element:last-child
{
    border-bottom: none;
}

.settings-element > label
{
    flex: 0 1 auto;
    width: auto;
    max-width: 100%;
    color: var(--text-color);
    cursor: pointer;
}

.settings-element > input,
.settings-element > select
{
    flex: 0 0 auto;
    width: auto;
    max-width: 100%;
    margin-left: auto; /* pushes the control to the right edge of the row */

    padding: 0.35em 0.5em;
    font: inherit;
    color: inherit;
    background: var(--input-bg);
    border: 1px solid var(--border-color);
    border-radius: var(--border-radius);
}

.settings-element > input[type="number"]
{
    width: 5.5em;
    text-align: right;
}

.settings-element > input[type="text"],
.settings-element > select
{
    flex: 1 1 8em;
}

.settings-element > input[type="checkbox"]
{
    width: 1.15em;
    height: 1.15em;
    padding: 0;
    border: none;
    background: none;
    accent-color: var(--accent-color);
}

/* a file picker is wide by nature, so it takes the remaining space instead of a fixed width */
.settings-element > input[type="file"]
{
    flex: 1 1 6em;
    padding: 0.25em 0;
    border: none;
    background: none;
}

/* the native file button is the one control the browser draws itself; match it to the tool buttons */
.settings-element > input[type="file"]::file-selector-button
{
    margin-right: 0.55em;
    padding: 0.4em 0.65em;
    font-family: var(--font-heading);
    font-size: 0.72em;
    font-weight: 700;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    color: var(--accent-color);
    background: var(--accent-soft);
    border: 0;
    border-radius: var(--border-radius);
    cursor: pointer;
    transition: background-color 0.15s, color 0.15s;
}

.settings-element > input[type="file"]::-webkit-file-upload-button
{
    margin-right: 0.55em;
    padding: 0.4em 0.65em;
    font-family: var(--font-heading);
    font-size: 0.72em;
    font-weight: 700;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    color: var(--accent-color);
    background: var(--accent-soft);
    border: 0;
    border-radius: var(--border-radius);
    cursor: pointer;
    transition: background-color 0.15s, color 0.15s;
}

.settings-element > input[type="file"]::file-selector-button:hover,
.settings-element > input[type="file"]::-webkit-file-upload-button:hover
{
    color: var(--text-color);
    background: #ffffff;
}

.settings-element > input:focus-visible,
.settings-element > select:focus-visible,
.settings button:focus-visible
{
    outline: 2px solid var(--accent-color);
    outline-offset: 2px;
}

/* A multi-select is a whole list of checkboxes, not a single value: it simply doesn't fit next to its
   label, so the list always takes a row of its own and becomes an evenly divided grid. */
.settings-element-multi > .settings-input-multi
{
    flex: 1 0 100%;
    width: 100%;
}

.settings-input-multi
{
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(7em, 1fr));
    gap: 0.25em 1em;
}

.settings-input-multi > div
{
    display: flex;
    align-items: center;
    gap: 0.5em;
    min-width: 0;
}

.settings-input-multi label
{
    flex: 1 1 auto;
    width: auto;
    overflow-wrap: anywhere;
    cursor: pointer;
}

.settings-input-multi input
{
    flex: 0 0 auto;
    width: 1.05em;
    height: 1.05em;
    margin: 0;
    accent-color: var(--accent-color);
}

/* The question mark: press it to read the explanation (a hover-only title does nothing on touch) */
.settings-remark
{
    flex: 0 0 auto;
    width: 1.35em;
    height: 1.35em;
    padding: 0;
    font-family: var(--font-body);
    font-size: 0.72em;
    font-weight: 700;
    font-style: normal;
    line-height: 1;
    text-transform: none;
    color: var(--mid-color);
    background: var(--input-bg);
    border: 1px solid var(--border-color);
    border-radius: 50%;
    cursor: pointer;
    transition: background-color 0.15s, color 0.15s, border-color 0.15s;
}

.settings-remark:hover,
.settings-remark.active
{
    color: #ffffff;
    background: var(--accent-color);
    border-color: var(--accent-color);
}

.settings-remark-text
{
    flex: 1 0 100%;
    width: 100%;
    padding: 0.55em 0.75em;
    font-size: 0.9em;
    font-style: italic;
    line-height: 1.4;
    color: var(--text-color);
    background: var(--accent-soft);
    border-left: 0.25em solid var(--accent-color);
    border-radius: 0 var(--border-radius) var(--border-radius) 0;
}

/* primary action: the one full-width button that starts the generation */
.settings-container > button
{
    width: 100%;
    margin: 0 0 0.35em;
    padding: 0.78em 1em;
    font-family: var(--font-heading);
    font-size: 0.78em;
    font-weight: 700;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    line-height: 1.2;
    color: #ffffff;
    background: var(--accent-color);
    border: 0;
    border-radius: var(--border-radius);
    cursor: pointer;
    transition: background-color 0.15s, transform 0.1s;
}

.settings-container > button:hover
{
    background: #4f2f22;
}

.settings-container > button:active
{
    transform: translateY(1px);
}

.settings button:disabled
{
    opacity: 0.55;
    cursor: progress;
}

.feedback-node-sub
{
    width: 100%;
    margin-bottom: 0.55em;
    font-size: 0.68em;
    font-style: italic;
    text-align: center;
    color: var(--mid-color);
}

@media all and (max-width: 30em)
{
    .settings
    {
        margin: 0.5em;
        padding: 0.9em;
    }

    .settings-tools button
    {
        flex: 1 1 45%;
    }

    .settings-element > input[type="text"],
    .settings-element > select
    {
        flex: 1 1 100%;
        margin-left: 0;
    }
}
`;
