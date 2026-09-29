// Base URL for your team lead's backend
const BASE_URL = 'https://probable-parakeet-r76x4xqjp979hw49-3000.app.github.dev';

const loginForm = document.getElementById('login-form');
const signupForm = document.getElementById('signup-form');
const loginSection = document.getElementById('login-section');
const signupSection = document.getElementById('signup-section');
const targetText = document.getElementById('target-text');

// Toggles
document.getElementById('show-signup').addEventListener('click', () => {
  loginSection.classList.add('hidden');
  signupSection.classList.remove('hidden');
  targetText.classList.add('hidden');
});

document.getElementById('show-login').addEventListener('click', () => {
  signupSection.classList.add('hidden');
  loginSection.classList.remove('hidden');
  targetText.classList.add('hidden');
});

// Success Handler
function handleAuthSuccess(player) {
  sessionStorage.setItem('asteria_player', JSON.stringify(player));
  document.querySelector('.terminal-container').classList.add('hidden');

    document.querySelectorAll('.agent-name').forEach((element) => {
        element.textContent = player.username;
    });

  const missionModal = document.getElementById('mission-modal');
  missionModal.classList.remove('hidden');
}

function showError(message) {
  targetText.textContent = `// ERROR: ${message}`;
  targetText.classList.remove('hidden');
  targetText.style.color = 'red';
}

// Fetch Logic
async function submitAuthForm(form, endpoint) {
  try {
    const username = form.querySelector('input[type="text"]').value;
    const password = form.querySelector('input[type="password"]').value;
    
    // FIXED: Appended the BASE_URL to the endpoint
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });
    
    const data = await response.json();

    if (response.ok && data.player) {
      handleAuthSuccess(data.player);
    } else {
      showError(data.error);
    }

  } catch (error) {
    showError('SINGULARITY INTERFERENCE: Backend not reachable.');
  }
}

// Form Listeners
loginForm.addEventListener('submit', (event) => {
  event.preventDefault();
  // Using the login endpoint you set up
  submitAuthForm(loginForm, '/api/login');
});

signupForm.addEventListener('submit', (event) => {
  event.preventDefault();
  // Using the signup endpoint you set up
  submitAuthForm(signupForm, '/api/signup');
});

document.getElementById('accept-btn').addEventListener('click', () => {
    document.getElementById('mission-modal').classList.add('hidden');
    document.getElementById('phase-3').classList.remove('hidden');
    document.getElementById('nasa-clue').classList.remove('hidden');
    document.getElementById('aurora-lock').textContent = 'PHASE 3 ACTIVE';
    document.getElementById('phase-3').scrollIntoView({ behavior: 'smooth' });
});

document.getElementById('decline-btn').addEventListener('click', () => {
    document.getElementById('mission-modal').classList.add('hidden');
    document.getElementById('decline-screen').classList.remove('hidden');
});

// ===============================
// PHASE 3 - SYSTEM AURORA
// ===============================

const phase3 = document.getElementById("phase-3");

