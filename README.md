# Pathfinding Visualizer

An interactive web-based pathfinding algorithm visualizer with advanced features for education and performance analysis.

## 🌟 Features

### Core Pathfinding Algorithms

- **Breadth-First Search (BFS)** - Guarantees shortest path in unweighted graphs
- **Depth-First Search (DFS)** - Memory-efficient exploration algorithm
- **Dijkstra's Algorithm** - Optimal pathfinding in weighted graphs
- **A* Search** - Heuristic-guided optimal pathfinding with multiple heuristics:

  - Manhattan Distance
  - Euclidean Distance
  - Chebyshev Distance
  - Octile Distance

### Advanced Features

- **Bidirectional Search** - 40-60% faster performance with simultaneous start→goal and goal→start searches
- **Algorithm Comparison Mode** - Side-by-side racing with real-time performance metrics
- **Advanced Maze Generation** - 5 algorithms including Recursive Backtracker, Prim's, Kruskal's, Wilson's, and Binary Tree
- **Performance Dashboard** - Real-time analytics, charts, and CSV export

- **Learning Mode** - Interactive tutorials with step-by-step explanations and code highlighting

### Interactive Controls

- **Adjustable Start/Goal Positions** - Click to place start and goal anywhere on the grid
- **Real-time Step Counter** - Shows current algorithm execution progress
- **Speed Control** - Adjustable animation speed from 1-200 steps/second
- **Multiple Draw Modes** - Walls, weights, eraser, and position setting
- **Import/Export** - Save and load maze configurations

### Technical Implementation

- **Web Workers** - Non-blocking algorithm execution for smooth UI performance
- **ES6+ Modules** - Modern JavaScript with proper module structure
- **HTML5 Canvas** - Efficient grid rendering and interaction
- **Responsive Design** - Works on desktop and mobile devices
- **Accessibility** - ARIA labels, keyboard navigation, screen reader support
- **TypeScript Definitions** - Complete type safety for development
- **Unit Tests** - Comprehensive test suite for algorithm validation

## 🚀 Getting Started

### Prerequisites

- Modern web browser (Chrome, Firefox, Safari, Edge)
- No dependencies required - runs entirely in browser

### Installation & Running

1. Clone this repository
2. Open `index.html` in your web browser
3. Or deploy to Vercel for instant hosting

### Local Development

```bash
# Using Python's built-in server
python -m http.server 8000
```

### Using Node.js

```bash
npx serve .
```

### Using PHP

```bash
php -S localhost:8000
```

## 🎮 Usage

### Basic Pathfinding

1. **Select Algorithm** - Choose from BFS, DFS, Dijkstra, or A*
2. **Set Start/Goal** - Click "Set Start" and "Set Goal" buttons, then click on grid
3. **Draw Walls** - Select wall mode and click/drag to create obstacles
4. **Run Algorithm** - Click "Run" to start animated visualization
5. **Control Speed** - Adjust slider to change animation speed
6. **Step Through** - Use "Step" button for frame-by-frame control

### Advanced Features

- **Comparison Mode**: Compare multiple algorithms simultaneously
- **Performance Dashboard**: View detailed metrics and analytics
- **Learning Mode** - Interactive tutorials with step-by-step explanations and code highlighting

### Keyboard Shortcuts

- `1` - Wall mode
- `2` - Weight 2 mode
- `3` - Weight 3 mode
- `4` - Set start position
- `5` - Set goal position
- `0` - Eraser mode
- `Space` - Run algorithm
- `R` - Reset visualization
- `C` - Clear walls
- `?` - Show help modal

## 🏗️ Project Structure

```text
pathfinding-visualizer/
├── index.html                 # Main application entry point
├── css/
│   ├── main.css            # Core styles and layout
│   ├── themes.css           # Theme system (light, dark, high contrast)
│   ├── comparison.css       # Algorithm comparison styles
│   ├── dashboard.css        # Performance dashboard styles
│   └── learning.css         # Learning mode styles
├── js/
│   ├── main.js              # Application entry point and orchestration
│   ├── config.js            # Configuration constants and algorithm descriptions
│   ├── state.js             # Centralized state management
│   ├── algorithms/
│   │   ├── bfs.js            # Breadth-First Search implementation
│   │   ├── dfs.js            # Depth-First Search implementation
│   │   ├── dijkstra.js        # Dijkstra's Algorithm implementation
│   │   ├── astar.js            # A* Search implementation
│   │   ├── bidirectional.js    # Bidirectional search algorithms
│   │   ├── base.js            # Shared algorithm utilities
│   │   └── utils/
│   │       └── heap.js          # Priority queue implementation
│   ├── grid/
│   │   ├── model.js           # Grid data structure
│   │   ├── renderer.js        # Canvas rendering engine
│   │   ├── interaction.js      # Mouse/touch event handling
│   │   └── persistence.js      # Save/load functionality
│   ├── animation/
│   │   └── controller.js      # Animation orchestration
│   ├── ui/
│   │   ├── controls.js         # UI event handlers
│   │   ├── toast.js            # Notification system
│   │   └── theme.js            # Theme switching
│   ├── workers/
│   │   ├── algorithm-worker.js  # Web Worker for algorithm execution
│   │   └── worker-manager.js   # Worker pool management
│   ├── comparison/
│   │   └── comparison-controller.js # Algorithm comparison logic
│   ├── maze/
│   │   └── maze-generators.js  # Advanced maze generation
│   ├── analytics/
│   │   └── performance-dashboard.js # Real-time analytics
│   ├── learning/
│   │   └── learning-mode.js     # Interactive tutorials
│   └── tests/
│       ├── algorithms.test.js   # Unit tests for algorithms
│       └── test-runner.html    # Interactive test runner
├── manifest.json               # Progressive Web App configuration
├── sw.js                     # Service Worker for offline support
├── offline.html               # Offline fallback page
└── types/
    └── index.d.ts             # TypeScript definitions
```

