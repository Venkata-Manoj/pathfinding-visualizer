/**
 * Pathfinding Visualizer - Advanced Maze Generation Algorithms
 * Implements various maze generation algorithms with animation support
 */

import { CONFIG } from '../config.js';

/**
 * Recursive Backtracking Maze Generator
 * Creates perfect mazes with long winding corridors
 */
export function* recursiveBacktracker(grid) {
  const rows = grid.rows;
  const cols = grid.cols;
  
  // Clear grid
  clearGrid(grid);
  
  // Initialize all cells as walls
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      grid.cells[r][c].isWall = true;
    }
  }
  
  // Stack for backtracking
  const stack = [];
  
  // Start from random odd position
  const startRow = Math.floor(Math.random() * Math.floor(rows / 2)) * 2 + 1;
  const startCol = Math.floor(Math.random() * Math.floor(cols / 2)) * 2 + 1;
  
  let current = { row: startRow, col: startCol };
  grid.cells[startRow][startCol].isWall = false;
  stack.push(current);
  
  // Directions: N, S, E, W
  const directions = [
    [-2, 0], [2, 0], [0, -2], [0, 2]
  ];
  
  while (stack.length > 0) {
    // Get unvisited neighbors
    const neighbors = [];
    
    for (const [dr, dc] of directions) {
      const newRow = current.row + dr;
      const newCol = current.col + dc;
      
      if (isValidCell(newRow, newCol, rows, cols) && 
          grid.cells[newRow][newCol].isWall) {
        neighbors.push({ row: newRow, col: newCol, wallRow: current.row + dr/2, wallCol: current.col + dc/2 });
      }
    }
    
    if (neighbors.length > 0) {
      // Choose random neighbor
      const next = neighbors[Math.floor(Math.random() * neighbors.length)];
      
      // Remove wall between current and chosen neighbor
      grid.cells[next.wallRow][next.wallCol].isWall = false;
      grid.cells[next.row][next.col].isWall = false;
      
      // Add current to stack and move to neighbor
      stack.push(current);
      current = { row: next.row, col: next.col };
      
      yield { type: 'carve', cell: current };
    } else if (stack.length > 0) {
      // Backtrack
      current = stack.pop();
      yield { type: 'backtrack', cell: current };
    }
  }
  
  yield { type: 'complete' };
}

/**
 * Prim's Algorithm Maze Generator
 * Creates mazes with more branching and less long corridors
 */
export function* primsAlgorithm(grid) {
  const rows = grid.rows;
  const cols = grid.cols;
  
  // Clear grid
  clearGrid(grid);
  
  // Initialize all cells as walls
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      grid.cells[r][c].isWall = true;
    }
  }
  
  // List of walls to consider
  const walls = [];
  
  // Start from random odd position
  const startRow = Math.floor(Math.random() * Math.floor(rows / 2)) * 2 + 1;
  const startCol = Math.floor(Math.random() * Math.floor(cols / 2)) * 2 + 1;
  
  grid.cells[startRow][startCol].isWall = false;
  
  // Add neighboring walls
  addWalls(startRow, startCol, walls, grid);
  
  while (walls.length > 0) {
    // Pick random wall
    const wallIndex = Math.floor(Math.random() * walls.length);
    const wall = walls[wallIndex];
    walls.splice(wallIndex, 1);
    
    const { row: wallRow, col: wallCol, fromRow, fromCol, toRow, toCol } = wall;
    
    // Check if the cell on the other side is a wall
    if (grid.cells[toRow][toCol].isWall) {
      // Remove the wall
      grid.cells[wallRow][wallCol].isWall = false;
      grid.cells[toRow][toCol].isWall = false;
      
      yield { type: 'carve', cell: { row: toRow, col: toCol } };
      
      // Add new walls
      addWalls(toRow, toCol, walls, grid);
    }
  }
  
  yield { type: 'complete' };
}

