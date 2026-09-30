const loginForm = document.getElementById('login-form');
const signupForm = document.getElementById('signup-form');
const loginSection = document.getElementById('login-section');
const signupSection = document.getElementById('signup-section');
const targetText = document.getElementById('target-text');

// Toggle between login and recruitment forms.
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

function handleAuthSuccess(player) {
  sessionStorage.setItem('asteria_player', JSON.stringify(player));
  document.querySelector('.terminal-container').classList.add('hidden');
  document.querySelectorAll('.agent-name').forEach((element) => {
    element.textContent = player.username;
  });
  document.getElementById('mission-modal').classList.remove('hidden');
}

function showError(message) {
  targetText.textContent = `// ERROR: ${message}`;
  targetText.classList.remove('hidden');
  targetText.style.color = 'red';
}

function getApiBase() {
  const page = new URL(window.location.href);
  if (page.protocol === 'file:') return 'http://localhost:3000';
  if (page.port === '3000') return '';

  if (['localhost', '127.0.0.1', '::1'].includes(page.hostname)) {
    return `${page.protocol}//${page.hostname}:3000`;
  }

  const codespacesHost = page.hostname.match(/^(.*)-\d+(\.app\.github\.dev)$/);
  if (codespacesHost) return `${page.protocol}//${codespacesHost[1]}-3000${codespacesHost[2]}`;

  return '';
}

async function submitAuthForm(form, endpoint) {
  const apiBase = getApiBase();
  const apiUrl = `${apiBase}${endpoint}`;

  try {
    const username = form.querySelector('input[type="text"]').value.trim();
    const password = form.querySelector('input[type="password"]').value;
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });
    const data = await response.json();

    if (response.ok && data.player) {
      handleAuthSuccess(data.player);
    } else {
      showError(data.error || 'Authentication failed.');
    }
  } catch (error) {
    showError(`Backend not reachable at ${apiBase || window.location.origin}. Run the app with npm start on port 3000.`);
  }
}

loginForm.addEventListener('submit', (event) => {
  event.preventDefault();
  submitAuthForm(loginForm, '/api/login');
});

signupForm.addEventListener('submit', (event) => {
  event.preventDefault();
  submitAuthForm(signupForm, '/api/signup');
});

// NASA APOD image is supplemental; the anomaly puzzle remains available if NASA is offline.
async function loadNASAImage() {
  const apodImage = document.getElementById('apodImage');
  const nasaStatus = document.getElementById('nasa-status');
  const fallbackImage = 'https://images-assets.nasa.gov/image/PIA04241/PIA04241~orig.jpg';
  let usingFallback = true;

  apodImage.alt = 'Pillars of Creation in the Eagle Nebula';
  apodImage.src = fallbackImage;
  apodImage.onerror = () => {
    if (!usingFallback) {
      usingFallback = true;
      apodImage.src = fallbackImage;
      nasaStatus.textContent = 'Live astronomy image unavailable; showing the Pillars of Creation reference image.';
      return;
    }
    nasaStatus.textContent = 'Astronomy image could not be loaded. Slider answer remains brightness 125%, contrast 150%, hue 210°.';
  };

  try {
    nasaStatus.textContent = 'CONNECTING TO NASA…';
    const response = await fetch('https://api.nasa.gov/planetary/apod?api_key=DEMO_KEY');
    if (!response.ok) throw new Error('NASA APOD request failed.');

    const data = await response.json();
    if (data.media_type !== 'image' || !(data.hdurl || data.url)) {
      nasaStatus.textContent = 'NASA returned a non-image APOD today; anomaly controls remain available.';
      return;
    }

    apodImage.src = data.hdurl || data.url;
    usingFallback = false;
    apodImage.alt = `NASA Astronomy Picture of the Day: ${data.title || 'Astronomy image'}`;
    nasaStatus.textContent = `NASA APOD: ${data.title || 'Image'} | ${data.date || ''}`;
  } catch (error) {
    console.warn('NASA APOD could not be loaded:', error);
    nasaStatus.textContent = 'NASA connection unavailable; anomaly controls remain available.';
  }
}

loadNASAImage();

document.getElementById('accept-btn').addEventListener('click', () => {
  let player = null;
  try {
    player = JSON.parse(sessionStorage.getItem('asteria_player') || 'null');
  } catch (error) {
    player = null;
  }

  document.getElementById('mission-modal').classList.add('hidden');
  if (!player || Number(player.currentLevel) < 3) {
    window.location.href = 'phase2.html';
    return;
  }

  activatePhase3(player);
});

document.getElementById('decline-btn').addEventListener('click', () => {
  document.getElementById('mission-modal').classList.add('hidden');
  document.getElementById('decline-screen').classList.remove('hidden');
});
