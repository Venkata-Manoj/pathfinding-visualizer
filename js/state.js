/**
 * Pathfinding Visualizer - Global State Management
 * Observable pattern for reactive UI updates
 */

import { CONFIG } from './config.js';

/**
 * Simple observable state container
 */
class ObservableState {
  constructor(initialState = {}) {
    this.state = { ...initialState };
    this.listeners = new Map();
  }
  
  /**
   * Subscribe to state changes
   * @param {string} key - State key to watch
   * @param {Function} callback - Function to call when value changes
   * @returns {Function} Unsubscribe function
   */
  subscribe(key, callback) {
    if (!this.listeners.has(key)) {
      this.listeners.set(key, new Set());
    }
    this.listeners.get(key).add(callback);
    
    // Return unsubscribe function
    return () => {
      this.listeners.get(key)?.delete(callback);
    };
  }
  
  /**
   * Get current state value
   */
  get(key) {
    return this.state[key];
  }
  
  /**
   * Set state value and notify listeners
   */
  set(key, value) {
    const oldValue = this.state[key];
    if (oldValue !== value) {
      this.state[key] = value;
      this.notify(key, value, oldValue);
    }
  }
  
  /**
   * Update multiple values at once
   */
  batch(updates) {
    const changed = [];
    for (const [key, value] of Object.entries(updates)) {
      if (this.state[key] !== value) {
        this.state[key] = value;
        changed.push(key);
      }
    }
    // Notify after all updates
    changed.forEach(key => this.notify(key, this.state[key]));
  }
  
  /**
   * Notify all listeners for a key
   */
  notify(key, newValue, oldValue) {
    this.listeners.get(key)?.forEach(callback => {
      try {
        callback(newValue, oldValue);
      } catch (err) {
        console.error(`[State] Error in listener for ${key}:`, err);
      }
    });
  }
  
  /**
   * Force notify all listeners for a key regardless of value change
   * Used to ensure UI refreshes even when values reset to same value (e.g. 0→0)
   */
  forceNotify(key) {
    this.notify(key, this.state[key]);
  }
  
  /**
   * Get entire state (for debugging)
   */
  getState() {
    return { ...this.state };
  }
}

// Create global state instance
export const state = new ObservableState({
  // Algorithm settings
  algorithm: 'astar',
  heuristic: 'manhattan',
  
  // Drawing settings
  drawMode: 'wall',
  
  // Animation settings
  isRunning: false,
  isPaused: false,
  speed: CONFIG.DEFAULT_SPEED,
  
  // Stats
  visitedCount: 0,
  pathLength: 0,
  pathCost: 0,
  stepCount: 0,
  
  // Grid dimensions
  rows: CONFIG.DEFAULT_ROWS,
  cols: CONFIG.DEFAULT_COLS,
  cellSize: CONFIG.CELL_SIZE_DESKTOP,
});

// Convenience getters/setters
export const getState = (key) => state.get(key);
export const setState = (key, value) => state.set(key, value);
export const subscribe = (key, callback) => state.subscribe(key, callback);
