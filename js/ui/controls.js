/**
 * Pathfinding Visualizer - UI Controls
 * Event handlers for buttons, sliders, and keyboard shortcuts
 */

import { state } from '../state.js';
import { showToast, showSuccess, showError } from './toast.js';
import { HEURISTIC_DESCRIPTIONS } from '../config.js';

/**
 * Initialize all UI controls
 * @param {Object} deps - Dependencies (controller, grid, interaction, etc.)
 */
export function initControls(deps) {
  const { controller, grid, interaction, runAlgorithm, algorithms, renderer } = deps;
  
  initAlgorithmSelect(runAlgorithm, algorithms);
  initDrawModeButtons(interaction);
  initPlaybackButtons(controller, runAlgorithm);
  initSpeedSlider();
  initMazeButtons(grid, controller, renderer);
  initFileButtons(grid, renderer);
  initKeyboardShortcuts(controller, grid, interaction, runAlgorithm);
  initHelpModal();
  initStats();
}

/**
 * Initialize algorithm selection dropdown
 */
function initAlgorithmSelect(runAlgorithm, algorithms) {
  const select = document.getElementById('algorithm-select');
  const heuristicGroup = document.getElementById('heuristic-group');
  const heuristicSelect = document.getElementById('heuristic-select');
  
  select?.addEventListener('change', (e) => {
    const algorithm = e.target.value;
    state.set('algorithm', algorithm);
    
    // Show/hide heuristic selector for A*
    if (algorithm === 'astar') {
      heuristicGroup.style.display = 'block';
    } else {
      heuristicGroup.style.display = 'none';
    }
    
    updateAlgorithmDescription(algorithm);
  });
  
  heuristicSelect?.addEventListener('change', (e) => {
    const heuristic = e.target.value;
    state.set('heuristic', heuristic);
    // Update heuristic description text when user changes it
    updateHeuristicDisplay(heuristic);
  });
  
  // Initialize visibility and description on page load
  const initialAlgo = select?.value || 'astar';
  if (initialAlgo !== 'astar') {
    heuristicGroup.style.display = 'none';
  }
  // Show initial description
  updateAlgorithmDescription(initialAlgo);
  if (initialAlgo === 'astar') {
    updateHeuristicDisplay(heuristicSelect?.value || 'manhattan');
  }
}

/**
 * Initialize draw mode buttons
 */
function initDrawModeButtons(interaction) {
  const buttons = document.querySelectorAll('.btn-mode');
  
  buttons.forEach(btn => {
    btn.addEventListener('click', () => {
      const mode = btn.dataset.mode;
      
      // Update UI
      buttons.forEach(b => {
        b.classList.remove('active');
        b.setAttribute('aria-pressed', 'false');
      });
      btn.classList.add('active');
      btn.setAttribute('aria-pressed', 'true');
      
      // Handle special modes for start/goal positioning
      if (mode === 'setstart') {
        interaction.setMode('setstart');
        showToast('Click on the grid to set start position', 'info');
      } else if (mode === 'setgoal') {
        interaction.setMode('setgoal');
        showToast('Click on the grid to set goal position', 'info');
      } else {
        // Regular draw modes
        interaction.setMode(mode);
        state.set('drawMode', mode);
      }
    });
  });
}

/**
 * Initialize playback control buttons
 */
function initPlaybackButtons(controller, runAlgorithm) {
  const btnRun = document.getElementById('btn-run');
  const btnPause = document.getElementById('btn-pause');
  const btnStep = document.getElementById('btn-step');
  const btnReset = document.getElementById('btn-reset');
  
  // Run button
  btnRun?.addEventListener('click', () => {
    if (controller.running && controller.paused) {
      controller.resume();
    } else if (!controller.running) {
      runAlgorithm();
    }
  });
  
  // Pause button
  btnPause?.addEventListener('click', () => {
    controller.togglePause();
  });
  
  // Step button
  btnStep?.addEventListener('click', () => {
    if (!controller.running) {
      // Start algorithm then immediately pause at first step
      runAlgorithm();
      // Use setTimeout(0) to ensure the rAF loop has been scheduled
      // before we pause, so the first frame processes one step correctly
      setTimeout(() => controller.pause(), 0);
    } else if (controller.paused) {
      controller.step();
    }
  });
  
  // Reset button
  btnReset?.addEventListener('click', () => {
    controller.reset();
    showToast('Grid reset', 'info', 1500);
  });
  
  // Update button states based on controller state
  state.subscribe('isRunning', (isRunning) => {
    btnRun.disabled = isRunning && !controller.paused;
    btnPause.disabled = !isRunning;
    btnStep.disabled = isRunning && !controller.paused;
  });
  
  state.subscribe('isPaused', (isPaused) => {
    btnRun.disabled = !isPaused;
    btnPause.disabled = !controller.running;
    
    // Update pause button icon
    if (btnPause) {
      btnPause.innerHTML = isPaused 
        ? `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
             <polygon points="5 3 19 12 5 21 5 3"/>
           </svg>`
        : `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
             <rect x="6" y="4" width="4" height="16"/>
             <rect x="14" y="4" width="4" height="16"/>
           </svg>`;
    }
  });
}

