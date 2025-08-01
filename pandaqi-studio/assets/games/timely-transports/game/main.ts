import AudioLoader from "./audioLoader"
import FontLoader from "./fontLoader"
import Overlay from "./overlay"
import Interface from "./interface"
import { CONFIG } from "../shared/config";

export default class Game 
{
    config: Record<string,any>;
    gameover: boolean;
    weWon: boolean;
    overlay: Overlay;
    audio: AudioLoader;
    fonts: FontLoader;
    interface: Interface;

    constructor()
    {
        this.config = this.setupConfig();
        this.gameover = false;
        this.weWon = false;
        this.createExitButton();
    }

    setupConfig()
    {
        const userConfig = JSON.parse(window.localStorage.timelyTransportsConfig || "{}");
        userConfig.playerRank = parseInt(userConfig.playerRank || 0);
        userConfig.playerCount = parseInt(userConfig.playerCount || 4);
        userConfig.timeout = parseInt(userConfig.timeout || 0);
        console.log(userConfig);
        return userConfig;
    }

    setGameOver(val: boolean) { this.gameover = val; }
    isGameOver() { return this.gameover; }
    setWon(val: boolean) 
    { 
        this.weWon = val; 
        setTimeout(() => { this.exit(false); }, 5000);
    }

    createExitButton()
    {
        const btn = document.createElement("button");
        document.getElementById("game-container").appendChild(btn);
        btn.classList.add("quit-button")
        btn.innerHTML = "Quit";
        btn.addEventListener("click", this.exit.bind(this));

        window.onbeforeunload = () => {
            if(this.isGameOver()) { return undefined; }
            return "Are you sure you want to leave?"
        }
    }

    async start()
    {
        this.overlay = new Overlay(this);
        this.overlay.setText("<p>Loading ... </p>");

        this.audio = new AudioLoader();
        this.fonts = new FontLoader();
        
        await this.fonts.load();
        await this.audio.load(this.config);

        this.interface = new Interface(this, this.config);
        this.interface.setPaused(true);

        this.overlay.setText("<p>Tap to start the game</p><p class='sub-instruction'>(Wait until everyone is ready.)</p>")
        this.overlay.makeClickable(() => {
            this.interface.setPaused(false);
        });
    }

    exit(askConfirmation = true)
    {
        if(askConfirmation && !confirm("Are you sure you want to quit?")) { return; }
        this.interface.setPaused(true);
        this.overlay.gotoGameOver();
    }
}

loadSettings(CONFIG, () => new Game().start());

new Game().start();