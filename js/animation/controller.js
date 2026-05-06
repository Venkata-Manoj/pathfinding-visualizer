/**
 * Pathfinding Visualizer - Animation Controller
 * Orchestrates algorithm execution with requestAnimationFrame
 */

import { state } from '../state.js';

/**
 * Animation Controller
 * Manages the animation loop, pausing, stepping, and speed control
 */
export class AnimationController {
  constructor(grid, renderer, options = {}) {
    this.grid = grid;
    this.renderer = renderer;
    
    // Configuration
    this.speed = options.speed || 50; // steps per second
    this.minSpeed = 1;
    this.maxSpeed = 200;
    
    // Animation state
    this.generator = null;
    this.isRunning = false;
    this.isPaused = false;
    this.lastFrameTime = 0;
    this.accumulatedTime = 0;
    this.stepInterval = 1000 / this.speed;
    
    // Pulse animation
    this.pulsePhase = 0;
    
    // Callbacks
    this.onStep = options.onStep || (() => {});
    this.onComplete = options.onComplete || (() => {});
    this.onStatsUpdate = options.onStatsUpdate || (() => {});
    
    // Stats tracking
    this.stats = {
      visited: 0,
      pathLength: 0,
      pathCost: 0,
      steps: 0,
    };
    
    // Bind methods
    this.loop = this.loop.bind(this);
    
    // Subscribe to speed changes
    state.subscribe('speed', (newSpeed) => {
      this.setSpeed(newSpeed);
    });
  }
  
  /**
   * Set animation speed (steps per second)
   */
  setSpeed(speed) {
    this.speed = Math.max(this.minSpeed, Math.min(this.maxSpeed, speed));
    this.stepInterval = 1000 / this.speed;
  }
  
  /**
   * Start the algorithm animation
   */
  start(algorithmGenerator) {
    // Reset everything
    this.reset();
    
    // Set up new algorithm
    this.generator = algorithmGenerator;
    this.isRunning = true;
    this.isPaused = false;
    this.lastFrameTime = performance.now();
    
    // Update state
    state.set('isRunning', true);
    state.set('isPaused', false);
    
    // Start the animation loop
    requestAnimationFrame(this.loop);
  }
  
  /**
   * Main animation loop using requestAnimationFrame
   */
  loop(currentTime) {
    if (!this.isRunning) return;
    
    const deltaTime = currentTime - this.lastFrameTime;
    this.lastFrameTime = currentTime;
    
    if (!this.isPaused) {
      this.accumulatedTime += deltaTime;
      
      // Process steps based on speed
      let stepsProcessed = 0;
      const maxStepsPerFrame = Math.ceil(this.speed / 30); // Prevent freezing
      
      while (this.accumulatedTime >= this.stepInterval && stepsProcessed < maxStepsPerFrame) {
        const done = this.step();
        if (done) {
          this.complete();
          return;
        }
        this.accumulatedTime -= this.stepInterval;
        stepsProcessed++;
      }
      
      // Cap accumulated time to prevent catch-up spirals
      if (this.accumulatedTime > this.stepInterval * 3) {
        this.accumulatedTime = this.stepInterval * 3;
      }
    }
    
    // Always update pulse animation for visual feedback
    this.pulsePhase = (currentTime / 1000) * 2;
    this.updatePulseEffects();
    
    // Render
    this.renderer.draw(currentTime);
    
    // Continue loop if still running
    if (this.isRunning) {
      requestAnimationFrame(this.loop);
    }
  }
  
  /**
   * Process a single step of the algorithm
   * Returns true if algorithm is complete
   */
  step() {
    if (!this.generator) return true;
    
    const result = this.generator.next();
    
    if (result.done) {
      return true;
    }
    
    const step = result.value;
    this.stats.steps++;
    // Update step counter in UI
    state.set('stepCount', this.stats.steps);
    this.processStep(step);
    this.onStep(step);
    
    return false;
  }
  