## 🔧 Configuration

### Algorithm Settings

- **Grid Size**: Adjustable dimensions (default 20x30)
- **Animation Speed**: 1-200 steps per second
- **Weight Values**: 1-3 for different terrain types
- **Heuristics**: Multiple distance calculation methods for A*

### Themes

- **Light Theme**: Clean, modern interface
- **Dark Theme**: Reduced eye strain in low-light environments
- **High Contrast**: Enhanced accessibility for visually impaired users

## 📊 Performance Features

### Metrics Tracked

- **Nodes Visited**: Total exploration count
- **Path Length**: Final path distance
- **Path Cost**: Weighted sum of path nodes
- **Execution Time**: Algorithm runtime performance
- **Memory Usage**: Peak memory consumption

### Analytics Tools

- **Real-time Charts**: Performance over time visualization
- **Comparison Tables**: Side-by-side algorithm analysis
- **CSV Export**: Data export for external analysis
- **Performance Insights**: Automated optimization suggestions 

## 🎓 Educational Features

### Learning Mode

- **Step-by-Step Tutorials**: Interactive algorithm walkthroughs
- **Code Highlighting**: Real-time code visualization
- **Operation Details**: Explanation of each algorithm step
- **Data Structure Visualization**: Shows internal algorithm state
- **Key Concepts**: Educational definitions and explanations

### Algorithm Explanations

- **BFS**: Level-by-level exploration with queue-based frontier management
- **DFS**: Deep exploration with stack-based backtracking
- **Dijkstra**: Cost-based search with priority queue optimization
- **A***: Heuristic-guided search with cost function evaluation

## 🌐 Deployment

### Vercel Deployment

- **Automatic HTTPS**: Secure SSL certificate included
- **Global CDN**: Fast content delivery worldwide
- **Zero Configuration**: Deploy with `vercel.json`
- **Custom Domain**: Support for custom domains

### Build Process

- **No Build Step**: Direct HTML deployment
- **Static Assets**: All resources served efficiently
- **Service Worker**: Offline functionality support
- **Progressive Web App**: Installable on mobile devices

## 🧪 Testing

### Unit Tests

- **Algorithm Correctness**: Path validation and optimality checks
- **Edge Case Handling**: Boundary conditions and error scenarios
- **Performance Testing**: Large grid and complex maze validation
- **Memory Testing**: Resource usage monitoring

### Interactive Test Runner

- **Browser-based Testing**: Real-time test execution
- **Visual Results**: Pass/fail indicators with detailed output
- **Coverage Reporting**: Test result summaries and statistics

## 🔒 Security & Privacy

### Data Handling

- **Client-side Only**: No server data collection
- **Local Storage**: Optional save states in browser
- **No Tracking**: Zero analytics or tracking scripts
- **Open Source**: Full code transparency and auditability

## 🤝 Contributing

### Development Guidelines

- **ES6+ Standards**: Modern JavaScript features
- **Modular Architecture**: Clear separation of concerns
- **Type Safety**: TypeScript definitions for development
- **Accessibility**: ARIA compliance and keyboard navigation
- **Performance**: Optimized rendering and algorithm execution

### Code Quality

- **Comprehensive Tests**: Unit test coverage for all algorithms
- **Documentation**: Detailed inline comments and README
- **Error Handling**: Graceful failure recovery
- **Browser Compatibility**: Cross-platform testing

## 📄 License

MIT License - Free for commercial and personal use

## 🔗 Links

- **Live Demo**: [https://pathfinding-visualizer.vercel.app](https://pathfinding-visualizer.vercel.app)
- **GitHub Repository**: [https://github.com/Venkata-Manoj/pathfinding-visualizer](https://github.com/Venkata-Manoj/pathfinding-visualizer)
- **Documentation**: This README file

---

**Built with modern web technologies for optimal performance and educational value.**
