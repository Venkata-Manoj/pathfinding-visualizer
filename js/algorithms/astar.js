/**
 * Pathfinding Visualizer - A* (A-Star) Algorithm
 * Combines actual cost from start with heuristic estimate to goal
 * Most efficient pathfinding for grid-based maps
 */

import { MinHeap } from './utils/heap.js';
import { baseAlgorithm, cellKey, isSameCell, HEURISTICS } from './base.js';

/**
 * A* Algorithm Generator
 * Uses priority queue ordered by f = g + h
 * - g: actual cost from start
 * - h: heuristic estimate to goal
 * 
 * Yields:
 * - { type: 'open', cell, f, g, h } - Cell added to open set
 * - { type: 'closed', cell, f, g, h } - Cell removed from open set
 * - { type: 'path', cell } - Cell on the final path
 * - { type: 'done', success, ... } - Algorithm complete
 */
export function* astar(grid, heuristicName = 'manhattan') {
  const setup = yield* baseAlgorithm(grid, { weighted: true });
  const { start, goal, incrementVisit, getNeighbors, reconstructPath, cellKey } = setup;
  
  const heuristic = HEURISTICS[heuristicName] || HEURISTICS.manhattan;
  
  // Priority queue ordered by f = g + h
  const openSet = new MinHeap((a, b) => a.f - b.f);
  
  // Track closed set (already processed)
  const closedSet = new Set();
  
  // Track g scores (cost from start)
  const gScore = new Map();
  gScore.set(cellKey(start), 0);
  
  // Track f scores (g + h)
  const fScore = new Map();
  fScore.set(cellKey(start), heuristic(start, goal));
  
  // Track parent pointers
  const parent = new Map();
  parent.set(cellKey(start), null);
  
  // Add start to open set
  const startH = heuristic(start, goal);
  openSet.push({ cell: start, f: startH, g: 0, h: startH });
  
  yield { 
    type: 'open', 
    cell: start, 
    f: startH, 
    g: 0, 
    h: startH,
    description: `A* starts with f = g + h = 0 + ${startH.toFixed(1)} = ${startH.toFixed(1)}`
  };
  
  while (!openSet.isEmpty()) {
    const current = openSet.pop();
    const currentKey = cellKey(current.cell);
    
    // Skip if already processed
    if (closedSet.has(currentKey)) {
      continue;
    }
    
    closedSet.add(currentKey);
    
    yield { 
      type: 'closed', 
      cell: current.cell, 
      f: current.f, 
      g: current.g, 
      h: current.h,
      visitOrder: incrementVisit(),
      description: `Expanding cell with f = ${current.f.toFixed(1)} (g=${current.g.toFixed(1)}, h=${current.h.toFixed(1)})`
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
      
      // Calculate tentative g score
      const tentativeG = current.g + cost;
      const currentG = gScore.get(neighborKey) || Infinity;
      
      // Update if this path is better
      if (tentativeG < currentG) {
        parent.set(neighborKey, current.cell);
        gScore.set(neighborKey, tentativeG);
        
        const h = heuristic(neighbor, goal);
        const f = tentativeG + h;
        fScore.set(neighborKey, f);
        
        openSet.push({ cell: neighbor, f, g: tentativeG, h });
        
        yield { 
          type: 'open', 
          cell: neighbor, 
          f, 
          g: tentativeG, 
          h,
          description: `Adding to open set: f = ${tentativeG.toFixed(1)} + ${h.toFixed(1)} = ${f.toFixed(1)}`
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
 * Weighted A* (WA*)
 * Allows trading off optimality for speed
 * Weight > 1 makes the heuristic more influential (faster but may not be optimal)
 * Weight = 1 is standard A* (optimal)
 */
export function* weightedAstar(grid, heuristicName = 'manhattan', weight = 1.5) {
  const setup = yield* baseAlgorithm(grid, { weighted: true });
  const { start, goal, incrementVisit, getNeighbors, reconstructPath, cellKey } = setup;
  
  const heuristic = HEURISTICS[heuristicName] || HEURISTICS.manhattan;
  
  const openSet = new MinHeap((a, b) => a.f - b.f);
  const closedSet = new Set();
  const gScore = new Map();
  const parent = new Map();
  
  gScore.set(cellKey(start), 0);
  parent.set(cellKey(start), null);
  
  const startH = heuristic(start, goal);
  const startF = 0 + weight * startH;
  openSet.push({ cell: start, f: startF, g: 0, h: startH });
  
  yield { 
    type: 'open', 
    cell: start, 
    f: startF, 
    g: 0, 
    h: startH,
    description: `Weighted A* (w=${weight}) starts with f = g + w*h = 0 + ${weight}*${startH.toFixed(1)} = ${startF.toFixed(1)}`
  };
  
  while (!openSet.isEmpty()) {
    const current = openSet.pop();
    const currentKey = cellKey(current.cell);
    
    if (closedSet.has(currentKey)) continue;
    closedSet.add(currentKey);
    
    yield { 
      type: 'closed', 
      cell: current.cell, 
      f: current.f, 
      g: current.g, 
      h: current.h,
      visitOrder: incrementVisit()
    };
    
    if (isSameCell(current.cell, goal)) {
      yield* reconstructPath(current.cell, parent);
      return;
    }
    
    for (const { cell: neighbor, cost } of getNeighbors(current.cell)) {
      const neighborKey = cellKey(neighbor);
      
      if (closedSet.has(neighborKey)) continue;
      
      const tentativeG = current.g + cost;
      const currentG = gScore.get(neighborKey) || Infinity;
      
      if (tentativeG < currentG) {
        parent.set(neighborKey, current.cell);
        gScore.set(neighborKey, tentativeG);
        
        const h = heuristic(neighbor, goal);
        const f = tentativeG + weight * h;
        
        openSet.push({ cell: neighbor, f, g: tentativeG, h });
        yield { type: 'open', cell: neighbor, f, g: tentativeG, h };
      }
    }
  }
  
  yield { type: 'done', success: false, error: 'No path found', visitedCount: closedSet.size };
}

/**
 * Greedy Best-First Search
 * Only uses heuristic (h), ignores cost from start (g)
 * Fast but does not guarantee shortest path
 */
export function* greedyBestFirst(grid, heuristicName = 'manhattan') {
  const setup = yield* baseAlgorithm(grid, { weighted: false });
  const { start, goal, incrementVisit, getNeighbors, reconstructPath, cellKey } = setup;
  
  const heuristic = HEURISTICS[heuristicName] || HEURISTICS.manhattan;
  
  const openSet = new MinHeap((a, b) => a.h - b.h);
  const closedSet = new Set();
  const parent = new Map();
  
  parent.set(cellKey(start), null);
  
  const startH = heuristic(start, goal);
  openSet.push({ cell: start, h: startH });
  
  yield { 
    type: 'open', 
    cell: start, 
    h: startH,
    description: `Greedy Best-First: only considers h = ${startH.toFixed(1)} to goal`
  };
  
  while (!openSet.isEmpty()) {
    const current = openSet.pop();
    const currentKey = cellKey(current.cell);
    
    if (closedSet.has(currentKey)) continue;
    closedSet.add(currentKey);
    
    yield { 
      type: 'closed', 
      cell: current.cell, 
      h: current.h,
      visitOrder: incrementVisit()
    };
    
    if (isSameCell(current.cell, goal)) {
      yield* reconstructPath(current.cell, parent);
      return;
    }
    
    for (const { cell: neighbor } of getNeighbors(current.cell)) {
      const neighborKey = cellKey(neighbor);
      
      if (closedSet.has(neighborKey)) continue;
      if (parent.has(neighborKey)) continue;
      
      parent.set(neighborKey, current.cell);
      const h = heuristic(neighbor, goal);
      
      openSet.push({ cell: neighbor, h });
      yield { type: 'open', cell: neighbor, h };
    }
  }
  
  yield { type: 'done', success: false, error: 'No path found', visitedCount: closedSet.size };
}
