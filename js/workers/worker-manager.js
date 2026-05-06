/**
 * Pathfinding Visualizer - Worker Manager
 * Manages Web Workers for algorithm execution
 */

export class WorkerManager {
  constructor() {
    this.workers = [];
    this.workerPool = [];
    this.maxWorkers = navigator.hardwareConcurrency || 4;
    this.taskQueue = [];
    this.activeTasks = new Map();
  }
  
  /**
   * Initialize worker pool
   */
  async initialize() {
    // Create worker pool
    for (let i = 0; i < this.maxWorkers; i++) {
      const worker = new Worker('/js/workers/algorithm-worker.js');
      worker.id = i;
      worker.busy = false;
      
      worker.onmessage = (e) => this.handleWorkerMessage(worker, e);
      worker.onerror = (e) => this.handleWorkerError(worker, e);
      
      this.workerPool.push(worker);
    }
    
    // Load algorithms into workers
    await this.loadAlgorithms();
  }
  
  /**
   * Load algorithm functions into workers
   */
  async loadAlgorithms() {
    const algorithms = await this.importAlgorithms();
    
    const promises = this.workerPool.map(worker => {
      return new Promise((resolve) => {
        worker.onmessage = (e) => {
          if (e.data.type === 'initialized') {
            resolve();
          }
        };
        
        worker.postMessage({
          type: 'init',
          data: { algorithms }
        });
      });
    });
    
    await Promise.all(promises);
  }
  
  /**
   * Import algorithm functions
   */
  async importAlgorithms() {
    const { bfs } = await import('../algorithms/bfs.js');
    const { dfs } = await import('../algorithms/dfs.js');
    const { dijkstra } = await import('../algorithms/dijkstra.js');
    const { astar } = await import('../algorithms/astar.js');
    
    // Convert functions to strings for worker
    return {
      bfs: bfs.toString(),
      dfs: dfs.toString(),
      dijkstra: dijkstra.toString(),
      astar: astar.toString()
    };
  }
  
  /**
   * Run algorithm in worker
   */
  async runAlgorithm(algorithmName, grid, heuristic = null, options = {}) {
    const taskId = this.generateTaskId();
    
    return new Promise((resolve, reject) => {
      const task = {
        id: taskId,
        algorithmName,
        grid,
        heuristic,
        options,
        resolve,
        reject,
        onProgress: options.onProgress,
        startTime: performance.now()
      };
      
      this.taskQueue.push(task);
      this.processQueue();
    });
  }
  
  /**
   * Process task queue
   */
  processQueue() {
    if (this.taskQueue.length === 0) return;
    
    const availableWorker = this.workerPool.find(w => !w.busy);
    if (!availableWorker) return;
    
    const task = this.taskQueue.shift();
    this.executeTask(availableWorker, task);
  }
  
  /**
   * Execute task in worker
   */
  executeTask(worker, task) {
    worker.busy = true;
    this.activeTasks.set(worker.id, task);
    
    worker.postMessage({
      type: 'run',
      data: {
        algorithmName: task.algorithmName,
        grid: task.grid,
        heuristic: task.heuristic,
        options: task.options
      }
    });
  }
  
  /**
   * Handle worker message
   */
  handleWorkerMessage(worker, e) {
    const task = this.activeTasks.get(worker.id);
    if (!task) return;
    
    const { type, ...data } = e.data;
    
    switch (type) {
      case 'progress':
        if (task.onProgress) {
          task.onProgress(data);
        }
        break;
        
      case 'complete':
        worker.busy = false;
        this.activeTasks.delete(worker.id);
        task.resolve({
          ...data,
          executionTime: performance.now() - task.startTime
        });
        this.processQueue();
        break;
        
      case 'stopped':
        worker.busy = false;
        this.activeTasks.delete(worker.id);
        task.resolve({ stopped: true });
        this.processQueue();
        break;
        
      case 'error':
        worker.busy = false;
        this.activeTasks.delete(worker.id);
        task.reject(new Error(data.message));
        this.processQueue();
        break;
    }
  }
  
  /**
   * Handle worker error
   */
  handleWorkerError(worker, error) {
    console.error(`Worker ${worker.id} error:`, error);
    const task = this.activeTasks.get(worker.id);
    if (task) {
      worker.busy = false;
      this.activeTasks.delete(worker.id);
      task.reject(error);
      this.processQueue();
    }
  }
  
  /**
   * Stop specific task
   */
  stopTask(taskId) {
    const taskEntry = Array.from(this.activeTasks.entries())
      .find(([id, task]) => task.id === taskId);
    
    if (taskEntry) {
      const [workerId, task] = taskEntry;
      const worker = this.workerPool.find(w => w.id === workerId);
      if (worker) {
        worker.postMessage({ type: 'stop' });
      }
    }
  }
  
  /**
   * Stop all tasks
   */
  stopAllTasks() {
    this.workerPool.forEach(worker => {
      if (worker.busy) {
        worker.postMessage({ type: 'stop' });
      }
    });
  }
  
  /**
   * Get worker pool statistics
   */
  getStats() {
    return {
      totalWorkers: this.workerPool.length,
      busyWorkers: this.workerPool.filter(w => w.busy).length,
      availableWorkers: this.workerPool.filter(w => !w.busy).length,
      queuedTasks: this.taskQueue.length,
      activeTasks: this.activeTasks.size
    };
  }
  
  /**
   * Generate unique task ID
   */
  generateTaskId() {
    return `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
  
  /**
   * Cleanup workers
   */
  terminate() {
    this.stopAllTasks();
    this.workerPool.forEach(worker => worker.terminate());
    this.workerPool = [];
    this.activeTasks.clear();
  }
}

// Singleton instance
export const workerManager = new WorkerManager();
