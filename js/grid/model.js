/**
 * Pathfinding Visualizer - Grid Model
 * Core data structure for the grid with undo/redo support
 */

import { CONFIG } from '../config.js';

/**
 * Cell class representing a single grid cell
 */
export class Cell {
  constructor(row, col) {
    this.row = row;
    this.col = col;
    
    // Permanent properties
    this.isWall = false;
    this.weight = 1;
    this.isStart = false;
    this.isGoal = false;
    
    // Algorithm state (reset after each run)
    this.state = 'unvisited'; // unvisited | open | closed | path
    this.fScore = Infinity;
    this.gScore = Infinity;
    this.parent = null;
    
    // Animation properties
    this.pulsePhase = 0;
    this.visitOrder = 0;
  }
  
  /**
   * Reset algorithm-specific state
   */
  resetAlgorithmState() {
    this.state = 'unvisited';
    this.fScore = Infinity;
    this.gScore = Infinity;
    this.parent = null;
    this.pulsePhase = 0;
    this.visitOrder = 0;
  }
  
  /**
   * Create a copy of this cell
   */
  clone() {
    const copy = new Cell(this.row, this.col);
    copy.isWall = this.isWall;
    copy.weight = this.weight;
    copy.isStart = this.isStart;
    copy.isGoal = this.isGoal;
    return copy;
  }
  
  /**
   * Get unique key for this cell
   */
  get key() {
    return `${this.row},${this.col}`;
  }
}

/**
 * Grid class managing the 2D array of cells
 */
export class Grid {
  constructor(rows = CONFIG.DEFAULT_ROWS, cols = CONFIG.DEFAULT_COLS) {
    this.rows = rows;
    this.cols = cols;
    this.cells = [];
    this.start = null;
    this.goal = null;
    
    // Undo/redo history
    this.history = [];
    this.historyIndex = -1;
    this.maxHistorySize = CONFIG.MAX_HISTORY_SIZE;
    
    // Track if we should save state (skip during animations)
    this._skipHistory = false;
    
    this.init();
  }
  
  /**
   * Initialize the grid with empty cells
   */
  init() {
    this.cells = [];
    for (let r = 0; r < this.rows; r++) {
      this.cells[r] = [];
      for (let c = 0; c < this.cols; c++) {
        this.cells[r][c] = new Cell(r, c);
      }
    }
    
    // Set default start and goal positions
    this.setStart(0, 0);
    this.setGoal(this.rows - 1, this.cols - 1);
    
    // Save initial state
    this.saveState();
  }
  
  /**
   * Resize the grid (preserves existing cells where possible)
   */
  resize(newRows, newCols) {
    const oldCells = this.cells;
    const oldStart = this.start ? { ...this.start } : { row: 0, col: 0 };
    const oldGoal = this.goal ? { ...this.goal } : { row: newRows - 1, col: newCols - 1 };
    
    this.rows = newRows;
    this.cols = newCols;
    this.cells = [];
    
    for (let r = 0; r < this.rows; r++) {
      this.cells[r] = [];
      for (let c = 0; c < this.cols; c++) {
        if (r < oldCells.length && c < oldCells[0]?.length) {
          // Preserve existing cell
          this.cells[r][c] = oldCells[r][c];
        } else {
          // Create new cell
          this.cells[r][c] = new Cell(r, c);
        }
      }
    }
    
    // Restore start/goal positions (clamped to new bounds)
    const startRow = Math.min(oldStart.row, this.rows - 1);
    const startCol = Math.min(oldStart.col, this.cols - 1);
    const goalRow = Math.min(oldGoal.row, this.rows - 1);
    const goalCol = Math.min(oldGoal.col, this.cols - 1);
    
    this.setStart(startRow, startCol);
    
    // Ensure goal is different from start
    if (goalRow === startRow && goalCol === startCol) {
      this.setGoal(this.rows - 1, this.cols - 1);
    } else {
      this.setGoal(goalRow, goalCol);
    }
    
    this.saveState();
  }
  
  /**
   * Set the start position
   */
  setStart(row, col) {
    // Clear old start
    if (this.start) {
      this.start.isStart = false;
    }
    
    // Ensure start is not on goal
    if (this.goal && this.goal.row === row && this.goal.col === col) {
      return false;
    }
    
    // Set new start
    this.start = this.cells[row][col];
    this.start.isStart = true;
    this.start.isWall = false;
    
    return true;
  }
  
  /**
   * Set the goal position
   */
  setGoal(row, col) {
    // Clear old goal
    if (this.goal) {
      this.goal.isGoal = false;
    }
    
    // Ensure goal is not on start
    if (this.start && this.start.row === row && this.start.col === col) {
      return false;
    }
    
    // Set new goal
    this.goal = this.cells[row][col];
    this.goal.isGoal = true;
    this.goal.isWall = false;
    
    return true;
  }
  
  /**
   * Toggle wall at position
   */
  toggleWall(row, col) {
    const cell = this.cells[row][col];
    if (cell.isStart || cell.isGoal) return false;
    
    cell.isWall = !cell.isWall;
    if (cell.isWall) {
      cell.weight = CONFIG.WEIGHT_VALUES.normal;
    }
    
    this.saveState();
    return true;
  }
  
  /**
   * Set cell weight
   */
  setWeight(row, col, weight) {
    const cell = this.cells[row][col];
    if (cell.isStart || cell.isGoal || cell.isWall) return false;
    
    cell.weight = weight;
    this.saveState();
    return true;
  }
  
