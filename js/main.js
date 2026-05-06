/**
 * Pathfinding Visualizer - Main Entry Point
 * Initializes all components and wires them together
 */

import { Grid } from './grid/model.js';
import { GridRenderer } from './grid/renderer.js';
import { GridInteraction } from './grid/interaction.js';
import { AnimationController } from './animation/controller.js';
import { initTheme } from './ui/theme.js';
import { initControls } from './ui/controls.js';
import { showSuccess, showError } from './ui/toast.js';
import { state } from './state.js';
import { CONFIG, ALGORITHM_DESCRIPTIONS } from './config.js';

// Algorithm imports
import { bfs } from './algorithms/bfs.js';
import { dfs } from './algorithms/dfs.js';
import { dijkstra } from './algorithms/dijkstra.js';
import { astar } from './algorithms/astar.js';
import { bidirectionalBFS, bidirectionalDijkstra } from './algorithms/bidirectional.js';

// Map of algorithm names to functions
const ALGORITHMS = {
  bfs,
  dfs,
  dijkstra,
  astar,
  bibfs: bidirectionalBFS,
  bidijkstra: bidirectionalDijkstra,
};

/**
 * Main Application Class
 */
class PathfindingVisualizer {
  constructor() {
    this.grid = null;
    this.renderer = null;
    this.interaction = null;
    this.controller = null;
    
    this.init();
  }
  
  /**
   * Initialize the application
   */
  init() {
    try {
      // Initialize error boundary
      this.initErrorBoundary();
      
      // Initialize theme first
      initTheme();
      
      // Initialize grid
      this.initGrid();
      
      // Initialize renderer
      this.initRenderer();
      
      // Initialize interaction
      this.initInteraction();
      
      // Initialize animation controller
      this.initController();
      
      // Initialize UI controls
      this.initControls();
      
      // Handle window resize
      this.initResizeHandler();
      
      // Initialize accessibility features
      this.initAccessibility();
      
      // Initial render
      this.renderer.draw();
      
      // Show welcome message
      setTimeout(() => {
        showSuccess('Pathfinding Visualizer ready! Press H for keyboard shortcuts');
      }, 500);
      
      console.log('[App] Pathfinding Visualizer initialized successfully');
    } catch (err) {
      console.error('[App] Initialization error:', err);
      this.handleFatalError(err);
    }
  }
  
  /**
   * Initialize error boundary for unhandled errors
   */
  initErrorBoundary() {
    window.addEventListener('error', (event) => {
      console.error('[App] Unhandled error:', event.error);
      showError('An unexpected error occurred. Please refresh the page.');
      event.preventDefault();
    });
    
    window.addEventListener('unhandledrejection', (event) => {
      console.error('[App] Unhandled promise rejection:', event.reason);
      showError('An async error occurred. Please try again.');
      event.preventDefault();
    });
  }
  
  /**
   * Handle fatal initialization errors
   */
  handleFatalError(err) {
    const container = document.getElementById('main-content');
    if (container) {
      container.innerHTML = `
        <div class="error-fallback" role="alert" style="padding: 2rem; text-align: center;">
          <h2 style="color: var(--error); margin-bottom: 1rem;">Failed to Load</h2>
          <p>${escapeHtml(err.message)}</p>
          <button onclick="location.reload()" class="btn btn-primary" style="margin-top: 1rem;">
            Reload Page
          </button>
        </div>
      `;
    }
    showError('Failed to initialize app: ' + err.message);
  }
  
  /**
   * Initialize accessibility features
   */
  initAccessibility() {
    // Add reduced motion support
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (prefersReducedMotion.matches) {
      document.documentElement.classList.add('reduce-motion');
      if (this.controller) {
        this.controller.setSpeed(200); // Max speed to skip animations
      }
    }
    
    // Listen for changes
    prefersReducedMotion.addEventListener('change', (e) => {
      if (e.matches) {
        document.documentElement.classList.add('reduce-motion');
      } else {
        document.documentElement.classList.remove('reduce-motion');
      }
    });
    
    // Add high contrast support
    const prefersHighContrast = window.matchMedia('(prefers-contrast: high)');
    if (prefersHighContrast.matches) {
      document.documentElement.classList.add('high-contrast');
    }
    
    // Announce page load to screen readers
    this.announceToScreenReader('Pathfinding Visualizer loaded. Use keyboard shortcuts H for help.');
  }
  
  /**
   * Announce message to screen readers
   */
  announceToScreenReader(message) {
    const announcement = document.createElement('div');
    announcement.setAttribute('role', 'status');
    announcement.setAttribute('aria-live', 'polite');
    announcement.setAttribute('aria-atomic', 'true');
    announcement.className = 'sr-only';
    announcement.textContent = message;
    document.body.appendChild(announcement);
    setTimeout(() => announcement.remove(), 1000);
  }
  
