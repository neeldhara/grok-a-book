document.addEventListener('DOMContentLoaded', function() {
  // Elements for Game 1
  const game1Grid = document.getElementById('game1-grid');
  const game1Message = document.getElementById('game1-message');
  const game1ResetBtn = document.getElementById('game1-reset');
  const game1DoneBtn = document.getElementById('game1-done');
  const game1LeftPattern = document.getElementById('game1-left-pattern');
  const game1RightPattern = document.getElementById('game1-right-pattern');
  
  // Elements for Game 2
  const game2Grid = document.getElementById('game2-grid');
  const game2Message = document.getElementById('game2-message');
  const game2DoneBtn = document.getElementById('game2-done');
  const game2ResetBtn = document.getElementById('game2-reset');
  const game2LeftPattern = document.getElementById('game2-left-pattern');
  const game2RightPattern = document.getElementById('game2-right-pattern');
  
  // Grid setup
  const gridSize = 4;
  let game1Cells = [];
  let game2Cells = [];
  let game1SelectedCells = [];
  let game1Solution = null;
  
  // Initialize both games
  initializeGame1();
  initializeGame2();
  
  // Initialize Game 1: Find two locations with identical cross patterns
  function initializeGame1() {
    game1Grid.innerHTML = '';
    game1Cells = [];
    game1SelectedCells = [];
    game1Solution = null;
    game1Message.textContent = 'Find two locations where the cross pattern is identical.';
    game1Message.className = 'game-message';
    game1DoneBtn.disabled = true;
    
    // Clear pattern displays
    game1LeftPattern.innerHTML = '';
    game1RightPattern.innerHTML = '';
    
    // Create a 4x4 grid with random 0/1 values (equal number of each)
    let values = Array(8).fill(0).concat(Array(8).fill(1));
    shuffleArray(values);
    
    // Make sure there are at least two identical cross patterns
    let hasSolution = false;
    while (!hasSolution) {
      // Check if there are at least two identical cross patterns
      const crossPatterns = getCrossPatterns(values);
      const patternCounts = {};
      
      for (let i = 0; i < crossPatterns.length; i++) {
        const pattern = crossPatterns[i].join('');
        patternCounts[pattern] = patternCounts[pattern] || [];
        patternCounts[pattern].push(i);
      }
      
      // Find a pattern that appears at least twice
      for (const pattern in patternCounts) {
        if (patternCounts[pattern].length >= 2) {
          game1Solution = patternCounts[pattern].slice(0, 2);
          hasSolution = true;
          break;
        }
      }
      
      // If no solution, reshuffle
      if (!hasSolution) {
        shuffleArray(values);
      }
    }
    
    // Create the grid
    game1Grid.style.gridTemplateColumns = `repeat(${gridSize}, 1fr)`;
    
    for (let row = 0; row < gridSize; row++) {
      for (let col = 0; col < gridSize; col++) {
        const index = row * gridSize + col;
        const cell = document.createElement('div');
        cell.className = 'grid-cell';
        cell.dataset.row = row;
        cell.dataset.col = col;
        cell.dataset.index = index;
        
        // Add value class
        if (values[index] === 1) {
          cell.classList.add('value-one');
        } else {
          cell.classList.add('value-zero');
        }
        
        // Add cell number label (1-16)
        const cellNumber = document.createElement('span');
        cellNumber.className = 'cell-number';
        cellNumber.textContent = index + 1;
        cell.appendChild(cellNumber);
        
        // Add click event
        cell.addEventListener('click', function() {
          handleGame1CellClick(this);
        });
        
        game1Grid.appendChild(cell);
        game1Cells.push({
          element: cell,
          value: values[index],
          row: row,
          col: col,
          index: index
        });
      }
    }
  }
  
  // Initialize Game 2: Create your own grid
  function initializeGame2() {
    game2Grid.innerHTML = '';
    game2Cells = [];
    game2Message.textContent = 'Color the grid however you like, then press "Done".';
    game2Message.className = 'game-message';
    
    // Clear pattern displays
    game2LeftPattern.innerHTML = '';
    game2RightPattern.innerHTML = '';
    game2LeftPattern.removeAttribute('data-index');
    game2RightPattern.removeAttribute('data-index');
    
    // Create an empty 4x4 grid
    game2Grid.style.gridTemplateColumns = `repeat(${gridSize}, 1fr)`;
    
    for (let row = 0; row < gridSize; row++) {
      for (let col = 0; col < gridSize; col++) {
        const index = row * gridSize + col;
        const cell = document.createElement('div');
        cell.className = 'grid-cell value-zero'; // Start with all zeros
        cell.dataset.row = row;
        cell.dataset.col = col;
        cell.dataset.index = index;
        
        // Add cell number label (1-16)
        const cellNumber = document.createElement('span');
        cellNumber.className = 'cell-number';
        cellNumber.textContent = index + 1;
        cell.appendChild(cellNumber);
        
        // Add click event to toggle color
        cell.addEventListener('click', function() {
          toggleGame2Cell(this);
        });
        
        game2Grid.appendChild(cell);
        game2Cells.push({
          element: cell,
          value: 0, // Start with 0
          row: row,
          col: col,
          index: index
        });
      }
    }
  }
  
  // Handle cell click for Game 1
  function handleGame1CellClick(cell) {
    // If already solved, do nothing
    if (game1Message.classList.contains('success')) {
      return;
    }
    
    const index = parseInt(cell.dataset.index);
    const row = Math.floor(index / gridSize);
    const col = index % gridSize;
    
    // Toggle selection
    if (cell.classList.contains('selected')) {
      cell.classList.remove('selected');
      game1SelectedCells = game1SelectedCells.filter(i => i !== index);
      
      // Clear the corresponding pattern display
      if (game1LeftPattern.dataset.index == index) {
        game1LeftPattern.innerHTML = '';
        game1LeftPattern.removeAttribute('data-index');
      } else if (game1RightPattern.dataset.index == index) {
        game1RightPattern.innerHTML = '';
        game1RightPattern.removeAttribute('data-index');
      }
    } else {
      // Only allow up to 2 selections
      if (game1SelectedCells.length >= 2) {
        return;
      }
      
      cell.classList.add('selected');
      game1SelectedCells.push(index);
      
      // Display the cross pattern
      const values = game1Cells.map(cell => cell.value);
      const pattern = getCrossPatternAt(row, col, values);
      
      // Create cross pattern display
      const patternDisplay = createCrossPatternDisplay(pattern, index);
      
      // Add to the appropriate display container
      if (!game1LeftPattern.hasAttribute('data-index')) {
        game1LeftPattern.innerHTML = '';
        game1LeftPattern.appendChild(patternDisplay);
        game1LeftPattern.dataset.index = index;
      } else {
        game1RightPattern.innerHTML = '';
        game1RightPattern.appendChild(patternDisplay);
        game1RightPattern.dataset.index = index;
      }
    }
    
    // Enable/disable the Done button based on selections
    game1DoneBtn.disabled = game1SelectedCells.length !== 2;
  }
  
  // Create a cross pattern display element
  function createCrossPatternDisplay(pattern, index) {
    const patternDisplay = document.createElement('div');
    patternDisplay.className = 'mini-cross-pattern';
    
    // Create a 3x3 grid with the cross pattern
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        const miniCell = document.createElement('div');
        
        // Only add content to the cross cells (center, top, right, bottom, left)
        if (i === 1 && j === 1) {
          // Center cell
          miniCell.className = 'mini-cell center-cell';
          miniCell.textContent = index + 1; // Display 1-based index for user
        } else if (i === 0 && j === 1) {
          // Top cell
          miniCell.className = 'mini-cell ' + (pattern[0] === 1 ? 'value-one' : 'value-zero');
          miniCell.classList.add('cross-part');
        } else if (i === 1 && j === 0) {
          // Left cell
          miniCell.className = 'mini-cell ' + (pattern[1] === 1 ? 'value-one' : 'value-zero');
          miniCell.classList.add('cross-part');
        } else if (i === 1 && j === 2) {
          // Right cell
          miniCell.className = 'mini-cell ' + (pattern[2] === 1 ? 'value-one' : 'value-zero');
          miniCell.classList.add('cross-part');
        } else if (i === 2 && j === 1) {
          // Bottom cell
          miniCell.className = 'mini-cell ' + (pattern[3] === 1 ? 'value-one' : 'value-zero');
          miniCell.classList.add('cross-part');
        } else {
          // Corner cells (empty)
          miniCell.className = 'mini-cell empty-cell';
        }
        
        patternDisplay.appendChild(miniCell);
      }
    }
    
    return patternDisplay;
  }
  
  // Toggle cell color for Game 2
  function toggleGame2Cell(cell) {
    const index = parseInt(cell.dataset.index);
    
    if (cell.classList.contains('value-zero')) {
      cell.classList.remove('value-zero');
      cell.classList.add('value-one');
      game2Cells[index].value = 1;
    } else {
      cell.classList.remove('value-one');
      cell.classList.add('value-zero');
      game2Cells[index].value = 0;
    }
  }
  
  // Check if the selected cells in Game 1 have identical cross patterns
  function checkGame1Solution() {
    if (game1SelectedCells.length !== 2) {
      return;
    }
    
    const index1 = game1SelectedCells[0];
    const index2 = game1SelectedCells[1];
    
    const row1 = Math.floor(index1 / gridSize);
    const col1 = index1 % gridSize;
    const row2 = Math.floor(index2 / gridSize);
    const col2 = index2 % gridSize;
    
    const pattern1 = getCrossPatternAt(row1, col1, game1Cells.map(cell => cell.value));
    const pattern2 = getCrossPatternAt(row2, col2, game1Cells.map(cell => cell.value));
    
    // Compare patterns (excluding center)
    let isMatch = true;
    for (let i = 0; i < pattern1.length; i++) {
      if (pattern1[i] !== pattern2[i]) {
        isMatch = false;
        break;
      }
    }
    
    if (isMatch) {
      game1Message.textContent = 'Correct! These two locations have identical cross patterns.';
      game1Message.className = 'game-message success';
      
      // Highlight the cross patterns
      highlightCrossPattern(row1, col1, game1Cells, 'correct-pattern');
      highlightCrossPattern(row2, col2, game1Cells, 'correct-pattern');
    } else {
      game1Message.textContent = 'These patterns are not identical. Try again.';
      game1Message.className = 'game-message error';
    }
  }
  
  // Find identical cross patterns in Game 2
  function findGame2Solution() {
    // Clear previous pattern displays
    game2LeftPattern.innerHTML = '';
    game2RightPattern.innerHTML = '';
    
    const values = game2Cells.map(cell => cell.value);
    const crossPatterns = getCrossPatterns(values);
    const patternCounts = {};
    
    for (let i = 0; i < crossPatterns.length; i++) {
      const pattern = crossPatterns[i].join('');
      patternCounts[pattern] = patternCounts[pattern] || [];
      patternCounts[pattern].push(i);
    }
    
    // Find a pattern that appears at least twice
    for (const pattern in patternCounts) {
      if (patternCounts[pattern].length >= 2) {
        const indices = patternCounts[pattern].slice(0, 2);
        const index1 = indices[0];
        const index2 = indices[1];
        const row1 = Math.floor(index1 / gridSize);
        const col1 = index1 % gridSize;
        const row2 = Math.floor(index2 / gridSize);
        const col2 = index2 % gridSize;
        
        game2Message.textContent = 'Found identical cross patterns!';
        game2Message.className = 'game-message success';
        
        // Add red border to the center cells
        game2Cells[index1].element.classList.add('solution-center');
        game2Cells[index2].element.classList.add('solution-center');
        
        // Display the patterns
        const pattern1 = getCrossPatternAt(row1, col1, values);
        const pattern2 = getCrossPatternAt(row2, col2, values);
        
        const leftDisplay = createCrossPatternDisplay(pattern1, index1);
        const rightDisplay = createCrossPatternDisplay(pattern2, index2);
        
        game2LeftPattern.appendChild(leftDisplay);
        game2LeftPattern.dataset.index = index1;
        
        game2RightPattern.appendChild(rightDisplay);
        game2RightPattern.dataset.index = index2;
        
        return true;
      }
    }
    
    game2Message.textContent = 'No identical cross patterns found! You created a unique pattern.';
    game2Message.className = 'game-message error';
    return false;
  }
  
  // Get all cross patterns in the grid
  function getCrossPatterns(values) {
    const patterns = [];
    
    for (let row = 0; row < gridSize; row++) {
      for (let col = 0; col < gridSize; col++) {
        patterns.push(getCrossPatternAt(row, col, values));
      }
    }
    
    return patterns;
  }
  
  // Get the cross pattern at a specific location
  function getCrossPatternAt(row, col, values) {
    const pattern = [];
    
    // Top
    if (row > 0) {
      pattern.push(values[(row - 1) * gridSize + col]);
    } else {
      pattern.push(values[(gridSize - 1) * gridSize + col]); // Wrap around
    }
    
    // Left
    if (col > 0) {
      pattern.push(values[row * gridSize + (col - 1)]);
    } else {
      pattern.push(values[row * gridSize + (gridSize - 1)]); // Wrap around
    }
    
    // Right
    if (col < gridSize - 1) {
      pattern.push(values[row * gridSize + (col + 1)]);
    } else {
      pattern.push(values[row * gridSize + 0]); // Wrap around
    }
    
    // Bottom
    if (row < gridSize - 1) {
      pattern.push(values[(row + 1) * gridSize + col]);
    } else {
      pattern.push(values[0 * gridSize + col]); // Wrap around
    }
    
    return pattern;
  }
  
  // Highlight the cross pattern at a specific location
  function highlightCrossPattern(row, col, cells, className) {
    const index = row * gridSize + col;
    
    // Center
    cells[index].element.classList.add(className + '-center');
    
    // Top
    let topRow = row > 0 ? row - 1 : gridSize - 1;
    let topIndex = topRow * gridSize + col;
    cells[topIndex].element.classList.add(className);
    
    // Left
    let leftCol = col > 0 ? col - 1 : gridSize - 1;
    let leftIndex = row * gridSize + leftCol;
    cells[leftIndex].element.classList.add(className);
    
    // Right
    let rightCol = col < gridSize - 1 ? col + 1 : 0;
    let rightIndex = row * gridSize + rightCol;
    cells[rightIndex].element.classList.add(className);
    
    // Bottom
    let bottomRow = row < gridSize - 1 ? row + 1 : 0;
    let bottomIndex = bottomRow * gridSize + col;
    cells[bottomIndex].element.classList.add(className);
  }
  
  // Utility function to shuffle an array
  function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }
  
  // Event listeners
  game1ResetBtn.addEventListener('click', initializeGame1);
  
  game1DoneBtn.addEventListener('click', function() {
    if (game1SelectedCells.length === 2) {
      checkGame1Solution();
    }
  });
  
  game2DoneBtn.addEventListener('click', function() {
    findGame2Solution();
    this.disabled = true;
    setTimeout(() => {
      this.disabled = false;
    }, 2000);
  });
  
  game2ResetBtn.addEventListener('click', function() {
    // Clear any highlighted cells from the previous solution
    game2Cells.forEach(cell => {
      cell.element.classList.remove('solution-center');
    });
    
    initializeGame2();
    game2DoneBtn.disabled = false;
  });
});
