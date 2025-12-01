console.log("SCRIPT LOADED");

var select = document.getElementById("songs");
var selectedValue = "ghost";

// Create audio element
let audio;
switch(selectedValue) {
    case "ghost": {
        audio = new Audio("goodForGhost.mp3");
        break;
    }
    case "bass": {
        audio = new Audio("demoBass.mp3");
        break;
    }
}

// Handle dropdown changes
select.addEventListener("change", function() {
    var selectedValue = select.value;
    console.log("Selected value:", selectedValue);

    // Pause current audio
    audio.pause();

    // Change source
    switch(selectedValue) {
        case "ghost":
            audio.src = "goodForGhost.mp3";
            break;
        case "bass":
            audio.src = "demoBass.mp3";
            break;
        case "morning":
            audio.src = "inTheMorning.mp3";
            break;
    }

    // Resume context and play
    if (audioCtx.state === "suspended") {
        audioCtx.resume();
    }
});

// Canvas setup
var canvas = document.getElementById("canvas");
var ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// Web Audio setup
var audioCtx = new (window.AudioContext || window.webkitAudioContext)();
var analyser = audioCtx.createAnalyser();

// Create media source once
var source = audioCtx.createMediaElementSource(audio);
source.connect(analyser);
analyser.connect(audioCtx.destination);

analyser.fftSize = 128;
var bufferLength = analyser.frequencyBinCount;
var dataArray = new Uint8Array(bufferLength);

// Animation function
function animate() {
    requestAnimationFrame(animate);

    analyser.getByteFrequencyData(dataArray);
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    drawVisualizer({
        ctx,
        canvas,
        bufferLength,
        dataArray
    });
}

const drawVisualizer = ({ ctx, canvas, bufferLength, dataArray }) => {
    const barWidth = canvas.width / bufferLength;
    let x = 0;

    for (let i = 0; i < bufferLength; i++) {
        const barHeight = dataArray[i] * 1.5;
        const red = Math.min(255, (i * barHeight) / 30);
        const green = Math.min(255, i * 5);
        const blue = Math.min(255, Math.max(0, barHeight / 4 - 12));
        ctx.fillStyle = `rgb(${red}, ${green}, ${blue})`;
        ctx.fillRect(canvas.width / 2 - x, canvas.height - barHeight, barWidth, barHeight);
        ctx.fillRect(canvas.width / 2 + x, canvas.height - barHeight, barWidth, barHeight);
        x += barWidth;
    }
};


// Button click
var startBtn = document.getElementById("startBtn");
startBtn.onclick = function() {
    console.log("START BUTTON CLICKED");

    // Resume audio context if suspended
    if (audioCtx.state === "suspended") {
        audioCtx.resume().then(function() {
            console.log("AudioContext resumed");
            audio.play();
            animate();
        });
    } else {
        audio.play();
        animate();
    }
};

var stopBtn = document.getElementById("stopBtn");
stopBtn.onclick = function () {
    console.log("STOP BUTTON CLICKED");
    console.log(`State: ${audioCtx.state}`)
    if (audioCtx.state === "running") {
        audio.pause();
        animate();
    }
}