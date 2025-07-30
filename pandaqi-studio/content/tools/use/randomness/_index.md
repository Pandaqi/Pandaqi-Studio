---
type: "tool"
title: "Randomness"
---

<h1>Random</h1>

<div class="tool-block">
    <h2>Coins</h2>
    <div id="coinFeedback" class="feedback"></div>
    <div class="settings-block">
        <div class="setting"><label for="numberOfCoins"># Coins?</label><input id="numberOfCoins" type="number" value="1" min="1" max="10" /></div>
        <div class="setting"><label for="fairnessOfCoins">Fairness?</label><input id="fairnessOfCoins" type="range" value="50" min="0" max="100" /></div>
    </div>
    <button id="coin">Flip a coin</button>
    <p class="desc">Flips a coin, with FAIR% chance of heads (H) and (1-FAIR)% chance of tails (T).</p>
</div>

<div class="tool-block">
    <h2>Dice</h2>
    <div id="diceFeedback" class="feedback"></div>
    <div class="settings-block">
        <div class="setting"><label for="numberOfDice"># Dice?</label><input id="numberOfDice" type="number" value="1" min="1" max="10" /></div>
        <div class="setting"><label for="sidesOnDice"># Sides?</label><input id="sidesOnDice" type="number" value="6" min="1" max="64" /></div>
    </div>
    <button id="dice">Throw the dice</button>
    <p class="desc">Throws # dice, each with # sides, all with equal chance of appearing.</p>
</div>

<div class="tool-block">
    <h2>Numbers</h2>
    <div id="numberFeedback" class="feedback"></div>
    <div class="settings-block">
        <div class="setting"><label for="numberMin">Low?</label><input id="numberMin" type="number" value="1" /></div>
        <div class="setting"><label for="numberMax">High?</label><input id="numberMax" type="number" value="10" /></div>
        <div class="setting"><label for="numberInteger">Round?</label><input id="numberInteger" type="checkbox" checked /></div>
    </div>
    <button id="number">Get random number</button>
    <p class="desc">Returns a number between the boundaries (both <em>inclusive</em>).</p>
</div>

<div class="tool-block">
    <h2>List</h2>
    <div id="listFeedback" class="feedback"></div>
    <div id="listContainer" class="list-container"></div>
    <button id="listAdd">Add new entry</button>
    <button id="list">Draw random entry from list</button>
    <p class="desc">Input all entries for the list. The button will draw a random one from it. (Empty entries are ignored.)</p>
</div>

<script>

</script>

