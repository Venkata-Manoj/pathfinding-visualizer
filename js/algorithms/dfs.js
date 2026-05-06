/**
 * Pathfinding Visualizer - Depth-First Search (DFS)
 * Explores as deep as possible before backtracking
 * Does NOT guarantee shortest path
 */

import { baseAlgorithm, cellKey, isSameCell } from './base.js';

/**
 * DFS Algorithm Generator
 * Uses a stack (LIFO) to explore as deep as possible
 * Memory efficient but does not guarantee shortest path
 * 
 * Yields:
 * - { type: 'open', cell } - Cell added to stack
 * - { type: 'closed', cell } - Cell removed from stack (being processed)
 * - { type: 'path', cell } - Cell on the final path
 * - { type: 'done', success, ... } - Algorithm complete
 */
export function* dfs(grid) {
  const setup = yield* baseAlgorithm(grid, { weighted: false });
  const { start, goal, incrementVisit, getNeighbors, reconstructPath, cellKey } = setup;
  
  // Stack for DFS (LIFO)
  const stack = [start];
  
  // Track visited cells
  const visited = new Set();
  visited.add(cellKey(start));
  
  // Track parent pointers
  const parent = new Map();
  parent.set(cellKey(start), null);
  
  // Mark start as visited
  yield { 
    type: 'open', 
    cell: start,
    description: 'DFS starts from the start node'
  };
  
  while (stack.length > 0) {
    const current = stack.pop();
    const currentKey = cellKey(current);
    
    // Mark as being processed
    yield { 
      type: 'closed', 
      cell: current,
      visitOrder: incrementVisit(),
      description: 'Processing cell from stack (going deeper)'
    };
    
    // Check if we reached the goal
    if (isSameCell(current, goal)) {
      yield* reconstructPath(current, parent);
      return;
    }
    
    // Explore neighbors (in reverse order so first neighbor is processed first)
    const neighbors = getNeighbors(current);
    for (let i = neighbors.length - 1; i >= 0; i--) {
      const { cell: neighbor } = neighbors[i];
      const neighborKey = cellKey(neighbor);
      
      if (!visited.has(neighborKey)) {
        visited.add(neighborKey);
        parent.set(neighborKey, current);
        stack.push(neighbor);
        
        yield { 
          type: 'open', 
          cell: neighbor,
          description: 'Adding unvisited neighbor to stack (will explore deep first)'
        };
      }
    }
  }
  
  // No path found
  yield { 
    type: 'done', 
    success: false,
    error: 'No path found - goal is unreachable',
    visitedCount: visited.size
  };
}

/**
 * Recursive DFS (for reference, not used due to stack limits)
 * This would be the traditional recursive implementation
 */
export function* dfsRecursive(grid) {
  const setup = yield* baseAlgorithm(grid, { weighted: false });
  const { start, goal, getNeighbors, cellKey } = setup;
  
  const visited = new Set();
  const path = [];
  
  function* dfsHelper(current) {
    visited.add(cellKey(current));
    path.push(current);
    
    yield { type: 'closed', cell: current };
    
    if (isSameCell(current, goal)) {
      return true;
    }
    
    for (const { cell: neighbor } of getNeighbors(current)) {
      if (!visited.has(cellKey(neighbor))) {
        yield { type: 'open', cell: neighbor };
        
        const found = yield* dfsHelper(neighbor);
        if (found) return true;
      }
    }
    
    path.pop();
    return false;
  }
  
  const found = yield* dfsHelper(start);
  
  if (found) {
    for (const cell of path) {
      yield { type: 'path', cell };
    }
    yield { type: 'done', success: true, pathLength: path.length };
  } else {
    yield { type: 'done', success: false, error: 'No path found' };
  }
}
