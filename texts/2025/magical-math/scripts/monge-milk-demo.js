// Monge and Milk Shuffle Demonstration

// State management
let mongeMilkCards = []; // Current deck of cards
let isSinglePile = true; // Whether the cards are in a single pile
let mongeMilkAnimationInProgress = false; // Flag to prevent multiple animations
let lastShuffleType = null; // Track the last shuffle performed

// DOM elements (will be initialized in the setup function)
let mongeMilkCardsContainer;
let mongeMilkButtonContainer;
let mongeShuffleButton;
let reverseMongeShuffleButton;
let milkShuffleButton;
let resetButton;
let mongeMilkStatusContainer;

// Initialize the cards
function initializeMongeMilkCards() {
  const initialCards = [];
  
  // Create cards numbered 1-20
  for (let i = 1; i <= 20; i++) {
    initialCards.push({
      value: i,
      color: '#FFFFFF' // White background initially
    });
  }
  
  return initialCards;
}

// Render the cards in their current state
function renderMongeMilkCards() {
  mongeMilkCardsContainer.innerHTML = '';
  
  const rowElement = document.createElement('div');
  rowElement.className = 'cards-row';
  
  mongeMilkCards.forEach((card, index) => {
    const cardElement = createMongeMilkCardElement(card, index);
    rowElement.appendChild(cardElement);
  });
  
  mongeMilkCardsContainer.appendChild(rowElement);
  
  // Update button states
  updateMongeMilkButtonStates();
}

// Create a card element
function createMongeMilkCardElement(card, index) {
  const cardElement = document.createElement('div');
  cardElement.className = 'card';
  cardElement.style.backgroundColor = card.color;
  cardElement.textContent = card.value;
  cardElement.dataset.value = card.value;
  cardElement.dataset.index = index;
  
  return cardElement;
}

// Update status message
function updateMongeMilkStatus(message) {
  mongeMilkStatusContainer.textContent = message;
}

// Update button states based on current deck state
function updateMongeMilkButtonStates() {
  if (mongeMilkAnimationInProgress) {
    // Disable all buttons during animation
    mongeShuffleButton.disabled = true;
    reverseMongeShuffleButton.disabled = true;
    milkShuffleButton.disabled = true;
    resetButton.disabled = true;
  } else {
    // Enable all buttons when not animating
    mongeShuffleButton.disabled = false;
    reverseMongeShuffleButton.disabled = false;
    milkShuffleButton.disabled = false;
    resetButton.disabled = false;
  }
}

// Perform a Monge shuffle
function performMongeShuffle() {
  if (mongeMilkAnimationInProgress) return;
  
  mongeMilkAnimationInProgress = true;
  updateMongeMilkButtonStates();
  
  updateMongeMilkStatus("Performing Monge shuffle...");
  
  // Get the current card elements
  const cardElements = document.querySelectorAll('.monge-milk-demo .card');
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
    clone.dataset.originalIndex = i;
    
    document.body.appendChild(clone);
    return clone;
  });
  
  // Perform the Monge shuffle
  const originalDeck = [...mongeMilkCards];
  const shuffledDeck = [];
  
  // For Monge shuffle: take top card, place next above, next below, and so on
  let placeOnTop = false;
  
  for (let i = 0; i < originalDeck.length; i++) {
    if (placeOnTop) {
      shuffledDeck.unshift(originalDeck[i]); // Place on top
    } else {
      shuffledDeck.push(originalDeck[i]); // Place on bottom
    }
    placeOnTop = !placeOnTop; // Alternate
  }
  
  // Update the deck
  mongeMilkCards = shuffledDeck;
  lastShuffleType = 'monge';
  
  // Render the new state (but hide it initially)
  renderMongeMilkCards();
  const newCardElements = document.querySelectorAll('.monge-milk-demo .card');
  
  // Hide the newly rendered cards
  newCardElements.forEach(card => {
    card.style.opacity = '0';
  });
  
  // Get positions for the new cards
  const newCardRects = Array.from(newCardElements).map(card => card.getBoundingClientRect());
  
  // Animate clones to their new positions
  setTimeout(() => {
    clones.forEach((clone, i) => {
      const originalIndex = parseInt(clone.dataset.originalIndex);
      // Find where this card ended up in the shuffled deck
      const newIndex = shuffledDeck.findIndex(card => card.value === originalDeck[originalIndex].value);
      const newRect = newCardRects[newIndex];
      
      clone.style.top = `${newRect.top}px`;
      clone.style.left = `${newRect.left}px`;
    });
    
    // After animation, show the real cards and remove clones
    setTimeout(() => {
      clones.forEach(clone => clone.remove());
      newCardElements.forEach(card => {
        card.style.opacity = '1';
      });
      
      // Color code the cards to show the pattern
      colorCodeMongeMilkCards();
      
      updateMongeMilkStatus("Monge shuffle complete. The pattern alternates placing cards on top and bottom.");
      mongeMilkAnimationInProgress = false;
      updateMongeMilkButtonStates();
    }, 500);
  }, 10);
}

