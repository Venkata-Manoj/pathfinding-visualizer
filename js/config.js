/**
 * Pathfinding Visualizer - Configuration
 * Default settings and constants
 */

export const CONFIG = {
  // Grid dimensions
  DEFAULT_ROWS: 25,
  DEFAULT_COLS: 50,
  MIN_ROWS: 10,
  MAX_ROWS: 50,
  MIN_COLS: 10,
  MAX_COLS: 80,
  
  // Cell sizing (responsive)
  CELL_SIZE_DESKTOP: 28,
  CELL_SIZE_TABLET: 24,
  CELL_SIZE_MOBILE: 22,
  
  // Animation settings
  DEFAULT_SPEED: 50,
  MIN_SPEED: 1,
  MAX_SPEED: 200,
  
  // History (undo/redo)
  MAX_HISTORY_SIZE: 50,
  
  // Default weights
  WEIGHT_VALUES: {
    wall: Infinity,
    normal: 1,
    weight2: 2,
    weight3: 3,
  },
  
  // Draw modes
  DRAW_MODES: ['wall', 'weight2', 'weight3', 'eraser'],
  
  // Algorithms
  ALGORITHMS: ['bfs', 'dfs', 'dijkstra', 'astar', 'bibfs', 'bidijkstra'],
  
  // Heuristics for A*
  HEURISTICS: ['manhattan', 'euclidean', 'chebyshev', 'octile'],
  
  // Maze generation
  MAZE_DENSITY: 0.3,
  
  // Direction vectors
  DIRECTIONS_4: [
    [-1, 0], // North
    [1, 0],  // South
    [0, -1], // West
    [0, 1],  // East
  ],
  
  DIRECTIONS_8: [
    [-1, 0], [1, 0], [0, -1], [0, 1], // Cardinal
    [-1, -1], [-1, 1], [1, -1], [1, 1], // Diagonal
  ],
};

// Algorithm descriptions for the explanation panel
export const ALGORITHM_DESCRIPTIONS = {
  bfs: {
    name: 'Breadth-First Search',
    short: 'BFS',
    description: 'BFS explores all nodes at the present depth before moving to the next level. It guarantees the shortest path in unweighted graphs by exploring equally in all directions.',
    characteristics: ['Unweighted', 'Shortest path guaranteed', 'Expands uniformly'],
    timeComplexity: 'O(V + E)',
    spaceComplexity: 'O(V)',
  },
  dfs: {
    name: 'Depth-First Search',
    short: 'DFS',
    description: 'DFS explores as far as possible along each branch before backtracking. It does not guarantee the shortest path and may find long, winding routes, but uses less memory.',
    characteristics: ['Unweighted', 'No shortest path guarantee', 'Memory efficient'],
    timeComplexity: 'O(V + E)',
    spaceComplexity: 'O(V)',
  },
  dijkstra: {
    name: "Dijkstra's Algorithm",
    short: 'Dijkstra',
    description: 'Dijkstra finds the shortest path in weighted graphs. It always expands the node with the lowest known cost from the start, guaranteeing optimal paths even with varying weights.',
    characteristics: ['Weighted', 'Shortest path guaranteed', 'No heuristic'],
    timeComplexity: 'O((V + E) log V)',
    spaceComplexity: 'O(V)',
  },
  astar: {
    name: 'A* Search',
    short: 'A*',
    description: 'A* combines actual cost from the start with a heuristic estimate to the goal. It finds optimal paths efficiently by prioritizing promising directions, often exploring fewer nodes than Dijkstra.',
    characteristics: ['Weighted', 'Shortest path guaranteed', 'Uses heuristic'],
    timeComplexity: 'O((V + E) log V)',
    spaceComplexity: 'O(V)',
  },
  bibfs: {
    name: 'Bidirectional BFS',
    short: 'Bi-BFS',
    description: 'Bidirectional BFS runs two simultaneous searches from the start and goal. It meets in the middle, dramatically reducing the number of explored nodes while still guaranteeing the shortest path in unweighted graphs.',
    characteristics: ['Unweighted', 'Shortest path guaranteed', 'Very fast'],
    timeComplexity: 'O(V^(1/2) + E^(1/2))',
    spaceComplexity: 'O(V^(1/2))',
  },
  bidijkstra: {
    name: "Bidirectional Dijkstra",
    short: 'Bi-Dijkstra',
    description: 'Bidirectional Dijkstra runs two simultaneous searches from the start and goal in weighted graphs. It guarantees the shortest path while exploring a significantly smaller area than standard Dijkstra.',
    characteristics: ['Weighted', 'Shortest path guaranteed', 'Fast'],
    timeComplexity: 'O((V^(1/2) + E^(1/2)) log V)',
    spaceComplexity: 'O(V^(1/2))',
  },
};

// Heuristic descriptions
export const HEURISTIC_DESCRIPTIONS = {
  manhattan: {
    name: 'Manhattan Distance',
    description: '|x1-x2| + |y1-y2|. Best for 4-directional movement (no diagonals).',
  },
  euclidean: {
    name: 'Euclidean Distance',
    description: 'sqrt((x1-x2)² + (y1-y2)²). Straight-line distance for any-angle movement.',
  },
  chebyshev: {
    name: 'Chebyshev Distance',
    description: 'max(|x1-x2|, |y1-y2|). For 8-directional movement with equal diagonal cost.',
  },
  octile: {
    name: 'Octile Distance',
    description: 'For 8-directional movement where diagonals cost sqrt(2). More accurate than Chebyshev.',
  },
};
