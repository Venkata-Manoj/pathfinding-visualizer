/**
 * Pathfinding Visualizer - Performance Dashboard
 * Real-time analytics and performance metrics for algorithms
 */

export class PerformanceDashboard {
  constructor(container) {
    this.container = container;
    this.metrics = new Map();
    this.charts = new Map();
    this.isRecording = false;
    this.startTime = null;
    this.currentAlgorithm = null;
    
    this.init();
  }
  
  /**
   * Initialize dashboard
   */
  init() {
    this.createDashboardLayout();
    this.setupEventListeners();
    this.initializeCharts();
  }
  
  /**
   * Create dashboard layout
   */
  createDashboardLayout() {
    this.container.innerHTML = `
      <div class="dashboard-container">
        <div class="dashboard-header">
          <h2>Performance Analytics</h2>
          <div class="dashboard-controls">
            <button id="start-recording" class="btn btn-primary">Start Recording</button>
            <button id="stop-recording" class="btn btn-secondary" disabled>Stop Recording</button>
            <button id="clear-data" class="btn btn-ghost">Clear Data</button>
            <button id="export-data" class="btn btn-secondary">Export CSV</button>
          </div>
        </div>
        
        <div class="dashboard-content">
          <!-- Real-time Metrics -->
          <div class="metrics-section">
            <h3>Real-time Metrics</h3>
            <div class="metrics-grid">
              <div class="metric-card" id="metric-visited">
                <div class="metric-icon">🔍</div>
                <div class="metric-info">
                  <div class="metric-value">0</div>
                  <div class="metric-label">Nodes Visited</div>
                </div>
              </div>
              
              <div class="metric-card" id="metric-path-length">
                <div class="metric-icon">📏</div>
                <div class="metric-info">
                  <div class="metric-value">0</div>
                  <div class="metric-label">Path Length</div>
                </div>
              </div>
              
              <div class="metric-card" id="metric-path-cost">
                <div class="metric-icon">💰</div>
                <div class="metric-info">
                  <div class="metric-value">0</div>
                  <div class="metric-label">Path Cost</div>
                </div>
              </div>
              
              <div class="metric-card" id="metric-execution-time">
                <div class="metric-icon">⏱️</div>
                <div class="metric-info">
                  <div class="metric-value">0ms</div>
                  <div class="metric-label">Execution Time</div>
                </div>
              </div>
              
              <div class="metric-card" id="metric-memory">
                <div class="metric-icon">🧠</div>
                <div class="metric-info">
                  <div class="metric-value">0MB</div>
                  <div class="metric-label">Memory Usage</div>
                </div>
              </div>
              
              <div class="metric-card" id="metric-nodes-per-second">
                <div class="metric-icon">⚡</div>
                <div class="metric-info">
                  <div class="metric-value">0</div>
                  <div class="metric-label">Nodes/Second</div>
                </div>
              </div>
            </div>
          </div>
          
          <!-- Charts Section -->
          <div class="charts-section">
            <div class="chart-container">
              <h3>Performance Over Time</h3>
              <canvas id="performance-chart"></canvas>
            </div>
            
            <div class="chart-container">
              <h3>Algorithm Comparison</h3>
              <canvas id="comparison-chart"></canvas>
            </div>
          </div>
          
          <!-- Statistics Table -->
          <div class="stats-section">
            <h3>Historical Statistics</h3>
            <div class="table-container">
              <table id="stats-table">
                <thead>
                  <tr>
                    <th>Algorithm</th>
                    <th>Avg. Time</th>
                    <th>Avg. Visited</th>
                    <th>Avg. Path Length</th>
                    <th>Success Rate</th>
                    <th>Total Runs</th>
                    <th>Best Time</th>
                  </tr>
                </thead>
                <tbody id="stats-tbody">
                  <!-- Stats will be populated here -->
                </tbody>
              </table>
            </div>
          </div>
          
          <!-- Insights Section -->
          <div class="insights-section">
            <h3>Performance Insights</h3>
            <div id="insights-content">
              <div class="insight-card">
                <h4>📊 Algorithm Efficiency</h4>
                <p id="efficiency-insight">No data available yet</p>
              </div>
              
              <div class="insight-card">
                <h4>🎯 Optimal Use Cases</h4>
                <p id="usecase-insight">Run algorithms to see recommendations</p>
              </div>
              
              <div class="insight-card">
                <h4>⚡ Performance Tips</h4>
                <p id="performance-tips">Start recording to get personalized tips</p>
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
    document.getElementById('start-recording').addEventListener('click', () => this.startRecording());
    document.getElementById('stop-recording').addEventListener('click', () => this.stopRecording());
    document.getElementById('clear-data').addEventListener('click', () => this.clearData());
    document.getElementById('export-data').addEventListener('click', () => this.exportData());
  }
  
  /**
   * Initialize charts
   */
  initializeCharts() {
    this.initializePerformanceChart();
    this.initializeComparisonChart();
  }
  
  /**
   * Initialize performance timeline chart
   */
  initializePerformanceChart() {
    const canvas = document.getElementById('performance-chart');
    const ctx = canvas.getContext('2d');
    
    // Simple chart implementation (in production, use Chart.js or similar)
    this.charts.set('performance', {
      canvas,
      ctx,
      data: {
        labels: [],
        datasets: {
          visited: [],
          pathLength: [],
          executionTime: []
        }
      }
    });
  }
  
  /**
   * Initialize comparison chart
   */
  initializeComparisonChart() {
    const canvas = document.getElementById('comparison-chart');
    const ctx = canvas.getContext('2d');
    
    this.charts.set('comparison', {
      canvas,
      ctx,
      data: {
        labels: [],
        datasets: {}
      }
    });
  }
  
  /**
   * Start recording metrics
   */
  startRecording() {
    this.isRecording = true;
    this.startTime = performance.now();
    
    document.getElementById('start-recording').disabled = true;
    document.getElementById('stop-recording').disabled = false;
    
    // Start monitoring
    this.startMonitoring();
  }
  
  /**
   * Stop recording metrics
   */
  stopRecording() {
    this.isRecording = false;
    
    document.getElementById('start-recording').disabled = false;
    document.getElementById('stop-recording').disabled = true;
    
    this.stopMonitoring();
  }
  
  /**
   * Start monitoring performance
   */
  startMonitoring() {
    this.monitoringInterval = setInterval(() => {
      if (this.isRecording) {
        this.collectSystemMetrics();
      }
    }, 100);
  }
  
  /**
   * Stop monitoring performance
   */
  stopMonitoring() {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
    }
  }
  
  /**
   * Collect system metrics
   */
  collectSystemMetrics() {
    const memory = performance.memory;
    if (memory) {
      this.updateMetric('memory', Math.round(memory.usedJSHeapSize / 1024 / 1024));
    }
  }
  
  /**
   * Record algorithm execution
   */
  recordAlgorithmExecution(algorithmName, stats) {
    if (!this.metrics.has(algorithmName)) {
      this.metrics.set(algorithmName, {
        runs: [],
        totalTime: 0,
        totalVisited: 0,
        totalPathLength: 0,
        successfulRuns: 0
      });
    }
    
    const algorithmMetrics = this.metrics.get(algorithmName);
    algorithmMetrics.runs.push({
      timestamp: Date.now(),
      ...stats
    });
    
    algorithmMetrics.totalTime += stats.executionTime || 0;
    algorithmMetrics.totalVisited += stats.visitedNodes || 0;
    algorithmMetrics.totalPathLength += stats.pathLength || 0;
    
    if (stats.success) {
      algorithmMetrics.successfulRuns++;
    }
    
    // Update real-time metrics
    this.updateRealTimeMetrics(algorithmName, stats);
    
    // Update charts
    this.updateCharts(algorithmName, stats);
    
    // Update statistics table
    this.updateStatisticsTable();
    
    // Update insights
    this.updateInsights();
  }
  
  /**
   * Update real-time metrics display
   */
  updateRealTimeMetrics(algorithmName, stats) {
    this.updateMetric('visited', stats.visitedNodes || 0);
    this.updateMetric('path-length', stats.pathLength || 0);
    this.updateMetric('path-cost', stats.pathCost || 0);
    this.updateMetric('execution-time', Math.round(stats.executionTime || 0) + 'ms');
    
    // Calculate nodes per second
    if (stats.executionTime && stats.executionTime > 0) {
      const nodesPerSecond = Math.round((stats.visitedNodes || 0) / (stats.executionTime / 1000));
      this.updateMetric('nodes-per-second', nodesPerSecond);
    }
  }
  
  /**
   * Update individual metric
   */
  updateMetric(metricId, value) {
    const metricCard = document.getElementById(`metric-${metricId}`);
    if (metricCard) {
      const valueEl = metricCard.querySelector('.metric-value');
      if (valueEl) {
        valueEl.textContent = value;
        
        // Add animation
        valueEl.style.transform = 'scale(1.1)';
        setTimeout(() => {
          valueEl.style.transform = 'scale(1)';
        }, 200);
      }
    }
  }
  
  /**
   * Update charts with new data
   */
  updateCharts(algorithmName, stats) {
    // Update performance chart
    const perfChart = this.charts.get('performance');
    if (perfChart && this.isRecording) {
      const time = new Date().toLocaleTimeString();
      perfChart.data.labels.push(time);
      perfChart.data.datasets.visited.push(stats.visitedNodes || 0);
      perfChart.data.datasets.pathLength.push(stats.pathLength || 0);
      perfChart.data.datasets.executionTime.push(stats.executionTime || 0);
      
      // Keep only last 20 data points
      if (perfChart.data.labels.length > 20) {
        perfChart.data.labels.shift();
        perfChart.data.datasets.visited.shift();
        perfChart.data.datasets.pathLength.shift();
        perfChart.data.datasets.executionTime.shift();
      }
      
      this.drawPerformanceChart();
    }
    
    // Update comparison chart
    this.updateComparisonChart();
  }
  
  /**
   * Draw performance chart
   */
  drawPerformanceChart() {
    const chart = this.charts.get('performance');
    if (!chart) return;
    
    const { canvas, ctx, data } = chart;
    const width = canvas.width = canvas.offsetWidth;
    const height = canvas.height = 200;
    
    ctx.clearRect(0, 0, width, height);
    
    // Draw grid
    ctx.strokeStyle = '#e0e0e0';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 5; i++) {
      const y = (height / 5) * i;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }
    
    // Draw visited nodes line
    this.drawLine(ctx, data.datasets.visited, '#3b82f6', width, height);
    
    // Draw path length line
    this.drawLine(ctx, data.datasets.pathLength, '#10b981', width, height);
  }
  
  /**
   * Draw line on chart
   */
  drawLine(ctx, data, color, width, height) {
    if (data.length < 2) return;
    
    const maxValue = Math.max(...data, 1);
    const stepX = width / (data.length - 1);
    
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.beginPath();
    
    data.forEach((value, index) => {
      const x = index * stepX;
      const y = height - (value / maxValue) * height * 0.9;
      
      if (index === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });
    
    ctx.stroke();
  }
  
  /**
   * Update comparison chart
   */
  updateComparisonChart() {
    const chart = this.charts.get('comparison');
    if (!chart) return;
    
    const { canvas, ctx } = chart;
    const width = canvas.width = canvas.offsetWidth;
    const height = canvas.height = 200;
    
    ctx.clearRect(0, 0, width, height);
    
    // Calculate average metrics for each algorithm
    const algorithms = Array.from(this.metrics.keys());
    const avgTimes = algorithms.map(algo => {
      const metrics = this.metrics.get(algo);
      return metrics.successfulRuns > 0 ? metrics.totalTime / metrics.successfulRuns : 0;
    });
    
    // Draw bar chart
    const barWidth = width / (algorithms.length * 2);
    const maxTime = Math.max(...avgTimes, 1);
    
    algorithms.forEach((algo, index) => {
      const x = (index * 2 + 0.5) * barWidth;
      const barHeight = (avgTimes[index] / maxTime) * height * 0.8;
      const y = height - barHeight;
      
      ctx.fillStyle = '#3b82f6';
      ctx.fillRect(x, y, barWidth, barHeight);
      
      // Draw label
      ctx.fillStyle = '#333';
      ctx.font = '12px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(algo.toUpperCase(), x + barWidth / 2, height - 5);
    });
  }
  
  /**
   * Update statistics table
   */
  updateStatisticsTable() {
    const tbody = document.getElementById('stats-tbody');
    tbody.innerHTML = '';
    
    this.metrics.forEach((metrics, algorithmName) => {
      const avgTime = metrics.successfulRuns > 0 ? 
        Math.round(metrics.totalTime / metrics.successfulRuns) : 0;
      const avgVisited = metrics.runs.length > 0 ? 
        Math.round(metrics.totalVisited / metrics.runs.length) : 0;
      const avgPathLength = metrics.successfulRuns > 0 ? 
        Math.round(metrics.totalPathLength / metrics.successfulRuns) : 0;
      const successRate = metrics.runs.length > 0 ? 
        Math.round((metrics.successfulRuns / metrics.runs.length) * 100) : 0;
      const bestTime = metrics.runs.length > 0 ? 
        Math.min(...metrics.runs.map(run => run.executionTime || Infinity)) : 0;
      
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${algorithmName}</td>
        <td>${avgTime}ms</td>
        <td>${avgVisited}</td>
        <td>${avgPathLength}</td>
        <td>${successRate}%</td>
        <td>${metrics.runs.length}</td>
        <td>${bestTime === Infinity ? '-' : bestTime + 'ms'}</td>
      `;
      
      tbody.appendChild(row);
    });
  }
  
  /**
   * Update insights
   */
  updateInsights() {
    // Efficiency insight
    const efficiencyEl = document.getElementById('efficiency-insight');
    if (efficiencyEl && this.metrics.size > 0) {
      const bestAlgorithm = this.findMostEfficientAlgorithm();
      efficiencyEl.textContent = `${bestAlgorithm} shows the best average performance with lowest execution time.`;
    }
    
    // Use case insight
    const usecaseEl = document.getElementById('usecase-insight');
    if (usecaseEl && this.metrics.size > 0) {
      usecaseEl.textContent = this.generateUseCaseRecommendation();
    }
    
    // Performance tips
    const tipsEl = document.getElementById('performance-tips');
    if (tipsEl) {
      tipsEl.textContent = this.generatePerformanceTips();
    }
  }
  
  /**
   * Find most efficient algorithm
   */
  findMostEfficientAlgorithm() {
    let bestAlgorithm = '';
    let bestTime = Infinity;
    
    this.metrics.forEach((metrics, algorithmName) => {
      if (metrics.successfulRuns > 0) {
        const avgTime = metrics.totalTime / metrics.successfulRuns;
        if (avgTime < bestTime) {
          bestTime = avgTime;
          bestAlgorithm = algorithmName;
        }
      }
    });
    
    return bestAlgorithm || 'Unknown';
  }
  
  /**
   * Generate use case recommendations
   */
  generateUseCaseRecommendation() {
    const bfs = this.metrics.get('bfs');
    const dijkstra = this.metrics.get('dijkstra');
    const astar = this.metrics.get('astar');
    
    if (astar && astar.successfulRuns > 0) {
      return 'A* is recommended for most pathfinding scenarios due to its balance of speed and optimality.';
    } else if (dijkstra && dijkstra.successfulRuns > 0) {
      return "Dijkstra's algorithm is ideal for weighted graphs where heuristic functions aren't available.";
    } else if (bfs && bfs.successfulRuns > 0) {
      return 'BFS is perfect for unweighted graphs where shortest path is guaranteed.';
    }
    
    return 'Run more algorithms to get personalized recommendations.';
  }
  
  /**
   * Generate performance tips
   */
  generatePerformanceTips() {
    return 'Consider using bidirectional search for large grids to reduce search space by half.';
  }
  
  /**
   * Clear all data
   */
  clearData() {
    this.metrics.clear();
    this.updateStatisticsTable();
    this.updateInsights();
    
    // Clear charts
    this.charts.forEach(chart => {
      chart.data.labels = [];
      Object.values(chart.data.datasets).forEach(dataset => {
        if (Array.isArray(dataset)) {
          dataset.length = 0;
        }
      });
    });
    
    this.drawPerformanceChart();
    this.updateComparisonChart();
  }
  
  /**
   * Export data as CSV
   */
  exportData() {
    let csv = 'Algorithm,Timestamp,ExecutionTime,VisitedNodes,PathLength,PathCost,Success\n';
    
    this.metrics.forEach((metrics, algorithmName) => {
      metrics.runs.forEach(run => {
        csv += `${algorithmName},${run.timestamp},${run.executionTime || 0},${run.visitedNodes || 0},${run.pathLength || 0},${run.pathCost || 0},${run.success || false}\n`;
      });
    });
    
    // Create download link
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `pathfinding-metrics-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }
}
