---
type: "game"
googleFonts: "https://fonts.googleapis.com/css2?family=Recursive:wght@300;500;700;900"
---

<main>
    <h1 id="title">Title</h1>
    <div id="ruleReminder"></div>
    <p id="metadata">
        Categorie: <span id="category">??</span> | Startinzet: <span id="money">??</span>
        <span id="addertjeContainer">
            Addertje: <span id="addertje">??</span>
        </span>
        <span id="rolvoordeelContainer">
            Rolvoordeel: <span id="rolvoordeel">??</span>
        </span>
    </p>
    <div id="timer">
        <div>
            <button id="timerStartButton">Start</button> 
            <span id="timerValue">00:00</span> 
            <button id="timerStopButton">Stop</button>
        </div>
    </div>
    <p id="story">Story</p>
    <div id="desc">Description</div>
    <button id="continueButton">Ga door!</button>
    <div id="options"></div>
    <div id="input">
        <input type="text" id="inputText" placeholder="... typ een spelernaam ..." />
        <div id="inputSettings">
            <div>
                <label for="setting-jokerCount">Jokers? </label>
                <input type="number" id="setting-jokerCount" name="setting-jokerCount" class="input-number" min="0" max="10" value="0" />
                <label for="setting-redCards">Rode kaarten? </label>
                <input type="number" id="setting-redCards" name="setting-redCards" class="input-number" min="0" max="10" value="0" />
                <label for="setting-freePass">Vrijstelling? </label>
                <input type="checkbox" name="setting-freePass" class="input-checkbox" id="setting-freePass">
                <label for="setting-destroyFreePass">Zwarte Vrijstelling? </label>
                <input type="checkbox" name="setting-destroyFreePass" class="input-checkbox" id="setting-destroyFreePass">
                <label for="setting-specialeKracht" id="setting-specialeKracht-label">Speciale Kracht? </label>
                <select name="setting-specialeKracht" id="setting-specialeKracht">
                    <option value="" selected>-- geen --</option>
                    <option value="Helderziende">Helderziende</option>
                    <option value="Afluisteraar">Afluisteraar</option>
                    <option value="Fotofinish">Fotofinish</option>
                    <option value="Gokker">Gokker</option>
                    <option value="Handelaar">Handelaar</option>
                </select>
            </div>
        </div>
        <p id="inputResult"></p>
        <button id="inputButton">Registreer speler</button>
    </div>
</main>