/**
 * Pathfinding Visualizer - Maze Generation Algorithms
 * Creates interesting grid patterns for pathfinding
 */

/**
 * Recursive Backtracker (Randomized Depth-First Search)
 * Generates a perfect maze (exactly one path between any two points)
 * Yields steps for potential animation
 */
export function* recursiveBacktracker(grid) {
  // Clear existing walls
  grid.clearWalls();
  
  // Mark all cells as walls initially (except start and goal)
  for (let r = 0; r < grid.rows; r++) {
    for (let c = 0; c < grid.cols; c++) {
      const cell = grid.cells[r][c];
      if (!cell.isStart && !cell.isGoal) {
        cell.isWall = true;
      }
    }
  }
  
  // Ensure odd dimensions for proper maze
  const startR = grid.start.row % 2 === 0 ? grid.start.row + 1 : grid.start.row;
  const startC = grid.start.col % 2 === 0 ? grid.start.col + 1 : grid.start.col;
  
  // Stack for backtracking
  const stack = [];
  const startCell = grid.cells[startR] && grid.cells[startR][startC] 
    ? grid.cells[startR][startC] 
    : grid.cells[1][1];
  
  startCell.isWall = false;
  stack.push({ row: startCell.row, col: startCell.col });
  
  // Direction vectors (jump 2 cells at a time)
  const directions = [
    [-2, 0], // North
    [2, 0],  // South
    [0, -2], // West
    [0, 2],  // East
  ];
  
  while (stack.length > 0) {
    const current = stack[stack.length - 1];
    
    // Find unvisited neighbors
    const neighbors = [];
    
    for (const [dr, dc] of directions) {
      const r = current.row + dr;
      const c = current.col + dc;
      
      // Check bounds
      if (r > 0 && r < grid.rows - 1 && c > 0 && c < grid.cols - 1) {
        const cell = grid.cells[r][c];
        if (cell.isWall) {
          neighbors.push({ row: r, col: c, midRow: current.row + dr / 2, midCol: current.col + dc / 2 });
        }
      }
    }
    
    if (neighbors.length > 0) {
      // Choose random neighbor
      const next = neighbors[Math.floor(Math.random() * neighbors.length)];
      
      // Carve passage
      grid.cells[next.row][next.col].isWall = false;
      grid.cells[next.midRow][next.midCol].isWall = false;
      
      yield {
        type: 'carve',
        cells: [
          { row: next.row, col: next.col },
          { row: next.midRow, col: next.midCol }
        ]
      };
      
      stack.push({ row: next.row, col: next.col });
    } else {
      // Backtrack
      stack.pop();
    }
  }
  
  // Ensure goal is reachable
  ensureGoalReachable(grid);
  
  yield { type: 'done' };
}

/**
 * Generate a random maze with given density
 */
export function generateRandomMaze(grid, density = 0.3) {
  grid.clearWalls();
  
  for (let r = 0; r < grid.rows; r++) {
    for (let c = 0; c < grid.cols; c++) {
      const cell = grid.cells[r][c];
      if (!cell.isStart && !cell.isGoal) {
        cell.isWall = Math.random() < density;
      }
    }
  }
  
  ensureGoalReachable(grid);
}

/**
 * Generate a simple maze with vertical/horizontal bias
 */
export function generateSimpleMaze(grid) {
  grid.clearWalls();
  
  // Create a simple pattern with corridors
  for (let r = 0; r < grid.rows; r++) {
    for (let c = 0; c < grid.cols; c++) {
      const cell = grid.cells[r][c];
      if (!cell.isStart && !cell.isGoal) {
        // Create corridors every few cells
        if (r % 4 !== 0 && c % 4 !== 0) {
          cell.isWall = true;
        }
      }
    }
  }
  
  // Add some randomness
  for (let r = 0; r < grid.rows; r++) {
    for (let c = 0; c < grid.cols; c++) {
      const cell = grid.cells[r][c];
      if (cell.isWall && Math.random() < 0.3) {
        cell.isWall = false;
      }
    }
  }
  
  ensureGoalReachable(grid);
}

/**
 * Generate a weighted maze with varying terrain costs
 */
export function generateWeightedMaze(grid, wallDensity = 0.2, weightDensity = 0.1) {
  grid.clearWalls();
  
  // Add walls
  for (let r = 0; r < grid.rows; r++) {
    for (let c = 0; c < grid.cols; c++) {
      const cell = grid.cells[r][c];
      if (!cell.isStart && !cell.isGoal) {
        if (Math.random() < wallDensity) {
          cell.isWall = true;
        } else if (Math.random() < weightDensity) {
          cell.weight = Math.random() < 0.5 ? 2 : 3;
        }
      }
    }
  }
  
  ensureGoalReachable(grid);
}

/**
 * Generate a spiral maze pattern
 */