  /**
   * Process a step from the algorithm generator
   */
  processStep(step) {
    const { type, cell } = step;
    
    if (!cell) return;
    
    const gridCell = this.grid.cells[cell.row][cell.col];
    
    switch (type) {
      case 'open':
        gridCell.state = 'open';
        gridCell.pulsePhase = 1;
        this.stats.visited++;
        break;
        
      case 'closed':
        gridCell.state = 'closed';
        gridCell.pulsePhase = 0;
        break;
        
      case 'path':
        gridCell.state = 'path';
        this.stats.pathLength++;
        this.stats.pathCost += gridCell.weight;
        break;
        
      case 'done':
        // Handle completion
        if (step.success) {
          this.stats = {
            visited: step.visitedCount || this.stats.visited,
            pathLength: step.pathLength || this.stats.pathLength,
            pathCost: this.stats.pathCost,
          };
        }
        break;
    }
    
    // Mark cell for redraw
    this.renderer.markDirty(cell.row, cell.col);
    
    // Update stats display
    this.onStatsUpdate(this.stats);
    state.batch({
      visitedCount: this.stats.visited,
      pathLength: this.stats.pathLength,
      pathCost: this.stats.pathCost,
    });
  }
  
  /**
   * Update pulse effects for open set cells
   */
  updatePulseEffects() {
    let hasOpenCells = false;
    
    for (let r = 0; r < this.grid.rows; r++) {
      for (let c = 0; c < this.grid.cols; c++) {
        const cell = this.grid.cells[r][c];
        if (cell.state === 'open') {
          hasOpenCells = true;
          cell.pulsePhase = Math.sin(this.pulsePhase + r * 0.1 + c * 0.1) * 0.3 + 0.7;
          this.renderer.markDirty(r, c);
        }
      }
    }
    
    return hasOpenCells;
  }
  
  /**
   * Pause the animation
   */
  pause() {
    if (this.isRunning && !this.isPaused) {
      this.isPaused = true;
      state.set('isPaused', true);
    }
  }
  
  /**
   * Resume the animation
   */
  resume() {
    if (this.isRunning && this.isPaused) {
      this.isPaused = false;
      this.lastFrameTime = performance.now();
      state.set('isPaused', false);
    }
  }
  
  /**
   * Toggle pause state
   */
  togglePause() {
    if (this.isPaused) {
      this.resume();
    } else {
      this.pause();
    }
  }
  
  /**
   * Reset animation state
   */
  reset() {
    this.isRunning = false;
    this.isPaused = false;
    this.generator = null;
    this.lastFrameTime = 0;
    this.accumulatedTime = 0;
    
    // Reset stats
    this.stats = {
      visited: 0,
      pathLength: 0,
      pathCost: 0,
      steps: 0,
    };
    
    state.batch({
      isRunning: false,
      isPaused: false,
      visitedCount: 0,
      pathLength: 0,
      pathCost: 0,
      stepCount: 0,
    });
    
    this.onStatsUpdate(this.stats);
  }
  
  /**
   * Clear only the path (keep walls and weights)
   */
  clearPath() {
    for (let r = 0; r < this.grid.rows; r++) {
      for (let c = 0; c < this.grid.cols; c++) {
        const cell = this.grid.cells[r][c];
        if (cell.state !== 'unvisited') {
          cell.resetAlgorithmState();
          this.renderer.markDirty(r, c);
        }
      }
    }
    
    this.stats = {
      visited: 0,
      pathLength: 0,
      pathCost: 0,
    };
    
    state.batch({
      visitedCount: 0,
      pathLength: 0,
      pathCost: 0,
    });
    
    this.onStatsUpdate(this.stats);
    this.renderer.draw();
  }
  
  /**
   * Handle algorithm completion
   */
  complete() {
    this.isRunning = false;
    this.isPaused = false;
    state.batch({
      isRunning: false,
      isPaused: false,
    });
    this.onComplete(this.stats);
  }
  
  /**
   * Check if animation is currently running
   */
  get running() {
    return this.isRunning;
  }
  
  /**
   * Check if animation is paused
   */
  get paused() {
    return this.isPaused;
  }
}
