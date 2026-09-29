const container = document.getElementById('canvas-container');

// 1. Core Three.js Setup (Scene, Camera, Renderer)
const scene = new THREE.Scene();
// 75 degree field of view, matching browser aspect ratio
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 50; // Pull the camera back so we can see the stars

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
// Inject the 3D canvas into our HTML container
container.appendChild(renderer.domElement);

// 2. Generate the Starry Background
const starsGeometry = new THREE.BufferGeometry();
const starsCount = 2000;
const posArray = new Float32Array(starsCount * 3);

// Create 2000 random X, Y, Z coordinates
for(let i = 0; i < starsCount * 3; i++) {
    posArray[i] = (Math.random() - 0.5) * 200; 
}

starsGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
// Make the stars small and white
const starsMaterial = new THREE.PointsMaterial({ size: 0.15, color: 0xffffff });
const starMesh = new THREE.Points(starsGeometry, starsMaterial);
scene.add(starMesh);

// 3. Animation Loop (Keeps the scene rendering every frame)
function animate() {
    requestAnimationFrame(animate);
    
    // Slowly rotate the entire star field for a cool space effect
    starMesh.rotation.y += 0.0003;
    starMesh.rotation.x += 0.0001;

    renderer.render(scene, camera);
}
animate();

// 4. Handle Window Resizing
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});
// --- INVENTORY & UI LOGIC ---
// --- INTERACTIVE CONSTELLATION (BIG DIPPER) ---
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
const interactiveStars = [];
const selectedStars = [];
const drawnLines = [];

// 1. GENERATE RETRO PIXEL STAR TEXTURE
function createStarTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 16;
    canvas.height = 16;
    const ctx = canvas.getContext('2d');
    
    // Draw the 4-point cross shape from your reference image
    ctx.fillStyle = '#ffcc00'; // Main yellow
    ctx.fillRect(6, 6, 4, 4);  // Center
    ctx.fillRect(7, 2, 2, 4);  // Top point
    ctx.fillRect(7, 10, 2, 4); // Bottom point
    ctx.fillRect(2, 7, 4, 2);  // Left point
    ctx.fillRect(10, 7, 4, 2); // Right point
    
    // Inner bright core
    ctx.fillStyle = '#ffff66';
    ctx.fillRect(7, 7, 2, 2);

    const texture = new THREE.CanvasTexture(canvas);
    texture.magFilter = THREE.NearestFilter; // Keeps the edges pixelated and crisp
    return texture;
}

const starTexture = createStarTexture();
const baseMaterial = new THREE.SpriteMaterial({ 
    map: starTexture, 
    color: 0xffffff, 
    transparent: true 
});
// 2. WIDE-SPAN COORDINATES (Spanning the entire camera view)
const starCoords = [
    // The 7 Big Dipper Stars (Stretched across the screen)
    new THREE.Vector3(60, 25, -20),   
    new THREE.Vector3(45, -5, -20),    
    new THREE.Vector3(15, -12, -20),   
    new THREE.Vector3(3, 18, -20),   
    new THREE.Vector3(-22, 13, -20),  
    new THREE.Vector3(-45, 2, -20),  
    new THREE.Vector3(-67, -17, -20),
    
    // 18 Decoy Stars pushed into the corners and empty edges
    new THREE.Vector3(85, 40, -20),   // Top Right corner
    new THREE.Vector3(75, -35, -20),  // Bottom Right corner
    new THREE.Vector3(90, 5, -20),    // Far Right edge
    new THREE.Vector3(-85, 40, -20),  // Top Left corner
    new THREE.Vector3(-75, -40, -20), // Bottom Left corner
    new THREE.Vector3(-88, -5, -20),  // Far Left edge
    new THREE.Vector3(10, 45, -20),   // Top Center
    new THREE.Vector3(25, -45, -20),  // Bottom Center
    new THREE.Vector3(-40, 45, -20),  // Top Mid-Left
    new THREE.Vector3(-30, -40, -20), // Bottom Mid-Left
    new THREE.Vector3(40, 45, -20),   // Top Mid-Right
    new THREE.Vector3(60, -30, -20),  // Bottom Mid-Right
    new THREE.Vector3(-10, -35, -20), // Lower Middle
    new THREE.Vector3(-60, 30, -20),  // Upper Left filler
    new THREE.Vector3(-20, -20, -20), // Center Left filler
    new THREE.Vector3(30, 10, -20),   // Center Right filler
    new THREE.Vector3(-10, 5, -20),   // Center filler
    new THREE.Vector3(-50, -25, -20)  // Lower Left filler
];

// 3. RENDER SPRITES
starCoords.forEach((pos, index) => {
    // Using Sprites instead of spheres for the retro 2D look
    const star = new THREE.Sprite(baseMaterial.clone());
    star.position.copy(pos);
    star.scale.set(4, 4, 1); // Size of the star
    
    star.userData.isDipper = index < 7;
    // Randomize twinkling rhythm for each star
    star.userData.twinkleSpeed = Math.random() * 0.003 + 0.0015; 
    star.userData.twinkleOffset = Math.random() * Math.PI * 2;
    
    scene.add(star);
    interactiveStars.push(star);
});