// Perform a Reverse Monge shuffle
function performReverseMonge() {
  if (mongeMilkAnimationInProgress) return;
  
  mongeMilkAnimationInProgress = true;
  updateMongeMilkButtonStates();
  
  updateMongeMilkStatus("Performing Reverse Monge shuffle...");
  
  // Get the current card elements
  const cardElements = document.querySelectorAll('.monge-milk-demo .card');
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
    clone.dataset.originalIndex = i;
    
    document.body.appendChild(clone);
    return clone;
  });
  
  // Perform the Reverse Monge shuffle
  const originalDeck = [...mongeMilkCards];
  const shuffledDeck = [];
  
  // For Reverse Monge shuffle: take top card, place next below, next above, and so on
  // This is the opposite of the regular Monge shuffle
  let placeOnTop = true; // Start with placing on top (opposite of regular Monge)
  
  for (let i = 0; i < originalDeck.length; i++) {
    if (placeOnTop) {
      shuffledDeck.unshift(originalDeck[i]); // Place on top
    } else {
      shuffledDeck.push(originalDeck[i]); // Place on bottom
    }
    placeOnTop = !placeOnTop; // Alternate
  }
  
  // Update the deck
  mongeMilkCards = shuffledDeck;
  lastShuffleType = 'reverse-monge';
  
  // Render the new state (but hide it initially)
  renderMongeMilkCards();
  const newCardElements = document.querySelectorAll('.monge-milk-demo .card');
  
  // Hide the newly rendered cards
  newCardElements.forEach(card => {
    card.style.opacity = '0';
  });
  
  // Get positions for the new cards
  const newCardRects = Array.from(newCardElements).map(card => card.getBoundingClientRect());
  
  // Animate clones to their new positions
  setTimeout(() => {
    clones.forEach((clone, i) => {
      const originalIndex = parseInt(clone.dataset.originalIndex);
      // Find where this card ended up in the shuffled deck
      const newIndex = shuffledDeck.findIndex(card => card.value === originalDeck[originalIndex].value);
      const newRect = newCardRects[newIndex];
      
      clone.style.top = `${newRect.top}px`;
      clone.style.left = `${newRect.left}px`;
    });
    
    // After animation, show the real cards and remove clones
    setTimeout(() => {
      clones.forEach(clone => clone.remove());
      newCardElements.forEach(card => {
        card.style.opacity = '1';
      });
      
      // Color code the cards to show the pattern
      colorCodeMongeMilkCards();
      
      updateMongeMilkStatus("Reverse Monge shuffle complete. The pattern alternates placing cards below and above.");
      mongeMilkAnimationInProgress = false;
      updateMongeMilkButtonStates();
    }, 500);
  }, 10);
}

// Perform a Milk shuffle
function performMilkShuffle() {
  if (mongeMilkAnimationInProgress) return;
  
  mongeMilkAnimationInProgress = true;
  updateMongeMilkButtonStates();
  
  updateMongeMilkStatus("Performing Milk (Klondike) shuffle...");
  
  // Get the current card elements
  const cardElements = document.querySelectorAll('.monge-milk-demo .card');
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
    clone.dataset.originalIndex = i;
    
    document.body.appendChild(clone);
    return clone;
  });
  
  // Perform the Milk shuffle
  const originalDeck = [...mongeMilkCards];
  const shuffledDeck = [];
  
  // For Milk shuffle: take pairs from top and bottom and place them in order
  const halfLength = Math.floor(originalDeck.length / 2);
  
  for (let i = 0; i < halfLength; i++) {
    shuffledDeck.push(originalDeck[i]); // Top card
    shuffledDeck.push(originalDeck[originalDeck.length - 1 - i]); // Bottom card
  }
  
  // If odd number of cards, add the middle card at the end
  if (originalDeck.length % 2 !== 0) {
    shuffledDeck.push(originalDeck[halfLength]);
  }
  
  // Update the deck
  mongeMilkCards = shuffledDeck;
  lastShuffleType = 'milk';
  
  // Render the new state (but hide it initially)
  renderMongeMilkCards();
  const newCardElements = document.querySelectorAll('.monge-milk-demo .card');
  
  // Hide the newly rendered cards
  newCardElements.forEach(card => {
    card.style.opacity = '0';
  });
  
  // Get positions for the new cards
  const newCardRects = Array.from(newCardElements).map(card => card.getBoundingClientRect());
  
  // Animate clones to their new positions
  setTimeout(() => {
    clones.forEach((clone, i) => {
      const originalIndex = parseInt(clone.dataset.originalIndex);
      // Find where this card ended up in the shuffled deck
      const newIndex = shuffledDeck.findIndex(card => card.value === originalDeck[originalIndex].value);
      const newRect = newCardRects[newIndex];
      
      clone.style.top = `${newRect.top}px`;
      clone.style.left = `${newRect.left}px`;
    });
    
    // After animation, show the real cards and remove clones
    setTimeout(() => {
      clones.forEach(clone => clone.remove());
      newCardElements.forEach(card => {
        card.style.opacity = '1';
      });
      
      // Color code the cards to show the pattern
      colorCodeMongeMilkCards();
      
      updateMongeMilkStatus("Milk shuffle complete. Pairs from top and bottom are taken in sequence.");
      mongeMilkAnimationInProgress = false;
      updateMongeMilkButtonStates();
    }, 500);
  }, 10);
}

