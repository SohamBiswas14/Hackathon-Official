const auroraPlanets = {
  alpha: {
    name: 'Planet Alpha',
    clue: 'Signal fragment 1/3: PITCH is 8. The anomaly brightness is 125%.',
  },
  beta: {
    name: 'Planet Beta',
    clue: 'Signal fragment 2/3: AMPLITUDE is 7. The anomaly contrast is 150%.',
  },
  gamma: {
    name: 'Planet Gamma',
    clue: 'Signal fragment 3/3: NOISE is 2. The anomaly hue is 210°. The time code reads hour : noise : amplitude.',
  },
};

const auroraTarget = { pitch: 8, amplitude: 7, noise: 2 };
const anomalyTarget = { brightness: 125, contrast: 150, hue: 210 };
const auroraPhase = document.getElementById('phase-3');
const auroraMessage = document.getElementById('aurora-message');
const auroraClues = document.getElementById('aurora-clues');
const timeInput = document.getElementById('timeInput');
const timeCodeMessage = document.getElementById('time-code-message');
const decodeTimeButton = document.getElementById('decodeTime');
const pitchKnob = document.getElementById('pitchKnob');
const amplitudeKnob = document.getElementById('amplitudeKnob');
const noiseKnob = document.getElementById('noiseKnob');
const phase3Complete = document.getElementById('phase3-complete');
const phase3SaveStatus = document.getElementById('phase3-save-status');
const retryPhaseSave = document.getElementById('retry-phase-save');
const nasaSection = document.getElementById('nasa-clue');
const nasaClueMessage = document.getElementById('nasa-clue-message');
const brightnessSlider = document.getElementById('brightness');
const contrastSlider = document.getElementById('contrast');
const hueSlider = document.getElementById('hue');
const inputCanvas = document.getElementById('inputWave');
const outputCanvas = document.getElementById('outputWave');

let activePlayer = null;
let phase3Progress = null;
let waveAnimationStarted = false;
let isSavingPhase = false;

function getCurrentPlayer() {
  try {
    return JSON.parse(sessionStorage.getItem('asteria_player') || 'null');
  } catch (error) {
    return null;
  }
}

function createEmptyProgress() {
  return { planets: [], timeDecoded: false, radioDecoded: false, completed: false };
}

function progressStorageKey(username) {
  return `asteria_phase3_${encodeURIComponent(username)}`;
}

function loadPhase3Progress(username) {
  try {
    const stored = JSON.parse(localStorage.getItem(progressStorageKey(username)) || 'null');
    if (!stored || typeof stored !== 'object') return createEmptyProgress();

    return {
      ...createEmptyProgress(),
      ...stored,
      planets: Array.isArray(stored.planets)
        ? stored.planets.filter((planet) => Object.hasOwn(auroraPlanets, planet))
        : [],
    };
  } catch (error) {
    return createEmptyProgress();
  }
}

function savePhase3Progress() {
  if (!activePlayer || !phase3Progress) return;
  try {
    localStorage.setItem(progressStorageKey(activePlayer.username), JSON.stringify(phase3Progress));
  } catch (error) {
    console.warn('Aurora puzzle progress could not be saved locally.', error);
  }
}

function setControlsEnabled(enabled) {
  [pitchKnob, amplitudeKnob, noiseKnob, timeInput, decodeTimeButton].forEach((control) => {
    control.disabled = !enabled;
  });
  [brightnessSlider, contrastSlider, hueSlider].forEach((control) => {
    control.disabled = !phase3Progress.radioDecoded;
  });
}

function refreshAuroraProgress() {
  const found = new Set(phase3Progress.planets);
  document.querySelectorAll('.planet').forEach((planet) => {
    planet.classList.toggle('scanned', found.has(planet.dataset.planet));
  });

  auroraClues.replaceChildren();
  phase3Progress.planets.forEach((key) => {
    const clue = document.createElement('li');
    clue.textContent = auroraPlanets[key].clue;
    auroraClues.appendChild(clue);
  });

  const allPlanetsScanned = phase3Progress.planets.length === Object.keys(auroraPlanets).length;
  setControlsEnabled(allPlanetsScanned);

  if (!allPlanetsScanned) {
    auroraMessage.textContent = `Scan the planets to collect all signal fragments (${phase3Progress.planets.length}/3).`;
  } else {
    auroraMessage.textContent = 'All fragments recovered. Enter the time code, then tune the signal.';
  }

  if (phase3Progress.timeDecoded) {
    timeInput.value = '08:27';
    timeCodeMessage.textContent = 'TIME CODE ACCEPTED — signal controls synchronized.';
  }

  if (phase3Progress.radioDecoded) {
    nasaSection.classList.remove('hidden');
    nasaClueMessage.textContent = 'Anomaly coordinates recovered. Set brightness to 125%, contrast to 150%, and hue to 210°.';
  }

  if (phase3Progress.completed) {
    phase3Complete.classList.remove('hidden');
    retryPhaseSave.classList.toggle('hidden', Number(activePlayer.currentLevel) >= 4);
  }
}

