/**
 * Pathfinding Visualizer - Comparison Controller
 * Manages side-by-side algorithm racing and comparison
 */

import { Grid } from '../grid/model.js';
import { GridRenderer } from '../grid/renderer.js';
import { AnimationController } from '../animation/controller.js';
import { workerManager } from '../workers/worker-manager.js';

export class ComparisonController {
  constructor(container, baseGrid) {
    this.container = container;
    this.baseGrid = baseGrid;
    this.comparisons = [];
    this.isRunning = false;
    this.results = [];
    
    this.init();
  }
  
  /**
   * Initialize comparison mode
   */
  init() {
    this.createComparisonLayout();
    this.setupEventListeners();
  }
  
  /**
   * Create side-by-side layout
   */
  createComparisonLayout() {
    this.container.innerHTML = `
      <div class="comparison-container">
        <div class="comparison-header">
          <h2>Algorithm Comparison Mode</h2>
          <div class="comparison-controls">
            <button id="start-comparison" class="btn btn-primary">Start Race</button>
            <button id="pause-comparison" class="btn btn-secondary" disabled>Pause</button>
            <button id="reset-comparison" class="btn btn-secondary">Reset</button>
            <button id="exit-comparison" class="btn btn-ghost">Exit Comparison</button>
          </div>
        </div>
        
        <div class="comparison-grid" id="comparison-grid">
          <!-- Comparison panels will be added here -->
        </div>
        
        <div class="comparison-stats">
          <div class="stats-table">
            <table>
              <thead>
                <tr>
                  <th>Algorithm</th>
                  <th>Status</th>
                  <th>Visited</th>
                  <th>Path Length</th>
                  <th>Path Cost</th>
                  <th>Time (ms)</th>
                  <th>Winner</th>
                </tr>
              </thead>
              <tbody id="comparison-stats-body">
                <!-- Stats will be populated here -->
              </tbody>
            </table>
          </div>
        </div>
      </div>
    `;
  }
  
  /**
   * Setup event listeners
   */
  setupEventListeners() {
    document.getElementById('start-comparison').addEventListener('click', () => this.startRace());
    document.getElementById('pause-comparison').addEventListener('click', () => this.pauseRace());
    document.getElementById('reset-comparison').addEventListener('click', () => this.resetRace());
    document.getElementById('exit-comparison').addEventListener('click', () => this.exitComparison());
  }
  
  /**
   * Add algorithm to comparison
   */
  addAlgorithm(algorithmName, heuristic = null) {
    const comparisonId = `comparison-${this.comparisons.length}`;
    
    // Clone the base grid
    const grid = this.cloneGrid(this.baseGrid);
    
    // Create comparison panel
    const panel = this.createComparisonPanel(comparisonId, algorithmName, heuristic);
    document.getElementById('comparison-grid').appendChild(panel);
    
    // Create renderer for this comparison
    const canvas = panel.querySelector('canvas');
    const renderer = new GridRenderer(canvas, grid);
    
    // Create comparison object
    const comparison = {
      id: comparisonId,
      algorithmName,
      heuristic,
      grid,
      renderer,
      controller: null,
      startTime: null,
      endTime: null,
      stats: {
        visited: 0,
        pathLength: 0,
        pathCost: 0,
        executionTime: 0,
        status: 'ready'
      },
      workerTaskId: null
    };
    
    this.comparisons.push(comparison);
    this.updateStatsTable();
    
    // Initial render
    renderer.draw();
  }
  
  /**
   * Create comparison panel
   */
  createComparisonPanel(id, algorithmName, heuristic) {
    const panel = document.createElement('div');
    panel.className = 'comparison-panel';
    panel.id = id;
    
    const displayName = this.getAlgorithmDisplayName(algorithmName, heuristic);
    
    panel.innerHTML = `
      <div class="panel-header">
        <h3>${displayName}</h3>
        <div class="panel-status" id="${id}-status">Ready</div>
      </div>
      <div class="panel-canvas">
        <canvas id="${id}-canvas"></canvas>
      </div>
      <div class="panel-metrics">
        <div class="metric">
          <span class="metric-label">Visited:</span>
          <span class="metric-value" id="${id}-visited">0</span>
        </div>
        <div class="metric">
          <span class="metric-label">Path:</span>
          <span class="metric-value" id="${id}-path">0</span>
        </div>
        <div class="metric">
          <span class="metric-label">Cost:</span>
          <span class="metric-value" id="${id}-cost">0</span>
        </div>
        <div class="metric">
          <span class="metric-label">Time:</span>
          <span class="metric-value" id="${id}-time">0ms</span>
        </div>
      </div>
    `;
    
    return panel;
  }
  