// Reset the deck to original order
function resetMongeMilkDeck() {
  if (mongeMilkAnimationInProgress) return;
  
  mongeMilkAnimationInProgress = true;
  updateMongeMilkButtonStates();
  
  updateMongeMilkStatus("Resetting deck to original order...");
  
  // Initialize a new deck in order
  mongeMilkCards = initializeMongeMilkCards();
  lastShuffleType = null;
  
  // Render the reset deck
  renderMongeMilkCards();
  
  updateMongeMilkStatus("Deck reset to original order (1-20).");
  mongeMilkAnimationInProgress = false;
  updateMongeMilkButtonStates();
}

// Color code the cards based on their original positions
function colorCodeMongeMilkCards() {
  // If we just did a shuffle, color code to show the pattern
  if (lastShuffleType) {
    // Create a gradient of colors
    const colors = [];
    for (let i = 0; i < 20; i++) {
      // Create a gradient from red to blue
      const r = Math.floor(255 - (i * 12));
      const g = 200;
      const b = Math.floor(100 + (i * 7));
      colors.push(`rgb(${r}, ${g}, ${b})`);
    }
    
    // Apply colors based on card values
    mongeMilkCards.forEach((card, index) => {
      // Card value is 1-20, so subtract 1 to get 0-19 for array index
      card.color = colors[card.value - 1];
    });
  } else {
    // Reset to white if we're in original order
    mongeMilkCards.forEach(card => {
      card.color = '#FFFFFF';
    });
  }
  
  // Update the display
  const cardElements = document.querySelectorAll('.monge-milk-demo .card');
  cardElements.forEach((cardElement, index) => {
    cardElement.style.backgroundColor = mongeMilkCards[index].color;
  });
}

// Setup the shuffle demonstration
function setupMongeMilkDemo() {
  // Initialize cards
  mongeMilkCards = initializeMongeMilkCards();
  
  // Create main container
  const container = document.createElement('div');
  container.className = 'shuffle-demo-container monge-milk-demo';
  
  // Create status display
  mongeMilkStatusContainer = document.createElement('div');
  mongeMilkStatusContainer.className = 'status-container';
  mongeMilkStatusContainer.textContent = "Click a button to perform a shuffle.";
  container.appendChild(mongeMilkStatusContainer);
  
  // Create cards container
  mongeMilkCardsContainer = document.createElement('div');
  mongeMilkCardsContainer.className = 'cards-container';
  container.appendChild(mongeMilkCardsContainer);
  
  // Create button container
  mongeMilkButtonContainer = document.createElement('div');
  mongeMilkButtonContainer.className = 'button-container';
  container.appendChild(mongeMilkButtonContainer);
  
  // Monge shuffle button
  mongeShuffleButton = document.createElement('button');
  mongeShuffleButton.className = 'control-button';
  mongeShuffleButton.textContent = 'Monge Shuffle';
  mongeShuffleButton.addEventListener('click', performMongeShuffle);
  mongeMilkButtonContainer.appendChild(mongeShuffleButton);
  
  // Reverse Monge shuffle button
  reverseMongeShuffleButton = document.createElement('button');
  reverseMongeShuffleButton.className = 'control-button';
  reverseMongeShuffleButton.textContent = 'Reverse Monge';
  reverseMongeShuffleButton.addEventListener('click', performReverseMonge);
  mongeMilkButtonContainer.appendChild(reverseMongeShuffleButton);
  
  // Milk shuffle button
  milkShuffleButton = document.createElement('button');
  milkShuffleButton.className = 'control-button';
  milkShuffleButton.textContent = 'Milk Shuffle';
  milkShuffleButton.addEventListener('click', performMilkShuffle);
  mongeMilkButtonContainer.appendChild(milkShuffleButton);
  
  // Reset button
  resetButton = document.createElement('button');
  resetButton.className = 'control-button';
  resetButton.textContent = 'Reset Deck';
  resetButton.addEventListener('click', resetMongeMilkDeck);
  mongeMilkButtonContainer.appendChild(resetButton);
  
  // Render the initial state
  renderMongeMilkCards();
  
  return container;
}

// Initialize when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  const shuffleDemoContainer = setupMongeMilkDemo();
  
  // Find the target element to append the shuffle demo
  const targetElement = document.querySelector('#monge-milk-demo');
  if (targetElement) {
    targetElement.appendChild(shuffleDemoContainer);
  }
});