  /**
   * Initialize the grid
   */
  initGrid() {
    this.grid = new Grid(CONFIG.DEFAULT_ROWS, CONFIG.DEFAULT_COLS);
  }
  
  /**
   * Initialize the canvas renderer
   */
  initRenderer() {
    const canvas = document.getElementById('grid-canvas');
    if (!canvas) {
      throw new Error('Canvas element not found');
    }
    
    this.renderer = new GridRenderer(canvas, this.grid);
  }
  
  /**
   * Initialize mouse/touch interaction
   */
  initInteraction() {
    this.interaction = new GridInteraction(
      this.renderer.canvas,
      this.grid,
      this.renderer
    );
  }
  
  /**
   * Initialize the animation controller
   */
  initController() {
    this.controller = new AnimationController(
      this.grid,
      this.renderer,
      {
        speed: state.get('speed'),
        onStep: (step) => this.handleStep(step),
        onComplete: (stats) => this.handleComplete(stats),
        onStatsUpdate: (stats) => this.handleStatsUpdate(stats),
      }
    );
  }
  
  /**
   * Initialize UI controls
   */
  initControls() {
    initControls({
      controller: this.controller,
      grid: this.grid,
      interaction: this.interaction,
      runAlgorithm: () => this.runAlgorithm(),
      algorithms: ALGORITHMS,
      // FIX Bug #8: removed broken updateStepCount reference (method doesn't exist on controller)
      // FIX Bug #2/#9: pass renderer so maze buttons can call renderer.draw()
      renderer: this.renderer,
    });
  }
  
  /**
   * Handle window resize
   */
  initResizeHandler() {
    let resizeTimeout;
    
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        this.renderer.resize();
        this.renderer.draw();
      }, 100);
    });
  }
  
  /**
   * Run the selected algorithm
   */
  runAlgorithm() {
    const algorithmName = state.get('algorithm');
    const heuristic = state.get('heuristic');
    
    // FIX Bug #1: fully reset controller stats so visited/path counters start at 0
    // Use reset() instead of clearPath() to ensure all state is fresh
    this.controller.reset();
    
    // Get algorithm generator
    const algorithmFn = ALGORITHMS[algorithmName];
    if (!algorithmFn) {
      showError(`Unknown algorithm: ${algorithmName}`);
      return;
    }
    
    // Create generator
    let generator;
    if (algorithmName === 'astar') {
      generator = algorithmFn(this.grid, heuristic);
    } else {
      generator = algorithmFn(this.grid);
    }
    
    // Start animation
    this.controller.start(generator);
    
    // Update explanation
    this.updateExplanation(algorithmName, 'running');
  }
  
  /**
   * Handle a step from the algorithm
   */
  handleStep(step) {
    // Update explanation panel for current step
    const explanationEl = document.getElementById('current-step');
    const explanationPanel = document.getElementById('explanation-current');
    
    if (explanationEl && step.description) {
      explanationEl.textContent = step.description;
      explanationPanel.style.display = 'block';
    }
  }
  
  /**
   * Handle algorithm completion
   */
  handleComplete(stats) {
    const algorithm = state.get('algorithm');
    
    if (stats.pathLength > 0) {
      showSuccess(
        `${ALGORITHM_DESCRIPTIONS[algorithm].short} complete! ` +
        `Path: ${stats.pathLength} cells, Cost: ${stats.pathCost}`,
        4000
      );
    } else {
      showError('No path found to the goal!');
    }
    
    this.updateExplanation(algorithm, 'complete');
  }
  
  /**
   * Handle stats update
   */
  handleStatsUpdate(stats) {
    // Stats are updated via state subscription in UI
  }
  
  /**
   * Update the algorithm explanation panel
   */
  updateExplanation(algorithm, status) {
    const descEl = document.getElementById('algorithm-description');
    const algoInfo = ALGORITHM_DESCRIPTIONS[algorithm];
    
    if (descEl && algoInfo) {
      descEl.textContent = algoInfo.description;
    }
  }
}

/**
 * Initialize app when DOM is ready
 */
function initApp() {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      window.app = new PathfindingVisualizer();
    });
  } else {
    window.app = new PathfindingVisualizer();
  }
}

// Start the app
initApp();

// Export for debugging
export { PathfindingVisualizer };

/**
 * Escape HTML special characters to prevent XSS
 */
function escapeHtml(text) {
  if (!text) return '';
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}
