# 🌌 ASTERIA: The Cosmic Enigma

**Asteria** is an immersive, browser-based sci-fi puzzle adventure created for the hackathon. Players step into the shoes of a newly recruited agent tasked with tracking down the rogue syndicate "Cosmo Polo" across multiple star systems and dimensional rifts.

## 🚀 The Vision: Why We Built It
We wanted to bring the tension and logic-solving of a physical escape room directly into the browser without requiring massive downloads or complex game engines. 
* **Why web technologies?** Accessibility. Anyone with a web browser can instantly drop into the terminal and start playing.
* **Why a multi-phase structure?** To give players a sense of progression and scale, moving from a simple 2D text terminal up to 3D planetary exploration and high-stakes cinematic defusal sequences.

## 🛠️ Technical Stack & How It Works
* **Frontend:** Vanilla HTML5, CSS3, and JavaScript. 
* **Styling:** Tailwind CSS for rapid UI development, coupled with custom CSS for complex animations (like the 3D Dyson Sphere).
* **3D Rendering:** Three.js (implemented in Phase 2) for spatial exploration.
* **State Management:** Custom local storage/session management (`game-tools.js`) to persist inventory items and mission progress across multiple HTML pages.

## 🧩 Key Features & Mechanics

### 1. The Terminal Login & Security Features
* **How it works:** A retro green-screen interface (`index.html`) that requires a Recruit ID and Passkey.
* **Security Implementation:** Thematically, it immerses the player in a secure OPSEC environment. Technically, the system simulates secure authentication. During the hackathon, we implemented client-side input sanitization to prevent XSS in the terminal inputs and used isolated session storage to ensure players couldn't skip phases by simply modifying URL parameters. 

### 2. The Great Library Codex (`book.html`)
* **Why this feature?** We needed a lore-friendly way to present cryptography puzzles. 
* **How it works:** A custom UI resembling an ancient, holographic tome. Players drag and drop binary/scrambled tiles to decode alien languages. It utilizes HTML5 Drag and Drop API and custom CSS grid layouts.

### 3. Dynamic Audio & Visual Puzzles (System Aurora)
* **How it works:** Players manipulate HTML5 Canvas elements acting as oscilloscopes. By adjusting Pitch, Amplitude, and Noise sliders, they match waveforms to decode a secret NASA anomaly.
* **The NASA APOD Integration:** Players adjust CSS filters (brightness, contrast, hue) via JavaScript on a fetched image to reveal hidden coordinates. 

### 4. 3D CSS Dyson Sphere Defusal (`phase4.html`)
* **How it works:** A time-sensitive, high-pressure hacking sequence. We built a 3D Dyson Sphere using purely CSS `transform-style: preserve-3d` and keyframe animations, avoiding WebGL overhead for this specific scene to ensure maximum performance while the countdown timer runs via JS intervals.

## ⚠️ Challenges & Errors Encountered

During the 24/48 hours, our team wrestled with several critical bugs:
1. **The CSS 3D Perspective Trap:** Getting the metallic rings in Phase 4 to orbit the "Sun Core" without clipping required exact `perspective` and `Z-index` balancing. Early versions caused the browser to incorrectly layer the bomb icon *behind* the sun despite its Z-index, which we fixed using `mix-blend-mode` and nested perspective containers.
2. **State Desync Across Files:** Since Asteria uses separate HTML files (`phase2.html`, `phase3.html`, etc.) rather than a Single Page Application (SPA) framework like React, maintaining the `INVENTORY_UPLINK` was a nightmare. If a player collected "Poison" in Phase 2, it wouldn't show in Phase 3. We solved this by writing a unified `game-tools.js` script that acts as a localized state manager.
3. **CORS and Canvas Tainting:** When manipulating the NASA APOD image pixels or generating wave canvases, we hit Cross-Origin Resource Sharing (CORS) errors. We bypassed this by carefully managing image `crossOrigin` attributes and utilizing proxy logic where necessary.

## 🏁 Phase 5: The Singularity
The final sequence. A seamless cinematic payoff utilizing CSS gradients and opacity washes over a high-res nebula to signify mission completion and data synchronization.

---
*Built with caffeine, zero sleep, and HTML/CSS/JS magic.*