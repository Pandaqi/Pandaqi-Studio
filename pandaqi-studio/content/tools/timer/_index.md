---
type: "tools"
title: "Timer"

---

<style type="text/css">

    #common-values, #controls {
        display: flex;
        gap: 0.5em;
        flex-wrap: wrap;
        justify-content: center;
        align-items: center;
    }

    #common-values button, #controls button {
        width: auto;
        margin: 0.25em;
    }

    #common-values button {
        opacity: 0.66;
    }

    #time {
        font-size: 4em;
        line-height: 0;
        text-align: center;
        font-family: "Dosis", sans-serif;
        font-weight: bold;
        margin: 0;
    }

    .timer-active {
        color: #9623a6;
        animation: pop 1s linear;
        animation-iteration-count: infinite;
    }

    .timer-almost-done {
        color: #c52020;
    }

    .timer-inactive {
        color: #076b7a;
    }

    @keyframes pop{
        0%  { transform: scale(1.1); }
        15%  { transform: scale(1.0); }
    }     
    
    #desc {
        text-align: center;
        margin: 0;
        padding: 0;
        opacity: 0.8;
    }

</style>

<h1>Timer</h1>
<div id="time" data-time="0" class="timer-inactive">
    00:00
</div>
<div id="controls">
    <button id="start">Start</button>
    <button id="stop">Stop</button>
    <button id="reset">Reset</button>
</div>
<div id="desc">
    Touch and scrub left/right to set a precise value. Or tap a common value below. Enable sound for an alarm on completion.
</div>
<div id="common-values">
    <button data-time="30">30s</button>
    <button data-time="60">1m</button>
    <button data-time="120">2m</button>
    <button data-time="180">3m</button>
    <button data-time="300">5m</button>
    <button data-time="600">10m</button>
</div>

<script>
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    let buffer = null;
    
    async function loadSound() {
        const file = "alarm_sound.mp3";

        const xhr = new XMLHttpRequest();
        xhr.open('GET', file, true);
        xhr.responseType = 'arraybuffer';

        const that = this;
        return new Promise((resolve, reject) => {
            xhr.onload = function()
            {
                let notFound = this.response.byteLength <= 24;
                if(notFound) { return; }
    
                audioCtx.decodeAudioData(
                    this.response, 
                    function (b) { buffer = b; resolve(true); }, 
                    function (e) { console.warn(e); reject(false); }
                );
            }
            xhr.onerror = function () { reject(false); };   
            xhr.send(); 
        });
    }

    loadSound();

    const timeNode = document.getElementById("time");
    const commonButtons = Array.from(document.getElementById("common-values").childNodes);
    const buttonStart = document.getElementById("start");
    const buttonStop = document.getElementById("stop");
    const buttonReset = document.getElementById("reset");
    let interval = null;

    function displayTime()
    {
        const t = getTime();

        let seconds = Math.ceil(t % 60);
        if(seconds < 10) { seconds = "0" + seconds; }

        let minutes = Math.floor(t / 60);
        if(minutes < 10) { minutes = "0" + minutes; }

        timeNode.innerHTML = minutes + ":" + seconds;

        let classes = "timer-active";
        if(t <= 15) { classes += " timer-almost-done"; }
        if(interval == null) { classes = "timer-inactive"; }

        timeNode.classList = classes;
    }

    function sound_alarm()
    {
        let source = audioCtx.createBufferSource();
        source.buffer = buffer;
        source.connect(audioCtx.destination);
        source.start();
    }

    function setTime(t) {
        t = Math.max(parseFloat(t), 0);
        timeNode.dataset.time = t; 
        displayTime();
        if(t <= 0 && interval != null) { 
            stop();
            sound_alarm() 
        }
    }

    function getTime() {
        return parseFloat(timeNode.dataset.time);
    }

    function decrementTime() {
        setTime(getTime() - 1);
    }

    function start() { 
        timeNode.dataset.starttime = getTime();
        interval = setInterval(decrementTime, 1000); 
        displayTime();
    }

    function stop() { 
        clearInterval(interval); 
        interval = null;
        displayTime();
    }

    function reset() {
        setTime(timeNode.dataset.starttime);
    }

    buttonStart.addEventListener("click", start);
    buttonStop.addEventListener("click", stop);
    buttonReset.addEventListener("click", reset);

    for(const btn of commonButtons)
    {
        btn.addEventListener("click", () => {
            setTime(btn.dataset.time);
        })
    }

    let scrubPos = null;
    let scrubbing = false;
    const scrubSensitivity = 0.5;

    function getPosFromEvent(ev)
    {
        if(ev.type == 'touchstart' || ev.type == 'touchmove' || ev.type == 'touchend' || ev.type == 'touchcancel')
        {
            var evt = (typeof ev.originalEvent === 'undefined') ? ev : ev.originalEvent;
            var touch = evt.touches[0] || evt.changedTouches[0];
            return { x: touch.clientX, y: touch.clientY };
        } else if (ev.type == 'mousedown' || ev.type == 'mouseup' || ev.type == 'mousemove' || ev.type == 'mouseover'|| ev.type == 'mouseout' || ev.type == 'mouseenter' || ev.type=='mouseleave' ) {
            return { x: ev.clientX, y: ev.clientY };
        }
        
    }

    function scrubStart(ev)
    {
        scrubPos = getPosFromEvent(ev);
        scrubbing = true;
        ev.preventDefault();
        return false;
    }

    function scrubProgress(ev)
    {
        if(!scrubbing) { return; }
        let newScrubPos = getPosFromEvent(ev);
        let delta = (newScrubPos.x - scrubPos.x)*scrubSensitivity;
        scrubPos = newScrubPos;
        setTime(getTime() + delta);
        ev.preventDefault();
        return false;
    }

    function scrubEnd(ev)
    {
        scrubbing = false;
        ev.preventDefault();
        return false;
    }

    timeNode.addEventListener("mousedown", scrubStart);
    timeNode.addEventListener("touchstart", scrubStart);
    timeNode.addEventListener("mousemove", scrubProgress);
    timeNode.addEventListener("touchmove", scrubProgress);
    timeNode.addEventListener("mouseup", scrubEnd);
    timeNode.addEventListener("touchend", scrubEnd);
    timeNode.addEventListener("mouseleave", scrubEnd);
    timeNode.addEventListener("touchcancel", scrubEnd);

    console.log("Ready to go");
</script>

