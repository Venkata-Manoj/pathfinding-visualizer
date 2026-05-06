/**
 * Pathfinding Visualizer - Learning Mode
 * Step-by-step educational explanations for algorithms
 */

export class LearningMode {
  constructor(container, grid, renderer) {
    this.container = container;
    this.grid = grid;
    this.renderer = renderer;
    this.currentStep = 0;
    this.totalSteps = 0;
    this.isLearning = false;
    this.currentAlgorithm = null;
    this.explanations = [];
    
    this.init();
  }
  
  /**
   * Initialize learning mode
   */
  init() {
    this.createLearningLayout();
    this.setupEventListeners();
  }
  
  /**
   * Create learning mode layout
   */
  createLearningLayout() {
    this.container.innerHTML = `
      <div class="learning-container">
        <div class="learning-header">
          <h2>Learning Mode</h2>
          <div class="learning-controls">
            <button id="start-learning" class="btn btn-primary">Start Tutorial</button>
            <button id="pause-learning" class="btn btn-secondary" disabled>Pause</button>
            <button id="step-back" class="btn btn-secondary" disabled>Step Back</button>
            <button id="step-forward" class="btn btn-secondary" disabled>Step Forward</button>
            <button id="exit-learning" class="btn btn-ghost">Exit Learning</button>
          </div>
        </div>
        
        <div class="learning-content">
          <div class="learning-main">
            <!-- Algorithm Selection -->
            <div class="algorithm-selector" id="algorithm-selector">
              <h3>Choose an Algorithm to Learn</h3>
              <div class="algorithm-cards">
                <div class="algo-card" data-algorithm="bfs">
                  <div class="algo-icon">🌊</div>
                  <h4>Breadth-First Search</h4>
                  <p>Explores level by level, guaranteeing the shortest path in unweighted graphs.</p>
                  <div class="algo-difficulty">
                    <span class="difficulty-label">Difficulty:</span>
                    <span class="difficulty easy">Easy</span>
                  </div>
                </div>
                
                <div class="algo-card" data-algorithm="dfs">
                  <div class="algo-icon">🌲</div>
                  <h4>Depth-First Search</h4>
                  <p>Goes deep before exploring alternatives, like exploring a maze.</p>
                  <div class="algo-difficulty">
                    <span class="difficulty-label">Difficulty:</span>
                    <span class="difficulty easy">Easy</span>
                  </div>
                </div>
                
                <div class="algo-card" data-algorithm="dijkstra">
                  <div class="algo-icon">⚖️</div>
                  <h4>Dijkstra's Algorithm</h4>
                  <p>Finds shortest path in weighted graphs by always choosing the cheapest option.</p>
                  <div class="algo-difficulty">
                    <span class="difficulty-label">Difficulty:</span>
                    <span class="difficulty medium">Medium</span>
                  </div>
                </div>
                
                <div class="algo-card" data-algorithm="astar">
                  <div class="algo-icon">⭐</div>
                  <h4>A* Search</h4>
                  <p>Uses heuristics to intelligently guide the search toward the goal.</p>
                  <div class="algo-difficulty">
                    <span class="difficulty-label">Difficulty:</span>
                    <span class="difficulty medium">Medium</span>
                  </div>
                </div>
              </div>
            </div>
            
            <!-- Step-by-step visualization -->
            <div class="step-visualization" id="step-visualization" style="display: none;">
              <div class="step-progress">
                <div class="progress-bar">
                  <div class="progress-fill" id="progress-fill"></div>
                </div>
                <div class="step-counter">
                  Step <span id="current-step">0</span> of <span id="total-steps">0</span>
                </div>
              </div>
              
              <div class="canvas-container">
                <canvas id="learning-canvas"></canvas>
              </div>
              
              <div class="step-info">
                <div class="step-title" id="step-title">Select an algorithm to begin</div>
                <div class="step-description" id="step-description">
                  Choose an algorithm from the cards above to start learning how it works step by step.
                </div>
              </div>
            </div>
          </div>
          
          <!-- Learning Panel -->
          <div class="learning-panel" id="learning-panel" style="display: none;">
            <div class="panel-section">
              <h3>Current Operation</h3>
              <div class="operation-info" id="operation-info">
                <div class="operation-type" id="operation-type">-</div>
                <div class="operation-details" id="operation-details">
                  Waiting to start...
                </div>
              </div>
            </div>
            
            <div class="panel-section">
              <h3>Data Structures</h3>
              <div class="data-structures" id="data-structures">
                <div class="ds-item">
                  <div class="ds-name">Queue/Stack</div>
                  <div class="ds-content" id="queue-content">Empty</div>
                </div>
                <div class="ds-item">
                  <div class="ds-name">Visited</div>
                  <div class="ds-content" id="visited-content">0 nodes</div>
                </div>
              </div>
            </div>
            
            <div class="panel-section">
              <h3>Key Concepts</h3>
              <div class="concepts" id="concepts">
                <div class="concept-item">
                  <strong>Frontier:</strong> The boundary between explored and unexplored areas
                </div>
                <div class="concept-item">
                  <strong>Heuristic:</strong> An educated guess about the distance to the goal
                </div>
              </div>
            </div>
            
            <div class="panel-section">
              <h3>Code Highlight</h3>
              <div class="code-highlight" id="code-highlight">
                <pre><code>// Select an algorithm to see code
function algorithm() {
  // Code will appear here
}</code></pre>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  }
  
  /**
   * Setup event listeners
   */
  setupEventListeners() {
    // Algorithm selection
    document.querySelectorAll('.algo-card').forEach(card => {
      card.addEventListener('click', () => {
        const algorithm = card.dataset.algorithm;
        this.startLearning(algorithm);
      });
    });
    
    // Control buttons
    document.getElementById('start-learning').addEventListener('click', () => this.startTutorial());
    document.getElementById('pause-learning').addEventListener('click', () => this.pauseTutorial());
    document.getElementById('step-back').addEventListener('click', () => this.stepBackward());
    document.getElementById('step-forward').addEventListener('click', () => this.stepForward());
    document.getElementById('exit-learning').addEventListener('click', () => this.exitLearning());
  }
  
  /**
   * Start learning mode for specific algorithm
   */
  async startLearning(algorithm) {
    this.currentAlgorithm = algorithm;
    this.isLearning = true;
    
    // Hide selector, show visualization
    document.getElementById('algorithm-selector').style.display = 'none';
    document.getElementById('step-visualization').style.display = 'block';
    document.getElementById('learning-panel').style.display = 'block';
    
    // Enable controls
    document.getElementById('start-learning').disabled = false;
    document.getElementById('step-forward').disabled = false;
    
    // Load algorithm explanations
    await this.loadAlgorithmExplanations(algorithm);
    
    // Initialize canvas
    this.initializeLearningCanvas();
    
    // Show algorithm info
    this.showAlgorithmInfo(algorithm);
  }
  
  /**
   * Load step-by-step explanations for algorithm
   */
  async loadAlgorithmExplanations(algorithm) {
    const explanations = {
      bfs: this.getBFSExplanations(),
      dfs: this.getDFSExplanations(),
      dijkstra: this.getDijkstraExplanations(),
      astar: this.getAStarExplanations()
    };
    
    this.explanations = explanations[algorithm] || [];
    this.totalSteps = this.explanations.length;
    
    // Update step counter
    document.getElementById('total-steps').textContent = this.totalSteps;
  }
  
  /**
   * Initialize learning canvas
   */
  initializeLearningCanvas() {
    const canvas = document.getElementById('learning-canvas');
    const ctx = canvas.getContext('2d');
    
    // Set canvas size
    canvas.width = 600;
    canvas.height = 400;
    
    // Create a smaller grid for learning
    this.learningGrid = this.createLearningGrid();
    this.learningRenderer = new GridRenderer(canvas, this.learningGrid);
    
    // Initial render
    this.learningRenderer.draw();
  }
  
  /**
   * Create smaller grid for learning
   */
  createLearningGrid() {
    const grid = new Grid(10, 15); // Smaller for better visibility
    
    // Add some walls for demonstration
    const walls = [
      [2, 3], [2, 4], [2, 5], [2, 6],
      [4, 7], [5, 7], [6, 7],
      [7, 2], [7, 3], [7, 4]
    ];
    
    walls.forEach(([row, col]) => {
      if (row < grid.rows && col < grid.cols) {
        grid.cells[row][col].isWall = true;
      }
    });
    
    // Set start and goal
    grid.setStart(1, 1);
    grid.setGoal(8, 13);
    
    return grid;
  }
  
  /**
   * Show algorithm information
   */
  showAlgorithmInfo(algorithm) {
    const info = {
      bfs: {
        title: 'Breadth-First Search',
        description: 'BFS explores all nodes at the current depth before moving to the next level.',
        concepts: [
          '<strong>Queue:</strong> First-In-First-Out data structure',
          '<strong>Level Order:</strong> Explores in layers from the start',
          '<strong>Optimal:</strong> Always finds shortest path in unweighted graphs'
        ],
        code: `// BFS Implementation
function bfs(grid) {
  const queue = [start];
  const visited = new Set([start]);
  
  while (queue.length > 0) {
    const current = queue.shift(); // Dequeue
    
    if (current === goal) {
      return reconstructPath(current);
    }
    
    for (const neighbor of getNeighbors(current)) {
      if (!visited.has(neighbor)) {
        visited.add(neighbor);
        queue.push(neighbor); // Enqueue
      }
    }
  }
}`
      },
      dfs: {
        title: 'Depth-First Search',
        description: 'DFS explores as far as possible along each branch before backtracking.',
        concepts: [
          '<strong>Stack:</strong> Last-In-First-Out data structure',
          '<strong>Deep Dive:</strong> Goes deep before exploring alternatives',
          '<strong>Memory:</strong> Uses less memory than BFS'
        ],
        code: `// DFS Implementation
function dfs(grid) {
  const stack = [start];
  const visited = new Set([start]);
  
  while (stack.length > 0) {
    const current = stack.pop(); // Pop from stack
    
    if (current === goal) {
      return reconstructPath(current);
    }
    
    for (const neighbor of getNeighbors(current)) {
      if (!visited.has(neighbor)) {
        visited.add(neighbor);
        stack.push(neighbor); // Push to stack
      }
    }
  }
}`
      },
      dijkstra: {
        title: "Dijkstra's Algorithm",
        description: 'Finds shortest path in weighted graphs by always expanding the cheapest node.',
        concepts: [
          '<strong>Priority Queue:</strong> Always extracts minimum distance node',
          '<strong>Distance Table:</strong> Tracks shortest known distance to each node',
          '<strong>Relaxation:</strong> Updates distances when shorter paths found'
        ],
        code: `// Dijkstra's Implementation
function dijkstra(grid) {
  const pq = new MinHeap();
  const distances = new Map();
  
  distances.set(start, 0);
  pq.insert(start, 0);
  
  while (!pq.isEmpty()) {
    const current = pq.extractMin();
    
    if (current === goal) {
      return reconstructPath(current);
    }
    
    for (const neighbor of getNeighbors(current)) {
      const newDist = distances.get(current) + neighbor.weight;
      if (newDist < distances.get(neighbor, Infinity)) {
        distances.set(neighbor, newDist);
        pq.insert(neighbor, newDist);
      }
    }
  }
}`
      },
      astar: {
        title: 'A* Search',
        description: 'A* combines actual cost with heuristic estimates for efficient pathfinding.',
        concepts: [
          '<strong>f = g + h:</strong> Total cost = actual cost + heuristic',
          '<strong>Heuristic:</strong> Estimated distance from node to goal',
          '<strong>Admissible:</strong> Never overestimates true distance'
        ],
        code: `// A* Implementation
function astar(grid) {
  const pq = new MinHeap();
  const gScore = new Map(); // Actual cost
  const fScore = new Map(); // Total cost
  
  gScore.set(start, 0);
  fScore.set(start, heuristic(start, goal));
  pq.insert(start, fScore.get(start));
  
  while (!pq.isEmpty()) {
    const current = pq.extractMin();
    
    if (current === goal) {
      return reconstructPath(current);
    }
    
    for (const neighbor of getNeighbors(current)) {
      const tentativeG = gScore.get(current) + neighbor.weight;
      
      if (tentativeG < gScore.get(neighbor, Infinity)) {
        gScore.set(neighbor, tentativeG);
        fScore.set(neighbor, tentativeG + heuristic(neighbor, goal));
        pq.insert(neighbor, fScore.get(neighbor));
      }
    }
  }
}`
      }
    };
    
    const algoInfo = info[algorithm];
    if (algoInfo) {
      // Update concepts
      const conceptsEl = document.getElementById('concepts');
      conceptsEl.innerHTML = algoInfo.concepts
        .map(concept => `<div class="concept-item">${concept}</div>`)
        .join('');
      
      // Update code highlight
      const codeEl = document.getElementById('code-highlight');
      codeEl.querySelector('code').textContent = algoInfo.code;
    }
  }
  
  /**
   * Start tutorial
   */
  startTutorial() {
    if (!this.currentAlgorithm || this.explanations.length === 0) return;
    
    this.currentStep = 0;
    this.isLearning = true;
    
    // Update controls
    document.getElementById('start-learning').disabled = true;
    document.getElementById('pause-learning').disabled = false;
    document.getElementById('step-back').disabled = false;
    
    // Start step execution
    this.executeStep();
  }
  
  /**
   * Execute current step
   */
  executeStep() {
    if (this.currentStep >= this.explanations.length) {
      this.completeTutorial();
      return;
    }
    
    const step = this.explanations[this.currentStep];
    this.displayStep(step);
    this.updateProgress();
  }
  
  /**
   * Display step information
   */
  displayStep(step) {
    // Update step info
    document.getElementById('current-step').textContent = this.currentStep + 1;
    document.getElementById('step-title').textContent = step.title;
    document.getElementById('step-description').textContent = step.description;
    
    // Update operation info
    document.getElementById('operation-type').textContent = step.operation;
    document.getElementById('operation-details').textContent = step.details;
    
    // Update data structures
    if (step.queue) {
      document.getElementById('queue-content').textContent = step.queue;
    }
    if (step.visited) {
      document.getElementById('visited-content').textContent = `${step.visited} nodes`;
    }
    
    // Update grid visualization
    if (step.gridState) {
      this.applyGridState(step.gridState);
    }
  }
  
  /**
   * Apply grid state for visualization
   */
  applyGridState(state) {
    // Reset grid first
    for (let r = 0; r < this.learningGrid.rows; r++) {
      for (let c = 0; c < this.learningGrid.cols; c++) {
        this.learningGrid.cells[r][c].state = 'unvisited';
      }
    }
    
    // Apply states
    state.forEach(({ row, col, state: cellState }) => {
      if (row >= 0 && row < this.learningGrid.rows && 
          col >= 0 && col < this.learningGrid.cols) {
        this.learningGrid.cells[row][col].state = cellState;
      }
    });
    
    // Re-render
    this.learningRenderer.draw();
  }
  
  /**
   * Update progress bar
   */
  updateProgress() {
    const progress = ((this.currentStep + 1) / this.totalSteps) * 100;
    document.getElementById('progress-fill').style.width = `${progress}%`;
  }
  
  /**
   * Step forward
   */
  stepForward() {
    if (this.currentStep < this.explanations.length - 1) {
      this.currentStep++;
      this.executeStep();
    }
  }
  
  /**
   * Step backward
   */
  stepBackward() {
    if (this.currentStep > 0) {
      this.currentStep--;
      this.executeStep();
    }
  }
  
  /**
   * Pause tutorial
   */
  pauseTutorial() {
    this.isLearning = false;
    document.getElementById('start-learning').disabled = false;
    document.getElementById('pause-learning').disabled = true;
  }
  
  /**
   * Complete tutorial
   */
  completeTutorial() {
    this.isLearning = false;
    
    // Show completion message
    document.getElementById('step-title').textContent = 'Tutorial Complete!';
    document.getElementById('step-description').textContent = 
      `Congratulations! You've learned how ${this.getAlgorithmName(this.currentAlgorithm)} works step by step.`;
    
    // Reset controls
    document.getElementById('start-learning').disabled = false;
    document.getElementById('pause-learning').disabled = true;
    document.getElementById('step-forward').disabled = true;
    document.getElementById('step-back').disabled = true;
  }
  
