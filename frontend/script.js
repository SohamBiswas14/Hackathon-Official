const loginSection = document.getElementById('login-section');
const signupSection = document.getElementById('signup-section');
const showLoginBtn = document.getElementById('show-login');
const loginForm = document.getElementById('login-form');
const targetText = document.getElementById('target-text');

if (showLoginBtn && loginSection && signupSection) {
  showLoginBtn.addEventListener('click', () => {
    signupSection.classList.add('hidden');
    loginSection.classList.remove('hidden');
  });
}

if (loginForm && targetText) {
  loginForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    const usernameInput = loginForm.querySelector('input[type="text"]')?.value || '';

    try {
      const response = await fetch('/api/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: usernameInput })
      });

      const data = await response.json();

      if (data.player) {
        sessionStorage.setItem('asteria_player', JSON.stringify(data.player));

        targetText.innerHTML = `// TARGET ACQUIRED: ${data.player.username} - LEVEL: ${data.player.currentLevel}`;
        targetText.classList.remove('hidden');
        targetText.style.color = '#0f0';
      }
    } catch (error) {
      console.error('Connection lost:', error);
      targetText.innerHTML = '// ERROR: SINGULARITY INTERFERENCE';
      targetText.classList.remove('hidden');
      targetText.style.color = 'red';
    }
  });
}