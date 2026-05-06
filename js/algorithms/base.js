/**
 * Pathfinding Visualizer - Algorithm Base Utilities
 * Shared utilities for all pathfinding algorithms
 */

import { CONFIG } from '../config.js';

/**
 * Direction vectors for neighbor generation
 */
export const DIRECTIONS_4 = CONFIG.DIRECTIONS_4;
export const DIRECTIONS_8 = CONFIG.DIRECTIONS_8;

/**
 * Heuristic functions for A* algorithm
 */
export const HEURISTICS = {
  /**
   * Manhattan Distance - Sum of absolute differences
   * Best for 4-directional movement
   */
  manhattan: (a, b) => Math.abs(a.row - b.row) + Math.abs(a.col - b.col),
  
  /**
   * Euclidean Distance - Straight line distance
   * Best for any-angle movement
   */
  euclidean: (a, b) => Math.sqrt((a.row - b.row) ** 2 + (a.col - b.col) ** 2),
  
  /**
   * Chebyshev Distance - Maximum of coordinate differences
   * Best for 8-directional movement with equal diagonal cost
   */
  chebyshev: (a, b) => Math.max(Math.abs(a.row - b.row), Math.abs(a.col - b.col)),
  
  /**
   * Octile Distance - Accurate for 8-directional with sqrt(2) diagonal cost
   */
  octile: (a, b) => {
    const dx = Math.abs(a.col - b.col);
    const dy = Math.abs(a.row - b.row);
    return Math.max(dx, dy) + (Math.SQRT2 - 1) * Math.min(dx, dy);
  },
};

/**
 * Create a unique key for a cell
 */
export function cellKey(cell) {
  return `${cell.row},${cell.col}`;
}

/**
 * Base generator setup for pathfinding algorithms
 * Yields step objects for visualization
 * 
 * Step types:
 * - { type: 'visit', cell, ... } - Cell is being explored
 * - { type: 'explore', cell, ... } - Cell is added to open set
 * - { type: 'path', cell, ... } - Cell is part of final path
 * - { type: 'done', success, ... } - Algorithm completed
 */
export function* baseAlgorithm(grid, options = {}) {
  const { 
    directions = DIRECTIONS_4, 
    allowDiagonal = false,
    weighted = false 
  } = options;
  
  const start = grid.start;
  const goal = grid.goal;
  
  // Validate start and goal exist
  if (!start || !goal) {
    yield { type: 'done', success: false, error: 'Missing start or goal' };
    return;
  }
  
  // Reset grid algorithm state
  grid.resetAlgorithmState();
  
  let visitOrder = 0;
  
  /**
   * Get valid neighbors of a cell
   */
  function* getNeighbors(cell) {
    for (const [dr, dc] of directions) {
      const r = cell.row + dr;
      const c = cell.col + dc;
      
      if (grid.isValidPosition(r, c)) {
        const neighbor = grid.cells[r][c];
        if (!neighbor.isWall) {
          // Calculate movement cost
          let cost = 1;
          if (weighted) {
            cost = neighbor.weight;
            // Diagonal movement costs more
            if (Math.abs(dr) + Math.abs(dc) === 2) {
              cost *= Math.SQRT2;
            }
          }
          yield { cell: neighbor, cost };
        }
      }
    }
  }
  
  /**
   * Reconstruct path from goal to start using parent pointers
   */
  function* reconstructPath(current, parentMap) {
    const path = [];
    let node = current;
    
    // Build path from goal to start
    while (node) {
      path.unshift(node);
      node = parentMap.get(cellKey(node));
    }
    
    // Yield path cells in order
    for (const cell of path) {
      yield { 
        type: 'path', 
        cell,
        pathLength: path.length,
        isStart: cell === start,
        isGoal: cell === goal
      };
    }
    
    // Final done event
    yield { 
      type: 'done', 
      success: true,
      visitedCount: visitOrder,
      pathLength: path.length,
      start: { row: start.row, col: start.col },
      goal: { row: goal.row, col: goal.col }
    };
  }
  
  // Return utilities for the specific algorithm
  return {
    start,
    goal,
    visitOrder,
    incrementVisit: () => { visitOrder++; return visitOrder; },
    getNeighbors: (cell) => [...getNeighbors(cell)],
    reconstructPath,
    cellKey
  };
}

/**
 * Check if two cells are the same position
 */
export function isSameCell(a, b) {
  return a.row === b.row && a.col === b.col;
}

/**
 * Calculate total path cost by summing weights
 */
export function calculatePathCost(path) {
  return path.reduce((sum, cell) => sum + (cell.weight || 1), 0);
}
