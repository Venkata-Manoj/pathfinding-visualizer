/**
 * Pathfinding Visualizer - TypeScript Definitions
 * Type definitions for the entire application
 */

// ============================================================================
// Core Types
// ============================================================================

export interface Cell {
  row: number;
  col: number;
  isWall: boolean;
  weight: number;
  isStart: boolean;
  isGoal: boolean;
  state: CellState;
}

export type CellState = 'unvisited' | 'open' | 'closed' | 'path' | 'start' | 'goal';

export interface Grid {
  rows: number;
  cols: number;
  cells: Cell[][];
  start: Cell | null;
  goal: Cell | null;
}

export interface Position {
  row: number;
  col: number;
}

// ============================================================================
// Algorithm Types
// ============================================================================

export interface AlgorithmStep {
  type: StepType;
  cell: Cell;
  direction?: 'start' | 'goal';
  distance?: number;
  description?: string;
}

export type StepType = 'open' | 'closed' | 'visit' | 'path' | 'done' | 'meeting';

export interface AlgorithmResult {
  success: boolean;
  pathLength: number;
  pathCost: number;
  visitedNodes: number;
  executionTime: number;
  path?: Cell[];
  meetingCell?: Cell;
  message?: string;
}

export interface AlgorithmGenerator {
  next(): IteratorResult<AlgorithmStep, AlgorithmResult>;
}

export type AlgorithmFunction = (grid: Grid, heuristic?: HeuristicType) => AlgorithmGenerator;

export type AlgorithmName = 'bfs' | 'dfs' | 'dijkstra' | 'astar' | 'bidirectionalBFS' | 'bidirectionalDijkstra';

export type HeuristicType = 'manhattan' | 'euclidean' | 'chebyshev' | 'octile';

export interface HeuristicFunction {
  (from: Position, to: Position): number;
}

// ============================================================================
// Animation Types
// ============================================================================

export interface AnimationOptions {
  speed: number;
  onStep?: (step: AlgorithmStep) => void;
  onComplete?: (result: AlgorithmResult) => void;
  onStatsUpdate?: (stats: Partial<AlgorithmResult>) => void;
}

export interface AnimationController {
  start(generator: AlgorithmGenerator): void;
  pause(): void;
  resume(): void;
  stepOne(): void;
  reset(): void;
  clearPath(): void;
  setSpeed(speed: number): void;
  isRunning: boolean;
}

// ============================================================================
// UI Types
// ============================================================================

export interface UIState {
  algorithm: AlgorithmName;
  heuristic: HeuristicType;
  speed: number;
  drawMode: DrawMode;
  isPlaying: boolean;
  grid: GridState;
}

export type DrawMode = 'wall' | 'weight2' | 'weight3' | 'eraser' | 'setstart' | 'setgoal';

export interface GridState {
  rows: number;
  cols: number;
  walls: Position[];
  weights: Map<string, number>;
  start: Position | null;
  goal: Position | null;
}

export interface ControlPanelConfig {
  controller: AnimationController;
  grid: Grid;
  interaction: GridInteraction;
  runAlgorithm: () => void;
  algorithms: Record<AlgorithmName, AlgorithmFunction>;
}

// ============================================================================
// Grid Types
// ============================================================================

export interface GridRenderer {
  canvas: HTMLCanvasElement;
  grid: Grid;
  draw(): void;
  resize(): void;
  clear(): void;
  setCellSize(size: number): void;
}

export interface GridInteraction {
  canvas: HTMLCanvasElement;
  grid: Grid;
  renderer: GridRenderer;
  isDrawing: boolean;
  currentMode: DrawMode;
  startDrawing(position: Position): void;
  draw(position: Position): void;
  stopDrawing(): void;
  setMode(mode: DrawMode): void;
}

// ============================================================================
// Worker Types
// ============================================================================

export interface WorkerMessage {
  type: 'init' | 'run' | 'stop' | 'progress' | 'complete' | 'error' | 'initialized' | 'stopped';
  data?: any;
}

export interface WorkerTaskData {
  algorithmName: AlgorithmName;
  grid: Grid;
  heuristic?: HeuristicType;
  options?: WorkerTaskOptions;
}

export interface WorkerTaskOptions {
  onProgress?: (step: AlgorithmStep) => void;
}

export interface WorkerProgress {
  step: AlgorithmStep;
  stepCount: number;
  stats: Partial<AlgorithmResult>;
}

