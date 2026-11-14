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

    --border-radius: 0.5em;
    --text-color: #222222;
    --bg-color: #DDDDDD;
    --mid-color: #999999;

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

.settings-tools
{
    font-size: 9px;
    display: flex;
    margin: 0.5em;
    gap: 0.5em;
}

.settings-group
{
    display: flex;
    flex-wrap: wrap;
    gap: 1em;
    width: 100%;
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

.settings-group-content
{
    padding-left: 1em;
}

.settings-element
{
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 0.5em 1em;
    width: 100%;
}

.settings-element label
{
    width: 100%;
}

.settings-element input, .settings-element select
{
    width: 100%;
}

/* a lone checkbox has no content of its own to fill a row with; stretching it just centres the box */
.settings-element > input[type="checkbox"]
{
    width: auto;
    align-self: flex-start;
}

/* A multi-select is a whole list of checkboxes, not a single value: its label takes its own row and
   the list becomes an evenly divided grid instead of one very thin column. */
.settings-element-multi > label
{
    flex: 1 0 100%;
    width: 100%;
}

.settings-element-multi > .settings-input-multi
{
    flex: 1 0 100%;
    width: 100%;
}

.settings-input-multi
{
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
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
}

.settings-input-multi input
{
    flex: 0 0 auto;
    width: auto;
}

.settings-remark
{
    font-style: italic;
    color: var(--mid-color);
}

.feedback-node-sub
{
    font-style: italic;
    font-size: 0.62em;
    text-align: center;
    width: 100%;
}
`;