  /**
   * Exit learning mode
   */
  exitLearning() {
    this.isLearning = false;
    this.currentAlgorithm = null;
    this.explanations = [];
    
    // Reset layout
    document.getElementById('algorithm-selector').style.display = 'block';
    document.getElementById('step-visualization').style.display = 'none';
    document.getElementById('learning-panel').style.display = 'none';
    
    // Reset controls
    document.getElementById('start-learning').disabled = false;
    document.getElementById('pause-learning').disabled = true;
    document.getElementById('step-forward').disabled = true;
    document.getElementById('step-back').disabled = true;
    
    // Trigger event to return to normal mode
    this.container.dispatchEvent(new CustomEvent('exitLearning'));
  }
  
  /**
   * Get algorithm explanations for BFS
   */
  getBFSExplanations() {
    return [
      {
        title: 'Initialization',
        description: 'BFS starts by creating a queue and adding the start node.',
        operation: 'Setup',
        details: 'Queue: [Start], Visited: {Start}',
        queue: '[Start]',
        visited: 1,
        gridState: [{ row: 1, col: 1, state: 'start' }]
      },
      {
        title: 'Dequeue Start Node',
        description: 'Remove the start node from the front of the queue and examine its neighbors.',
        operation: 'Processing',
        details: 'Current: Start, Queue: []',
        queue: '[]',
        visited: 1,
        gridState: [{ row: 1, col: 1, state: 'closed' }]
      },
      {
        title: 'Explore Neighbors',
        description: 'Add all unvisited neighbors to the queue and mark them as visited.',
        operation: 'Expanding',
        details: 'Adding neighbors to queue',
        queue: '[Node1, Node2, Node3]',
        visited: 4,
        gridState: [
          { row: 1, col: 1, state: 'closed' },
          { row: 1, col: 2, state: 'open' },
          { row: 2, col: 1, state: 'open' }
        ]
      }
      // ... more steps
    ];
  }
  
