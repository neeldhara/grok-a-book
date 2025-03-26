document.addEventListener('DOMContentLoaded', function() {
  // Elements
  const combSequence = document.getElementById('comb-sequence');
  const combOverlay = document.getElementById('comb-overlay');
  const currentPattern = document.getElementById('current-pattern');
  const patternDecimal = document.getElementById('pattern-decimal');
  const patternsGrid = document.getElementById('patterns-grid');
  const combResetBtn = document.getElementById('comb-reset-btn');
  const combPrevBtn = document.getElementById('comb-prev-btn');
  const combNextBtn = document.getElementById('comb-next-btn');
  const combPositionDisplay = document.getElementById('comb-position-display');
  
  // Constants
  const sequenceLength = 16;
  const combPositions = [0, 1, 3, 7]; // Positions 1, 2, 4, 8 (0-indexed)
  
  // State
  let currentPosition = 0;
  let deBruijnSequence = [];
  let seenPatterns = new Set();
  
  // Generate a valid de Bruijn sequence for the comb
  // This is a specific de Bruijn sequence that works with the (1,2,4,8) comb
  // as mentioned in the paper by Cooper and Graham
  function generateDeBruijnSequence() {
    // This is a known de Bruijn sequence for the (1,2,4,8) comb
    return [1, 0, 0, 0, 1, 0, 0, 1, 1, 1, 1, 1, 0, 0, 1, 0];
  }
  
  // Initialize the comb interactive
  function initializeCombInteractive() {
    // Reset state
    currentPosition = 0;
    deBruijnSequence = generateDeBruijnSequence();
    seenPatterns = new Set();
    
    // Create sequence display
    renderSequence();
    
    // Wait for the sequence to be rendered before creating the comb overlay
    setTimeout(() => {
      // Create comb overlay
      renderCombOverlay();
      
      // Create the title
      renderCombTitle();
      
      // Create all possible patterns grid
      renderPatternsGrid();
      
      // Update current pattern display
      updateCurrentPattern();
      
      // Update position display
      updatePositionDisplay();
      
      // Update button states
      updateButtonStates();
    }, 0);
  }
  
  // Render the de Bruijn sequence
  function renderSequence() {
    combSequence.innerHTML = '';
    
    for (let i = 0; i < sequenceLength; i++) {
      const bit = deBruijnSequence[i];
      const bitElement = document.createElement('div');
      bitElement.className = `sequence-bit bit-${bit}`;
      bitElement.textContent = bit;
      bitElement.dataset.position = i;
      combSequence.appendChild(bitElement);
    }
  }
  
  // Render the comb overlay
  function renderCombOverlay() {
    combOverlay.innerHTML = '';
    
    // Create a container for the comb visualization
    const combContainer = document.createElement('div');
    combContainer.className = 'comb-container';
    combOverlay.appendChild(combContainer);
    
    // Calculate the width of each bit cell
    const sequenceBits = combSequence.querySelectorAll('.sequence-bit');
    const bitWidth = sequenceBits.length > 0 ? sequenceBits[0].offsetWidth : combSequence.offsetWidth / sequenceLength;
    
    // Create the comb visualization
    for (let i = 0; i < sequenceLength; i++) {
      const cellElement = document.createElement('div');
      cellElement.className = 'comb-cell';
      cellElement.style.width = `${bitWidth}px`;
      
      // Check if this position is an open position in the comb
      const isOpen = combPositions.includes((i - currentPosition + sequenceLength) % sequenceLength);
      
      if (isOpen) {
        cellElement.classList.add('open-position');
        
        // Add position label
        const posLabel = document.createElement('div');
        posLabel.className = 'position-label';
        const posValue = combPositions.indexOf((i - currentPosition + sequenceLength) % sequenceLength) + 1;
        posLabel.textContent = posValue === 1 ? '1' : 
                              posValue === 2 ? '2' : 
                              posValue === 3 ? '4' : '8';
        cellElement.appendChild(posLabel);
        
        // Add highlight to show the bit value
        const bitValue = deBruijnSequence[i];
        const bitHighlight = document.createElement('div');
        bitHighlight.className = `bit-highlight bit-${bitValue}`;
        bitHighlight.textContent = bitValue;
        cellElement.appendChild(bitHighlight);
      }
      
      combContainer.appendChild(cellElement);
    }
  }
  
  // Create a separate function to render the title
  function renderCombTitle() {
    // Remove any existing title
    const existingTitle = document.querySelector('.comb-title');
    if (existingTitle) {
      existingTitle.remove();
    }
    
    // Create the title element
    const titleElement = document.createElement('div');
    titleElement.className = 'comb-title';
    titleElement.textContent = 'Comb with open positions at 1, 2, 4, 8';
    
    // Append to the parent container of both the sequence and overlay
    const parentContainer = document.querySelector('.comb-sequence-container');
    if (parentContainer) {
      parentContainer.appendChild(titleElement);
    }
  }
  
  // Render the grid of all possible patterns
  function renderPatternsGrid() {
    patternsGrid.innerHTML = '';
    
    // Create all possible 4-bit patterns (0-15)
    for (let i = 0; i < 16; i++) {
      const patternItem = document.createElement('div');
      patternItem.className = 'pattern-item';
      patternItem.id = `pattern-${i}`;
      
      const patternBits = document.createElement('div');
      patternBits.className = 'pattern-item-bits';
      
      // Convert decimal to 4-bit binary
      const binaryStr = i.toString(2).padStart(4, '0');
      
      for (let j = 0; j < 4; j++) {
        const bit = parseInt(binaryStr[j]);
        const bitElement = document.createElement('div');
        bitElement.className = `pattern-item-bit bit-${bit}`;
        bitElement.textContent = bit;
        patternBits.appendChild(bitElement);
      }
      
      const decimalValue = document.createElement('div');
      decimalValue.className = 'pattern-item-decimal';
      decimalValue.textContent = i;
      
      patternItem.appendChild(patternBits);
      patternItem.appendChild(decimalValue);
      patternsGrid.appendChild(patternItem);
    }
  }
  
  // Update the current pattern display
  function updateCurrentPattern() {
    currentPattern.innerHTML = '';
    
    // Get the current pattern based on the comb positions
    const pattern = getCurrentPattern();
    
    // Convert pattern to decimal
    const decimal = parseInt(pattern.join(''), 2);
    
    // Update the pattern display
    for (let i = 0; i < pattern.length; i++) {
      const bit = pattern[i];
      const bitElement = document.createElement('div');
      bitElement.className = `pattern-bit bit-${bit}`;
      bitElement.textContent = bit;
      currentPattern.appendChild(bitElement);
    }
    
    // Update the decimal value
    patternDecimal.textContent = decimal;
    
    // Mark this pattern as seen
    seenPatterns.add(decimal);
    
    // Update the patterns grid
    const patternItem = document.getElementById(`pattern-${decimal}`);
    if (patternItem) {
      patternItem.classList.add('seen');
    }
  }
  
  // Get the current pattern based on the comb positions
  function getCurrentPattern() {
    const pattern = [];
    
    for (const pos of combPositions) {
      // Calculate the actual position with wrapping
      const actualPos = (currentPosition + pos) % sequenceLength;
      pattern.push(deBruijnSequence[actualPos]);
    }
    
    return pattern;
  }
  
  // Update the position display
  function updatePositionDisplay() {
    combPositionDisplay.textContent = `Position: ${currentPosition + 1} / ${sequenceLength}`;
  }
  
  // Update button states
  function updateButtonStates() {
    combPrevBtn.disabled = currentPosition === 0;
    combNextBtn.disabled = currentPosition === sequenceLength - 1;
  }
  
  // Move the comb to the previous position
  function moveToPrevious() {
    if (currentPosition > 0) {
      currentPosition--;
      renderCombOverlay();
      updateCurrentPattern();
      updatePositionDisplay();
      updateButtonStates();
    }
  }
  
  // Move the comb to the next position
  function moveToNext() {
    if (currentPosition < sequenceLength - 1) {
      currentPosition++;
      renderCombOverlay();
      updateCurrentPattern();
      updatePositionDisplay();
      updateButtonStates();
    }
  }
  
  // Event listeners
  combResetBtn.addEventListener('click', function() {
    initializeCombInteractive();
  });
  
  combPrevBtn.addEventListener('click', moveToPrevious);
  combNextBtn.addEventListener('click', moveToNext);
  
  // Handle window resize
  window.addEventListener('resize', function() {
    // Delay the re-render to ensure the DOM has updated
    setTimeout(() => {
      renderCombOverlay();
    }, 0);
  });
  
  // Initialize the interactive when the page is fully loaded
  if (document.readyState === 'complete') {
    initializeCombInteractive();
  } else {
    window.addEventListener('load', initializeCombInteractive);
  }
});
