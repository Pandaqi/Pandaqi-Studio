// JUMBLE AMBIENCE sounds research
// this is a softer, less present one
//const url2 = "https://www.zapsplat.com/wp-content/uploads/2015/sound-effects-31172/zapsplat_nature_forest_ambience_distant_river_dist_planes_birds_32171.mp3?_=8";

import CONFIG from "../shared/config";

// this one is more present
// https://www.zapsplat.com/wp-content/uploads/2015/sound-effects-free-to-use-sounds/ftus_jungle_rainforest_daytime_birds_singing_close_up_distant_traffic_vietnam_705.mp3?_=7

export default class AudioLoader {
    filePath: string;
    buffer: Record<string,any>;
    ctx: AudioContext;

    constructor() 
    {
        this.filePath = CONFIG.assetsBase + "audio"
        this.buffer = {};
        this.setupContext();
    }

    getContext() { return this.ctx; }
    setupContext()
    {
        // @ts-ignore
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        this.ctx = new AudioContext();
        document.addEventListener("visibilitychange", event => {
            if (document.visibilityState === "visible") { this.ctx.resume(); } 
            else { this.ctx.suspend(); }
        });
    }

    async load(config:Record<string,any>)
    {
        const urlsToLoad = [
            "alarm_1_short", "announcement_1", "timer_fail_1",
            "score_success_1", "upgrade_1_short", "victory_1_short"
        ]

        const loadJungleAmbience = (config.playerRank == 1);
        if(loadJungleAmbience)
        {
            urlsToLoad.push("jungle_ambience_2")
        }

        const promises = [];
        for(const url of urlsToLoad)
        {
            promises.push(this.loadResource(url));
        }
        await Promise.all(promises);
    }

    loadResource(url: string)
    {
        const file = this.filePath  + "/" + url + ".mp3";

        const xhr = new XMLHttpRequest();
        xhr.open('GET', file, true);
        xhr.responseType = 'arraybuffer';

        const that = this;
        return new Promise((resolve, reject) => {
            xhr.onload = function()
            {
                let notFound = this.response.byteLength <= 24;
                if(notFound) { return; }
    
                that.getContext().decodeAudioData(
                    this.response, 
                    function (b) { that.buffer[url] = b; resolve(true); }, 
                    function (e) { console.warn(e); reject(false); }
                );
            }
            xhr.onerror = function () { reject(false); };   
            xhr.send(); 
        });
    }

    getResource(url: string | number)
    {
        return this.buffer[url];
    }

    play(url: any, params:Record<string,any> = {})
    {
        if (this.ctx.state === "suspended") { this.ctx.resume(); }

        const source = this.ctx.createBufferSource();
        source.buffer = this.getResource(url);
        source.loop = params.loop || false;

        const gainNode = this.ctx.createGain();
        const volume = params.volume || 1;
        gainNode.gain.setValueAtTime(volume, this.ctx.currentTime)

        source.connect(gainNode);
        gainNode.connect(this.ctx.destination);

        source.start();
        return source;
    }
}



