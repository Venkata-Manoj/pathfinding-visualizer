/**
 * Pathfinding Visualizer - Breadth-First Search (BFS)
 * Unweighted graph search that finds the shortest path
 */

import { baseAlgorithm, cellKey, isSameCell } from './base.js';

/**
 * BFS Algorithm Generator
 * Explores all neighbors at current depth before moving deeper
 * Guarantees shortest path in unweighted graphs
 * 
 * Yields:
 * - { type: 'open', cell } - Cell added to queue
 * - { type: 'closed', cell } - Cell removed from queue (being processed)
 * - { type: 'path', cell } - Cell on the final path
 * - { type: 'done', success, ... } - Algorithm complete
 */
export function* bfs(grid) {
  const setup = yield* baseAlgorithm(grid, { weighted: false });
  const { start, goal, incrementVisit, getNeighbors, reconstructPath, cellKey } = setup;
  
  // Queue for BFS (FIFO)
  const queue = [start];
  
  // Track visited cells
  const visited = new Set();
  visited.add(cellKey(start));
  
  // Track parent pointers for path reconstruction
  const parent = new Map();
  parent.set(cellKey(start), null);
  
  // Mark start as visited
  yield { 
    type: 'open', 
    cell: start,
    description: 'Starting from the start node'
  };
  
  while (queue.length > 0) {
    const current = queue.shift();
    const currentKey = cellKey(current);
    
    // Mark as being processed
    yield { 
      type: 'closed', 
      cell: current,
      visitOrder: incrementVisit(),
      description: 'Processing cell from queue'
    };
    
    // Check if we reached the goal
    if (isSameCell(current, goal)) {
      yield* reconstructPath(current, parent);
      return;
    }
    
    // Explore neighbors
    for (const { cell: neighbor, cost } of getNeighbors(current)) {
      const neighborKey = cellKey(neighbor);
      
      if (!visited.has(neighborKey)) {
        visited.add(neighborKey);
        parent.set(neighborKey, current);
        queue.push(neighbor);
        
        yield { 
          type: 'open', 
          cell: neighbor,
          description: 'Adding unvisited neighbor to queue'
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
 * BFS with early exit (stops when goal is first reached)
 * This is functionally the same as regular BFS but with clearer comments
 */
export function* bfsEarlyExit(grid) {
  const setup = yield* baseAlgorithm(grid, { weighted: false });
  const { start, goal, incrementVisit, getNeighbors, reconstructPath, cellKey } = setup;
  
  const queue = [start];
  const visited = new Set([cellKey(start)]);
  const parent = new Map([[cellKey(start), null]]);
  
  yield { type: 'open', cell: start, description: 'BFS starts from the start node' };
  
  while (queue.length > 0) {
    const current = queue.shift();
    
    yield { type: 'closed', cell: current, visitOrder: incrementVisit() };
    
    if (isSameCell(current, goal)) {
      yield* reconstructPath(current, parent);
      return;
    }
    
    for (const { cell: neighbor } of getNeighbors(current)) {
      const key = cellKey(neighbor);
      if (!visited.has(key)) {
        visited.add(key);
        parent.set(key, current);
        queue.push(neighbor);
        yield { type: 'open', cell: neighbor };
      }
    }
  }
  
  yield { type: 'done', success: false, error: 'No path found' };
}
