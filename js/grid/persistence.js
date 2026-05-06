/**
 * Pathfinding Visualizer - Grid Persistence
 * Import/Export maze configurations
 */

/**
 * Export grid state as JSON file
 */
export function exportGrid(grid) {
  const data = grid.serialize();
  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  
  const a = document.createElement('a');
  a.href = url;
  a.download = `maze-${formatDate(new Date())}.json`;
  document.body.appendChild(a);
  a.click();
  
  // Cleanup
  setTimeout(() => {
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, 100);
}

/**
 * Import grid state from JSON file
 */
export function importGrid(file, grid) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result);
        
        // Validate data structure
        if (!data || typeof data !== 'object') {
          throw new Error('Invalid file format');
        }
        
        if (!data.walls || !Array.isArray(data.walls)) {
          throw new Error('Invalid maze data: missing walls array');
        }
        
        // Deserialize
        grid.deserialize(data);
        
        resolve(data);
      } catch (err) {
        reject(new Error('Failed to parse maze file: ' + err.message));
      }
    };
    
    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };
    
    reader.readAsText(file);
  });
}

/**
 * Export grid state as URL-safe string
 */
export function exportToUrl(grid) {
  const data = grid.serialize();
  const compressed = compressState(data);
  return btoa(JSON.stringify(compressed));
}

/**
 * Import grid state from URL string
 */
export function importFromUrl(urlString, grid) {
  try {
    const json = atob(urlString);
    const compressed = JSON.parse(json);
    const data = decompressState(compressed);
    grid.deserialize(data);
    return true;
  } catch (err) {
    console.error('Failed to import from URL:', err);
    return false;
  }
}

/**
 * Simple compression for grid state
 * Converts arrays to run-length encoded format for efficiency
 */
function compressState(data) {
  return {
    v: 1, // version
    r: data.rows,
    c: data.cols,
    s: [data.start.r, data.start.c],
    g: [data.goal.r, data.goal.c],
    w: encodePositions(data.walls),
    wt: encodeWeightedCells(data.weights),
  };
}

/**
 * Decompress state
 */
function decompressState(compressed) {
  return {
    version: compressed.v,
    rows: compressed.r,
    cols: compressed.c,
    start: { r: compressed.s[0], c: compressed.s[1] },
    goal: { r: compressed.g[0], c: compressed.g[1] },
    walls: decodePositions(compressed.w),
    weights: decodeWeightedCells(compressed.wt),
  };
}

/**
 * Encode positions as compact strings
 * "r,c;r,c;..."
 */
function encodePositions(positions) {
  if (!positions || positions.length === 0) return '';
  return positions.map(p => `${p.r},${p.c}`).join(';');
}

/**
 * Decode position string
 */
function decodePositions(str) {
  if (!str) return [];
  return str.split(';').map(s => {
    const [r, c] = s.split(',').map(Number);
    return { r, c };
  });
}

/**
 * Encode weighted cells
 * "r,c,w;r,c,w;..."
 */
function encodeWeightedCells(weights) {
  if (!weights || weights.length === 0) return '';
  return weights.map(w => `${w.r},${w.c},${w.w}`).join(';');
}

/**
 * Decode weighted cells
 */
function decodeWeightedCells(str) {
  if (!str) return [];
  return str.split(';').map(s => {
    const [r, c, w] = s.split(',').map(Number);
    return { r, c, w };
  });
}

/**
 * Format date for filenames
 */
function formatDate(date) {
  return date.toISOString()
    .replace(/[:T]/g, '-')
    .slice(0, 19);
}

/**
 * Save maze to localStorage
 */
export function saveToLocalStorage(grid, key = 'saved-maze') {
  try {
    const data = grid.serialize();
    localStorage.setItem(key, JSON.stringify(data));
    return true;
  } catch (err) {
    console.error('Failed to save to localStorage:', err);
    return false;
  }
}

/**
 * Load maze from localStorage
 */
export function loadFromLocalStorage(grid, key = 'saved-maze') {
  try {
    const json = localStorage.getItem(key);
    if (!json) return false;
    
    const data = JSON.parse(json);
    grid.deserialize(data);
    return true;
  } catch (err) {
    console.error('Failed to load from localStorage:', err);
    return false;
  }
}

/**
 * Export maze as ASCII art for text sharing
 */
export function exportAsAscii(grid) {
  const lines = [];
  
  // Header
  lines.push(`Maze ${grid.rows}x${grid.cols}`);
  lines.push(`Start: (${grid.start.row},${grid.start.col}) Goal: (${grid.goal.row},${grid.goal.col})`);
  lines.push('');
  
  // Grid
  for (let r = 0; r < grid.rows; r++) {
    let line = '';
    for (let c = 0; c < grid.cols; c++) {
      const cell = grid.cells[r][c];
      if (cell.isStart) line += 'S';
      else if (cell.isGoal) line += 'G';
      else if (cell.isWall) line += '#';
      else if (cell.weight === 3) line += '3';
      else if (cell.weight === 2) line += '2';
      else line += '.';
    }
    lines.push(line);
  }
  
  return lines.join('\n');
}
