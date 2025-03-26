// Perfect Shuffle Demonstration

// State management
let cards = []; // Current deck of cards
let topRow = []; // Cards in the top row (1-10)
let bottomRow = []; // Cards in the bottom row (11-20)
let isMerged = false; // Whether the cards are currently merged
let animationInProgress = false; // Flag to prevent multiple animations

// DOM elements (will be initialized in the setup function)
let cardsContainer;
let buttonContainer;
let inShuffleButton;
let outShuffleButton;
let splitButton;
let statusContainer;

// Initialize the cards
function initializeCards() {
  const topCards = [];
  const bottomCards = [];
  
  // Create top row cards (1-10)
  for (let i = 1; i <= 10; i++) {
    topCards.push({
      value: i,
      originalRow: 'top',
      color: '#FFCCCC' // Light red
    });
  }
  
  // Create bottom row cards (11-20)
  for (let i = 11; i <= 20; i++) {
    bottomCards.push({
      value: i,
      originalRow: 'bottom',
      color: '#CCE5FF' // Light blue
    });
  }
  
  return { topCards, bottomCards };
}

// Render the cards in their current state
function renderCards() {
  cardsContainer.innerHTML = '';
  
  if (isMerged) {
    // Render as a single row
    const rowElement = document.createElement('div');
    rowElement.className = 'cards-row merged-row';
    
    cards.forEach(card => {
      const cardElement = createCardElement(card);
      rowElement.appendChild(cardElement);
    });
    
    cardsContainer.appendChild(rowElement);
  } else {
    // Render as two rows
    const topRowElement = document.createElement('div');
    topRowElement.className = 'cards-row top-row';
    
    topRow.forEach(card => {
      const cardElement = createCardElement(card);
      topRowElement.appendChild(cardElement);
    });
    
    const bottomRowElement = document.createElement('div');
    bottomRowElement.className = 'cards-row bottom-row';
    
    bottomRow.forEach(card => {
      const cardElement = createCardElement(card);
      bottomRowElement.appendChild(cardElement);
    });
    
    cardsContainer.appendChild(topRowElement);
    cardsContainer.appendChild(bottomRowElement);
  }
  
  // Update button states
  updateButtonStates();
}

// Create a card element
function createCardElement(card) {
  const cardElement = document.createElement('div');
  cardElement.className = 'card';
  cardElement.style.backgroundColor = card.color;
  cardElement.textContent = card.value;
  cardElement.dataset.value = card.value;
  cardElement.dataset.originalRow = card.originalRow;
  
  return cardElement;
}

// Update status message
function updateStatus(message) {
  statusContainer.textContent = message;
}

// Update button states based on current deck state
function updateButtonStates() {
  if (animationInProgress) {
    // Disable all buttons during animation
    inShuffleButton.disabled = true;
    outShuffleButton.disabled = true;
    splitButton.disabled = true;
  } else if (isMerged) {
    // When cards are merged, only enable split button
    inShuffleButton.disabled = true;
    outShuffleButton.disabled = true;
    splitButton.disabled = false;
  } else {
    // When cards are split, only enable shuffle buttons
    inShuffleButton.disabled = false;
    outShuffleButton.disabled = false;
    splitButton.disabled = true;
  }
}

// Perform an in-shuffle
function performInShuffle() {
  if (animationInProgress || isMerged) return;
  
  animationInProgress = true;
  updateButtonStates();
  
  // Merge with in-shuffle
  updateStatus("Performing in-shuffle...");
  mergeWithInShuffle();
}

// Perform an out-shuffle
function performOutShuffle() {
  if (animationInProgress || isMerged) return;
  
  animationInProgress = true;
  updateButtonStates();
  
  // Merge with out-shuffle
  updateStatus("Performing out-shuffle...");
  mergeWithOutShuffle();
}