if (phase3) {

    // ===============================
    // RADIO DECODER
    // ===============================

    const inputCanvas = document.getElementById("inputWave");
    const outputCanvas = document.getElementById("outputWave");

    const pitchKnob = document.getElementById("pitchKnob");
    const amplitudeKnob = document.getElementById("amplitudeKnob");
    const noiseKnob = document.getElementById("noiseKnob");

    const pitchValue = document.getElementById("pitchValue");
    const amplitudeValue = document.getElementById("amplitudeValue");
    const noiseValue = document.getElementById("noiseValue");

    const inputCtx = inputCanvas.getContext("2d");
    const outputCtx = outputCanvas.getContext("2d");

    // Target values for the correct signal.
    // These are frontend puzzle values for now.
    const targetPitch = 8;
    const targetAmplitude = 7;
    const targetNoise = 2;

    let animationTime = 0;


    // ===============================
    // DRAW WAVES
    // ===============================

    function drawWaves() {

        const width = inputCanvas.width;
        const height = inputCanvas.height;

        inputCtx.clearRect(0, 0, width, height);
        outputCtx.clearRect(0, 0, width, height);

        // Background
        inputCtx.fillStyle = "#050505";
        inputCtx.fillRect(0, 0, width, height);

        outputCtx.fillStyle = "#050505";
        outputCtx.fillRect(0, 0, width, height);


        // -------------------------------
        // MESSY RED INPUT SIGNAL
        // -------------------------------

        inputCtx.beginPath();

        for (let x = 0; x < width; x++) {

            const wave =
                Math.sin(
                    x * 0.04 +
                    animationTime
                ) * 35;

            const noise =
                (Math.random() - 0.5) *
                Number(noiseKnob.value) *
                12;

            const y =
                height / 2 +
                wave +
                noise;

            if (x === 0) {
                inputCtx.moveTo(x, y);
            } else {
                inputCtx.lineTo(x, y);
            }
        }

        inputCtx.strokeStyle = "red";
        inputCtx.lineWidth = 2;
        inputCtx.stroke();


        // -------------------------------
        // CLEAN GREEN OUTPUT SIGNAL
        // -------------------------------

        outputCtx.beginPath();

        const amplitude =
            Number(amplitudeKnob.value) * 6;

        const pitch =
            Number(pitchKnob.value);

        for (let x = 0; x < width; x++) {

            const y =
                height / 2 +
                amplitude *
                Math.sin(
                    x * (pitch * 0.01) +
                    animationTime
                );

            if (x === 0) {
                outputCtx.moveTo(x, y);
            } else {
                outputCtx.lineTo(x, y);
            }
        }

        outputCtx.strokeStyle = "#00ff00";
        outputCtx.lineWidth = 3;
        outputCtx.stroke();

        animationTime += 0.03;

        requestAnimationFrame(drawWaves);
    }


    // ===============================
    // UPDATE KNOB VALUES
    // ===============================

    function updateValues() {

        pitchValue.textContent = pitchKnob.value;
        amplitudeValue.textContent = amplitudeKnob.value;
        noiseValue.textContent = noiseKnob.value;

        checkSignal();
    }


    pitchKnob.addEventListener("input", updateValues);
    amplitudeKnob.addEventListener("input", updateValues);
    noiseKnob.addEventListener("input", updateValues);


    // ===============================
    // CHECK RADIO SIGNAL
    // ===============================

    function checkSignal() {

        const pitch =
            Number(pitchKnob.value);

        const amplitude =
            Number(amplitudeKnob.value);

        const noise =
            Number(noiseKnob.value);

        if (
            pitch === targetPitch &&
            amplitude === targetAmplitude &&
            noise === targetNoise
        ) {
            showAuroraCode();
        }
    }


    // ===============================
    // SUCCESS POPUP
    // ===============================

    let signalDecoded = false;

    function showAuroraCode() {

        if (signalDecoded) {
            return;
        }

        signalDecoded = true;

        alert("ALPHA-9-CORE");
    }


    // Start wave animation
    drawWaves();


    // ===============================
    // TIME CODE
    // ===============================

    const timeInput =
        document.getElementById("timeInput");

    const decodeTimeButton =
        document.getElementById("decodeTime");


    decodeTimeButton.addEventListener("click", function () {

        if (!timeInput.value) {
            alert("ENTER TIME");
            return;
        }

        const timeParts =
            timeInput.value.split(":");

        const hour =
            Number(timeParts[0]);

        const minutes =
            timeParts[1];

        const minuteTens = Number(minutes[0]);
        const minuteOnes = Number(minutes[1]);


        // Put the time digits into the three knobs

        pitchKnob.value = hour;
        amplitudeKnob.value = minuteOnes;
        noiseKnob.value = minuteTens;


        updateValues();

    });


    // ===============================
    // PLANET HOVER
    // ===============================

    const planets =
        document.querySelectorAll(".planet");


    planets.forEach(function (planet) {

        planet.addEventListener("mouseenter", function () {

            const planetName =
                planet.dataset.planet;

            planet.title = planetName;

        });

    });

}

// ===============================
// NASA APOD - CLUE D
// ===============================

const apodImage = document.getElementById("apodImage");
const nasaStatus = document.getElementById("nasa-status");

const brightnessSlider =
    document.getElementById("brightness");

const contrastSlider =
    document.getElementById("contrast");

const hueSlider =
    document.getElementById("hue");


async function loadNASAImage() {

    try {

        nasaStatus.textContent =
            "CONNECTING TO NASA...";

        const response = await fetch(
            "https://api.nasa.gov/planetary/apod?api_key=DEMO_KEY"
        );

        if (!response.ok) {
            throw new Error("NASA API request failed");
        }

        const data = await response.json();

        if (data.media_type !== "image") {

            nasaStatus.textContent =
                "NASA RETURNED NON-IMAGE DATA.";

            return;
        }

        apodImage.src =
            data.hdurl || data.url;

        nasaStatus.textContent =
            `NASA APOD: ${data.title} | ${data.date}`;

    }

    catch (error) {

        console.error("NASA API error:", error);

        nasaStatus.textContent =
            "NASA CONNECTION FAILED.";
    }
}


function updateNASAImage() {

    const brightness =
        brightnessSlider.value;

    const contrast =
        contrastSlider.value;

    const hue =
        hueSlider.value;

    apodImage.style.filter =
        `brightness(${brightness}%)
         contrast(${contrast}%)
         hue-rotate(${hue}deg)`;
}


brightnessSlider.addEventListener(
    "input",
    updateNASAImage
);

contrastSlider.addEventListener(
    "input",
    updateNASAImage
);

hueSlider.addEventListener(
    "input",
    updateNASAImage
);


loadNASAImage();

