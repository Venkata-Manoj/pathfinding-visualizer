/**
 * Pathfinding Visualizer - Grid Renderer
 * Canvas-based rendering with dirty rectangle optimization
 */

import { CONFIG } from '../config.js';

/**
 * Get CSS custom property value
 */
function getCSSVar(name) {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}

/**
 * Grid Renderer - Handles all canvas drawing operations
 */
export class GridRenderer {
  constructor(canvas, grid) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d', { alpha: false });
    this.grid = grid;
    this.cellSize = CONFIG.CELL_SIZE_DESKTOP;
    
    // Dirty rectangle tracking for performance
    this.dirtyCells = new Set();
    this.needsFullRedraw = true;
    
    // Animation state
    this.pulseOffset = 0;
    this.lastFrameTime = 0;
    
    // Initialize
    this.resize();
  }
  
  /**
   * Resize canvas to fit container and recalculate cell size
   */
  resize() {
    const container = this.canvas.parentElement;
    if (!container) return;
    
    const rect = container.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    
    // Set canvas size in pixels (scaled for high DPI)
    this.canvas.width = rect.width * dpr;
    this.canvas.height = rect.height * dpr;
    
    // Set display size
    this.canvas.style.width = `${rect.width}px`;
    this.canvas.style.height = `${rect.height}px`;
    
    // Scale context for high DPI
    this.ctx.scale(dpr, dpr);
    
    // Calculate optimal cell size based on container
    const isMobile = rect.width < 640;
    const isTablet = rect.width >= 640 && rect.width < 1024;
    
    if (isMobile) {
      this.cellSize = CONFIG.CELL_SIZE_MOBILE;
    } else if (isTablet) {
      this.cellSize = CONFIG.CELL_SIZE_TABLET;
    } else {
      this.cellSize = CONFIG.CELL_SIZE_DESKTOP;
    }
    
    // Adjust grid dimensions if needed
    const maxCols = Math.floor(rect.width / this.cellSize);
    const maxRows = Math.floor(rect.height / this.cellSize);
    
    if (maxCols !== this.grid.cols || maxRows !== this.grid.rows) {
      // Grid needs to resize - this will trigger a full redraw
      this.grid.resize(
        Math.min(maxRows, CONFIG.MAX_ROWS),
        Math.min(maxCols, CONFIG.MAX_COLS)
      );
    }
    
    this.needsFullRedraw = true;
  }
  
  /**
   * Mark a cell as needing redraw
   */
  markDirty(row, col) {
    this.dirtyCells.add(`${row},${col}`);
  }
  
  /**
   * Mark all cells as dirty (for full redraw)
   */
  markAllDirty() {
    this.needsFullRedraw = true;
    this.dirtyCells.clear();
  }
  
  /**
   * Main draw function - called by animation loop
   */
  draw(timestamp = 0) {
    // Update pulse animation
    if (timestamp > 0) {
      this.pulseOffset = (timestamp / 1000) * 2;
    }
    
    // Decide whether to do full redraw or partial
    if (this.needsFullRedraw || this.dirtyCells.size > this.grid.rows * this.grid.cols * 0.3) {
      this.fullRedraw();
    } else {
      this.partialRedraw();
    }
    
    // Draw path overlay if path exists
    this.drawPathOverlay();
  }
  
  /**
   * Full redraw of entire canvas
   */
  fullRedraw() {
    const width = this.canvas.width / (window.devicePixelRatio || 1);
    const height = this.canvas.height / (window.devicePixelRatio || 1);
    
    // Clear canvas
    this.ctx.fillStyle = getCSSVar('--bg-secondary');
    this.ctx.fillRect(0, 0, width, height);
    
    // Draw all cells
    for (let r = 0; r < this.grid.rows; r++) {
      for (let c = 0; c < this.grid.cols; c++) {
        this.drawCell(r, c, true);
      }
    }
    
    this.needsFullRedraw = false;
    this.dirtyCells.clear();
  }
  
  /**
   * Partial redraw of only dirty cells
   */
  partialRedraw() {
    for (const key of this.dirtyCells) {
      const [r, c] = key.split(',').map(Number);
      this.drawCell(r, c, false);
    }
    this.dirtyCells.clear();
  }
  
  /**
   * Draw a single cell
   */
  drawCell(r, c, isFullRedraw) {
    const cell = this.grid.cells[r][c];
    const x = c * this.cellSize;
    const y = r * this.cellSize;
    const size = this.cellSize - 1; // 1px gap for grid lines
    
    // Get cell color based on state and properties
    const color = this.getCellColor(cell);
    
    // Draw cell background
    this.ctx.fillStyle = color;
    this.ctx.fillRect(x, y, size, size);
    
    // Draw weight indicator for weighted cells
    if (cell.weight > 1 && !cell.isWall && !cell.isStart && !cell.isGoal) {
      this.drawWeightIndicator(x, y, size, cell.weight);
    }
    
    // Draw start/goal markers
    if (cell.isStart) {
      this.drawStartMarker(x, y, size);
    } else if (cell.isGoal) {
      this.drawGoalMarker(x, y, size);
    }
    
    // Draw pulse effect for open set cells
    if (cell.state === 'open') {
      this.drawPulseEffect(x, y, size);
    }
  }
  
  /**
   * Get the appropriate color for a cell
   */
  getCellColor(cell) {
    if (cell.isWall) {
      return getCSSVar('--cell-wall');
    }
    
    switch (cell.state) {
      case 'path':
        return getCSSVar('--cell-path');
      case 'closed':
        return getCSSVar('--cell-closed');
      case 'open':
        return getCSSVar('--cell-open');
      default:
        // Weight-based colors for unvisited cells
        if (cell.weight === 3) return getCSSVar('--cell-weight-3');
        if (cell.weight === 2) return getCSSVar('--cell-weight-2');
        return getCSSVar('--cell-unvisited');
    }
  }
  
  /**
   * Draw weight indicator text
   */
  drawWeightIndicator(x, y, size, weight) {
    this.ctx.fillStyle = getCSSVar('--text-muted');
    this.ctx.font = `bold ${Math.max(8, size * 0.4)}px system-ui, sans-serif`;
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';
    this.ctx.fillText(weight.toString(), x + size / 2, y + size / 2);
  }
  
  /**
   * Draw start position marker
   */
  drawStartMarker(x, y, size) {
    const centerX = x + size / 2;
    const centerY = y + size / 2;
    const radius = size * 0.35;
    
    // Background circle
    this.ctx.fillStyle = getCSSVar('--cell-start');
    this.ctx.beginPath();
    this.ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    this.ctx.fill();
    
    // Icon (play arrow)
    this.ctx.fillStyle = getCSSVar('--text-inverse');
    this.ctx.beginPath();
    const iconSize = radius * 0.5;
    this.ctx.moveTo(centerX - iconSize * 0.3, centerY - iconSize);
    this.ctx.lineTo(centerX + iconSize * 0.6, centerY);
    this.ctx.lineTo(centerX - iconSize * 0.3, centerY + iconSize);
    this.ctx.closePath();
    this.ctx.fill();
  }
  
  /**
   * Draw goal position marker
   */
  drawGoalMarker(x, y, size) {
    const centerX = x + size / 2;
    const centerY = y + size / 2;
    const radius = size * 0.35;
    
    // Background circle
    this.ctx.fillStyle = getCSSVar('--cell-goal');
    this.ctx.beginPath();
    this.ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    this.ctx.fill();
    
    // Icon (target/flag)
    this.ctx.fillStyle = getCSSVar('--text-inverse');
    this.ctx.beginPath();
    const iconSize = radius * 0.5;
    this.ctx.moveTo(centerX - iconSize * 0.3, centerY - iconSize);
    this.ctx.lineTo(centerX + iconSize * 0.5, centerY - iconSize * 0.3);
    this.ctx.lineTo(centerX - iconSize * 0.3, centerY + iconSize * 0.4);
    this.ctx.closePath();
    this.ctx.fill();
    
    // Pole of flag
    this.ctx.fillRect(centerX - iconSize * 0.3, centerY + iconSize * 0.3, 2, iconSize * 0.6);
  }
  
  /**
   * Draw pulse animation for open set cells
   */
  drawPulseEffect(x, y, size) {
    const pulse = Math.sin(this.pulseOffset * Math.PI) * 0.15 + 0.85;
    const centerX = x + size / 2;
    const centerY = y + size / 2;
    const maxRadius = size * 0.4;
    const radius = maxRadius * pulse;
    
    this.ctx.fillStyle = getCSSVar('--primary-subtle');
    this.ctx.globalAlpha = 0.5;
    this.ctx.beginPath();
    this.ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    this.ctx.fill();
    this.ctx.globalAlpha = 1;
  }
  
  /**
   * Draw path overlay (connecting lines between path cells)
   */
  drawPathOverlay() {
    // Find all path cells
    const pathCells = [];
    for (let r = 0; r < this.grid.rows; r++) {
      for (let c = 0; c < this.grid.cols; c++) {
        if (this.grid.cells[r][c].state === 'path') {
          pathCells.push({ r, c });
        }
      }
    }
    
    if (pathCells.length < 2) return;
    
    // Draw connecting lines
    this.ctx.strokeStyle = getCSSVar('--cell-path');
    this.ctx.lineWidth = 2;
    this.ctx.lineCap = 'round';
    this.ctx.lineJoin = 'round';
    
    // Sort path cells by visit order to connect in sequence
    // For now, we'll just connect adjacent cells
    this.ctx.beginPath();
    
    for (let i = 0; i < pathCells.length; i++) {
      const { r, c } = pathCells[i];
      const x = c * this.cellSize + this.cellSize / 2;
      const y = r * this.cellSize + this.cellSize / 2;
      
      // Find adjacent path cells and draw line to them
      const directions = [[-1, 0], [1, 0], [0, -1], [0, 1]];
      for (const [dr, dc] of directions) {
        const nr = r + dr;
        const nc = c + dc;
        
        // Check if neighbor is also in path
        const neighbor = pathCells.find(p => p.r === nr && p.c === nc);
        if (neighbor) {
          const nx = nc * this.cellSize + this.cellSize / 2;
          const ny = nr * this.cellSize + this.cellSize / 2;
          
          this.ctx.moveTo(x, y);
          this.ctx.lineTo(nx, ny);
        }
      }
    }
    
    this.ctx.stroke();
  }
  
  /**
   * Convert screen coordinates to grid coordinates
   */
  screenToGrid(screenX, screenY) {
    const rect = this.canvas.getBoundingClientRect();
    const x = screenX - rect.left;
    const y = screenY - rect.top;
    
    const col = Math.floor(x / this.cellSize);
    const row = Math.floor(y / this.cellSize);
    
    if (this.grid.isValidPosition(row, col)) {
      return { row, col };
    }
    return null;
  }
  
  /**
   * Get cell at screen position
   */
  getCellAtPosition(screenX, screenY) {
    const coords = this.screenToGrid(screenX, screenY);
    if (coords) {
      return this.grid.getCell(coords.row, coords.col);
    }
    return null;
  }
}