// Split the merged deck back into two rows
function splitDeck() {
  if (animationInProgress || !isMerged) return;
  
  animationInProgress = true;
  updateButtonStates();
  
  updateStatus("Splitting deck...");
  
  // Get the current card elements
  const cardElements = document.querySelectorAll('.card');
  const cardRects = Array.from(cardElements).map(card => card.getBoundingClientRect());
  
  // Create clones for animation
  const clones = Array.from(cardElements).map((card, i) => {
    const clone = card.cloneNode(true);
    const rect = cardRects[i];
    
    clone.style.position = 'fixed';
    clone.style.top = `${rect.top}px`;
    clone.style.left = `${rect.left}px`;
    clone.style.width = `${rect.width}px`;
    clone.style.height = `${rect.height}px`;
    clone.style.transition = 'all 0.5s ease';
    clone.style.zIndex = '100';
    
    document.body.appendChild(clone);
    return clone;
  });
  
  // Split cards back into top and bottom rows
  topRow = [];
  bottomRow = [];
  
  for (let i = 0; i < 10; i++) {
    topRow.push(cards[i]);
  }
  
  for (let i = 10; i < 20; i++) {
    bottomRow.push(cards[i]);
  }
  
  // Update the state
  isMerged = false;
  
  // Render the new state (but hide it initially)
  renderCards();
  const newTopRow = document.querySelector('.top-row');
  const newBottomRow = document.querySelector('.bottom-row');
  const newCards = document.querySelectorAll('.card');
  
  // Hide the newly rendered cards
  newCards.forEach(card => {
    card.style.opacity = '0';
  });
  
  // Get positions for the new cards
  const newCardRects = Array.from(newCards).map(card => card.getBoundingClientRect());
  
  // Animate clones to their new positions
  setTimeout(() => {
    clones.forEach((clone, i) => {
      const newIndex = i < 10 ? i : i - 10;
      const newRow = i < 10 ? newTopRow : newBottomRow;
      const newRect = newCardRects[i];
      
      clone.style.top = `${newRect.top}px`;
      clone.style.left = `${newRect.left}px`;
    });
    
    // After animation, show the real cards and remove clones
    setTimeout(() => {
      clones.forEach(clone => clone.remove());
      newCards.forEach(card => {
        card.style.opacity = '1';
      });
      
      updateStatus("Deck split. Ready for next shuffle.");
      animationInProgress = false;
      updateButtonStates();
    }, 500);
  }, 10);
}

// Merge the two rows with an in-shuffle
function mergeWithInShuffle() {
  // For in-shuffle, we interleave starting with the bottom row
  cards = [];
  for (let i = 0; i < 10; i++) {
    cards.push(bottomRow[i]);
    cards.push(topRow[i]);
  }
  
  animateMerge("in");
}

// Merge the two rows with an out-shuffle
function mergeWithOutShuffle() {
  // For out-shuffle, we interleave starting with the top row
  cards = [];
  for (let i = 0; i < 10; i++) {
    cards.push(topRow[i]);
    cards.push(bottomRow[i]);
  }
  
  animateMerge("out");
}

