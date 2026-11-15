export const STYLES = `
.settings
{
    max-width: 32em;
    margin: auto;
    padding: 1em;
    font-family: var(--font-body);
    background-color: var(--bg-color);
    border-radius: var(--border-radius);
    font-size: var(--font-size);
    color: var(--text-color);
    box-shadow: 0 0 1em rgba(0, 0, 0, 0.15);

    --border-radius: 0.5em;
    --text-color: #222222;
    --bg-color: #DDDDDD;
    --mid-color: #999999;
    --input-bg: #FFFFFF;

    --font-heading: Trebuchet MS, Helvetica, Arial;
    --font-body: Trebuchet MS, Helvetica, Arial;
    --font-size: 16px;
}

h1
{
    margin: 0.5em;
    text-align: center;
    font-size: 24px;
}

.settings-container, .settings-group-content
{
    display: flex;
    flex-wrap: wrap;
    gap: 1em;
    width: 100%;
}

/* the small row of buttons at the top (reset, fold all, unfold all) */
.settings-tools
{
    display: flex;
    flex-wrap: wrap;
    gap: 0.5em;
    margin: 0.5em 0;
    font-size: 0.8em;
}

.settings-tools button
{
    flex: 1 1 auto;
    width: auto;
    padding: 0.4em 0.6em;
}

.settings-group
{
    display: flex;
    flex-wrap: wrap;
    gap: 0.75em;
    width: 100%;
    padding: 0.75em;
    border: 1px solid var(--mid-color);
    border-radius: var(--border-radius);
}

.settings-group-header, button
{
    text-align: center;
    text-transform: uppercase;
    background-color: var(--text-color);
    color: var(--bg-color);
    width: 100%;
    padding: 0.5em;
    border-radius: var(--border-radius);
    font-weight: bold;
    font-family: var(--font-heading);
    font-size: 1.0em;
    border: none;
    cursor: pointer;
    transition: background-color 0.15s, color 0.15s;
}

button:disabled
{
    opacity: 0.5;
    cursor: not-allowed;
}

.settings-group-header:hover, button:hover
{
    background-color: #FFFFFF;
    color: var(--text-color);
}

/* show that a group header folds, without needing any extra markup */
.settings-group[data-folded="true"] > .settings-group-header::after { content: " ▸"; }
.settings-group[data-folded="false"] > .settings-group-header::after { content: " ▾"; }

.settings-group-content
{
    padding-left: 0.75em;
    gap: 0.75em;
}

/* One setting = one row: the label (and its help button) on the left, the control on the right.
   Only a multi-select needs the full row, because its list of checkboxes is simply too big. */
.settings-element
{
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 0.4em 0.75em;
    width: 100%;
    padding: 0.4em 0;
    border-bottom: 1px solid rgba(0, 0, 0, 0.1);
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
    background-color: var(--input-bg);
    border: 1px solid var(--mid-color);
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
    width: 1.2em;
    height: 1.2em;
    padding: 0;
    border: none;
    background: none;
    accent-color: var(--text-color);
}

/* a file picker is wide by nature, so it takes the remaining space instead of a fixed width */
.settings-element > input[type="file"]
{
    flex: 1 1 6em;
    padding: 0.25em 0;
    border: none;
    background: none;
}

.settings-element > input:focus-visible,
.settings-element > select:focus-visible,
button:focus-visible
{
    outline: 2px solid var(--text-color);
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
    accent-color: var(--text-color);
}

/* The question mark: press it to read the explanation (a hover-only title does nothing on touch) */
.settings-remark
{
    flex: 0 0 auto;
    width: 1.5em;
    height: 1.5em;
    padding: 0;
    border: 1px solid var(--mid-color);
    border-radius: 50%;
    background-color: var(--input-bg);
    color: var(--mid-color);
    font-family: var(--font-body);
    font-size: 0.75em;
    font-weight: bold;
    font-style: normal;
    text-transform: none;
    line-height: 1;
    cursor: pointer;
}

.settings-remark:hover, .settings-remark.active
{
    background-color: var(--text-color);
    color: var(--bg-color);
    border-color: var(--text-color);
}

.settings-remark-text
{
    flex: 1 0 100%;
    width: 100%;
    padding: 0.5em 0.75em;
    background-color: var(--input-bg);
    border-left: 0.25em solid var(--mid-color);
    border-radius: var(--border-radius);
    font-size: 0.9em;
    font-style: italic;
    line-height: 1.35;
}

.feedback-node-sub
{
    font-style: italic;
    font-size: 0.62em;
    text-align: center;
    width: 100%;
}
`;