function activatePhase3(player) {
  const currentLevel = Number(player?.currentLevel);
  if (!player || !Number.isFinite(currentLevel) || currentLevel < 3) {
    document.getElementById('aurora-lock').textContent = '🔒 PHASE 3 LOCKED — COMPLETE THE PREVIOUS PHASES';
    return;
  }

  activePlayer = player;
  phase3Progress = loadPhase3Progress(player.username);
  document.querySelector('.terminal-container').classList.add('hidden');
  auroraPhase.classList.remove('hidden');
  document.getElementById('aurora-lock').textContent = currentLevel >= 4
    ? 'SYSTEM AURORA CLEARED'
    : 'PHASE 3 ACTIVE';

  if (currentLevel >= 4) {
    phase3Progress.completed = true;
    phase3Progress.planets = Object.keys(auroraPlanets);
    phase3Progress.timeDecoded = true;
    phase3Progress.radioDecoded = true;
    pitchKnob.value = auroraTarget.pitch;
    amplitudeKnob.value = auroraTarget.amplitude;
    noiseKnob.value = auroraTarget.noise;
    brightnessSlider.value = anomalyTarget.brightness;
    contrastSlider.value = anomalyTarget.contrast;
    hueSlider.value = anomalyTarget.hue;
    updateKnobReadouts();
    updateNASAFilter();
    savePhase3Progress();
    phase3SaveStatus.textContent = 'Mission progress is saved to your player profile.';
    retryPhaseSave.classList.add('hidden');
  }

  refreshAuroraProgress();
  startWaveAnimation();
  if (phase3Progress.completed && currentLevel === 3) {
    savePhase3Completion();
  }
  auroraPhase.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function scanPlanet(planetKey) {
  if (!phase3Progress || !Object.hasOwn(auroraPlanets, planetKey)) return;

  if (!phase3Progress.planets.includes(planetKey)) {
    phase3Progress.planets.push(planetKey);
    savePhase3Progress();
  }

  refreshAuroraProgress();
}

document.querySelectorAll('.planet').forEach((planet) => {
  planet.addEventListener('click', () => scanPlanet(planet.dataset.planet));
});

decodeTimeButton.addEventListener('click', () => {
  if (!phase3Progress || phase3Progress.planets.length !== 3) return;

  if (timeInput.value !== '08:27') {
    timeCodeMessage.textContent = 'TIME CODE REJECTED — combine the fragments as hour : noise : amplitude.';
    return;
  }

  const [hour, minute] = timeInput.value.split(':');
  pitchKnob.value = Number(hour);
  noiseKnob.value = Number(minute[0]);
  amplitudeKnob.value = Number(minute[1]);
  phase3Progress.timeDecoded = true;
  savePhase3Progress();
  updateKnobReadouts();
  checkRadioSignal();
  refreshAuroraProgress();
});

function updateKnobReadouts() {
  document.getElementById('pitchValue').textContent = pitchKnob.value;
  document.getElementById('amplitudeValue').textContent = amplitudeKnob.value;
  document.getElementById('noiseValue').textContent = noiseKnob.value;
}

function checkRadioSignal() {
  if (!phase3Progress || !phase3Progress.timeDecoded || phase3Progress.radioDecoded) return;

  const matches = Number(pitchKnob.value) === auroraTarget.pitch
    && Number(amplitudeKnob.value) === auroraTarget.amplitude
    && Number(noiseKnob.value) === auroraTarget.noise;

  if (!matches) {
    timeCodeMessage.textContent = 'Signal not synchronized. Use the three planetary fragments to tune each control.';
    return;
  }

  phase3Progress.radioDecoded = true;
  savePhase3Progress();
  nasaSection.classList.remove('hidden');
  [brightnessSlider, contrastSlider, hueSlider].forEach((control) => { control.disabled = false; });
  nasaClueMessage.textContent = 'Anomaly coordinates recovered. Set brightness to 125%, contrast to 150%, and hue to 210°.';
  nasaSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

[pitchKnob, amplitudeKnob, noiseKnob].forEach((control) => {
  control.addEventListener('input', () => {
    updateKnobReadouts();
    checkRadioSignal();
  });
});

[brightnessSlider, contrastSlider, hueSlider].forEach((control) => {
  control.addEventListener('input', checkNASAAnomaly);
});

function checkNASAAnomaly() {
  if (!phase3Progress || !phase3Progress.radioDecoded || phase3Progress.completed) return;

  const matches = Number(brightnessSlider.value) === anomalyTarget.brightness
    && Number(contrastSlider.value) === anomalyTarget.contrast
    && Number(hueSlider.value) === anomalyTarget.hue;

  if (matches) {
    phase3Progress.completed = true;
    savePhase3Progress();
    phase3Complete.classList.remove('hidden');
    retryPhaseSave.classList.add('hidden');
    phase3SaveStatus.textContent = 'Anomaly calibrated. Saving mission progress…';
    savePhase3Completion();
  }
}

async function savePhase3Completion() {
  if (isSavingPhase || !phase3Progress?.completed || !activePlayer) return;

  if (Number(activePlayer.currentLevel) >= 4) {
    phase3SaveStatus.textContent = 'Mission progress is saved to your player profile.';
    retryPhaseSave.classList.add('hidden');
    return;
  }

  if (Number(activePlayer.currentLevel) !== 3) {
    phase3SaveStatus.textContent = 'Puzzle solved, but the profile is not at Phase 3. Sign in again to sync progress.';
    retryPhaseSave.classList.remove('hidden');
    return;
  }

  isSavingPhase = true;
  retryPhaseSave.classList.add('hidden');
  phase3SaveStatus.textContent = 'Saving mission progress…';

  try {
    const response = await fetch(`${BASE_URL}/api/game/advance-phase`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: activePlayer.username }),
    });
    const result = await response.json();

    if (!response.ok) throw new Error(result.error || 'Progress save failed.');

    activePlayer.currentLevel = Number(result.newLevel) || 4;
    activePlayer.currentLocation = result.newLocation || 'Abyssal Void';
    sessionStorage.setItem('asteria_player', JSON.stringify(activePlayer));
    savePhase3Progress();
    document.getElementById('aurora-lock').textContent = 'SYSTEM AURORA CLEARED';
    phase3SaveStatus.textContent = 'Phase 3 complete — progress saved to your player profile.';
  } catch (error) {
    console.error('Could not save Phase 3 completion:', error);
    phase3SaveStatus.textContent = 'Puzzle solved, but the server could not save progress. Check your connection and retry.';
    retryPhaseSave.classList.remove('hidden');
  } finally {
    isSavingPhase = false;
  }
}

