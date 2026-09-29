const BASE_URL = 'https://probable-parakeet-r76x4xqjp979hw49-3000.app.github.dev';
const SECRET_CODE_1 = 'ECHO-77';

const TOTAL_PAGES = 10;
let currentSpread = 0;
let isUrsaMajorDecoded = false;
let isCodeRetrieved = false;
let isHintRevealed = false;

const TARGET_PHRASE = 'URSA MAJOR';

function generateScrambledLetters() {
  let array = TARGET_PHRASE.split('');
  let isSame = true;
  while (isSame) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    if (array.join('') !== TARGET_PHRASE) {
      isSame = false;
    }
  }
  return array;
}

const SCRAMBLED_PHRASE = generateScrambledLetters();

const BINARY_DICTIONARY = {
  'U': '01010101',
  'R': '01010010',
  'S': '01010011',
  'A': '01000001',
  ' ': '00100000',
  'M': '01001101',
  'J': '01001010',
  'O': '01001111'
};

let userArrangedTiles = [...SCRAMBLED_PHRASE];
let revealedLettersCount = 0;
let binaryRevealedMap = new Array(SCRAMBLED_PHRASE.length).fill(false);

const bookInterface = document.getElementById('book-interface');
const bookReopenBtn = document.getElementById('book-reopen-btn');
const bookCloseBtn = document.getElementById('book-close-btn');

const leftPageDisplay = document.getElementById('left-page-display');
const rightPageDisplay = document.getElementById('right-page-display');
const leftPageNum = document.getElementById('left-page-num');
const rightPageNum = document.getElementById('right-page-num');

const prevPageBtn = document.getElementById('prev-page-btn');
const nextPageBtn = document.getElementById('next-page-btn');
const spreadCounter = document.getElementById('current-spread');

const codexToast = document.getElementById('codex-toast');
const toastMessage = document.getElementById('toast-message');
const signalModal = document.getElementById('signal-modal');
const signalTextContent = document.getElementById('signal-text-content');

function showToast(text) {
  toastMessage.textContent = text;
  codexToast.classList.remove('hidden');
  setTimeout(() => {
    codexToast.classList.add('hidden');
  }, 4000);
}

function renderSpread() {
  const leftPageNumber = currentSpread * 2 + 1;
  const rightPageNumber = currentSpread * 2 + 2;

  leftPageNum.textContent = `FOL. 0${leftPageNumber}`;
  rightPageNum.textContent = `FOL. ${rightPageNumber < 10 ? '0' : ''}${rightPageNumber}`;
  spreadCounter.textContent = currentSpread + 1;

  prevPageBtn.disabled = currentSpread === 0;
  nextPageBtn.disabled = currentSpread === 4;

  if (leftPageNumber === 1) {
    renderPage1(leftPageDisplay);
  } else if (leftPageNumber === 9) {
    renderEmptyPage(leftPageDisplay, 9, 'EXPUNGED ARCHIVAL ARCHITECTURE');
  } else {
    renderEmptyPage(leftPageDisplay, leftPageNumber, 'CELESTIAL HARMONICS TRANSCRIBED // NO DATA');
  }

  if (rightPageNumber === 2) {
    renderPage2Hint(rightPageDisplay);
  } else if (rightPageNumber === 10) {
    renderPage10(rightPageDisplay);
  } else {
    renderEmptyPage(rightPageDisplay, rightPageNumber, 'FRAGMENT EXPUNGED BY ANCIENT ARCHIVISTS');
  }
}

