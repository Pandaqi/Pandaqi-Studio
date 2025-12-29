// @ts-ignore
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
let buffer = null;

const loadSound = async () =>
{
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
const commonButtons = Array.from(document.getElementById("common-values").childNodes) as HTMLButtonElement[];
const buttonStart = document.getElementById("start");
const buttonStop = document.getElementById("stop");
const buttonReset = document.getElementById("reset");
let interval = null;

const displayTime = () =>
{
    const t = getTime();

    let seconds:(number|string) = Math.ceil(t % 60);
    if(seconds < 10) { seconds = "0" + seconds; }

    let minutes:(number|string) = Math.floor(t / 60);
    if(minutes < 10) { minutes = "0" + minutes; }

    timeNode.innerHTML = minutes + ":" + seconds;

    let classes = "timer-active";
    if(t <= 15) { classes += " timer-almost-done"; }
    if(interval == null) { classes = "timer-inactive"; }

    timeNode.classList = classes;
}

const soundAlarm = () =>
{
    let source = audioCtx.createBufferSource();
    source.buffer = buffer;
    source.connect(audioCtx.destination);
    source.start();
}

const setTime = (t:number|string) =>
{
    // @ts-ignore
    t = Math.max(parseFloat(t), 0);
    timeNode.dataset.time = t.toString(); 
    displayTime();
    if(t <= 0 && interval != null) { 
        stopTimer();
        soundAlarm() 
    }
}

const getTime = () => { return parseFloat(timeNode.dataset.time); }
const decrementTime = () => { setTime(getTime() - 1); }

const startTimer = () => 
{ 
    timeNode.dataset.starttime = getTime().toString();
    interval = setInterval(decrementTime, 1000); 
    displayTime();
}

const stopTimer = () =>
{ 
    clearInterval(interval); 
    interval = null;
    displayTime();
}

const resetTimer = () => { setTime(timeNode.dataset.starttime); }

buttonStart.addEventListener("click", startTimer);
buttonStop.addEventListener("click", stopTimer);
buttonReset.addEventListener("click", resetTimer);

for(const btn of commonButtons)
{
    btn.addEventListener("click", () => {
        setTime(btn.dataset.time);
    })
}

let scrubPos = null;
let scrubbing = false;
const scrubSensitivity = 0.5;

const getPosFromEvent = (ev) =>
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

const scrubStart = (ev) =>
{
    scrubPos = getPosFromEvent(ev);
    scrubbing = true;
    ev.preventDefault();
    return false;
}

const scrubProgress = (ev) =>
{
    if(!scrubbing) { return; }
    let newScrubPos = getPosFromEvent(ev);
    let delta = (newScrubPos.x - scrubPos.x)*scrubSensitivity;
    scrubPos = newScrubPos;
    setTime(getTime() + delta);
    ev.preventDefault();
    return false;
}

const scrubEnd = (ev) =>
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