retryPhaseSave.addEventListener('click', savePhase3Completion);

function updateNASAFilter() {
  document.getElementById('apodImage').style.filter = `brightness(${brightnessSlider.value}%) contrast(${contrastSlider.value}%) hue-rotate(${hueSlider.value}deg)`;
}

[brightnessSlider, contrastSlider, hueSlider].forEach((control) => {
  control.addEventListener('input', updateNASAFilter);
});

function resizeSignalCanvases() {
  [inputCanvas, outputCanvas].forEach((canvas) => {
    const rect = canvas.getBoundingClientRect();
    const pixelRatio = window.devicePixelRatio || 1;
    canvas.width = Math.max(1, Math.round(rect.width * pixelRatio));
    canvas.height = Math.max(1, Math.round(rect.height * pixelRatio));
    const context = canvas.getContext('2d');
    context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
  });
}

function drawSignalWaves() {
  if (auroraPhase.classList.contains('hidden')) {
    requestAnimationFrame(drawSignalWaves);
    return;
  }

  const inputContext = inputCanvas.getContext('2d');
  const outputContext = outputCanvas.getContext('2d');
  const width = inputCanvas.getBoundingClientRect().width;
  const height = inputCanvas.getBoundingClientRect().height;
  const time = performance.now() / 1000;
  const pitch = Number(pitchKnob.value);
  const amplitude = Number(amplitudeKnob.value) * 6;
  const noiseLevel = Number(noiseKnob.value);

  inputContext.clearRect(0, 0, width, height);
  outputContext.clearRect(0, 0, width, height);
  inputContext.fillStyle = '#050505';
  inputContext.fillRect(0, 0, width, height);
  outputContext.fillStyle = '#050505';
  outputContext.fillRect(0, 0, width, height);

  inputContext.beginPath();
  outputContext.beginPath();
  for (let x = 0; x < width; x += 1) {
    const noisyY = height / 2 + Math.sin(x * 0.04 + time) * 35
      + (Math.random() - 0.5) * noiseLevel * 12;
    const tunedY = height / 2 + amplitude * Math.sin(x * (pitch * 0.01) + time);
    if (x === 0) {
      inputContext.moveTo(x, noisyY);
      outputContext.moveTo(x, tunedY);
    } else {
      inputContext.lineTo(x, noisyY);
      outputContext.lineTo(x, tunedY);
    }
  }
  inputContext.strokeStyle = '#ff4258';
  inputContext.lineWidth = 2;
  inputContext.stroke();
  outputContext.strokeStyle = phase3Progress?.radioDecoded ? '#00ffcc' : '#00ff00';
  outputContext.lineWidth = 3;
  outputContext.stroke();
  requestAnimationFrame(drawSignalWaves);
}

function startWaveAnimation() {
  if (waveAnimationStarted) return;
  waveAnimationStarted = true;
  resizeSignalCanvases();
  drawSignalWaves();
  window.addEventListener('resize', resizeSignalCanvases);
}

const initialPlayer = getCurrentPlayer();
if (initialPlayer && Number(initialPlayer.currentLevel) >= 3) {
  activatePhase3(initialPlayer);
}