/**
 * Kruskal's Algorithm Maze Generator
 * Creates mazes using random spanning tree
 */
export function* kruskalsAlgorithm(grid) {
  const rows = grid.rows;
  const cols = grid.cols;
  
  // Clear grid
  clearGrid(grid);
  
  // Initialize all cells as walls
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      grid.cells[r][c].isWall = true;
    }
  }
  
  // Create sets for each cell (only odd positions)
  const sets = new Map();
  const edges = [];
  
  for (let r = 1; r < rows; r += 2) {
    for (let c = 1; c < cols; c += 2) {
      const setId = `${r},${c}`;
      sets.set(setId, setId);
      grid.cells[r][c].isWall = false;
      
      // Add edges to right and down neighbors
      if (c + 2 < cols) {
        edges.push({
          from: { row: r, col: c },
          to: { row: r, col: c + 2 },
          wall: { row: r, col: c + 1 }
        });
      }
      if (r + 2 < rows) {
        edges.push({
          from: { row: r, col: c },
          to: { row: r + 2, col: c },
          wall: { row: r + 1, col: c }
        });
      }
    }
  }
  
  // Shuffle edges
  shuffleArray(edges);
  
  // Process edges
  for (const edge of edges) {
    const fromSet = findSet(sets, `${edge.from.row},${edge.from.col}`);
    const toSet = findSet(sets, `${edge.to.row},${edge.to.col}`);
    
    if (fromSet !== toSet) {
      // Remove wall
      grid.cells[edge.wall.row][edge.wall.col].isWall = false;
      
      // Union sets
      unionSets(sets, fromSet, toSet);
      
      yield { type: 'carve', cell: edge.wall };
    }
  }
  
  yield { type: 'complete' };
}

/**
 * Wilson's Algorithm Maze Generator
 * Creates unbiased mazes using loop-erased random walks
 */
export function* wilsonsAlgorithm(grid) {
  const rows = grid.rows;
  const cols = grid.cols;
  
  // Clear grid
  clearGrid(grid);
  
  // Initialize all cells as walls
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      grid.cells[r][c].isWall = true;
    }
  }
  
  // Track visited cells
  const visited = new Set();
  
  // Start with random cell
  const startRow = Math.floor(Math.random() * Math.floor(rows / 2)) * 2 + 1;
  const startCol = Math.floor(Math.random() * Math.floor(cols / 2)) * 2 + 1;
  
  grid.cells[startRow][startCol].isWall = false;
  visited.add(`${startRow},${startCol}`);
  
  // Directions
  const directions = [
    [-2, 0], [2, 0], [0, -2], [0, 2]
  ];
  
  // Process remaining cells
  const totalCells = Math.floor(rows / 2) * Math.floor(cols / 2);
  
  while (visited.size < totalCells) {
    // Pick random unvisited cell
    let currentRow, currentCol;
    do {
      currentRow = Math.floor(Math.random() * Math.floor(rows / 2)) * 2 + 1;
      currentCol = Math.floor(Math.random() * Math.floor(cols / 2)) * 2 + 1;
    } while (visited.has(`${currentRow},${currentCol}`));
    
    // Random walk until hitting visited cell
    const path = [{ row: currentRow, col: currentCol }];
    const pathSet = new Set([`${currentRow},${currentCol}`]);
    
    while (!visited.has(`${currentRow},${currentCol}`)) {
      // Random direction
      const [dr, dc] = directions[Math.floor(Math.random() * directions.length)];
      const newRow = currentRow + dr;
      const newCol = currentCol + dc;
      
      if (isValidCell(newRow, newCol, rows, cols)) {
        currentRow = newRow;
        currentCol = newCol;
        
        const key = `${currentRow},${currentCol}`;
        
        if (pathSet.has(key)) {
          // Loop erasure - remove loop
          const index = path.findIndex(cell => cell.row === currentRow && cell.col === currentCol);
          const removed = path.splice(index + 1);
          removed.forEach(cell => pathSet.delete(`${cell.row},${cell.col}`));
        } else {
          path.push({ row: currentRow, col: currentCol });
          pathSet.add(key);
        }
      }
    }
    
    // Carve path
    for (let i = 0; i < path.length - 1; i++) {
      const current = path[i];
      const next = path[i + 1];
      
      grid.cells[current.row][current.col].isWall = false;
      visited.add(`${current.row},${current.col}`);
      
      // Carve wall between cells
      const wallRow = current.row + (next.row - current.row) / 2;
      const wallCol = current.col + (next.col - current.col) / 2;
      grid.cells[wallRow][wallCol].isWall = false;
      
      yield { type: 'carve', cell: current };
    }
  }
  
  yield { type: 'complete' };
}

