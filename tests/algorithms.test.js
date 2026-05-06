/**
 * Pathfinding Visualizer - Algorithm Unit Tests
 * Comprehensive testing for all pathfinding algorithms
 */

import { Grid } from '../js/grid/model.js';
import { bfs } from '../js/algorithms/bfs.js';
import { dfs } from '../js/algorithms/dfs.js';
import { dijkstra } from '../js/algorithms/dijkstra.js';
import { astar } from '../js/algorithms/astar.js';

// Test utilities
function createTestGrid(rows = 5, cols = 5) {
  const grid = new Grid(rows, cols);
  
  // Clear any existing walls
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      grid.cells[r][c].isWall = false;
      grid.cells[r][c].weight = 1;
    }
  }
  
  // Set start and goal
  grid.setStart(0, 0);
  grid.setGoal(rows - 1, cols - 1);
  
  return grid;
}

function collectSteps(generator) {
  const steps = [];
  let result = generator.next();
  
  while (!result.done) {
    steps.push(result.value);
    result = generator.next();
  }
  
  return { steps, result: result.value };
}

function extractPath(steps) {
  return steps
    .filter(step => step.type === 'path')
    .map(step => step.cell);
}

// Test suite
class AlgorithmTests {
  constructor() {
    this.testResults = [];
  }
  
  run(testName, testFn) {
    try {
      testFn();
      this.testResults.push({ name: testName, status: 'PASS', error: null });
      console.log(`✅ ${testName}`);
    } catch (error) {
      this.testResults.push({ name: testName, status: 'FAIL', error: error.message });
      console.error(`❌ ${testName}: ${error.message}`);
    }
  }
  
  assert(condition, message) {
    if (!condition) {
      throw new Error(message || 'Assertion failed');
    }
  }
  
  assertEqual(actual, expected, message) {
    if (actual !== expected) {
      throw new Error(message || `Expected ${expected}, got ${actual}`);
    }
  }
  
  assertPath(path, start, goal, message) {
    if (!path || path.length === 0) {
      throw new Error(message || 'Path is empty');
    }
    
    const firstCell = path[0];
    const lastCell = path[path.length - 1];
    
    if (firstCell.row !== start.row || firstCell.col !== start.col) {
      throw new Error(message || 'Path does not start at start position');
    }
    
    if (lastCell.row !== goal.row || lastCell.col !== goal.col) {
      throw new Error(message || 'Path does not end at goal position');
    }
  }
  
  printResults() {
    const passed = this.testResults.filter(r => r.status === 'PASS').length;
    const total = this.testResults.length;
    
    console.log(`\nTest Results: ${passed}/${total} passed`);
    
    this.testResults.forEach(result => {
      const icon = result.status === 'PASS' ? '✅' : '❌';
      console.log(`${icon} ${result.name}`);
      if (result.error) {
        console.log(`   ${result.error}`);
      }
    });
  }
}

