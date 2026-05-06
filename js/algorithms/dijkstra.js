/**
 * Pathfinding Visualizer - Dijkstra's Algorithm
 * Finds the shortest path in weighted graphs
 * Always expands the node with the lowest known cost from start
 */

import { MinHeap } from './utils/heap.js';
import { baseAlgorithm, cellKey, isSameCell } from './base.js';

/**
 * Dijkstra's Algorithm Generator
 * Uses a priority queue (min heap) to always expand the lowest-cost node
 * Guarantees shortest path in weighted graphs
 * 
 * Yields:
 * - { type: 'open', cell, distance } - Cell added to priority queue
 * - { type: 'closed', cell, distance } - Cell removed from queue (being processed)
 * - { type: 'path', cell } - Cell on the final path
 * - { type: 'done', success, ... } - Algorithm complete
 */
export function* dijkstra(grid) {
  const setup = yield* baseAlgorithm(grid, { weighted: true });
  const { start, goal, incrementVisit, getNeighbors, reconstructPath, cellKey } = setup;
  
  // Priority queue ordered by distance from start
  const openSet = new MinHeap((a, b) => a.distance - b.distance);
  
  // Track closed set (already processed)
  const closedSet = new Set();
  
  // Track best known distance to each cell
  const distances = new Map();
  distances.set(cellKey(start), 0);
  
  // Track parent pointers for path reconstruction
  const parent = new Map();
  parent.set(cellKey(start), null);
  
  // Add start to open set
  openSet.push({ cell: start, distance: 0 });
  yield { 
    type: 'open', 
    cell: start, 
    distance: 0,
    description: 'Starting from the start node with distance 0'
  };
  
  while (!openSet.isEmpty()) {
    const current = openSet.pop();
    const currentKey = cellKey(current.cell);
    
    // Skip if already processed (we might have outdated entries in the heap)
    if (closedSet.has(currentKey)) {
      continue;
    }
    
    closedSet.add(currentKey);
    
    // Mark as being processed
    yield { 
      type: 'closed', 
      cell: current.cell, 
      distance: current.distance,
      visitOrder: incrementVisit(),
      description: `Processing cell with distance ${current.distance.toFixed(1)}`
    };
    
    // Check if we reached the goal
    if (isSameCell(current.cell, goal)) {
      yield* reconstructPath(current.cell, parent);
      return;
    }
    
    // Explore neighbors
    for (const { cell: neighbor, cost } of getNeighbors(current.cell)) {
      const neighborKey = cellKey(neighbor);
      
      // Skip if already processed
      if (closedSet.has(neighborKey)) {
        continue;
      }
      
      // Calculate new distance
      const currentDist = distances.get(currentKey) || Infinity;
      const newDist = currentDist + cost;
      
      // Update if this path is better
      if (newDist < (distances.get(neighborKey) || Infinity)) {
        distances.set(neighborKey, newDist);
        parent.set(neighborKey, current.cell);
        openSet.push({ cell: neighbor, distance: newDist });
        
        yield { 
          type: 'open', 
          cell: neighbor, 
          distance: newDist,
          description: `Found better path with distance ${newDist.toFixed(1)}`
        };
      }
    }
  }
  
  // No path found
  yield { 
    type: 'done', 
    success: false,
    error: 'No path found - goal is unreachable',
    visitedCount: closedSet.size
  };
}

/**
 * Optimized Dijkstra with decrease-key operation
 * More efficient for dense graphs
 */
export function* dijkstraOptimized(grid) {
  const setup = yield* baseAlgorithm(grid, { weighted: true });
  const { start, goal, incrementVisit, getNeighbors, reconstructPath, cellKey } = setup;
  
  // Use a Map for O(1) lookups and updates
  const openSet = new Map();
  const closedSet = new Set();
  const distances = new Map();
  const parent = new Map();
  
  distances.set(cellKey(start), 0);
  parent.set(cellKey(start), null);
  openSet.set(cellKey(start), start);
  
  yield { type: 'open', cell: start, distance: 0 };
  
  while (openSet.size > 0) {
    // Find node with minimum distance (O(n) - could be optimized with a proper heap)
    let currentKey = null;
    let currentDist = Infinity;
    let currentCell = null;
    
    for (const [key, cell] of openSet) {
      const dist = distances.get(key) || Infinity;
      if (dist < currentDist) {
        currentDist = dist;
        currentKey = key;
        currentCell = cell;
      }
    }
    
    if (!currentCell) break;
    
    openSet.delete(currentKey);
    closedSet.add(currentKey);
    
    yield { type: 'closed', cell: currentCell, distance: currentDist, visitOrder: incrementVisit() };
    
    if (isSameCell(currentCell, goal)) {
      yield* reconstructPath(currentCell, parent);
      return;
    }
    
    for (const { cell: neighbor, cost } of getNeighbors(currentCell)) {
      const neighborKey = cellKey(neighbor);
      
      if (closedSet.has(neighborKey)) continue;
      
      const newDist = currentDist + cost;
      
      if (newDist < (distances.get(neighborKey) || Infinity)) {
        distances.set(neighborKey, newDist);
        parent.set(neighborKey, currentCell);
        openSet.set(neighborKey, neighbor);
        yield { type: 'open', cell: neighbor, distance: newDist };
      }
    }
  }
  
  yield { type: 'done', success: false, error: 'No path found', visitedCount: closedSet.size };
}