/**
 * Binary Tree Maze Generator
 * Creates simple mazes with a bias towards top-right
 */
export function* binaryTree(grid) {
  const rows = grid.rows;
  const cols = grid.cols;
  
  // Clear grid
  clearGrid(grid);
  
  // Initialize all cells as walls
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      grid.cells[r][c].isWall = true;
    }
  }
  
  // Process each cell
  for (let r = 1; r < rows; r += 2) {
    for (let c = 1; c < cols; c += 2) {
      grid.cells[r][c].isWall = false;
      
      // Choose between north and west (or both if available)
      const canGoNorth = r > 1;
      const canGoWest = c > 1;
      
      if (canGoNorth && canGoWest) {
        if (Math.random() < 0.5) {
          // Carve north
          grid.cells[r - 1][c].isWall = false;
        } else {
          // Carve west
          grid.cells[r][c - 1].isWall = false;
        }
      } else if (canGoNorth) {
        grid.cells[r - 1][c].isWall = false;
      } else if (canGoWest) {
        grid.cells[r][c - 1].isWall = false;
      }
      
      yield { type: 'carve', cell: { row: r, col: c } };
    }
  }
  
  yield { type: 'complete' };
}

/**
 * Helper Functions
 */

function clearGrid(grid) {
  for (let r = 0; r < grid.rows; r++) {
    for (let c = 0; c < grid.cols; c++) {
      grid.cells[r][c].isWall = false;
      grid.cells[r][c].weight = 1;
      grid.cells[r][c].state = 'unvisited';
    }
  }
}

function isValidCell(row, col, rows, cols) {
  return row >= 0 && row < rows && col >= 0 && col < cols;
}

function addWalls(row, col, walls, grid) {
  const directions = [
    [-2, 0], [2, 0], [0, -2], [0, 2]
  ];
  
  for (const [dr, dc] of directions) {
    const newRow = row + dr;
    const newCol = col + dc;
    
    if (isValidCell(newRow, newCol, grid.rows, grid.cols) && 
        grid.cells[newRow][newCol].isWall) {
      walls.push({
        row: row + dr/2,
        col: col + dc/2,
        fromRow: row,
        fromCol: col,
        toRow: newRow,
        toCol: newCol
      });
    }
  }
}

function findSet(sets, key) {
  const parent = sets.get(key);
  if (parent === key) return key;
  const root = findSet(sets, parent);
  sets.set(key, root);
  return root;
}

function unionSets(sets, set1, set2) {
  const root1 = findSet(sets, set1);
  const root2 = findSet(sets, set2);
  sets.set(root1, root2);
}

function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

// Export all generators
export const MAZE_GENERATORS = {
  recursiveBacktracker,
  primsAlgorithm,
  kruskalsAlgorithm,
  wilsonsAlgorithm,
  binaryTree
};

export const MAZE_NAMES = {
  recursiveBacktracker: 'Recursive Backtracker',
  primsAlgorithm: "Prim's Algorithm",
  kruskalsAlgorithm: "Kruskal's Algorithm",
  wilsonsAlgorithm: "Wilson's Algorithm",
  binaryTree: 'Binary Tree'
};
