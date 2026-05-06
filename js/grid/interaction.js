/**
 * Pathfinding Visualizer - Grid Interaction
 * Mouse and touch event handling for drawing and dragging
 */

import { state } from '../state.js';
import { showToast } from '../ui/toast.js';

/**
 * Grid Interaction Handler
 */
export class GridInteraction {
  constructor(canvas, grid, renderer) {
    this.canvas = canvas;
    this.grid = grid;
    this.renderer = renderer;
    
    // Interaction state
    this.isDrawing = false;
    this.isDraggingStart = false;
    this.isDraggingGoal = false;
    this.lastCell = null;
    this.drawMode = 'wall';
    
    // Bind methods
    this.handleMouseDown = this.handleMouseDown.bind(this);
    this.handleMouseMove = this.handleMouseMove.bind(this);
    this.handleMouseUp = this.handleMouseUp.bind(this);
    this.handleTouchStart = this.handleTouchStart.bind(this);
    this.handleTouchMove = this.handleTouchMove.bind(this);
    this.handleTouchEnd = this.handleTouchEnd.bind(this);
    this.handleContextMenu = this.handleContextMenu.bind(this);
    
    // Subscribe to draw mode changes
    state.subscribe('drawMode', (mode) => {
      this.drawMode = mode;
    });
    
    this.attachEventListeners();
  }
  
  /**
   * Attach all event listeners
   */
  attachEventListeners() {
    // Mouse events
    this.canvas.addEventListener('mousedown', this.handleMouseDown);
    this.canvas.addEventListener('mousemove', this.handleMouseMove);
    window.addEventListener('mouseup', this.handleMouseUp);
    this.canvas.addEventListener('contextmenu', this.handleContextMenu);
    
    // Touch events
    this.canvas.addEventListener('touchstart', this.handleTouchStart, { passive: false });
    this.canvas.addEventListener('touchmove', this.handleTouchMove, { passive: false });
    window.addEventListener('touchend', this.handleTouchEnd);
    
    // Prevent scrolling while drawing on touch devices
    this.canvas.addEventListener('touchstart', (e) => {
      if (e.target === this.canvas) {
        e.preventDefault();
      }
    }, { passive: false });
  }
  
  /**
   * Get coordinates from mouse or touch event
   */
  getEventCoords(event) {
    if (event.touches && event.touches.length > 0) {
      return {
        x: event.touches[0].clientX,
        y: event.touches[0].clientY
      };
    }
    return {
      x: event.clientX,
      y: event.clientY
    };
  }
  
  /**
   * Handle mouse/touch down
   */
  handleMouseDown(event) {
    if (state.get('isRunning')) {
      showToast('Cannot edit while algorithm is running', 'warning');
      return;
    }
    
    const coords = this.getEventCoords(event);
    const cell = this.renderer.getCellAtPosition(coords.x, coords.y);
    
    if (!cell) return;
    
    this.isDrawing = true;
    
    // Check if clicking on start or goal (for dragging)
    if (cell.isStart) {
      this.isDraggingStart = true;
      this.canvas.style.cursor = 'grabbing';
    } else if (cell.isGoal) {
      this.isDraggingGoal = true;
      this.canvas.style.cursor = 'grabbing';
    } else {
      // Normal drawing mode
      this.isDraggingStart = false;
      this.isDraggingGoal = false;
      this.applyDrawMode(cell);
    }
    
    this.lastCell = cell;
  }
  
  /**
   * Handle mouse/touch move
   */
  handleMouseMove(event) {
    if (!this.isDrawing) return;
    
    const coords = this.getEventCoords(event);
    const cell = this.renderer.getCellAtPosition(coords.x, coords.y);
    
    if (!cell || cell === this.lastCell) return;
    
    if (this.isDraggingStart) {
      // Move start position
      if (!cell.isGoal && !cell.isWall) {
        this.grid.setStart(cell.row, cell.col);
        this.renderer.markAllDirty();
      }
    } else if (this.isDraggingGoal) {
      // Move goal position
      if (!cell.isStart && !cell.isWall) {
        this.grid.setGoal(cell.row, cell.col);
        this.renderer.markAllDirty();
      }
    } else {
      // Continue drawing
      this.applyDrawMode(cell);
    }
    
    this.lastCell = cell;
  }
  