export interface WorkerManager {
  initialize(): Promise<void>;
  runAlgorithm(
    algorithmName: AlgorithmName,
    grid: Grid,
    heuristic?: HeuristicType,
    options?: WorkerTaskOptions
  ): Promise<AlgorithmResult>;
  stopTask(taskId: string): void;
  stopAllTasks(): void;
  getStats(): WorkerStats;
  terminate(): void;
}

export interface WorkerStats {
  totalWorkers: number;
  busyWorkers: number;
  availableWorkers: number;
  queuedTasks: number;
  activeTasks: number;
}

// ============================================================================
// Comparison Types
// ============================================================================

export interface ComparisonController {
  addAlgorithm(algorithmName: AlgorithmName, heuristic?: HeuristicType): void;
  startRace(): Promise<void>;
  pauseRace(): void;
  resetRace(): void;
  exitComparison(): void;
}

export interface ComparisonResult {
  comparison: ComparisonInstance;
  result: AlgorithmResult;
}

export interface ComparisonInstance {
  id: string;
  algorithmName: AlgorithmName;
  heuristic?: HeuristicType;
  grid: Grid;
  renderer: GridRenderer;
  controller: AnimationController;
  startTime: number;
  endTime: number;
  stats: AlgorithmResult;
  workerTaskId: string;
}

// ============================================================================
// Maze Generation Types
// ============================================================================

export interface MazeGenerator {
  (grid: Grid): AlgorithmGenerator;
}

export interface MazeStep {
  type: 'carve' | 'backtrack' | 'complete';
  cell: Position;
}

export type MazeGeneratorName = 'recursiveBacktracker' | 'primsAlgorithm' | 'kruskalsAlgorithm' | 'wilsonsAlgorithm' | 'binaryTree';

export interface MazeGenerators {
  recursiveBacktracker: MazeGenerator;
  primsAlgorithm: MazeGenerator;
  kruskalsAlgorithm: MazeGenerator;
  wilsonsAlgorithm: MazeGenerator;
  binaryTree: MazeGenerator;
}

// ============================================================================
// Performance Analytics Types
// ============================================================================

export interface PerformanceDashboard {
  startRecording(): void;
  stopRecording(): void;
  recordAlgorithmExecution(algorithmName: AlgorithmName, stats: AlgorithmResult): void;
  clearData(): void;
  exportData(): void;
}

export interface PerformanceMetrics {
  runs: AlgorithmResult[];
  totalTime: number;
  totalVisited: number;
  totalPathLength: number;
  successfulRuns: number;
}

export interface RealTimeMetrics {
  visited: number;
  pathLength: number;
  pathCost: number;
  executionTime: number;
  memoryUsage: number;
  nodesPerSecond: number;
}

// ============================================================================
// Learning Mode Types
// ============================================================================

export interface LearningMode {
  startLearning(algorithmName: AlgorithmName): Promise<void>;
  startTutorial(): void;
  stepForward(): void;
  stepBackward(): void;
  pauseTutorial(): void;
  exitLearning(): void;
}

export interface LearningStep {
  title: string;
  description: string;
  operation: string;
  details: string;
  queue?: string;
  visited?: number;
  gridState?: GridStateChange[];
}

export interface GridStateChange {
  row: number;
  col: number;
  state: CellState;
}

export interface AlgorithmInfo {
  title: string;
  description: string;
  concepts: string[];
  code: string;
}

// ============================================================================
// Configuration Types
// ============================================================================

export interface Config {
  DEFAULT_ROWS: number;
  DEFAULT_COLS: number;
  MIN_ROWS: number;
  MAX_ROWS: number;
  MIN_COLS: number;
  MAX_COLS: number;
  CELL_SIZE_DESKTOP: number;
  CELL_SIZE_TABLET: number;
  CELL_SIZE_MOBILE: number;
  DEFAULT_SPEED: number;
  MIN_SPEED: number;
  MAX_SPEED: number;
  MAX_HISTORY_SIZE: number;
  WEIGHT_VALUES: Record<string, number>;
  DRAW_MODES: DrawMode[];
  ALGORITHMS: AlgorithmName[];
  HEURISTICS: HeuristicType[];
  MAZE_DENSITY: number;
  DIRECTIONS_4: number[][];
  DIRECTIONS_8: number[][];
}

export interface AlgorithmDescription {
  name: string;
  short: string;
  description: string;
  characteristics: string[];
  timeComplexity: string;
  spaceComplexity: string;
}

export interface HeuristicDescription {
  name: string;
  description: string;
}

// ============================================================================
// State Management Types
// ============================================================================