function renderPage1(container) {
  container.innerHTML = `
    <h3 class="tome-title">KALLISTO CODEX</h3>
    <p class="tome-lead">1. Hover over scrambled binary glyphs to reveal the letters.<br>2. Click, hold, and drag the tiles into the correct celestial designation.</p>
    
    <div class="binary-matrix-container" id="binary-matrix"></div>

    <div class="arrange-section-title">// ALIGNMENT RAIL (CLICK & HOLD TO SWAP)</div>
    <div class="arrange-rail" id="arrange-rail"></div>

    <div class="decoder-progress">
      <div class="progress-label">// DECRYPTED RECORD</div>
      <div class="decoded-readout" id="decoded-readout">${isUrsaMajorDecoded ? TARGET_PHRASE : '----------'}</div>
    </div>
  `;

  const matrix = container.querySelector('#binary-matrix');
  const rail = container.querySelector('#arrange-rail');

  SCRAMBLED_PHRASE.forEach((char, index) => {
    const unit = document.createElement('div');
    unit.className = `binary-unit ${binaryRevealedMap[index] ? 'decoded' : ''}`;
    
    const binStr = BINARY_DICTIONARY[char] || '01111111';
    unit.innerHTML = `
      <span class="raw-bits">${binStr.substring(0, 4)}<br>${binStr.substring(4)}</span>
      <span class="scrambled-char">${char === ' ' ? '␣' : char}</span>
    `;

    unit.addEventListener('mouseenter', () => {
      if (!binaryRevealedMap[index]) {
        binaryRevealedMap[index] = true;
        unit.classList.add('decoded');
        revealedLettersCount++;
        renderArrangeRail(rail);
        if (revealedLettersCount === SCRAMBLED_PHRASE.length) {
          showToast('ALL GLYPHS REVEALED. REARRANGE TO DECODE.');
        }
      }
    });

    matrix.appendChild(unit);
  });

  renderArrangeRail(rail);
}

function renderArrangeRail(rail) {
  if (!rail) return;
  rail.innerHTML = '';

  userArrangedTiles.forEach((char, index) => {
    const tile = document.createElement('div');
    tile.className = `draggable-tile ${char === ' ' ? 'space-tile' : ''}`;
    tile.draggable = true;
    tile.dataset.index = index;

    const isRevealed = binaryRevealedMap.filter(Boolean).length > index || isUrsaMajorDecoded;
    tile.textContent = isRevealed ? (char === ' ' ? '␣' : char) : '?';

    tile.addEventListener('dragstart', handleDragStart);
    tile.addEventListener('dragover', handleDragOver);
    tile.addEventListener('dragleave', handleDragLeave);
    tile.addEventListener('drop', handleDrop);

    rail.appendChild(tile);
  });
}

let draggedTileIndex = null;

function handleDragStart(e) {
  draggedTileIndex = Number(this.dataset.index);
  e.dataTransfer.effectAllowed = 'move';
  e.dataTransfer.setData('text/plain', draggedTileIndex);
}

function handleDragOver(e) {
  e.preventDefault();
  this.classList.add('drag-over');
  e.dataTransfer.dropEffect = 'move';
}

function handleDragLeave() {
  this.classList.remove('drag-over');
}

function handleDrop(e) {
  e.preventDefault();
  this.classList.remove('drag-over');
  const targetIndex = Number(this.dataset.index);

  if (draggedTileIndex !== null && draggedTileIndex !== targetIndex) {
    const temp = userArrangedTiles[draggedTileIndex];
    userArrangedTiles[draggedTileIndex] = userArrangedTiles[targetIndex];
    userArrangedTiles[targetIndex] = temp;

    const rail = document.getElementById('arrange-rail');
    renderArrangeRail(rail);
    checkDecryptionSolution();
  }
}

async function checkDecryptionSolution() {
  const currentString = userArrangedTiles.join('');
  if (currentString === TARGET_PHRASE && !isUrsaMajorDecoded) {
    isUrsaMajorDecoded = true;
    const readout = document.getElementById('decoded-readout');
    if (readout) readout.textContent = TARGET_PHRASE;
    showToast('ANOMALY RESOLVED: URSA MAJOR DECRYPTED!');

    const rawUser = sessionStorage.getItem('asteria_player');
    if (rawUser) {
      try {
        const player = JSON.parse(rawUser);
        const res = await fetch(`${BASE_URL}/api/phase2/decode-binary`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            username: player.username,
            decodedWord: currentString
          })
        });
        const data = await res.json();
        if (data.success && data.message) {
          signalTextContent.textContent = `"${data.message}"`;
        }
      } catch (e) {
        console.warn('Backend verification unreachable:', e);
      }
    }
    checkTriggerConditions();
  }
}

function renderPage2Hint(container) {
  container.innerHTML = `
    <div class="hint-page-wrapper">
      <button id="hint-action-btn" class="hint-btn">[ HINT ]</button>
      <div id="hint-reveal-box" class="hint-reveal-text ${isHintRevealed ? '' : 'hidden'}">
        Great Bear
      </div>
    </div>
  `;

  const hintBtn = container.querySelector('#hint-action-btn');
  const hintBox = container.querySelector('#hint-reveal-box');

  hintBtn.addEventListener('click', () => {
    isHintRevealed = true;
    hintBox.classList.remove('hidden');
    showToast('ARCHIVE HINT UNVEILED: GREAT BEAR');
  });
}