  /**
   * Clear a cell (remove wall and reset weight)
   */
  clearCell(row, col) {
    const cell = this.cells[row][col];
    if (cell.isStart || cell.isGoal) return false;
    
    cell.isWall = false;
    cell.weight = CONFIG.WEIGHT_VALUES.normal;
    this.saveState();
    return true;
  }
  
  /**
   * Clear all walls and weights
   */
  clearWalls() {
    this._skipHistory = true;
    for (let r = 0; r < this.rows; r++) {
      for (let c = 0; c < this.cols; c++) {
        const cell = this.cells[r][c];
        if (!cell.isStart && !cell.isGoal) {
          cell.isWall = false;
          cell.weight = CONFIG.WEIGHT_VALUES.normal;
        }
      }
    }
    this._skipHistory = false;
    this.saveState();
  }
  
  /**
   * Reset algorithm state (clear visited/path markers)
   */
  resetAlgorithmState() {
    for (let r = 0; r < this.rows; r++) {
      for (let c = 0; c < this.cols; c++) {
        this.cells[r][c].resetAlgorithmState();
      }
    }
  }
  
  /**
   * Get neighbors of a cell (4-way or 8-way)
   */
  getNeighbors(cell, allowDiagonal = false) {
    const directions = allowDiagonal ? CONFIG.DIRECTIONS_8 : CONFIG.DIRECTIONS_4;
    const neighbors = [];
    
    for (const [dr, dc] of directions) {
      const r = cell.row + dr;
      const c = cell.col + dc;
      
      if (this.isValidPosition(r, c)) {
        const neighbor = this.cells[r][c];
        if (!neighbor.isWall) {
          // Calculate movement cost (diagonal is sqrt(2))
          const cost = (Math.abs(dr) + Math.abs(dc) === 2) ? Math.SQRT2 : 1;
          neighbors.push({ cell: neighbor, cost });
        }
      }
    }
    
    return neighbors;
  }
  
  /**
   * Check if position is valid
   */
  isValidPosition(row, col) {
    return row >= 0 && row < this.rows && col >= 0 && col < this.cols;
  }
  
  /**
   * Get cell at position
   */
  getCell(row, col) {
    if (this.isValidPosition(row, col)) {
      return this.cells[row][col];
    }
    return null;
  }
  
  // ==================== UNDO/REDO ====================
  
  /**
   * Save current state to history
   */
  saveState() {
    if (this._skipHistory) return;
    
    const snapshot = this.serialize();
    
    // Remove any future history if we're not at the end
    if (this.historyIndex < this.history.length - 1) {
      this.history = this.history.slice(0, this.historyIndex + 1);
    }
    
    // Don't save if identical to last state
    if (this.historyIndex >= 0) {
      const lastState = JSON.stringify(this.history[this.historyIndex]);
      const newState = JSON.stringify(snapshot);
      if (lastState === newState) return;
    }
    
    this.history.push(snapshot);
    this.historyIndex++;
    
    // Limit history size
    if (this.history.length > this.maxHistorySize) {
      this.history.shift();
      this.historyIndex--;
    }
  }
  
  /**
   * Undo last action
   */
  undo() {
    if (this.historyIndex > 0) {
      this.historyIndex--;
      this.deserialize(this.history[this.historyIndex]);
      return true;
    }
    return false;
  }
  
  /**
   * Redo last undone action
   */
  redo() {
    if (this.historyIndex < this.history.length - 1) {
      this.historyIndex++;
      this.deserialize(this.history[this.historyIndex]);
      return true;
    }
    return false;
  }
  
  /**
   * Check if undo is available
   */
  canUndo() {
    return this.historyIndex > 0;
  }
  
  /**
   * Check if redo is available
   */
  canRedo() {
    return this.historyIndex < this.history.length - 1;
  }
  
  // ==================== SERIALIZATION ====================
  
  /**
   * Serialize grid state for export/history
   */
  serialize() {
    const walls = [];
    const weights = [];
    
    for (let r = 0; r < this.rows; r++) {
      for (let c = 0; c < this.cols; c++) {
        const cell = this.cells[r][c];
        if (cell.isWall) {
          walls.push({ r, c });
        } else if (cell.weight > 1) {
          weights.push({ r, c, w: cell.weight });
        }
      }
    }
    
    return {
      version: '1.0',
      rows: this.rows,
      cols: this.cols,
      start: { r: this.start.row, c: this.start.col },
      goal: { r: this.goal.row, c: this.goal.col },
      walls,
      weights,
    };
  }
  
  /**
   * Deserialize and restore grid state
   */
  deserialize(data) {
    this._skipHistory = true;
    
    // Resize if dimensions changed
    if (data.rows !== this.rows || data.cols !== this.cols) {
      this.resize(data.rows, data.cols);
    }
    
    // Clear all walls and weights
    this.clearWalls();
    
    // Restore walls
    data.walls?.forEach(({ r, c }) => {
      if (this.isValidPosition(r, c)) {
        this.cells[r][c].isWall = true;
      }
    });
    
    // Restore weights
    data.weights?.forEach(({ r, c, w }) => {
      if (this.isValidPosition(r, c)) {
        this.cells[r][c].weight = w;
      }
    });
    
    // Restore start and goal
    if (data.start) {
      this.setStart(data.start.r, data.start.c);
    }
    if (data.goal) {
      this.setGoal(data.goal.r, data.goal.c);
    }
    
    this._skipHistory = false;
  }
}
