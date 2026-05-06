/**
 * Pathfinding Visualizer - Theme Manager
 * Dark/Light mode toggle with system preference detection
 */

/**
 * Initialize theme toggle functionality
 */
export function initTheme() {
  const themeToggle = document.getElementById('theme-toggle');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');
  
  // Load saved theme preference or use system preference
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme) {
    setTheme(savedTheme);
  } else if (prefersDark.matches) {
    setTheme('dark');
  } else {
    setTheme('light');
  }
  
  // Toggle button click handler
  themeToggle?.addEventListener('click', () => {
    const currentTheme = getCurrentTheme();
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
  });
  
  // Listen for system theme changes
  prefersDark.addEventListener('change', (e) => {
    // Only auto-switch if user hasn't manually set a preference
    if (!localStorage.getItem('theme')) {
      setTheme(e.matches ? 'dark' : 'light');
    }
  });
}

/**
 * Get the current theme
 */
export function getCurrentTheme() {
  return document.documentElement.getAttribute('data-theme') || 'light';
}

/**
 * Set the theme
 */
export function setTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem('theme', theme);
  
  // Update meta theme-color for mobile browsers
  const metaThemeColor = document.querySelector('meta[name="theme-color"]');
  if (metaThemeColor) {
    metaThemeColor.content = theme === 'dark' ? '#0f172a' : '#3b82f6';
  }
}

/**
 * Toggle between light and dark themes
 */
export function toggleTheme() {
  const current = getCurrentTheme();
  setTheme(current === 'dark' ? 'light' : 'dark');
}
