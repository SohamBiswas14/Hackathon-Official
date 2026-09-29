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

  // FIXED: Targeting the exact IDs from your index.html
  document.getElementById('agent-name-display').textContent = player.username;
  document.getElementById('agent-name-display-2').textContent = player.username;

  const missionModal = document.getElementById('mission-modal');
  missionModal.classList.remove('hidden');

  // FIXED: Button IDs match the HTML
  document.getElementById('btn-accept').addEventListener('click', () => {
    const button = document.getElementById('btn-accept');
    button.innerText = '[ INITIATING PHASE 2... ]';

    setTimeout(() => {
      missionModal.classList.add('hidden');
      console.log('Proceeding to Phase 2...');
      // Phase 2 redirect will go here
    }, 5000);
  });

  // FIXED: Button IDs match the HTML
  document.getElementById('btn-decline').addEventListener('click', () => {
    missionModal.classList.add('hidden');
    document.getElementById('decline-screen').classList.remove('hidden');
  });
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