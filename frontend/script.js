const loginForm = document.getElementById('login-form');
const signupForm = document.getElementById('signup-form');
const loginSection = document.getElementById('login-section');
const signupSection = document.getElementById('signup-section');
const targetText = document.getElementById('target-text');

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

  document.querySelectorAll('.agent-name').forEach((span) => {
    span.textContent = player.username;
  });

  const missionModal = document.getElementById('mission-modal');
  missionModal.classList.remove('hidden');

  document.getElementById('accept-btn').addEventListener('click', () => {
    const button = document.getElementById('accept-btn');
    button.innerText = '[ INITIATING PHASE 2... ]';

    setTimeout(() => {
      missionModal.classList.add('hidden');
      console.log('Proceeding to Phase 2...');
    }, 5000);
  });

  document.getElementById('decline-btn').addEventListener('click', () => {
    missionModal.classList.add('hidden');
    document.getElementById('decline-screen').classList.remove('hidden');
  });
}

function showError(message) {
  targetText.textContent = `// ERROR: ${message}`;
  targetText.classList.remove('hidden');
  targetText.style.color = 'red';
}

async function submitAuthForm(form, endpoint) {
  try {
    const username = form.querySelector('input[type="text"]').value;
    const password = form.querySelector('input[type="password"]').value;
    const response = await fetch(endpoint, {
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
    showError('SINGULARITY INTERFERENCE');
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