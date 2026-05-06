/**
 * Pathfinding Visualizer - Bidirectional Search
 * Searches from both start and goal simultaneously for better performance
 * Works with both BFS and Dijkstra approaches
 */

import { baseAlgorithm, cellKey, isSameCell } from './base.js';

/**
 * Bidirectional BFS Algorithm Generator
 * Searches from both start and goal simultaneously
 * 
 * Yields:
 * - { type: 'open', cell, direction } - Cell added to frontier
 * - { type: 'closed', cell, direction } - Cell being processed
 * - { type: 'path', cell } - Cell on final path
 * - { type: 'meeting', cell } - Where searches meet
 * - { type: 'done', success, ... } - Algorithm complete
 */
export function* bidirectionalBFS(grid) {
  const setup = yield* baseAlgorithm(grid, { weighted: false });
  const { start, goal, incrementVisit, getNeighbors, reconstructPath } = setup;
  
  // Two queues for bidirectional search
  const startQueue = [start];
  const goalQueue = [goal];
  
  // Visited sets for both directions
  const startVisited = new Set([cellKey(start)]);
  const goalVisited = new Set([cellKey(goal)]);
  
  // Parent pointers for path reconstruction
  const startParents = new Map([[cellKey(start), null]]);
  const goalParents = new Map([[cellKey(goal), null]]);
  
  // Track meeting point
  let meetingCell = null;
  
  while (startQueue.length > 0 && goalQueue.length > 0 && !meetingCell) {
    // Alternate between expanding from start and goal
    if (startQueue.length > 0) {
      const startResult = yield* expandFrontier(
        startQueue, startVisited, startParents, goalVisited,
        'start', getNeighbors, incrementVisit
      );
      if (startResult.meeting) {
        meetingCell = startResult.meeting;
        break;
      }
    }
    
    if (goalQueue.length > 0) {
      const goalResult = yield* expandFrontier(
        goalQueue, goalVisited, goalParents, startVisited,
        'goal', getNeighbors, incrementVisit
      );
      if (goalResult.meeting) {
        meetingCell = goalResult.meeting;
        break;
      }
    }
  }
  
  if (meetingCell) {
    yield { type: 'meeting', cell: meetingCell };
    
    // Reconstruct path from both sides
    const path = reconstructBidirectionalPath(
      meetingCell, startParents, goalParents
    );
    
    for (const cell of path) {
      yield { type: 'path', cell };
    }
    
    yield { 
      type: 'done', 
      success: true,
      pathLength: path.length,
      meetingCell
    };
  } else {
    yield { 
      type: 'done', 
      success: false,
      message: 'No path found'
    };
  }
}

/**
 * Bidirectional Dijkstra Algorithm Generator
 * Weighted bidirectional search
 */
export function* bidirectionalDijkstra(grid) {
  const setup = yield* baseAlgorithm(grid, { weighted: true });
  const { start, goal, incrementVisit, getNeighbors, reconstructPath } = setup;
  
  // Priority queues for both directions
  const startPQ = new MinHeap();
  const goalPQ = new MinHeap();
  
  // Distance maps
  const startDist = new Map();
  const goalDist = new Map();
  
  // Visited sets
  const startVisited = new Set();
  const goalVisited = new Set();
  
  // Parent pointers
  const startParents = new Map();
  const goalParents = new Map();
  
  // Initialize
  startDist.set(cellKey(start), 0);
  goalDist.set(cellKey(goal), 0);
  startPQ.insert(start, 0);
  goalPQ.insert(goal, 0);
  startParents.set(cellKey(start), null);
  goalParents.set(cellKey(goal), null);
  
  let meetingCell = null;
  let bestPathLength = Infinity;
  
  while (startPQ.size() > 0 && goalPQ.size() > 0 && !meetingCell) {
    // Expand from the side with smaller frontier
    const startTop = startPQ.peek();
    const goalTop = goalPQ.peek();
    
    if (startTop.priority <= goalTop.priority) {
      const result = yield* expandWeightedFrontier(
        startPQ, startDist, startVisited, startParents, goalDist,
        'start', getNeighbors, incrementVisit
      );
      
      if (result.meeting) {
        const pathLength = startDist.get(cellKey(result.meeting)) + 
                          goalDist.get(cellKey(result.meeting));
        if (pathLength < bestPathLength) {
          bestPathLength = pathLength;
          meetingCell = result.meeting;
        }
      }
    } else {
      const result = yield* expandWeightedFrontier(
        goalPQ, goalDist, goalVisited, goalParents, startDist,
        'goal', getNeighbors, incrementVisit
      );
      
      if (result.meeting) {
        const pathLength = startDist.get(cellKey(result.meeting)) + 
                          goalDist.get(cellKey(result.meeting));
        if (pathLength < bestPathLength) {
          bestPathLength = pathLength;
          meetingCell = result.meeting;
        }
      }
    }
  }
  
  if (meetingCell) {
    yield { type: 'meeting', cell: meetingCell };
    
    const path = reconstructBidirectionalPath(
      meetingCell, startParents, goalParents
    );
    
    for (const cell of path) {
      yield { type: 'path', cell };
    }
    
    yield { 
      type: 'done', 
      success: true,
      pathLength: path.length,
      pathCost: bestPathLength,
      meetingCell
    };
  } else {
    yield { 
      type: 'done', 
      success: false,
      message: 'No path found'
    };
  }
}