  /**
   * Get algorithm explanations for DFS
   */
  getDFSExplanations() {
    return [
      {
        title: 'Initialization',
        description: 'DFS starts by creating a stack and adding the start node.',
        operation: 'Setup',
        details: 'Stack: [Start], Visited: {Start}',
        queue: '[Start]',
        visited: 1,
        gridState: [{ row: 1, col: 1, state: 'start' }]
      }
      // ... more steps
    ];
  }
  
  /**
   * Get algorithm explanations for Dijkstra
   */
  getDijkstraExplanations() {
    return [
      {
        title: 'Initialization',
        description: 'Dijkstra starts with a priority queue containing only the start node with distance 0.',
        operation: 'Setup',
        details: 'PQ: [(Start, 0)], Distances: {Start: 0}',
        queue: '[(Start, 0)]',
        visited: 1,
        gridState: [{ row: 1, col: 1, state: 'start' }]
      }
      // ... more steps
    ];
  }
  
  /**
   * Get algorithm explanations for A*
   */
  getAStarExplanations() {
    return [
      {
        title: 'Initialization',
        description: 'A* starts with a priority queue using f = g + h scores.',
        operation: 'Setup',
        details: 'PQ: [(Start, h)], gScore: {Start: 0}',
        queue: '[(Start, h)]',
        visited: 1,
        gridState: [{ row: 1, col: 1, state: 'start' }]
      }
      // ... more steps
    ];
  }
  
  /**
   * Get algorithm display name
   */
  getAlgorithmName(algorithm) {
    const names = {
      bfs: 'Breadth-First Search',
      dfs: 'Depth-First Search',
      dijkstra: "Dijkstra's Algorithm",
      astar: 'A* Search'
    };
    return names[algorithm] || algorithm;
  }
}