export function generateSpiralMaze(grid) {
  grid.clearWalls();
  
  const rows = grid.rows;
  const cols = grid.cols;
  
  // Create spiral pattern
  let top = 0, bottom = rows - 1, left = 0, right = cols - 1;
  let direction = 0; // 0: right, 1: down, 2: left, 3: up
  
  while (top <= bottom && left <= right) {
    if (direction === 0) {
      // Top row
      for (let c = left; c <= right; c++) {
        if (!grid.cells[top][c].isStart && !grid.cells[top][c].isGoal) {
          grid.cells[top][c].isWall = true;
        }
      }
      top += 2;
    } else if (direction === 1) {
      // Right column
      for (let r = top; r <= bottom; r++) {
        if (!grid.cells[r][right].isStart && !grid.cells[r][right].isGoal) {
          grid.cells[r][right].isWall = true;
        }
      }
      right -= 2;
    } else if (direction === 2) {
      // Bottom row
      for (let c = right; c >= left; c--) {
        if (!grid.cells[bottom][c].isStart && !grid.cells[bottom][c].isGoal) {
          grid.cells[bottom][c].isWall = true;
        }
      }
      bottom -= 2;
    } else {
      // Left column
      for (let r = bottom; r >= top; r--) {
        if (!grid.cells[r][left].isStart && !grid.cells[r][left].isGoal) {
          grid.cells[r][left].isWall = true;
        }
      }
      left += 2;
    }
    
    direction = (direction + 1) % 4;
  }
  
  ensureGoalReachable(grid);
}

/**
 * Generate a maze with rooms
 */
export function generateRoomMaze(grid, roomCount = 5, roomSize = 5) {
  grid.clearWalls();
  
  // Generate rooms
  const rooms = [];
  const maxAttempts = 50;
  let attempts = 0;
  
  while (rooms.length < roomCount && attempts < maxAttempts) {
    attempts++;
    
    const r = Math.floor(Math.random() * (grid.rows - roomSize - 2)) + 1;
    const c = Math.floor(Math.random() * (grid.cols - roomSize - 2)) + 1;
    
    // Check if room overlaps with existing rooms or start/goal
    let overlaps = false;
    for (const room of rooms) {
      if (r < room.r + room.h && r + roomSize > room.r &&
          c < room.c + room.w && c + roomSize > room.c) {
        overlaps = true;
        break;
      }
    }
    
    // Check start/goal overlap
    for (let i = r; i < r + roomSize && !overlaps; i++) {
      for (let j = c; j < c + roomSize; j++) {
        if (grid.cells[i] && grid.cells[i][j]) {
          if (grid.cells[i][j].isStart || grid.cells[i][j].isGoal) {
            overlaps = true;
            break;
          }
        }
      }
    }
    
    if (!overlaps) {
      rooms.push({ r, c, h: roomSize, w: roomSize });
    }
  }
  
  // Carve out rooms
  for (const room of rooms) {
    for (let r = room.r; r < room.r + room.h; r++) {
      for (let c = room.c; c < room.c + room.w; c++) {
        if (grid.cells[r] && grid.cells[r][c] && !grid.cells[r][c].isStart && !grid.cells[r][c].isGoal) {
          grid.cells[r][c].isWall = false;
        }
      }
    }
  }
  
  // Add walls everywhere else
  for (let r = 0; r < grid.rows; r++) {
    for (let c = 0; c < grid.cols; c++) {
      const cell = grid.cells[r][c];
      if (!cell.isStart && !cell.isGoal && !cell.isWall) {
        // Check if in a room
        let inRoom = false;
        for (const room of rooms) {
          if (r >= room.r && r < room.r + room.h &&
              c >= room.c && c < room.c + room.w) {
            inRoom = true;
            break;
          }
        }
        if (!inRoom) {
          cell.isWall = true;
        }
      }
    }
  }
  
  // Connect rooms with corridors
  for (let i = 0; i < rooms.length - 1; i++) {
    const room1 = rooms[i];
    const room2 = rooms[i + 1];
    
    const r1 = room1.r + Math.floor(room1.h / 2);
    const c1 = room1.c + Math.floor(room1.w / 2);
    const r2 = room2.r + Math.floor(room2.h / 2);
    const c2 = room2.c + Math.floor(room2.w / 2);
    
    // Horizontal corridor
    const minC = Math.min(c1, c2);
    const maxC = Math.max(c1, c2);
    for (let c = minC; c <= maxC; c++) {
      if (grid.cells[r1] && grid.cells[r1][c]) {
        grid.cells[r1][c].isWall = false;
      }
    }
    
    // Vertical corridor
    const minR = Math.min(r1, r2);
    const maxR = Math.max(r1, r2);
    for (let r = minR; r <= maxR; r++) {
      if (grid.cells[r] && grid.cells[r][c2]) {
        grid.cells[r][c2].isWall = false;
      }
    }
  }
  
  ensureGoalReachable(grid);
}

/**
 * Ensure start and goal are not walls and are reachable
 * Simple approach: clear walls around them
 */
function ensureGoalReachable(grid) {
  // Clear walls at start and goal
  if (grid.start) {
    grid.start.isWall = false;
  }
  if (grid.goal) {
    grid.goal.isWall = false;
  }
  
  // Clear adjacent cells to ensure some paths exist
  const directions = [[-1, 0], [1, 0], [0, -1], [0, 1]];
  
  [grid.start, grid.goal].forEach(point => {
    if (!point) return;
    
    for (const [dr, dc] of directions) {
      const r = point.row + dr;
      const c = point.col + dc;
      
      if (grid.isValidPosition(r, c)) {
        const cell = grid.cells[r][c];
        // 50% chance to clear each adjacent wall
        if (cell.isWall && Math.random() < 0.5) {
          cell.isWall = false;
        }
      }
    }
  });
}
