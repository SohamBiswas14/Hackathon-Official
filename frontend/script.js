const loginSection = document.getElementById('login-section');
const signupSection = document.getElementById('signup-section');
const showSignupBtn = document.getElementById('show-signup');
const showLoginBtn = document.getElementById('show-login');
const loginForm = document.getElementById('login-form');
const targetText = document.getElementById('target-text');

// Click "CREATE_RECORD" to show Sign Up
showSignupBtn.addEventListener('click', () => {
    loginSection.classList.add('hidden');
    signupSection.classList.remove('hidden');
});

// Click "AUTHENTICATE" to show Login
showLoginBtn.addEventListener('click', () => {
    signupSection.classList.add('hidden');
    loginSection.classList.remove('hidden');
});

// Click "INITIATE_WARP" to reveal the secret text
loginForm.addEventListener('submit', (event) => {
    event.preventDefault(); // Stops the page from refreshing
    targetText.classList.remove('hidden'); // Removes the hidden class
});