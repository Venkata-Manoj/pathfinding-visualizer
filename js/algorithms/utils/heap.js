/**
 * Pathfinding Visualizer - Binary Min Heap
 * Priority queue implementation for Dijkstra and A* algorithms
 */

/**
 * Binary Min Heap - Priority Queue
 * Efficiently maintains the minimum element at the top
 */
export class MinHeap {
  /**
   * @param {Function} compare - Comparison function (a, b) => number
   *                             Return negative if a < b, positive if a > b
   */
  constructor(compare = (a, b) => a - b) {
    this.heap = [];
    this.compare = compare;
    this._indices = new Map(); // Track indices for potential decrease-key
  }
  
  /**
   * Get the number of elements in the heap
   */
  get size() {
    return this.heap.length;
  }
  
  /**
   * Check if heap is empty
   */
  isEmpty() {
    return this.heap.length === 0;
  }
  
  /**
   * Peek at the minimum element without removing it
   */
  peek() {
    return this.heap[0] || null;
  }
  
  /**
   * Insert a new element into the heap
   * @param {*} item - Element to insert
   */
  push(item) {
    this.heap.push(item);
    this._bubbleUp(this.heap.length - 1);
  }
  
  /**
   * Remove and return the minimum element
   */
  pop() {
    if (this.heap.length === 0) {
      return null;
    }
    
    if (this.heap.length === 1) {
      return this.heap.pop();
    }
    
    const min = this.heap[0];
    const last = this.heap.pop();
    this.heap[0] = last;
    this._bubbleDown(0);
    
    return min;
  }
  
  /**
   * Update the priority of an existing element
   * Note: This assumes the element's comparison value has changed externally
   * @param {*} item - The element to update
   */
  update(item) {
    const index = this.heap.indexOf(item);
    if (index === -1) return false;
    
    // Try bubbling up and down to restore heap property
    this._bubbleUp(index);
    const newIndex = this.heap.indexOf(item);
    this._bubbleDown(newIndex);
    
    return true;
  }
  
  /**
   * Check if an element exists in the heap
   */
  contains(item) {
    return this.heap.includes(item);
  }
  
  /**
   * Clear all elements
   */
  clear() {
    this.heap.length = 0;
    this._indices.clear();
  }
  
  /**
   * Get all elements (for debugging)
   */
  toArray() {
    return [...this.heap];
  }
  
  /**
   * Bubble up element at given index to maintain heap property
   * @private
   */
  _bubbleUp(index) {
    const item = this.heap[index];
    
    while (index > 0) {
      const parentIndex = Math.floor((index - 1) / 2);
      const parent = this.heap[parentIndex];
      
      if (this.compare(item, parent) >= 0) {
        break;
      }
      
      this.heap[index] = parent;
      this.heap[parentIndex] = item;
      index = parentIndex;
    }
  }
  
  /**
   * Bubble down element at given index to maintain heap property
   * @private
   */
  _bubbleDown(index) {
    const length = this.heap.length;
    const item = this.heap[index];
    
    while (true) {
      let smallestIndex = index;
      const leftChildIndex = 2 * index + 1;
      const rightChildIndex = 2 * index + 2;
      
      if (leftChildIndex < length) {
        if (this.compare(this.heap[leftChildIndex], this.heap[smallestIndex]) < 0) {
          smallestIndex = leftChildIndex;
        }
      }
      
      if (rightChildIndex < length) {
        if (this.compare(this.heap[rightChildIndex], this.heap[smallestIndex]) < 0) {
          smallestIndex = rightChildIndex;
        }
      }
      
      if (smallestIndex === index) {
        break;
      }
      
      this.heap[index] = this.heap[smallestIndex];
      this.heap[smallestIndex] = item;
      index = smallestIndex;
    }
  }
}

/**
 * Priority Queue wrapper with a cleaner API
 * Uses MinHeap internally
 */
export class PriorityQueue {
  constructor(options = {}) {
    const compare = options.compare || ((a, b) => a.priority - b.priority);
    this.heap = new MinHeap(compare);
  }
  
  enqueue(item, priority) {
    this.heap.push({ item, priority });
  }
  
  dequeue() {
    const node = this.heap.pop();
    return node?.item || null;
  }
  
  peek() {
    const node = this.heap.peek();
    return node?.item || null;
  }
  
  isEmpty() {
    return this.heap.isEmpty();
  }
  
  get size() {
    return this.heap.size;
  }
}
