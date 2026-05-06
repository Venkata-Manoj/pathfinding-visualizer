/**
 * Pathfinding Visualizer - Algorithm Worker
 * Runs pathfinding algorithms in a separate thread to prevent UI blocking
 */

// Import algorithms - these will be loaded as scripts in the worker
let algorithms = {};

// Load algorithm scripts
function loadAlgorithms() {
  // This would be handled by the worker initialization
  // For now, we'll use a simplified approach
}

/**
 * Message handler for the worker
 */
self.onmessage = function(e) {
  const { type, data } = e.data;
  
  switch (type) {
    case 'init':
      initializeAlgorithms(data);
      break;
    case 'run':
      runAlgorithm(data);
      break;
    case 'stop':
      stopAlgorithm();
      break;
    default:
      self.postMessage({ type: 'error', message: 'Unknown message type' });
  }
};

let currentAlgorithm = null;
let shouldStop = false;

/**
 * Initialize algorithm functions
 */
function initializeAlgorithms(data) {
  algorithms = data.algorithms;
  self.postMessage({ type: 'initialized' });
}

/**
 * Run algorithm with progress updates
 */
function runAlgorithm(data) {
  const { algorithmName, grid, heuristic, options } = data;
  
  shouldStop = false;
  
  try {
    const algorithm = algorithms[algorithmName];
    if (!algorithm) {
      throw new Error(`Algorithm ${algorithmName} not found`);
    }
    
    // Create generator
    let generator;
    if (algorithmName === 'astar') {
      generator = algorithm(grid, heuristic);
    } else {
      generator = algorithm(grid);
    }
    
    // Run algorithm with progress updates
    const results = [];
    let stepCount = 0;
    
    for (const step of generator) {
      if (shouldStop) {
        self.postMessage({ type: 'stopped' });
        return;
      }
      
      results.push(step);
      stepCount++;
      
      // Send progress update every 10 steps or for important events
      if (stepCount % 10 === 0 || step.type === 'done' || step.type === 'path') {
        self.postMessage({
          type: 'progress',
          step,
          stepCount,
          stats: calculateStats(results)
        });
      }
    }
    
    // Send final results
    self.postMessage({
      type: 'complete',
      results,
      stats: calculateStats(results)
    });
    
  } catch (error) {
    self.postMessage({
      type: 'error',
      message: error.message,
      stack: error.stack
    });
  }
}

/**
 * Stop current algorithm execution
 */
function stopAlgorithm() {
  shouldStop = true;
}

/**
 * Calculate statistics from algorithm results
 */
function calculateStats(results) {
  const stats = {
    totalSteps: results.length,
    visitedNodes: 0,
    pathLength: 0,
    pathCost: 0,
    executionTime: 0,
    memoryUsage: 0
  };
  
  const visited = new Set();
  const pathCells = [];
  
  for (const step of results) {
    switch (step.type) {
      case 'closed':
      case 'visit':
        visited.add(`${step.cell.row},${step.cell.col}`);
        stats.visitedNodes++;
        break;
      case 'path':
        pathCells.push(step.cell);
        stats.pathLength++;
        if (step.cell.weight) {
          stats.pathCost += step.cell.weight;
        }
        break;
    }
  }
  
  // Calculate path cost if not explicitly provided
  if (stats.pathCost === 0 && pathCells.length > 0) {
    stats.pathCost = pathCells.length;
  }
  
  return stats;
}

/**
 * Performance monitoring
 */
function getPerformanceMetrics() {
  if (performance && performance.memory) {
    return {
      memory: {
        used: performance.memory.usedJSHeapSize,
        total: performance.memory.totalJSHeapSize,
        limit: performance.memory.jsHeapSizeLimit
      },
      time: performance.now()
    };
  }
  return null;
}