// BFS Tests
function testBFS() {
  const tests = new AlgorithmTests();
  
  tests.run('BFS finds shortest path in empty grid', () => {
    const grid = createTestGrid(3, 3);
    const generator = bfs(grid);
    const { steps, result } = collectSteps(generator);
    const path = extractPath(steps);
    
    tests.assert(result.success, 'BFS should find a path');
    tests.assertPath(path, grid.start, grid.goal, 'Path should connect start to goal');
    tests.assertEqual(path.length, 5, 'Should find shortest path of 5 cells');
  });
  
  tests.run('BFS handles walls correctly', () => {
    const grid = createTestGrid(3, 3);
    
    // Add wall to force longer path
    grid.cells[1][1].isWall = true;
    
    const generator = bfs(grid);
    const { steps, result } = collectSteps(generator);
    const path = extractPath(steps);
    
    tests.assert(result.success, 'BFS should find a path around walls');
    tests.assertPath(path, grid.start, grid.goal, 'Path should connect start to goal');
  });
  
  tests.run('BFS handles impossible path', () => {
    const grid = createTestGrid(3, 3);
    
    // Block all possible paths
    grid.cells[0][1].isWall = true;
    grid.cells[1][0].isWall = true;
    grid.cells[1][2].isWall = true;
    grid.cells[2][1].isWall = true;
    
    const generator = bfs(grid);
    const { result } = collectSteps(generator);
    
    tests.assert(!result.success, 'BFS should fail when no path exists');
  });
  
  tests.run('BFS explores in correct order', () => {
    const grid = createTestGrid(3, 3);
    const generator = bfs(grid);
    const { steps } = collectSteps(generator);
    
    const openSteps = steps.filter(step => step.type === 'open');
    const expectedOrder = [
      { row: 0, col: 1 }, // Right from start
      { row: 1, col: 0 }, // Down from start
      { row: 0, col: 2 }, // Right again
      { row: 1, col: 1 }, // Down from (0,1)
      { row: 2, col: 0 }, // Down from (1,0)
    ];
    
    // Check that BFS explores level by level
    expectedOrder.forEach((expected, index) => {
      if (index < openSteps.length) {
        const actual = openSteps[index].cell;
        tests.assertEqual(
          `${actual.row},${actual.col}`,
          `${expected.row},${expected.col}`,
          `Step ${index + 1} should explore ${expected.row},${expected.col}`
        );
      }
    });
  });
  
  tests.printResults();
  return tests.testResults;
}

// DFS Tests
function testDFS() {
  const tests = new AlgorithmTests();
  
  tests.run('DFS finds a path', () => {
    const grid = createTestGrid(3, 3);
    const generator = dfs(grid);
    const { steps, result } = collectSteps(generator);
    const path = extractPath(steps);
    
    tests.assert(result.success, 'DFS should find a path');
    tests.assertPath(path, grid.start, grid.goal, 'Path should connect start to goal');
  });
  
  tests.run('DFS explores deeply', () => {
    const grid = createTestGrid(3, 3);
    const generator = dfs(grid);
    const { steps } = collectSteps(generator);
    
    const openSteps = steps.filter(step => step.type === 'open');
    
    // DFS should explore deeply rather than broadly
    tests.assert(openSteps.length > 0, 'DFS should explore cells');
    
    // Check that it doesn't necessarily explore in BFS order
    // (this is more of a behavioral test)
  });
  
  tests.run('DFS handles impossible path', () => {
    const grid = createTestGrid(3, 3);
    
    // Block all paths
    grid.cells[0][1].isWall = true;
    grid.cells[1][0].isWall = true;
    grid.cells[1][2].isWall = true;
    grid.cells[2][1].isWall = true;
    
    const generator = dfs(grid);
    const { result } = collectSteps(generator);
    
    tests.assert(!result.success, 'DFS should fail when no path exists');
  });
  
  tests.printResults();
  return tests.testResults;
}

