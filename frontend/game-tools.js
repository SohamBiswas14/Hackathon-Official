const gameLocations = [
  'Mission Control',
  'Planet Sonic Enigma',
  'System Aurora',
  'Abyssal Void',
  'The Singularity',
];

const defaultInventory = [
  'Map',
  'Book of the Great Library',
  'Radio Signal Tuner',
  'Hacking System',
  'Poison',
  'Hints',
];

const itemDescriptions = {
  map: 'Shows the mission route and which phases are unlocked.',
  'book of the great library': 'A field reference for recovered clues and transmissions.',
  'radio signal tuner': 'Equipment for synchronizing intercepted signals.',
  'hacking system': 'A portable system for interacting with mission terminals.',
  poison: 'A dangerous toxin. Use with care.',
  hints: 'Review the active phase clues and objectives.',
};

let gamePlayer = null;
try {
  gamePlayer = JSON.parse(sessionStorage.getItem('asteria_player') || 'null');
} catch (error) {
  gamePlayer = null;
}

const currentPhase = Number(gamePlayer?.currentLevel);
if (Number.isInteger(currentPhase) && currentPhase >= 2) {
  document.body.dataset.gamePhase = String(currentPhase);

  const launcher = document.createElement('nav');
  launcher.className = 'game-tools-launcher';
  launcher.setAttribute('aria-label', 'Game tools');
  launcher.innerHTML = `
    <button type="button" data-tool-view="map">[ MAP ]</button>
    <button type="button" data-tool-view="inventory">[ INVENTORY ]</button>
  `;

  const panel = document.createElement('section');
  panel.id = 'game-tools-panel';
  panel.hidden = true;
  panel.setAttribute('role', 'dialog');
  panel.setAttribute('aria-modal', 'false');
  panel.setAttribute('aria-labelledby', 'game-tools-title');
  panel.innerHTML = `
    <header class="game-tools-header">
      <h2 id="game-tools-title">MISSION MAP</h2>
      <button class="game-tools-close" type="button" aria-label="Close game tools">[ CLOSE ]</button>
    </header>
    <div class="game-tools-tabs" role="tablist" aria-label="Game tools views">
      <button class="game-tools-tab" type="button" role="tab" data-tool-view="map">MAP</button>
      <button class="game-tools-tab" type="button" role="tab" data-tool-view="inventory">INVENTORY</button>
    </div>
    <div id="game-tools-content" aria-live="polite"></div>
  `;

  document.body.append(launcher, panel);

  const title = panel.querySelector('#game-tools-title');
  const content = panel.querySelector('#game-tools-content');
  const views = panel.querySelectorAll('[data-tool-view]');

  function showMap() {
    title.textContent = 'MISSION MAP';
    content.replaceChildren();
    const list = document.createElement('ol');
    list.className = 'game-tools-list';

    gameLocations.forEach((location, index) => {
      const phase = index + 1;
      const row = document.createElement('li');
      row.className = 'game-tools-row';

      const name = document.createElement('strong');
      name.textContent = `PHASE ${phase} / ${location}`;

      const state = document.createElement('span');
      state.className = 'game-tools-state';
      state.textContent = phase < currentPhase ? 'CLEARED' : phase === currentPhase ? 'CURRENT' : 'LOCKED';

      row.append(name, state);
      list.appendChild(row);
    });

    content.appendChild(list);
  }

  function showInventory() {
    title.textContent = 'FIELD INVENTORY';
    content.replaceChildren();
    const items = Array.isArray(gamePlayer.inventory) ? gamePlayer.inventory : defaultInventory;
    const grid = document.createElement('div');
    grid.className = 'game-inventory-grid';
    const description = document.createElement('p');
    description.className = 'game-tools-description';
    description.textContent = items.length ? 'Select an item to inspect it.' : 'No items are assigned to this profile.';

    items.forEach((item, index) => {
      const button = document.createElement('button');
      button.className = 'game-inventory-item';
      button.type = 'button';
      button.textContent = item;
      button.setAttribute('aria-pressed', 'false');
      button.addEventListener('click', () => {
        grid.querySelectorAll('button').forEach((itemButton) => {
          itemButton.setAttribute('aria-pressed', String(itemButton === button));
        });
        description.textContent = itemDescriptions[String(item).toLowerCase()] || 'No additional field notes are available.';
      });
      grid.appendChild(button);
      if (index === 0) button.click();
    });

    content.append(grid, description);
  }

  function openView(view) {
    panel.hidden = false;
    views.forEach((button) => {
      button.setAttribute('aria-selected', String(button.dataset.toolView === view));
    });
    if (view === 'inventory') showInventory();
    else showMap();
  }

  launcher.querySelectorAll('[data-tool-view]').forEach((button) => {
    button.addEventListener('click', () => openView(button.dataset.toolView));
  });
  panel.querySelectorAll('[data-tool-view]').forEach((button) => {
    button.addEventListener('click', () => openView(button.dataset.toolView));
  });
  panel.querySelector('.game-tools-close').addEventListener('click', () => {
    panel.hidden = true;
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') panel.hidden = true;
  });
}