export interface StateManager {
  get<T>(key: string): T;
  set<T>(key: string, value: T): void;
  subscribe(key: string, callback: (value: any) => void): () => void;
  subscribeAll(callback: (state: Record<string, any>) => void): () => void;
}

export interface StateEvents {
  stateChanged: CustomEvent<{ key: string; value: any }>;
  stateLoaded: CustomEvent<Record<string, any>>;
}

// ============================================================================
// Theme Types
// ============================================================================

export interface Theme {
  name: string;
  colors: ThemeColors;
}

export interface ThemeColors {
  primary: string;
  secondary: string;
  success: string;
  warning: string;
  error: string;
  info: string;
  background: {
    primary: string;
    secondary: string;
    tertiary: string;
  };
  surface: {
    primary: string;
    secondary: string;
    tertiary: string;
  };
  text: {
    primary: string;
    secondary: string;
    tertiary: string;
  };
  border: {
    primary: string;
    secondary: string;
  };
  shadow: string;
}

export type ThemeMode = 'light' | 'dark' | 'auto';

// ============================================================================
// Utility Types
// ============================================================================

export interface MinHeap<T = any> {
  insert(element: T, priority: number): void;
  extractMin(): { element: T; priority: number } | null;
  peek(): { element: T; priority: number } | null;
  size(): number;
  isEmpty(): boolean;
}

export interface PriorityQueue<T> extends MinHeap<T> {}

export interface EventEmitter {
  on(event: string, callback: Function): void;
  off(event: string, callback: Function): void;
  emit(event: string, data?: any): void;
}

export interface Disposable {
  dispose(): void;
}

// ============================================================================
// File/Import-Export Types
// ============================================================================

export interface GridExport {
  version: string;
  timestamp: number;
  grid: GridState;
  metadata?: {
    name?: string;
    description?: string;
    author?: string;
  };
}

export interface ImportResult {
  success: boolean;
  grid?: GridState;
  error?: string;
}

// ============================================================================
// Toast/Notification Types
// ============================================================================

export interface ToastOptions {
  message: string;
  type?: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
  persistent?: boolean;
}

export interface ToastManager {
  show(options: ToastOptions): void;
  success(message: string, duration?: number): void;
  error(message: string, duration?: number): void;
  warning(message: string, duration?: number): void;
  info(message: string, duration?: number): void;
  clear(): void;
}

// ============================================================================
// Keyboard/Accessibility Types
// ============================================================================

export interface KeyboardShortcuts {
  [key: string]: {
    description: string;
    action: () => void;
    category?: string;
  };
}

export interface AccessibilityFeatures {
  reducedMotion: boolean;
  highContrast: boolean;
  screenReader: boolean;
}

// ============================================================================
// Error Handling Types
// ============================================================================

export interface AppError {
  message: string;
  code?: string;
  details?: any;
  timestamp: number;
  stack?: string;
}

export interface ErrorHandler {
  handle(error: AppError): void;
  report(error: AppError): void;
  recover(error: AppError): boolean;
}

// ============================================================================
// Service Worker Types
// ============================================================================

export interface ServiceWorkerEvent {
  type: 'update' | 'offline' | 'online';
  data?: any;
}

export interface CacheManager {
  add(url: string): Promise<void>;
  match(url: string): Promise<Response | undefined>;
  delete(url: string): Promise<boolean>;
  clear(): Promise<void>;
}

// ============================================================================
// Global Application Types
// ============================================================================

export interface PathfindingVisualizer {
  grid: Grid;
  renderer: GridRenderer;
  interaction: GridInteraction;
  controller: AnimationController;
  runAlgorithm(): void;
  reset(): void;
  export(): string;
  import(data: string): boolean;
}

export interface Window {
  app?: PathfindingVisualizer;
  performance?: Performance & {
    memory?: {
      usedJSHeapSize: number;
      totalJSHeapSize: number;
      jsHeapSizeLimit: number;
    };
  };
}

// ============================================================================
// Module Declaration Merging
// ============================================================================

declare module '*.css' {
  const content: Record<string, string>;
  export default content;
}

declare module '*.json' {
  const value: any;
  export default value;
}

declare module '*.svg' {
  const content: string;
  export default content;
}

declare module '*.png' {
  const content: string;
  export default content;
}

declare module '*.jpg' {
  const content: string;
  export default content;
}

declare module '*.jpeg' {
  const content: string;
  export default content;
}

declare module '*.gif' {
  const content: string;
  export default content;
}

declare module '*.webp' {
  const content: string;
  export default content;
}