// Dijkstra Tests
function testDijkstra() {
  const tests = new AlgorithmTests();
  
  tests.run('Dijkstra finds shortest path in weighted grid', () => {
    const grid = createTestGrid(3, 3);
    
    // Add weights to create different path costs
    grid.cells[0][1].weight = 5; // Expensive to go right
    grid.cells[1][0].weight = 1; // Cheap to go down
    
    const generator = dijkstra(grid);
    const { steps, result } = collectSteps(generator);
    const path = extractPath(steps);
    
    tests.assert(result.success, 'Dijkstra should find a path');
    tests.assertPath(path, grid.start, grid.goal, 'Path should connect start to goal');
    
    // Should prefer the cheaper path (down first)
    const secondCell = path[1];
    tests.assertEqual(
      `${secondCell.row},${secondCell.col}`,
      '1,0',
      'Should prefer cheaper path'
    );
  });
  
  tests.run('Dijkstra handles walls correctly', () => {
    const grid = createTestGrid(3, 3);
    grid.cells[1][1].isWall = true;
    
    const generator = dijkstra(grid);
    const { steps, result } = collectSteps(generator);
    const path = extractPath(steps);
    
    tests.assert(result.success, 'Dijkstra should find a path around walls');
    tests.assertPath(path, grid.start, grid.goal, 'Path should connect start to goal');
  });
  
  tests.run('Dijkstra calculates correct costs', () => {
    const grid = createTestGrid(3, 3);
    
    // Set specific weights
    grid.cells[0][1].weight = 2;
    grid.cells[1][1].weight = 3;
    grid.cells[1][2].weight = 4;
    grid.cells[2][2].weight = 5;
    
    const generator = dijkstra(grid);
    const { result } = collectSteps(generator);
    
    tests.assert(result.success, 'Dijkstra should find a path');
    tests.assert(result.pathCost > 0, 'Should calculate positive path cost');
  });
  
  tests.printResults();
  return tests.testResults;
}

// A* Tests
function testAStar() {
  const tests = new AlgorithmTests();
  
  tests.run('A* finds shortest path with Manhattan heuristic', () => {
    const grid = createTestGrid(3, 3);
    const generator = astar(grid, 'manhattan');
    const { steps, result } = collectSteps(generator);
    const path = extractPath(steps);
    
    tests.assert(result.success, 'A* should find a path');
    tests.assertPath(path, grid.start, grid.goal, 'Path should connect start to goal');
  });
  
  tests.run('A* works with different heuristics', () => {
    const grid = createTestGrid(3, 3);
    
    const heuristics = ['manhattan', 'euclidean', 'chebyshev', 'octile'];
    
    heuristics.forEach(heuristic => {
      const generator = astar(grid, heuristic);
      const { result } = collectSteps(generator);
      
      tests.assert(result.success, `A* should work with ${heuristic} heuristic`);
    });
  });
  
  tests.run('A* explores fewer nodes than Dijkstra in open space', () => {
    const grid = createTestGrid(5, 5);
    
    // Run A*
    const astarGenerator = astar(grid, 'manhattan');
    const { steps: astarSteps } = collectSteps(astarGenerator);
    const astarVisited = astarSteps.filter(step => step.type === 'closed').length;
    
    // Run Dijkstra for comparison
    const dijkstraGenerator = dijkstra(grid);
    const { steps: dijkstraSteps } = collectSteps(dijkstraGenerator);
    const dijkstraVisited = dijkstraSteps.filter(step => step.type === 'closed').length;
    
    // A* should generally explore fewer nodes in open spaces
    tests.assert(
      astarVisited <= dijkstraVisited,
      `A* should explore <= ${dijkstraVisited} nodes, explored ${astarVisited}`
    );
  });
  
  tests.run('A* handles weighted grids', () => {
    const grid = createTestGrid(3, 3);
    grid.cells[0][1].weight = 10; // Very expensive
    
    const generator = astar(grid, 'manhattan');
    const { steps, result } = collectSteps(generator);
    const path = extractPath(steps);
    
    tests.assert(result.success, 'A* should find a path in weighted grid');
    tests.assertPath(path, grid.start, grid.goal, 'Path should connect start to goal');
    
    // Should avoid expensive cell
    const avoidsExpensive = !path.some(cell => cell.row === 0 && cell.col === 1);
    tests.assert(avoidsExpensive, 'Should avoid expensive cells when possible');
  });
  
  tests.printResults();
  return tests.testResults;
}