/**
 * Initialize speed slider
 */
function initSpeedSlider() {
  const slider = document.getElementById('speed-slider');
  const valueDisplay = document.getElementById('speed-value');
  
  slider?.addEventListener('input', (e) => {
    const speed = parseInt(e.target.value, 10);
    state.set('speed', speed);
    
    if (valueDisplay) {
      valueDisplay.textContent = speed;
    }
  });
}

/**
 * Update step count display
 */
function updateStepCount(steps) {
  const stepCountDisplay = document.getElementById('step-count');
  if (stepCountDisplay) {
    stepCountDisplay.textContent = steps;
  }
}

/**
 * Initialize maze generation buttons
 */
function initMazeButtons(grid, controller, renderer) {
  const btnBacktracker = document.getElementById('btn-maze-backtracker');
  const btnRandom = document.getElementById('btn-maze-random');
  const btnClear = document.getElementById('btn-clear-walls');
  
  btnBacktracker?.addEventListener('click', async () => {
    if (state.get('isRunning')) {
      showToast('Cannot generate maze while running', 'warning');
      return;
    }
    
    controller.reset();
    const { recursiveBacktracker } = await import('../algorithms/mazes.js');
    
    // Run the generator to completion (applies all wall changes to model)
    const generator = recursiveBacktracker(grid);
    for (const step of generator) { /* consume all steps */ }
    
    grid.saveState();
    // FIX Bug #2: redraw canvas after walls are updated in model
    renderer?.draw();
    showSuccess('Recursive backtracker maze generated');
  });
  
  btnRandom?.addEventListener('click', async () => {
    if (state.get('isRunning')) {
      showToast('Cannot generate maze while running', 'warning');
      return;
    }
    
    controller.reset();
    const { generateRandomMaze } = await import('../algorithms/mazes.js');
    generateRandomMaze(grid);
    grid.saveState();
    // FIX Bug #9: redraw canvas after walls are updated in model
    renderer?.draw();
    showSuccess('Random maze generated');
  });
  
  btnClear?.addEventListener('click', () => {
    if (state.get('isRunning')) {
      showToast('Cannot clear while running', 'warning');
      return;
    }
    
    controller.reset();
    grid.clearWalls();
    renderer?.draw();
    showToast('Walls cleared', 'info', 1500);
  });
}

/**
 * Initialize import/export buttons
 */
function initFileButtons(grid, renderer) {
  const btnExport = document.getElementById('btn-export');
  const btnImport = document.getElementById('btn-import');
  const fileInput = document.getElementById('file-input');
  
  btnExport?.addEventListener('click', async () => {
    const { exportGrid } = await import('../grid/persistence.js');
    exportGrid(grid);
    showSuccess('Maze exported to JSON');
  });
  
  btnImport?.addEventListener('click', () => {
    fileInput?.click();
  });
  
  fileInput?.addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    try {
      const { importGrid } = await import('../grid/persistence.js');
      await importGrid(file, grid);
      renderer?.draw();
      showSuccess('Maze imported successfully');
    } catch (err) {
      showError('Failed to import maze: ' + err.message);
    }
    
    // Reset file input
    fileInput.value = '';
  });
}

/**
 * Initialize keyboard shortcuts
 */
function initKeyboardShortcuts(controller, grid, interaction, runAlgorithm) {
  const shortcuts = {
    ' ': () => {
      if (controller.running) {
        controller.togglePause();
      } else {
        runAlgorithm();
      }
    },
    's': () => {
      if (!controller.running) {
        runAlgorithm();
        controller.pause();
      } else if (controller.paused) {
        controller.step();
      }
    },
    'r': () => {
      controller.reset();
    },
    'c': () => {
      controller.reset();
      grid.clearWalls();
    },
    'z': (e) => {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
        if (grid.undo()) {
          showToast('Undo', 'info', 1000);
        }
      }
    },
    'y': (e) => {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
        if (grid.redo()) {
          showToast('Redo', 'info', 1000);
        }
      }
    },
    '1': () => setDrawMode('wall'),
    '2': () => setDrawMode('weight2'),
    '3': () => setDrawMode('weight3'),
    '4': () => setDrawMode('setstart'),
    '5': () => setDrawMode('setgoal'),
    '0': () => setDrawMode('eraser'),
  };
  
  document.addEventListener('keydown', (e) => {
    // Skip if user is typing in an input or any form control is focused
    const activeTag = document.activeElement?.tagName;
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT' || e.target.tagName === 'TEXTAREA') {
      return;
    }
    // Also skip if a select/input has focus (e.g. after tabbing to it)
    if (activeTag === 'INPUT' || activeTag === 'SELECT' || activeTag === 'TEXTAREA') {
      return;
    }
    
    // Skip if modal is open
    if (document.getElementById('shortcuts-help')?.classList.contains('show')) {
      if (e.key === 'Escape') {
        toggleHelpModal(false);
      }
      return;
    }
    
    const handler = shortcuts[e.key];
    if (handler) {
      e.preventDefault();
      handler(e);
    }
    
    // Help modal
    if (e.key === '?' || e.key === 'h') {
      toggleHelpModal(true);
    }
  });
  
  function setDrawMode(mode) {
    const btn = document.querySelector(`.btn-mode[data-mode="${mode}"]`);
    if (btn) {
      btn.click();
    }
  }
}

