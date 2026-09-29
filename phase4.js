// --- CONFIGURATION ---
const APOD_ANSWER = "pillars of creation";
const CORRECT_CODE_1 = "aurora";
const CORRECT_CODE_2 = "ursa";
const CORRECT_CODE_3 = "omega_protocol";

let timerInterval;
let timeLeft = 180;
let bombDefused = false;

// --- DOM LOGIC ---

// 1. APOD Security Lock (Centered Immersive Terminal)
document.getElementById('btn-unlock-apod').addEventListener('click', () => {
    const input = document.getElementById('apod-input').value.toLowerCase().trim();
    if (input === APOD_ANSWER) {
        document.getElementById('apod-error').classList.add('hidden');
        triggerGlitchTransition();
    } else {
        document.getElementById('apod-error').classList.remove('hidden');
    }
});

// Also allow hitting 'Enter' to submit
document.getElementById('apod-input').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') document.getElementById('btn-unlock-apod').click();
});

function triggerGlitchTransition() {
    const glitch = document.getElementById('glitch-screen');
    document.body.classList.add('animate-glitch', 'brightness-150');
    glitch.style.opacity = '1';

    setTimeout(() => {
        document.body.classList.remove('animate-glitch', 'brightness-150');
        glitch.style.opacity = '0';

        document.getElementById('scene-apod-lock').classList.add('hidden');
        document.getElementById('scene-core').classList.remove('hidden');
        document.getElementById('scene-core').classList.add('flex');

        startCountdown();
    }, 1500);
}

// 2. Reveal Code on Sun Core Click
document.getElementById('orb-hitbox').addEventListener('click', () => {
    document.getElementById('hidden-code-3').classList.remove('hidden');
});

// 3. Hacking Terminal Navigation
document.getElementById('orbiting-bomb').addEventListener('click', () => {
    document.getElementById('hacking-terminal').classList.remove('hidden');
});

document.getElementById('btn-close-terminal').addEventListener('click', () => {
    document.getElementById('hacking-terminal').classList.add('hidden');
});

// 4. Defusal Validation
document.getElementById('btn-defuse').addEventListener('click', () => {
    const c1 = document.getElementById('code-1').value.toLowerCase().trim();
    const c2 = document.getElementById('code-2').value.toLowerCase().trim();
    const c3 = document.getElementById('code-3').value.toLowerCase().trim();

    if (c1 === CORRECT_CODE_1 && c2 === CORRECT_CODE_2 && c3 === CORRECT_CODE_3) {
        bombDefused = true;
        document.getElementById('hacking-terminal').classList.add('hidden');

        // Update the Static Timer UI & its Boundary Box
        const timer = document.getElementById('bomb-timer');
        const boundary = document.getElementById('timer-boundary');

        timer.innerText = "DEFUSED";
        timer.classList.remove('text-danger', 'text-4xl', 'drop-shadow-[0_0_12px_rgba(255,42,42,0.9)]');
        timer.classList.add('text-green-500', 'text-2xl', 'drop-shadow-[0_0_15px_rgba(34,197,94,0.8)]');

        boundary.classList.replace('border-danger', 'border-green-500');
        boundary.classList.replace('bg-red-950/50', 'bg-green-950/50');
        boundary.classList.replace('shadow-[inset_0_0_10px_rgba(255,0,0,0.2)]', 'shadow-[inset_0_0_10px_rgba(34,197,94,0.2)]');

        // Update the Orbiting Icon
        const icon = document.getElementById('bomb-icon');
        const label = document.getElementById('bomb-label');

        label.innerText = "NEUTRALIZED";
        label.classList.replace('text-danger', 'text-green-500');
        label.classList.remove('animate-pulse');

        icon.setAttribute('stroke', '#22c55e');
        icon.classList.replace('drop-shadow-[0_0_15px_rgba(255,42,42,1)]', 'drop-shadow-[0_0_15px_rgba(34,197,94,1)]');
        icon.querySelector('path[fill]').setAttribute('fill', '#22c55e');

        triggerEndingDialogue();
    } else {
        document.getElementById('defuse-error').classList.remove('hidden');
    }
});

// 5. Timer and Explosion Mechanics
function startCountdown() {
    const display = document.getElementById('bomb-timer');
    timerInterval = setInterval(() => {
        if (bombDefused) { clearInterval(timerInterval); return; }
        timeLeft--;
        display.innerText = timeLeft;

        if (timeLeft < 30) {
            display.classList.toggle('opacity-50');
        }

        if (timeLeft <= 0) {
            clearInterval(timerInterval);
            triggerFailState();
        }
    }, 1000);
}

function triggerFailState() {
    document.getElementById('hacking-terminal').classList.add('hidden');
    document.body.classList.add('critical-shake');

    // Inject the final explosion screen dynamically
    setTimeout(() => {
        document.body.innerHTML = `
            <div class="fixed inset-0 bg-white z-[9999] flex flex-col items-center justify-center animate-[fadeToBlack_3s_forwards]">
                <h1 class="text-black text-6xl md:text-8xl font-black tracking-tighter uppercase mb-4">MISSION FAILED</h1>
                <p class="text-black text-2xl md:text-3xl font-bold tracking-widest">ASTERIA IS LOST.</p>
            </div>
        `;
        const style = document.createElement('style');
        style.innerHTML = `@keyframes fadeToBlack { 0% { background: white; } 30% { background: #ff2a2a; } 100% { background: #050505; } }`;
        document.head.appendChild(style);
    }, 1000);
}

// 6. Story Resolution (Now Centered)
function triggerEndingDialogue() {
    const box = document.getElementById('ending-dialogue');
    const text = document.getElementById('dialogue-text');
    box.classList.remove('hidden');

    const msg = "This bomb wasn't the doing of Cosmo Polo... what is happening? Why is mission control trying to destroy the Harmony?";
    let i = 0;

    function typeWriter() {
        if (i < msg.length) {
            text.innerHTML += msg.charAt(i);
            i++;
            setTimeout(typeWriter, 40);
        } else {
            setTimeout(() => {
                alert("Proceeding to Phase 5: Singularity");
                // In your final SPA, call your state transition function here
            }, 4000);
        }
    }
    typeWriter();
}