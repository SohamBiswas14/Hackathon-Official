// --- 1. THREE.JS WIREFRAME PLANET SETUP ---
const canvas = document.getElementById('webgl-canvas');
const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(0x000000, 0.02);

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

// The Asteria Core Mesh
const geometry = new THREE.SphereGeometry(12, 24, 24);
const material = new THREE.MeshBasicMaterial({
    color: 0x00ff00,
    wireframe: true,
    transparent: true,
    opacity: 0.15
});
const sphere = new THREE.Mesh(geometry, material);
scene.add(sphere);

camera.position.z = 25;

// Mouse Parallax Effect
let mouseX = 0;
let mouseY = 0;
document.addEventListener('mousemove', (e) => {
    mouseX = (e.clientX / window.innerWidth) * 2 - 1;
    mouseY = -(e.clientY / window.innerHeight) * 2 + 1;
});

function animate() {
    requestAnimationFrame(animate);
    sphere.rotation.y += 0.002; // Idle spin
    sphere.rotation.x += 0.001;

    // Smooth camera drift based on mouse
    camera.position.x += (mouseX * 3 - camera.position.x) * 0.05;
    camera.position.y += (mouseY * 3 - camera.position.y) * 0.05;
    camera.lookAt(scene.position);

    renderer.render(scene, camera);
}
animate();

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// --- 2. DYNAMIC TYPING EFFECT ---
const titleText = "ASTERIA_TERMINAL";
const subText = "SYS.OP: RECRUIT_739 // UPLINK_ESTABLISHED";

async function typeString(elementId, text, speed = 50) {
    const el = document.getElementById(elementId);
    el.innerHTML = '';
    for (let i = 0; i < text.length; i++) {
        el.innerHTML += text.charAt(i);
        // AUDIO HOOK: Play single keystroke sound here
        await new Promise(r => setTimeout(r, speed + Math.random() * 40));
    }
}

async function initTerminal() {
    // AUDIO HOOK: Play bg-drone audio here
    await typeString('title-text', titleText, 80);
    await new Promise(r => setTimeout(r, 400));
    await typeString('subtitle-text', subText, 30);

    document.getElementById('status-bar').classList.remove('hidden');
    document.getElementById('login-section').classList.remove('hidden');

    gsap.fromTo("#login-section", { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 1.5, ease: "power2.out" });
}
window.onload = initTerminal;

// --- 3. REACTIVE ENVIRONMENT ---
const inputField = document.getElementById('recruit-id');
inputField.addEventListener('input', () => {
    // Planet pulses to the rhythm of typing
    gsap.to(sphere.scale, { x: 1.05, y: 1.05, z: 1.05, duration: 0.1, yoyo: true, repeat: 1 });
    gsap.to(material, { opacity: 0.3, duration: 0.1, yoyo: true, repeat: 1 });
});

// --- 4. THE CINEMATIC WARP (GSAP) ---
const loginForm = document.getElementById('login-form');
loginForm.addEventListener('submit', (event) => {
    event.preventDefault();

    // AUDIO HOOK: Play sfx-warp (heavy bass drop) here

    // 1. Shatter & throw the UI backwards
    gsap.to("#terminal", {
        duration: 1.2,
        scale: 2,
        opacity: 0,
        rotationX: 30,
        rotationY: 15,
        ease: "power4.in"
    });

    // 2. Shift planet color to warp-speed blue and spin wildly
    gsap.to(material, { opacity: 1, color: 0x00f3ff, duration: 1 });
    gsap.to(sphere.rotation, { y: "+=5", x: "+=2", duration: 1.5, ease: "power2.in" });

    // 3. Camera dives straight into the core of the wireframe
    gsap.to(camera.position, {
        z: 0,
        duration: 1.5,
        ease: "power3.in",
        onComplete: () => {
            // Blinding flashbang transition
            const flash = document.createElement('div');
            flash.style.position = 'fixed';
            flash.style.inset = '0';
            flash.style.backgroundColor = '#00f3ff';
            flash.style.zIndex = '9999';
            document.body.appendChild(flash);

            setTimeout(() => {
                window.location.href = 'phase2.html'; // SPA Route Transition
            }, 300);
        }
    });
});