  /**
   * Clone grid for comparison
   */
  cloneGrid(originalGrid) {
    const grid = new Grid(originalGrid.rows, originalGrid.cols);
    
    // Copy cell states
    for (let r = 0; r < originalGrid.rows; r++) {
      for (let c = 0; c < originalGrid.cols; c++) {
        const originalCell = originalGrid.cells[r][c];
        const newCell = grid.cells[r][c];
        
        newCell.isWall = originalCell.isWall;
        newCell.weight = originalCell.weight;
        newCell.state = 'unvisited';
      }
    }
    
    // Copy start and goal positions
    if (originalGrid.start) {
      grid.setStart(originalGrid.start.row, originalGrid.start.col);
    }
    if (originalGrid.goal) {
      grid.setGoal(originalGrid.goal.row, originalGrid.goal.col);
    }
    
    return grid;
  }
  
  /**
   * Start algorithm race
   */
  async startRace() {
    if (this.isRunning) return;
    
    this.isRunning = true;
    this.results = [];
    
    document.getElementById('start-comparison').disabled = true;
    document.getElementById('pause-comparison').disabled = false;
    
    // Start all algorithms simultaneously
    const promises = this.comparisons.map(comparison => this.runComparison(comparison));
    
    // Wait for all to complete
    try {
      const results = await Promise.allSettled(promises);
      this.handleRaceComplete(results);
    } catch (error) {
      console.error('Race error:', error);
    }
  }
  
  /**
   * Run individual comparison
   */
  async runComparison(comparison) {
    comparison.startTime = performance.now();
    comparison.stats.status = 'running';
    
    this.updateComparisonStatus(comparison.id, 'Running');
    
    try {
      // Run algorithm using worker manager
      const result = await workerManager.runAlgorithm(
        comparison.algorithmName,
        comparison.grid,
        comparison.heuristic,
        {
          onProgress: (step) => this.handleComparisonProgress(comparison, step)
        }
      );
      
      comparison.endTime = performance.now();
      comparison.stats.executionTime = comparison.endTime - comparison.startTime;
      comparison.stats.status = result.success ? 'completed' : 'failed';
      
      if (result.success) {
        comparison.stats.visited = result.stats.visitedNodes;
        comparison.stats.pathLength = result.stats.pathLength;
        comparison.stats.pathCost = result.stats.pathCost;
      }
      
      this.updateComparisonStatus(comparison.id, result.success ? 'Complete' : 'Failed');
      this.updateComparisonMetrics(comparison);
      
      return { comparison, result };
      
    } catch (error) {
      comparison.stats.status = 'error';
      this.updateComparisonStatus(comparison.id, 'Error');
      throw error;
    }
  }
  
  /**
   * Handle comparison progress
   */
  handleComparisonProgress(comparison, step) {
    // Update grid state based on step
    switch (step.type) {
      case 'open':
      case 'visit':
        comparison.grid.cells[step.cell.row][step.cell.col].state = 'open';
        break;
      case 'closed':
        comparison.grid.cells[step.cell.row][step.cell.col].state = 'closed';
        comparison.stats.visited++;
        break;
      case 'path':
        comparison.grid.cells[step.cell.row][step.cell.col].state = 'path';
        break;
    }
    
    // Update metrics
    this.updateComparisonMetrics(comparison);
    
    // Re-render
    comparison.renderer.draw();
  }
  
  /**
   * Update comparison status
   */
  updateComparisonStatus(comparisonId, status) {
    const statusEl = document.getElementById(`${comparisonId}-status`);
    if (statusEl) {
      statusEl.textContent = status;
      statusEl.className = `panel-status status-${status.toLowerCase()}`;
    }
  }
  
  /**
   * Update comparison metrics
   */
  updateComparisonMetrics(comparison) {
    const visitedEl = document.getElementById(`${comparison.id}-visited`);
    const pathEl = document.getElementById(`${comparison.id}-path`);
    const costEl = document.getElementById(`${comparison.id}-cost`);
    const timeEl = document.getElementById(`${comparison.id}-time`);
    
    if (visitedEl) visitedEl.textContent = comparison.stats.visited;
    if (pathEl) pathEl.textContent = comparison.stats.pathLength;
    if (costEl) costEl.textContent = comparison.stats.pathCost;
    if (timeEl) timeEl.textContent = `${Math.round(comparison.stats.executionTime)}ms`;
  }
  
