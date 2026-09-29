window.addEventListener('DOMContentLoaded', () => {
    // --- 1. SCENE, CAMERA & RENDERER SETUP ---
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 50;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);

    renderer.domElement.style.position = 'fixed';
    renderer.domElement.style.top = '0';
    renderer.domElement.style.left = '0';
    renderer.domElement.style.zIndex = '0';
    document.body.appendChild(renderer.domElement);

    // --- 2. 3D VOLUMETRIC BACKGROUND STARFIELD ---
    const particleCount = 800;
    const particleGeometry = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount * 3; i += 3) {
        particlePositions[i] = (Math.random() - 0.5) * 400; // X width
        particlePositions[i + 1] = (Math.random() - 0.5) * 400; // Y height
        particlePositions[i + 2] = (Math.random() - 0.5) * 200 - 50; // True 3D Z depth spread
    }

    particleGeometry.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));

    const particleMaterial = new THREE.PointsMaterial({
        color: 0xffffff,
        size: 1.4,
        transparent: true,
        opacity: 0.8
    });

    const backgroundField = new THREE.Points(particleGeometry, particleMaterial);
    scene.add(backgroundField);

    // --- 3. RETRO PIXEL STAR TEXTURE ---
    function createStarTexture() {
        const canvas = document.createElement('canvas');
        canvas.width = 16;
        canvas.height = 16;
        const ctx = canvas.getContext('2d');

        ctx.clearRect(0, 0, 16, 16);

        ctx.fillStyle = '#ffcc00';
        ctx.fillRect(6, 6, 4, 4);
        ctx.fillRect(7, 2, 2, 4);
        ctx.fillRect(7, 10, 2, 4);
        ctx.fillRect(2, 7, 4, 2);
        ctx.fillRect(10, 7, 4, 2);

        ctx.fillStyle = '#ffffff';
        ctx.fillRect(7, 7, 2, 2);

        const texture = new THREE.CanvasTexture(canvas);
        texture.magFilter = THREE.NearestFilter;
        texture.minFilter = THREE.NearestFilter;
        return texture;
    }

    const starTexture = createStarTexture();
    const baseMaterial = new THREE.SpriteMaterial({
        map: starTexture,
        color: 0xffffff,
        transparent: true
    });

    // --- 4. CONSTELLATION DATA (7 Real + 18 Decoys) ---
    const interactiveStars = [];
    const selectedStars = [];
    const drawnLines = [];

    const starCoords = [
        // 7 True Big Dipper Stars
        new THREE.Vector3(60, 25, -20),
        new THREE.Vector3(45, -5, -20),
        new THREE.Vector3(15, -12, -20),
        new THREE.Vector3(3, 18, -20),
        new THREE.Vector3(-22, 13, -20),
        new THREE.Vector3(-45, 2, -20),
        new THREE.Vector3(-67, -17, -20),

        // 18 Decoys
        new THREE.Vector3(85, 40, -20), new THREE.Vector3(75, -35, -20),
        new THREE.Vector3(90, 5, -20), new THREE.Vector3(-85, 40, -20),
        new THREE.Vector3(-75, -40, -20), new THREE.Vector3(-88, -5, -20),
        new THREE.Vector3(10, 45, -20), new THREE.Vector3(25, -45, -20),
        new THREE.Vector3(-40, 45, -20), new THREE.Vector3(-30, -40, -20),
        new THREE.Vector3(40, 45, -20), new THREE.Vector3(60, -30, -20),
        new THREE.Vector3(-10, -35, -20), new THREE.Vector3(-60, 30, -20),
        new THREE.Vector3(-20, -20, -20), new THREE.Vector3(30, 10, -20),
        new THREE.Vector3(-10, 5, -20), new THREE.Vector3(-50, -25, -20)
    ];

    starCoords.forEach((pos, index) => {
        const star = new THREE.Sprite(baseMaterial.clone());
        star.position.copy(pos);
        star.scale.set(4, 4, 1);

        star.userData.isDipper = index < 7;

        // HIGHLIGHT THE BIG DIPPER IN CYAN FOR REFERENCE
        if (index < 7) {
            star.material.color.setHex(0x00ffff);
        }

        star.userData.twinkleSpeed = Math.random() * 0.003 + 0.0015;
        star.userData.twinkleOffset = Math.random() * Math.PI * 2;

        scene.add(star);
        interactiveStars.push(star);
    });

    const lineMaterial = new THREE.LineBasicMaterial({ color: 0x00ff00, linewidth: 2 });

    // --- 5. 3D ANIMATION & ROTATION LOOP ---
    let activeAnchor = null;

    function animateConstellation() {
        requestAnimationFrame(animateConstellation);
        const time = Date.now();

        // Gentle 3D spherical rotation for the background depth field
        backgroundField.rotation.x += 0.0003;
        backgroundField.rotation.y += 0.0005;

        // Twinkle interactive constellation stars
        interactiveStars.forEach(star => {
            if (!selectedStars.includes(star) && activeAnchor !== star) {
                star.material.opacity = 0.875 + 0.125 * Math.sin(time * star.userData.twinkleSpeed + star.userData.twinkleOffset);
            }
        });

        renderer.render(scene, camera);
    }
    animateConstellation();

    // --- 6. INTERACTION & RAYCASTING ---
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    window.addEventListener('mousemove', (event) => {
        mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
        raycaster.setFromCamera(mouse, camera);

        const intersects = raycaster.intersectObjects(interactiveStars);
        document.body.style.cursor = intersects.length > 0 ? 'pointer' : 'default';
    });

    window.addEventListener('click', (event) => {
        mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
        raycaster.setFromCamera(mouse, camera);

        const intersects = raycaster.intersectObjects(interactiveStars);

        if (intersects.length > 0) {
            const clickedStar = intersects[0].object;

            // Deselect active anchor
            if (activeAnchor === clickedStar) {
                const isConnected = drawnLines.some(d => d.starA === clickedStar || d.starB === clickedStar);
                activeAnchor.material.color.setHex(isConnected ? 0x00ff00 : (activeAnchor.userData.isDipper ? 0x00ffff : 0xffffff));
                activeAnchor = null;
            }
            // Undo last line
            else if (activeAnchor === null && drawnLines.length > 0 &&
                (drawnLines[drawnLines.length - 1].starA === clickedStar || drawnLines[drawnLines.length - 1].starB === clickedStar)) {

                const lastLineData = drawnLines.pop();
                scene.remove(lastLineData.line);

                const isStillConnected = (star) => drawnLines.some(d => d.starA === star || d.starB === star);

                if (!isStillConnected(lastLineData.starA)) {
                    lastLineData.starA.material.color.setHex(lastLineData.starA.userData.isDipper ? 0x00ffff : 0xffffff);
                    const indexA = selectedStars.indexOf(lastLineData.starA);
                    if (indexA > -1) selectedStars.splice(indexA, 1);
                }
                if (!isStillConnected(lastLineData.starB)) {
                    lastLineData.starB.material.color.setHex(lastLineData.starB.userData.isDipper ? 0x00ffff : 0xffffff);
                    const indexB = selectedStars.indexOf(lastLineData.starB);
                    if (indexB > -1) selectedStars.splice(indexB, 1);
                }
            }
            // Set anchor
            else if (activeAnchor === null) {
                activeAnchor = clickedStar;
                activeAnchor.material.color.setHex(0xff00ff); // Magenta highlight
                activeAnchor.material.opacity = 1.0;
            }
            // Connect line
            else {
                const alreadyConnected = drawnLines.some(d =>
                    (d.starA === activeAnchor && d.starB === clickedStar) ||
                    (d.starB === activeAnchor && d.starA === clickedStar)
                );

                if (!alreadyConnected) {
                    const points = [activeAnchor.position, clickedStar.position];
                    const lineGeo = new THREE.BufferGeometry().setFromPoints(points);
                    const line = new THREE.Line(lineGeo, lineMaterial);
                    scene.add(line);

                    drawnLines.push({ line: line, starA: activeAnchor, starB: clickedStar });

                    if (!selectedStars.includes(activeAnchor)) selectedStars.push(activeAnchor);
                    if (!selectedStars.includes(clickedStar)) selectedStars.push(clickedStar);

                    activeAnchor.material.color.setHex(0x00ff00);
                    clickedStar.material.color.setHex(0x00ff00);
                    activeAnchor.material.opacity = 1.0;
                    clickedStar.material.opacity = 1.0;

                    activeAnchor = null;

                    // --- PUZZLE COMPLETION CHECK ---
                    if (selectedStars.length === 7) {
                        const isCorrect = selectedStars.every(star => star.userData.isDipper);
                        if (isCorrect) {
                            setTimeout(() => {
                                alert("Signal detected: [32.92, -56°78, 8e32]. Cosmic waves resemble a humanoid figure. Where to go?");
                                fetch('/api/game/advance-phase', { method: 'POST' })
                                    .then(res => console.log("Warping to Phase 3..."))
                                    .catch(err => console.error("Warp failed:", err));
                            }, 500);
                        }
                    }
                } else {
                    activeAnchor.material.color.setHex(activeAnchor.userData.isDipper ? 0x00ffff : 0xffffff);
                    activeAnchor = null;
                }
            }
        }
    });

    // --- 7. UI EVENT LISTENERS ---
    const deathScreen = document.getElementById('death-screen');
    const btnPoison = document.getElementById('btn-poison');
    if (btnPoison) {
        btnPoison.addEventListener('click', () => {
            if (deathScreen) deathScreen.classList.remove('hidden');
        });
    }
});