/**
 * Expand frontier for unweighted bidirectional search
 */
function* expandFrontier(queue, visited, parents, otherVisited, direction, 
                       getNeighbors, incrementVisit) {
  if (queue.length === 0) return { steps: [], meeting: null };
  
  const current = queue.shift();
  const key = cellKey(current);
  
  if (visited.has(key)) return { steps: [], meeting: null };
  
  visited.add(key);
  incrementVisit();
  
  yield { type: 'closed', cell: current, direction };
  
  // Check if this cell is in the other search's visited set
  if (otherVisited.has(key)) {
    return { steps: [], meeting: current };
  }
  
  for (const neighbor of getNeighbors(current)) {
    const neighborKey = cellKey(neighbor);
    
    if (!visited.has(neighborKey) && !parents.has(neighborKey)) {
      parents.set(neighborKey, current);
      queue.push(neighbor);
      yield { type: 'open', cell: neighbor, direction };
    }
  }
  
  return { steps: [], meeting: null };
}

/**
 * Expand frontier for weighted bidirectional search
 */
function* expandWeightedFrontier(pq, dist, visited, parents, otherDist, direction,
                               getNeighbors, incrementVisit) {
  if (pq.size() === 0) return { steps: [], meeting: null };
  
  const { element: current, priority } = pq.extractMin();
  const key = cellKey(current);
  
  if (visited.has(key)) return { steps: [], meeting: null };
  
  visited.add(key);
  incrementVisit();
  
  yield { type: 'closed', cell: current, direction, distance: priority };
  
  // Check if this cell is in the other search's distance map
  if (otherDist.has(key)) {
    return { steps: [], meeting: current };
  }
  
  for (const neighbor of getNeighbors(current)) {
    const neighborKey = cellKey(neighbor);
    const weight = neighbor.weight || 1;
    const newDist = dist.get(key) + weight;
    
    if (!dist.has(neighborKey) || newDist < dist.get(neighborKey)) {
      dist.set(neighborKey, newDist);
      parents.set(neighborKey, current);
      pq.insert(neighbor, newDist);
      yield { type: 'open', cell: neighbor, direction, distance: newDist };
    }
  }
  
  return { steps: [], meeting: null };
}

/**
 * Reconstruct path from bidirectional search
 */
function reconstructBidirectionalPath(meetingCell, startParents, goalParents) {
  const path = [];
  
  // Path from start to meeting
  let current = meetingCell;
  while (current) {
    path.unshift(current);
    current = startParents.get(cellKey(current));
  }
  
  // Path from meeting to goal (excluding meeting cell to avoid duplication)
  current = goalParents.get(cellKey(meetingCell));
  while (current) {
    path.push(current);
    current = goalParents.get(cellKey(current));
  }
  
  return path;
}

/**
 * Simple Min Heap implementation for priority queues
 */
class MinHeap {
  constructor() {
    this.heap = [];
  }
  
  insert(element, priority) {
    this.heap.push({ element, priority });
    this.bubbleUp(this.heap.length - 1);
  }
  
  extractMin() {
    if (this.heap.length === 0) return null;
    if (this.heap.length === 1) return this.heap.pop();
    
    const min = this.heap[0];
    this.heap[0] = this.heap.pop();
    this.bubbleDown(0);
    return min;
  }
  
  peek() {
    return this.heap[0] || null;
  }
  
  size() {
    return this.heap.length;
  }
  
  bubbleUp(index) {
    while (index > 0) {
      const parentIndex = Math.floor((index - 1) / 2);
      if (this.heap[parentIndex].priority <= this.heap[index].priority) break;
      
      [this.heap[parentIndex], this.heap[index]] = [this.heap[index], this.heap[parentIndex]];
      index = parentIndex;
    }
  }
  
  bubbleDown(index) {
    while (true) {
      const leftChild = 2 * index + 1;
      const rightChild = 2 * index + 2;
      let smallest = index;
      
      if (leftChild < this.heap.length && 
          this.heap[leftChild].priority < this.heap[smallest].priority) {
        smallest = leftChild;
      }
      
      if (rightChild < this.heap.length && 
          this.heap[rightChild].priority < this.heap[smallest].priority) {
        smallest = rightChild;
      }
      
      if (smallest === index) break;
      
      [this.heap[index], this.heap[smallest]] = [this.heap[smallest], this.heap[index]];
      index = smallest;
    }
  }
}