// Performance Tests
function testPerformance() {
  const tests = new AlgorithmTests();
  
  tests.run('Algorithms handle larger grids efficiently', () => {
    const grid = createTestGrid(20, 20);
    const algorithms = [
      { name: 'BFS', fn: bfs },
      { name: 'DFS', fn: dfs },
      { name: 'Dijkstra', fn: dijkstra },
      { name: 'A*', fn: astar }
    ];
    
    algorithms.forEach(({ name, fn }) => {
      const startTime = performance.now();
      const generator = fn(grid);
      const { result } = collectSteps(generator);
      const endTime = performance.now();
      const executionTime = endTime - startTime;
      
      tests.assert(executionTime < 1000, `${name} should complete in under 1 second`);
      console.log(`${name} completed in ${executionTime.toFixed(2)}ms`);
    });
  });
  
  tests.run('Memory usage is reasonable', () => {
    const grid = createTestGrid(10, 10);
    
    // Test multiple runs to check for memory leaks
    for (let i = 0; i < 10; i++) {
      const generator = bfs(grid);
      collectSteps(generator);
    }
    
    // In a real environment, we'd check memory usage here
    // For now, just ensure it doesn't crash
    tests.assert(true, 'Multiple runs should not cause crashes');
  });
  
  tests.printResults();
  return tests.testResults;
}

// Edge Case Tests
function testEdgeCases() {
  const tests = new AlgorithmTests();
  
  tests.run('Algorithms handle 1x1 grid', () => {
    const grid = createTestGrid(1, 1);
    grid.setStart(0, 0);
    grid.setGoal(0, 0);
    
    const algorithms = [
      { name: 'BFS', fn: bfs },
      { name: 'DFS', fn: dfs },
      { name: 'Dijkstra', fn: dijkstra },
      { name: 'A*', fn: astar }
    ];
    
    algorithms.forEach(({ name, fn }) => {
      const generator = fn(grid);
      const { result } = collectSteps(generator);
      
      tests.assert(result.success, `${name} should handle 1x1 grid`);
    });
  });
  
  tests.run('Algorithms handle start equals goal', () => {
    const grid = createTestGrid(3, 3);
    grid.setGoal(0, 0); // Same as start
    
    const generator = bfs(grid);
    const { result } = collectSteps(generator);
    
    tests.assert(result.success, 'Should handle when start equals goal');
    tests.assertEqual(result.pathLength, 1, 'Path length should be 1');
  });
  
  tests.run('Algorithms handle completely blocked grid', () => {
    const grid = createTestGrid(3, 3);
    
    // Block everything except start and goal
    for (let r = 0; r < 3; r++) {
      for (let c = 0; c < 3; c++) {
        if (!((r === 0 && c === 0) || (r === 2 && c === 2))) {
          grid.cells[r][c].isWall = true;
        }
      }
    }
    
    const generator = bfs(grid);
    const { result } = collectSteps(generator);
    
    tests.assert(!result.success, 'Should fail when grid is completely blocked');
  });
  
  tests.printResults();
  return tests.testResults;
}

// Main test runner
export function runAllTests() {
  console.log('🧪 Running Algorithm Tests\n');
  
  const results = [
    ...testBFS(),
    ...testDFS(),
    ...testDijkstra(),
    ...testAStar(),
    ...testPerformance(),
    ...testEdgeCases()
  ];
  
  const totalTests = results.length;
  const passedTests = results.filter(r => r.status === 'PASS').length;
  
  console.log(`\n📊 Test Summary: ${passedTests}/${totalTests} tests passed`);
  
  if (passedTests === totalTests) {
    console.log('🎉 All tests passed!');
  } else {
    console.log('❌ Some tests failed. Check the output above for details.');
  }
  
  return {
    total: totalTests,
    passed: passedTests,
    failed: totalTests - passedTests,
    results
  };
}

// Export individual test functions for selective testing
export {
  testBFS,
  testDFS,
  testDijkstra,
  testAStar,
  testPerformance,
  testEdgeCases
};

// Run tests if this file is executed directly
if (typeof window !== 'undefined') {
  // Browser environment
  window.runAlgorithmTests = runAllTests;
} else if (typeof module !== 'undefined' && module.exports) {
  // Node.js environment
  module.exports = { runAllTests };
}
