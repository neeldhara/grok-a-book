document.addEventListener('DOMContentLoaded', function() {
  // Elements
  const gridContainer = document.getElementById('grid-container');
  const windowContainer = document.getElementById('window-container');
  const patternDisplay = document.getElementById('pattern-display');
  const patternCountDisplay = document.getElementById('pattern-count');
  const resetBtn = document.getElementById('reset-btn');
  const autoPlayBtn = document.getElementById('autoplay-btn');
  const speedSlider = document.getElementById('speed-slider');
  const speedValue = document.getElementById('speed-value');
  
  // Grid setup
  const gridSize = 4;
  const windowSize = 2;
  let grid = [];
  let windowPosition = { row: 0, col: 0 };
  let isAnimating = false;
  let autoPlayInterval = null;
  let visitedPatterns = new Set();
  let allPossiblePatterns = Math.pow(2, windowSize * windowSize); // 2^4 = 16
  
  // Update speed value display
  speedSlider.addEventListener('input', function() {
    const value = parseInt(this.value);
    speedValue.textContent = value;
  });
  
  // Initialize grid
  function initializeGrid() {
    // Clear previous grid
    gridContainer.innerHTML = '';
    windowContainer.innerHTML = '';
    patternDisplay.innerHTML = '';
    visitedPatterns.clear();
    
    // Create the de Bruijn pattern as shown in the example
    grid = [
      [1, 1, 0, 1],
      [0, 0, 0, 1],
      [1, 0, 0, 0],
      [1, 0, 1, 1]
    ];
    
    // Render grid
    renderGrid();
    
    // Initialize window at top-left
    windowPosition = { row: 0, col: 0 };
    updateWindow();
    
    // Update pattern count
    updatePatternCount();
  }
  
  // Render the grid
  function renderGrid() {
    gridContainer.style.gridTemplateColumns = `repeat(${gridSize}, 1fr)`;
    
    for (let row = 0; row < gridSize; row++) {
      for (let col = 0; col < gridSize; col++) {
        const cell = document.createElement('div');
        cell.className = 'grid-cell';
        cell.textContent = grid[row][col];
        cell.dataset.row = row;
        cell.dataset.col = col;
        
        // Add highlight class based on value
        if (grid[row][col] === 1) {
          cell.classList.add('value-one');
        } else {
          cell.classList.add('value-zero');
        }
        
        gridContainer.appendChild(cell);
      }
    }
  }
  
  // Update the sliding window
  function updateWindow() {
    // Clear previous window highlight
    const cells = document.querySelectorAll('.grid-cell');
    cells.forEach(cell => {
      cell.classList.remove('in-window');
    });
    
    // Highlight cells in the current window
    for (let row = windowPosition.row; row < windowPosition.row + windowSize; row++) {
      for (let col = windowPosition.col; col < windowPosition.col + windowSize; col++) {
        const cellRow = ((row % gridSize) + gridSize) % gridSize; // Handle wrapping
        const cellCol = ((col % gridSize) + gridSize) % gridSize; // Handle wrapping
        
        const cell = document.querySelector(`.grid-cell[data-row="${cellRow}"][data-col="${cellCol}"]`);
        if (cell) {
          cell.classList.add('in-window');
        }
      }
    }
    
    // Update window display
    updateWindowDisplay();
  }
  
  // Update the window display
  function updateWindowDisplay() {
    windowContainer.innerHTML = '';
    windowContainer.style.gridTemplateColumns = `repeat(${windowSize}, 1fr)`;
    
    // Extract the pattern from the current window position
    let pattern = [];
    for (let row = windowPosition.row; row < windowPosition.row + windowSize; row++) {
      let rowPattern = [];
      for (let col = windowPosition.col; col < windowPosition.col + windowSize; col++) {
        const cellRow = ((row % gridSize) + gridSize) % gridSize; // Handle wrapping
        const cellCol = ((col % gridSize) + gridSize) % gridSize; // Handle wrapping
        rowPattern.push(grid[cellRow][cellCol]);
      }
      pattern.push(rowPattern);
    }
    
    // Display the window
    for (let row = 0; row < windowSize; row++) {
      for (let col = 0; col < windowSize; col++) {
        const cell = document.createElement('div');
        cell.className = 'window-cell';
        cell.textContent = pattern[row][col];
        
        // Add highlight class based on value
        if (pattern[row][col] === 1) {
          cell.classList.add('value-one');
        } else {
          cell.classList.add('value-zero');
        }
        
        windowContainer.appendChild(cell);
      }
    }
    
    // Add pattern to visited patterns
    const patternString = pattern.flat().join('');
    if (!visitedPatterns.has(patternString)) {
      visitedPatterns.add(patternString);
      
      // Add to pattern display
      const patternElement = document.createElement('div');
      patternElement.className = 'pattern-item';
      
      // Create a mini-grid for the pattern
      const miniGrid = document.createElement('div');
      miniGrid.className = 'mini-grid';
      miniGrid.style.gridTemplateColumns = `repeat(${windowSize}, 1fr)`;
      
      for (let row = 0; row < windowSize; row++) {
        for (let col = 0; col < windowSize; col++) {
          const cell = document.createElement('div');
          cell.className = 'mini-cell';
          cell.textContent = pattern[row][col];
          
          // Add highlight class based on value
          if (pattern[row][col] === 1) {
            cell.classList.add('value-one');
          } else {
            cell.classList.add('value-zero');
          }
          
          miniGrid.appendChild(cell);
        }
      }
      
      patternElement.appendChild(miniGrid);
      patternElement.innerHTML += `<div class="pattern-text">${patternString}</div>`;
      patternDisplay.appendChild(patternElement);
      
      // Update pattern count
      updatePatternCount();
    }
  }
  
  // Update pattern count display
  function updatePatternCount() {
    patternCountDisplay.textContent = `${visitedPatterns.size} / ${allPossiblePatterns}`;
  }
  
  // Move window to next position
  function moveWindow(direction) {
    if (isAnimating) return;
    
    isAnimating = true;
    
    switch (direction) {
      case 'right':
        windowPosition.col = (windowPosition.col + 1) % gridSize;
        break;
      case 'left':
        windowPosition.col = ((windowPosition.col - 1) % gridSize + gridSize) % gridSize;
        break;
      case 'down':
        windowPosition.row = (windowPosition.row + 1) % gridSize;
        break;
      case 'up':
        windowPosition.row = ((windowPosition.row - 1) % gridSize + gridSize) % gridSize;
        break;
    }
    
    updateWindow();
    
    setTimeout(() => {
      isAnimating = false;
    }, 300);
  }
  
  // Auto-play function
  function toggleAutoPlay() {
    if (autoPlayInterval) {
      clearInterval(autoPlayInterval);
      autoPlayInterval = null;
      autoPlayBtn.textContent = 'Start Auto-Play';
    } else {
      let positions = [];
      
      // Generate all possible window positions
      for (let row = 0; row < gridSize; row++) {
        for (let col = 0; col < gridSize; col++) {
          positions.push({ row, col });
        }
      }
      
      let currentIndex = 0;
      
      autoPlayInterval = setInterval(() => {
        if (currentIndex >= positions.length) {
          clearInterval(autoPlayInterval);
          autoPlayInterval = null;
          autoPlayBtn.textContent = 'Start Auto-Play';
          return;
        }
        
        windowPosition = positions[currentIndex];
        updateWindow();
        currentIndex++;
      }, parseInt(speedSlider.value));
      
      autoPlayBtn.textContent = 'Stop Auto-Play';
    }
  }
  
  // Event listeners for arrow keys
  document.addEventListener('keydown', function(event) {
    if (autoPlayInterval) return; // Ignore key presses during auto-play
    
    switch (event.key) {
      case 'ArrowRight':
        moveWindow('right');
        break;
      case 'ArrowLeft':
        moveWindow('left');
        break;
      case 'ArrowDown':
        moveWindow('down');
        break;
      case 'ArrowUp':
        moveWindow('up');
        break;
    }
  });
  
  // Button event listeners
  document.getElementById('move-right').addEventListener('click', () => moveWindow('right'));
  document.getElementById('move-left').addEventListener('click', () => moveWindow('left'));
  document.getElementById('move-down').addEventListener('click', () => moveWindow('down'));
  document.getElementById('move-up').addEventListener('click', () => moveWindow('up'));
  resetBtn.addEventListener('click', initializeGrid);
  autoPlayBtn.addEventListener('click', toggleAutoPlay);
  
  // Initialize on load
  initializeGrid();
});