function renderEmptyPage(container, num, subtitle) {
  container.innerHTML = `
    <div class="empty-page-wrapper">
      <div class="greek-diagram" style="width: 90px; height: 90px;"></div>
      <p class="empty-folio-note">FOLIO [ ${num} ]</p>
      <p style="font-size: 0.7rem; color: #00FF00; margin-top: 0.4rem; opacity: 0.6;">${subtitle}</p>
    </div>
  `;
}

function renderPage10(container) {
  container.innerHTML = `
    <div class="relic-wrapper">
      <h3 class="tome-title" style="color: #00FF00;">FINAL RECORD</h3>
      <p class="tome-lead">Archival lock compromised. One encrypted code fragment was pressed into the binding.</p>

      <div class="relic-token ${isCodeRetrieved ? 'collected' : ''}" id="relic-item">
        <div class="relic-symbol">Ω // ☊</div>
        <div class="relic-code">${SECRET_CODE_1}</div>
        <div class="relic-action">${isCodeRetrieved ? '[ STORED IN MEMORY BANK ]' : '[ CLICK TO RETRIEVE CODE ]'}</div>
      </div>
    </div>
  `;

  const relic = container.querySelector('#relic-item');
  relic.addEventListener('click', async () => {
    if (!isCodeRetrieved) {
      isCodeRetrieved = true;
      relic.classList.add('collected');
      relic.querySelector('.relic-action').textContent = '[ STORED IN MEMORY BANK ]';
      showToast(`CODE ACQUIRED: ${SECRET_CODE_1} SECURED`);
      
      await syncCodeWithServer(SECRET_CODE_1);
      checkTriggerConditions();
    }
  });
}

async function syncCodeWithServer(code) {
  const rawUser = sessionStorage.getItem('asteria_player');
  if (!rawUser) return;
  try {
    const player = JSON.parse(rawUser);
    if (!player.collectedCodes) player.collectedCodes = [];
    if (!player.collectedCodes.includes(code)) {
      player.collectedCodes.push(code);
      sessionStorage.setItem('asteria_player', JSON.stringify(player));
    }

    await fetch(`${BASE_URL}/api/game/collect-code`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: player.username,
        code: code
      })
    });
  } catch (err) {
    console.warn('Backend code sync bypassed or offline:', err);
  }
}

function checkTriggerConditions() {
  if (isUrsaMajorDecoded && isCodeRetrieved) {
    setTimeout(() => {
      signalModal.classList.remove('hidden');
    }, 1000);
  }
}

prevPageBtn.addEventListener('click', () => {
  if (currentSpread > 0) {
    currentSpread--;
    renderSpread();
  }
});

nextPageBtn.addEventListener('click', () => {
  if (currentSpread < 4) {
    currentSpread++;
    renderSpread();
  }
});

bookCloseBtn.addEventListener('click', () => {
  bookInterface.classList.add('hidden');
});

bookReopenBtn.addEventListener('click', () => {
  bookInterface.classList.remove('hidden');
});

async function routeToPhase(targetPhaseNumber, destinationName) {
  const rawUser = sessionStorage.getItem('asteria_player');
  if (rawUser) {
    try {
      const player = JSON.parse(rawUser);
      await fetch(`${BASE_URL}/api/game/advance-phase`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: player.username,
          targetPhase: targetPhaseNumber
        })
      });
      player.currentLevel = targetPhaseNumber;
      player.currentLocation = destinationName;
      sessionStorage.setItem('asteria_player', JSON.stringify(player));
    } catch (e) {
      console.warn('Failed to advance phase on backend:', e);
    }
  }
  showToast(`DIRECTING TO PHASE ${targetPhaseNumber}: ${destinationName.toUpperCase()}...`);
}

document.getElementById('opt-aurora').addEventListener('click', async () => {
  signalModal.classList.add('hidden');
  await routeToPhase(3, 'System Aurora');
});

document.getElementById('opt-centuari').addEventListener('click', async () => {
  signalModal.classList.add('hidden');
  await routeToPhase(4, 'System Centauri');
});

window.addEventListener('DOMContentLoaded', () => {
  renderSpread();
});