  /**
   * Handle mouse/touch up
   */
  handleMouseUp() {
    this.isDrawing = false;
    this.isDraggingStart = false;
    this.isDraggingGoal = false;
    this.lastCell = null;
    this.canvas.style.cursor = 'crosshair';
  }
  
  /**
   * Touch event wrappers
   */
  handleTouchStart(event) {
    event.preventDefault();
    this.handleMouseDown(event);
  }
  
  handleTouchMove(event) {
    event.preventDefault();
    this.handleMouseMove(event);
  }
  
  handleTouchEnd(event) {
    this.handleMouseUp(event);
  }
  
  /**
   * Prevent context menu on right click
   */
  handleContextMenu(event) {
    event.preventDefault();
    return false;
  }
  
  /**
   * Apply the current draw mode to a cell
   */
  applyDrawMode(cell) {
    let changed = false;
    
    switch (this.drawMode) {
      case 'wall':
        if (!cell.isWall && !cell.isStart && !cell.isGoal) {
          cell.isWall = true;
          cell.weight = 1;
          changed = true;
        }
        break;
        
      case 'weight2':
        if (!cell.isWall && !cell.isStart && !cell.isGoal) {
          cell.weight = 2;
          changed = true;
        }
        break;
        
      case 'weight3':
        if (!cell.isWall && !cell.isStart && !cell.isGoal) {
          cell.weight = 3;
          changed = true;
        }
        break;
        
      case 'eraser':
        if (!cell.isStart && !cell.isGoal && (cell.isWall || cell.weight > 1)) {
          cell.isWall = false;
          cell.weight = 1;
          changed = true;
        }
        break;
        
      case 'setstart':
        if (!cell.isGoal && !cell.isWall) {
          this.grid.setStart(cell.row, cell.col);
          this.renderer.markAllDirty();
          showToast(`Start position set to (${cell.row}, ${cell.col})`, 'success');
          // Reset to wall mode after setting start
          state.set('drawMode', 'wall');
          this.drawMode = 'wall';
          // Update UI buttons
          document.querySelectorAll('.btn-mode').forEach(btn => {
            btn.classList.remove('active');
            btn.setAttribute('aria-pressed', 'false');
            if (btn.dataset.mode === 'wall') {
              btn.classList.add('active');
              btn.setAttribute('aria-pressed', 'true');
            }
          });
        } else {
          showToast('Cannot place start on wall or goal', 'warning');
        }
        break;
        
      case 'setgoal':
        if (!cell.isStart && !cell.isWall) {
          this.grid.setGoal(cell.row, cell.col);
          this.renderer.markAllDirty();
          showToast(`Goal position set to (${cell.row}, ${cell.col})`, 'success');
          // Reset to wall mode after setting goal
          state.set('drawMode', 'wall');
          this.drawMode = 'wall';
          // Update UI buttons
          document.querySelectorAll('.btn-mode').forEach(btn => {
            btn.classList.remove('active');
            btn.setAttribute('aria-pressed', 'false');
            if (btn.dataset.mode === 'wall') {
              btn.classList.add('active');
              btn.setAttribute('aria-pressed', 'true');
            }
          });
        } else {
          showToast('Cannot place goal on wall or start', 'warning');
        }
        break;
    }
    
    if (changed) {
      this.renderer.markDirty(cell.row, cell.col);
      // Batch save state (don't save every single cell)
      if (!this.saveTimeout) {
        this.saveTimeout = setTimeout(() => {
          this.grid.saveState();
          this.saveTimeout = null;
        }, 100);
      }
    }
  }
  
  /**
   * Set the draw mode
   */
  setDrawMode(mode) {
    this.drawMode = mode;
    state.set('drawMode', mode);
  }
  
  /**
   * Set the interaction mode (handles special modes)
   */
  setMode(mode) {
    this.drawMode = mode;
    state.set('drawMode', mode);
  }
  
  /**
   * Clean up event listeners
   */
  destroy() {
    this.canvas.removeEventListener('mousedown', this.handleMouseDown);
    this.canvas.removeEventListener('mousemove', this.handleMouseMove);
    window.removeEventListener('mouseup', this.handleMouseUp);
    this.canvas.removeEventListener('contextmenu', this.handleContextMenu);
    this.canvas.removeEventListener('touchstart', this.handleTouchStart);
    this.canvas.removeEventListener('touchmove', this.handleTouchMove);
    window.removeEventListener('touchend', this.handleTouchEnd);
  }
}