const lineMaterial = new THREE.LineBasicMaterial({ color: 0x00ff00, linewidth: 2 });
// 4. TWINKLING ANIMATION LOOP
function animateConstellation() {
    requestAnimationFrame(animateConstellation);
    const time = Date.now();
    
    interactiveStars.forEach(star => {
        // Only twinkle if it hasn't been locked in/selected
        if (!selectedStars.includes(star)) {
            // Tightened the math: 0.875 ± 0.125 keeps opacity between 0.75 and 1.0
            star.material.opacity = 0.875 + 0.125 * Math.sin(time * star.userData.twinkleSpeed + star.userData.twinkleOffset);
        }
    });
}
animateConstellation();

// 5. HOVER EFFECTS
window.addEventListener('mousemove', (event) => {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    raycaster.setFromCamera(mouse, camera);
    
    const intersects = raycaster.intersectObjects(interactiveStars);
    document.body.style.cursor = intersects.length > 0 ? 'pointer' : 'default';
});
// 6. 2-STEP CLICK & COMPLETION LOGIC
let activeAnchor = null; // Stores the first star you click

window.addEventListener('click', (event) => {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    raycaster.setFromCamera(mouse, camera);
    
    const intersects = raycaster.intersectObjects(interactiveStars);

    if (intersects.length > 0) {
        const clickedStar = intersects[0].object;
        
        // STEP 1: If no star is currently selected, make this one the anchor
        if (activeAnchor === null) {
            activeAnchor = clickedStar;
            activeAnchor.material.color.setHex(0x00ffff); // Turn CYAN to show it is selected
            activeAnchor.material.opacity = 1.0;
        } 
        // CANCEL: If you click the same star again, deselect it
        else if (activeAnchor === clickedStar) {
            // Revert to green if it's already part of a completed line, otherwise white
            activeAnchor.material.color.setHex(selectedStars.includes(activeAnchor) ? 0x00ff00 : 0xffffff);
            activeAnchor = null;
        } 
        // STEP 2: If an anchor is set and you click a DIFFERENT star, draw a line!
        else {
            const points = [activeAnchor.position, clickedStar.position];
            const lineGeo = new THREE.BufferGeometry().setFromPoints(points);
            const line = new THREE.Line(lineGeo, lineMaterial);
            scene.add(line);
            drawnLines.push(line);
            
            // Add to selected array if they aren't already in it
            if (!selectedStars.includes(activeAnchor)) selectedStars.push(activeAnchor);
            if (!selectedStars.includes(clickedStar)) selectedStars.push(clickedStar);

            // Turn both stars neon green to confirm the connection
            activeAnchor.material.color.setHex(0x00ff00);
            clickedStar.material.color.setHex(0x00ff00);
            activeAnchor.material.opacity = 1.0;
            clickedStar.material.opacity = 1.0;

            // Reset the anchor so the next click starts a brand new line
            activeAnchor = null; 

            // PUZZLE CHECK: The Big Dipper requires 7 connected stars and 7 lines (to close the pan loop)
            if (selectedStars.length === 7 && drawnLines.length === 7) {
                const isCorrect = selectedStars.every(star => star.userData.isDipper);
                
                if (isCorrect) {
                    setTimeout(() => {
                        alert("Signal detected: [32.92, -56°78, 8e32]. Cosmic waves resemble a humanoid figure. Where to go?");
                        fetch('/api/game/advance-phase', { method: 'POST' })
                            .then(res => console.log("Warping to Phase 3..."))
                            .catch(err => console.error("Warp failed:", err));
                    }, 500); 
                } else {
                    console.log("Incorrect constellation detected.");
                }
            }
        }
    }
});
const actionMenu = document.getElementById('action-menu');
const btnUse = document.getElementById('btn-use');
const btnDrop = document.getElementById('btn-drop');
const deathScreen = document.getElementById('death-screen');

let selectedItem = null;

// 1. Show Use/Drop menu when an item is clicked
document.querySelectorAll('.inv-item').forEach(button => {
    button.addEventListener('click', (e) => {
        e.stopPropagation(); // Prevents the document click listener from immediately hiding the menu
        
        selectedItem = e.target.getAttribute('data-item');
        
        // Position the menu slightly above the clicked item
        const rect = e.target.getBoundingClientRect();
        actionMenu.style.left = `${rect.left}px`;
        actionMenu.style.top = `${rect.top - 90}px`; 
        
        actionMenu.classList.remove('hidden');
    });
});

// 2. Hide menu if the player clicks anywhere else on the screen
document.addEventListener('click', () => {
    actionMenu.classList.add('hidden');
});

// 3. Handle the "USE" action
btnUse.addEventListener('click', () => {
    if (selectedItem === 'poison') {
        // Trigger the instant death trap
        deathScreen.classList.remove('hidden');
    } else if (selectedItem === 'book') {
        console.log("Book logic incoming...");
        // We will wire up the binary puzzle here next
    } else {
        console.log(`System cannot process: ${selectedItem}`);
    }
});

// 4. Handle the "DROP" action (Dismisses the menu)
btnDrop.addEventListener('click', () => {
    actionMenu.classList.add('hidden');
});