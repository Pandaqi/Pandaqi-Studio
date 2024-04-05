---
type: "tools"
title: "Categorizer"
---

<style type="text/css">
main
{
    max-width: 900px;
}

table
{
    background-color: rgba(255,255,255,0.66);
}

tr:nth-child(2n)
{
    background-color: rgba(255,255,255,0.85);
}

td 
{
    padding: 0.75em;
}

td:first-child
{
    font-weight: bold;
    font-family: "Dosis";
}

.settings-block {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-around;
    align-content: center;
    align-items: center;
    gap: 0.5em;
}

.setting {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-around;
    align-content: center;
    align-items: center;
    gap: 0.5em;
    margin: 0;
    padding: 0;
}

input
{
    font-size: 1em;
    margin: 0;
}

label
{
    width: 100%;
    text-align: center;
}

input[type="checkbox"]
{
    width: 64px;
    height: 64px;
    border-radius: 0.5em;
}

.white-background
{
    background-color: rgba(255,255,255,0.66);
    border-radius: 0.33em;
}

h2
{
    text-align: center;
    font-weight: bold;
    font-family: "Dosis";
    font-size: 1.8em;
    margin-top: 1.5em;
    margin-bottom: 0.25em;
}

.result-draw-random
{
    display: flex;
    flex-wrap: wrap;
}

.result-draw-random div
{
    margin: 0.75em;
    padding: 0;
}

.list-display, .list-display-container
{
    padding: 0;
    margin: 0;
}

.entry-type
{
    opacity: 0.5;
    font-size: 0.75em;
    display: block;
}
</style>

<h1>Categorizer</h1>

<!--- The basic introduction and explanation --->
<div class="white-background">
    <p>
        This tool contains the lists that I use to categorize all games. It has 5 major sub lists: <a href="#difficulty">Difficulty</a>, <a href="#genres">Genres</a>, <a href="#categories">Categories</a>, <a href="#tags">Tags</a>, <a href="#themes">Themes</a>.
    </p>
    <p>
        I scroll through the tables below to tag every new project. (Categorization was an absolute mess before with no consistency!) You might press the button below for random ideas. Or just read through it and maybe get inspired!
    </p>
    <p>
        DISCLAIMER (the usual one): these lists are incomplete, imperfect, and slightly biased to the specific games I tend to make.
    </p>
</div>

<!--- The random ideas drawer --->
<!--- The code automatically attaches the right listeners and response to this --->
<h2>Randomize Tool</h2>
<div class="draw-random white-background">
    <div class="settings-block">
        <div class="setting"><label for="input-genres">#Genres?</label> <input type="number" min="0" max="10" value="1" class="input-genres" id="input-genres"></div>
        <div class="setting"><label for="input-categories">#Categories?</label> <input type="number" min="0" max="10" value="3" class="input-categories" id="input-categories"></div>
        <div class="setting"><label for="input-tags">#Tags?</label> <input type="number" min="0" max="30" value="3" class="input-tags" id="input-tags"></div>
        <div class="setting"><label for="input-themes">#Themes?</label> <input type="number" min="0" max="30" value="1" class="input-themes" id="input-themes"></div>
        <div class="setting"><label for="input-difficulty">Draw a Difficulty?</label> <input type="checkbox" class="input-difficulty" id="input-difficulty"></div>
    </div>
    <button class="button-draw-random">Give me some random ideas!</button>
    <div class="result-draw-random"><em>Results will come here ...</em></div>
</div>

<!--- The actual entire list --->
<!--- This is detected, then filled automatically by the code --->
<div class="list-display"></div>

<!-- Actually load that code -->
{{< load-assets-custom input="/games/tools/categorizer/main.ts" output="/js/lib-pqTools-categorizer.js" >}}