  /**
   * Update stats table
   */
  updateStatsTable() {
    const tbody = document.getElementById('comparison-stats-body');
    tbody.innerHTML = '';
    
    this.comparisons.forEach(comparison => {
      const row = document.createElement('tr');
      const displayName = this.getAlgorithmDisplayName(comparison.algorithmName, comparison.heuristic);
      
      row.innerHTML = `
        <td>${displayName}</td>
        <td id="table-status-${comparison.id}">${comparison.stats.status}</td>
        <td id="table-visited-${comparison.id}">${comparison.stats.visited}</td>
        <td id="table-path-${comparison.id}">${comparison.stats.pathLength}</td>
        <td id="table-cost-${comparison.id}">${comparison.stats.pathCost}</td>
        <td id="table-time-${comparison.id}">${Math.round(comparison.stats.executionTime)}ms</td>
        <td id="table-winner-${comparison.id}">-</td>
      `;
      
      tbody.appendChild(row);
    });
  }
  
  /**
   * Handle race completion
   */
  handleRaceComplete(results) {
    this.isRunning = false;
    
    document.getElementById('start-comparison').disabled = false;
    document.getElementById('pause-comparison').disabled = true;
    
    // Determine winners
    this.determineWinners();
    
    // Show completion message
    this.showCompletionMessage();
  }
  
  /**
   * Determine winners in different categories
   */
  determineWinners() {
    const categories = {
      fastest: { metric: 'executionTime', name: 'Fastest' },
      shortest: { metric: 'pathLength', name: 'Shortest Path' },
      efficient: { metric: 'visited', name: 'Most Efficient' },
      cheapest: { metric: 'pathCost', name: 'Lowest Cost' }
    };
    
    Object.entries(categories).forEach(([category, info]) => {
      const winner = this.comparisons.reduce((best, current) => {
        if (current.stats.status !== 'completed') return best;
        if (!best || current.stats[info.metric] < best.stats[info.metric]) {
          return current;
        }
        return best;
      }, null);
      
      if (winner) {
        const winnerEl = document.getElementById(`table-winner-${winner.id}`);
        if (winnerEl) {
          winnerEl.textContent = info.name;
          winnerEl.className = 'winner-badge';
        }
      }
    });
  }
  
  /**
   * Show completion message
   */
  showCompletionMessage() {
    const completed = this.comparisons.filter(c => c.stats.status === 'completed');
    const failed = this.comparisons.filter(c => c.stats.status !== 'completed');
    
    let message = `Race complete! ${completed.length} algorithms finished successfully`;
    if (failed.length > 0) {
      message += `, ${failed.length} failed`;
    }
    
    // Update UI with completion message
    const header = document.querySelector('.comparison-header h2');
    header.textContent = message;
  }
  
  /**
   * Pause race
   */
  pauseRace() {
    // Implementation for pausing all running comparisons
    this.isRunning = false;
    document.getElementById('start-comparison').disabled = false;
    document.getElementById('pause-comparison').disabled = true;
  }
  
  /**
   * Reset race
   */
  resetRace() {
    this.comparisons.forEach(comparison => {
      // Reset grid states
      for (let r = 0; r < comparison.grid.rows; r++) {
        for (let c = 0; c < comparison.grid.cols; c++) {
          comparison.grid.cells[r][c].state = 'unvisited';
        }
      }
      
      // Reset stats
      comparison.stats = {
        visited: 0,
        pathLength: 0,
        pathCost: 0,
        executionTime: 0,
        status: 'ready'
      };
      
      // Reset UI
      this.updateComparisonStatus(comparison.id, 'Ready');
      this.updateComparisonMetrics(comparison);
      comparison.renderer.draw();
    });
    
    this.updateStatsTable();
  }
  
  /**
   * Exit comparison mode
   */
  exitComparison() {
    this.container.innerHTML = '';
    this.comparisons = [];
    this.isRunning = false;
    
    // Trigger event to return to normal mode
    this.container.dispatchEvent(new CustomEvent('exitComparison'));
  }
  
  /**
   * Get algorithm display name
   */
  getAlgorithmDisplayName(algorithmName, heuristic) {
    const names = {
      bfs: 'BFS',
      dfs: 'DFS',
      dijkstra: "Dijkstra's",
      astar: 'A*',
      bidirectionalBFS: 'Bidirectional BFS',
      bidirectionalDijkstra: 'Bidirectional Dijkstra'
    };
    
    let name = names[algorithmName] || algorithmName;
    if (heuristic && algorithmName === 'astar') {
      name += ` (${heuristic})`;
    }
    
    return name;
  }
}