/**
 * Initialize help modal
 */
function initHelpModal() {
  const helpBtn = document.getElementById('help-btn');
  const closeBtn = document.getElementById('close-shortcuts');
  const modal = document.getElementById('shortcuts-help');
  
  helpBtn?.addEventListener('click', () => toggleHelpModal(true));
  closeBtn?.addEventListener('click', () => toggleHelpModal(false));
  
  // Close on backdrop click
  modal?.addEventListener('click', (e) => {
    if (e.target === modal) {
      toggleHelpModal(false);
    }
  });
}

/**
 * Toggle help modal visibility
 */
function toggleHelpModal(show) {
  const modal = document.getElementById('shortcuts-help');
  if (!modal) return;
  
  if (show) {
    modal.classList.add('show');
    modal.setAttribute('aria-hidden', 'false');
    document.getElementById('close-shortcuts')?.focus();
  } else {
    modal.classList.remove('show');
    modal.setAttribute('aria-hidden', 'true');
    document.getElementById('help-btn')?.focus();
  }
}

/**
 * Initialize stats display
 * Subscribes to state and immediately renders current values
 */
function initStats() {
  const statMap = {
    visitedCount: 'stat-visited',
    pathLength:   'stat-length',
    pathCost:     'stat-cost',
    stepCount:    'step-count',
  };
  
  for (const [key, id] of Object.entries(statMap)) {
    // Set the initial value immediately (shows 0 on load)
    const el = document.getElementById(id);
    if (el) el.textContent = state.get(key) ?? 0;
    
    // Subscribe to future updates
    state.subscribe(key, (value) => {
      const target = document.getElementById(id);
      if (target) target.textContent = value;
    });
  }
}

/**
 * Update algorithm description in the UI
 */
function updateAlgorithmDescription(algorithm) {
  const descEl = document.getElementById('algorithm-description');
  // FIX Bug #6: target heuristic-display (the text div), not heuristic-info (the container)
  const heuristicEl = document.getElementById('heuristic-display');
  
  const descriptions = {
    bfs: 'BFS explores all nodes at the present depth before moving to the next level. It guarantees the shortest path in unweighted graphs.',
    dfs: 'DFS explores as far as possible along each branch before backtracking. It does not guarantee the shortest path but uses less memory.',
    dijkstra: 'Dijkstra finds the shortest path in weighted graphs. It always expands the node with the lowest known cost from the start.',
    astar: 'A* combines the actual cost from the start with a heuristic estimate to the goal. It finds optimal paths efficiently by prioritizing promising directions.',
    // FIX Bug #5: add descriptions for bidirectional algorithms
    bibfs: 'Bidirectional BFS launches simultaneous BFS searches from both the start and goal nodes. When the two frontiers meet, the shortest path is found — often twice as fast as standard BFS.',
    bidijkstra: 'Bidirectional Dijkstra runs Dijkstra\'s algorithm simultaneously from both start and goal. It terminates when the two searched regions overlap, significantly reducing the number of nodes explored.',
  };
  
  const heuristics = {
    manhattan: 'Manhattan distance: |x₁-x₂| + |y₁-y₂| — best for grids with only horizontal/vertical movement.',
    euclidean: 'Euclidean distance: √((x₁-x₂)² + (y₁-y₂)²) — true straight-line distance.',
    chebyshev: 'Chebyshev distance: max(|x₁-x₂|, |y₁-y₂|) — allows diagonal movement with equal cost.',
    octile: 'Octile distance: optimized for 8-directional movement with √2 diagonal cost.',
  };
  
  if (descEl) {
    descEl.textContent = descriptions[algorithm] || 'Select an algorithm to see how it works.';
  }
  
  if (heuristicEl && algorithm === 'astar') {
    const heuristic = state.get('heuristic') || 'manhattan';
    heuristicEl.textContent = heuristics[heuristic] || '';
  } else if (heuristicEl) {
    heuristicEl.textContent = 'Select A* to see heuristic details';
  }
}

/**
 * Update heuristic description text using config data
 */
function updateHeuristicDisplay(heuristicName) {
  const el = document.getElementById('heuristic-display');
  if (!el) return;
  const info = HEURISTIC_DESCRIPTIONS[heuristicName];
  el.textContent = info?.description || `${heuristicName} heuristic`;
}

export { toggleHelpModal };