// Animate the merging of two rows
function animateMerge(shuffleType) {
  // Get the current card elements
  const topCardElements = document.querySelectorAll('.top-row .card');
  const bottomCardElements = document.querySelectorAll('.bottom-row .card');
  const topCardRects = Array.from(topCardElements).map(card => card.getBoundingClientRect());
  const bottomCardRects = Array.from(bottomCardElements).map(card => card.getBoundingClientRect());
  
  // Create clones for animation
  const topClones = Array.from(topCardElements).map((card, i) => {
    const clone = card.cloneNode(true);
    const rect = topCardRects[i];
    
    clone.style.position = 'fixed';
    clone.style.top = `${rect.top}px`;
    clone.style.left = `${rect.left}px`;
    clone.style.width = `${rect.width}px`;
    clone.style.height = `${rect.height}px`;
    clone.style.transition = 'all 0.5s ease';
    clone.style.zIndex = '100';
    clone.dataset.originalIndex = i;
    clone.dataset.originalRow = 'top';
    
    document.body.appendChild(clone);
    return clone;
  });
  
  const bottomClones = Array.from(bottomCardElements).map((card, i) => {
    const clone = card.cloneNode(true);
    const rect = bottomCardRects[i];
    
    clone.style.position = 'fixed';
    clone.style.top = `${rect.top}px`;
    clone.style.left = `${rect.left}px`;
    clone.style.width = `${rect.width}px`;
    clone.style.height = `${rect.height}px`;
    clone.style.transition = 'all 0.5s ease';
    clone.style.zIndex = '100';
    clone.dataset.originalIndex = i;
    clone.dataset.originalRow = 'bottom';
    
    document.body.appendChild(clone);
    return clone;
  });
  
  // Update the state
  isMerged = true;
  
  // Render the new state (but hide it initially)
  renderCards();
  const mergedRow = document.querySelector('.merged-row');
  const mergedCards = document.querySelectorAll('.merged-row .card');
  
  // Hide the newly rendered cards
  mergedCards.forEach(card => {
    card.style.opacity = '0';
  });
  
  // Get positions for the merged cards
  const mergedCardRects = Array.from(mergedCards).map(card => card.getBoundingClientRect());
  
  // Animate clones to their new positions
  setTimeout(() => {
    const allClones = [...topClones, ...bottomClones];
    
    allClones.forEach((clone) => {
      const originalRow = clone.dataset.originalRow;
      const originalIndex = parseInt(clone.dataset.originalIndex);
      
      // Find the index in the merged array
      let mergedIndex;
      if (shuffleType === "in") {
        // In-shuffle: bottom, top, bottom, top, ...
        mergedIndex = originalRow === 'top' ? originalIndex * 2 + 1 : originalIndex * 2;
      } else {
        // Out-shuffle: top, bottom, top, bottom, ...
        mergedIndex = originalRow === 'top' ? originalIndex * 2 : originalIndex * 2 + 1;
      }
      
      const mergedRect = mergedCardRects[mergedIndex];
      
      clone.style.top = `${mergedRect.top}px`;
      clone.style.left = `${mergedRect.left}px`;
    });
    
    // After animation, show the real cards and remove clones
    setTimeout(() => {
      allClones.forEach(clone => clone.remove());
      mergedCards.forEach(card => {
        card.style.opacity = '1';
      });
      
      updateStatus(`Cards ${shuffleType}-shuffled. Click Split to separate the cards again.`);
      animationInProgress = false;
      updateButtonStates();
    }, 500);
  }, 10);
}

// Setup the shuffle demonstration
function setupShuffleDemo() {
  // Initialize cards
  const { topCards, bottomCards } = initializeCards();
  topRow = topCards;
  bottomRow = bottomCards;
  
  // Create main container
  const container = document.createElement('div');
  container.className = 'shuffle-demo-container';
  
  // Create status display
  statusContainer = document.createElement('div');
  statusContainer.className = 'status-container';
  statusContainer.textContent = "Click a button to perform a perfect shuffle.";
  container.appendChild(statusContainer);
  
  // Create cards container
  cardsContainer = document.createElement('div');
  cardsContainer.className = 'cards-container';
  container.appendChild(cardsContainer);
  
  // Create button container
  buttonContainer = document.createElement('div');
  buttonContainer.className = 'button-container';
  container.appendChild(buttonContainer);
  
  // In-shuffle button
  inShuffleButton = document.createElement('button');
  inShuffleButton.className = 'control-button';
  inShuffleButton.textContent = 'In-Shuffle';
  inShuffleButton.addEventListener('click', performInShuffle);
  buttonContainer.appendChild(inShuffleButton);
  
  // Out-shuffle button
  outShuffleButton = document.createElement('button');
  outShuffleButton.className = 'control-button';
  outShuffleButton.textContent = 'Out-Shuffle';
  outShuffleButton.addEventListener('click', performOutShuffle);
  buttonContainer.appendChild(outShuffleButton);
  
  // Split button
  splitButton = document.createElement('button');
  splitButton.className = 'control-button';
  splitButton.textContent = 'Split Deck';
  splitButton.addEventListener('click', splitDeck);
  splitButton.disabled = true; // Initially disabled since cards start split
  buttonContainer.appendChild(splitButton);
  
  // Render the initial state
  renderCards();
  
  return container;
}

// Initialize when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  const shuffleDemoContainer = setupShuffleDemo();
  
  // Find the target element to append the shuffle demo
  const targetElement = document.querySelector('#shuffle-demo');
  if (targetElement) {
    targetElement.appendChild(shuffleDemoContainer);
  }
});
