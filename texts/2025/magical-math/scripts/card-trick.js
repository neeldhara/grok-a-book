// Card Trick Demonstration

// State management
let state = 'initial'; // Possible states: initial, dealing, shuffling, selecting, eliminating, done
let deck = []; // Current deck of cards
let selectedCard = null; // Card selected by the user
let animationInProgress = false; // Flag to prevent multiple animations
let tempDeck = []; // Temporary deck for animation purposes

// DOM elements (will be initialized in the setup function)
let deckContainer;
let statusContainer;
let buttonContainer;
let initialButtonsContainer;
let selectionControlsContainer;
let resetControlsContainer;
let sliderContainer;
let sliderValueDisplay;
let cardSlider;
let pilesContainer;

// Initialize the deck
function initializeDeck() {
  const suits = ["♠", "♣"];
  const ranks = ["A", "2", "3", "4", "5", "6"];
  
  let cards = [];
  
  // Add spades in ascending order
  for (let i = 0; i < ranks.length; i++) {
    cards.push({
      rank: ranks[i],
      suit: suits[0],
      color: "black",
      index: i,
      selected: false,
      eliminated: false
    });
  }
  
  // Add clubs in descending order
  for (let i = ranks.length - 1; i >= 0; i--) {
    cards.push({
      rank: ranks[i],
      suit: suits[1],
      color: "black",
      index: i + 6,
      selected: false,
      eliminated: false
    });
  }
  
  return cards;
}

// Render the deck
function renderDeck(cardsToRender = deck) {
  deckContainer.innerHTML = '';
  
  const deckElement = document.createElement('div');
  deckElement.className = 'card-deck';
  
  cardsToRender.forEach((card, index) => {
    const cardElement = document.createElement('div');
    cardElement.className = `card rank-${card.rank} ${card.selected ? 'selected' : ''} ${card.eliminated ? 'eliminated' : ''}`;
    cardElement.innerHTML = `
      <div class="card-content ${card.color}">
        ${card.rank}${card.suit}
      </div>
    `;
    
    // Add data attributes for animations
    cardElement.dataset.index = index;
    cardElement.dataset.rank = card.rank;
    cardElement.dataset.suit = card.suit;
    
    deckElement.appendChild(cardElement);
  });
  
  deckContainer.appendChild(deckElement);
}

// Update status message
function updateStatus(message) {
  statusContainer.textContent = message;
}

// Deal cards into piles
function dealPiles(numPiles) {
  if (state !== 'initial' || animationInProgress) return;
  
  animationInProgress = true;
  state = 'dealing';
  updateStatus(`Dealing into ${numPiles} piles...`);
  
  // Create piles container if it doesn't exist
  if (!pilesContainer) {
    pilesContainer = document.createElement('div');
    pilesContainer.className = 'piles-container';
    document.querySelector('.card-trick-container').insertBefore(pilesContainer, buttonContainer);
  }
  
  pilesContainer.innerHTML = '';
  
  // Create pile elements
  for (let i = 0; i < numPiles; i++) {
    const pileElement = document.createElement('div');
    pileElement.className = 'pile';
    pileElement.dataset.pile = i;
    pilesContainer.appendChild(pileElement);
  }
  
  const piles = Array(numPiles).fill().map(() => []);
  const currentDeck = [...deck];
  const cardElements = document.querySelectorAll('.card');
  
  // Animate dealing cards into piles
  function dealNextCard(cardIndex) {
    if (cardIndex >= currentDeck.length) {
      // All cards dealt, reassemble after a delay
      setTimeout(() => {
        updateStatus("Reassembling piles...");
        // Initialize empty temporary deck for reassembly animation
        tempDeck = [];
        renderDeck(tempDeck);
        reassemblePiles(piles, numPiles);
      }, 500);
      return;
    }
    
    // Deal this card to the appropriate pile
    const pileIndex = cardIndex % numPiles;
    piles[pileIndex].push(currentDeck[cardIndex]);
    
    // Get the card element
    const cardElement = cardElements[cardIndex];
    if (!cardElement) {
      // If card element doesn't exist, just continue to the next card
      dealNextCard(cardIndex + 1);
      return;
    }
    
    const cardRect = cardElement.getBoundingClientRect();
    const pileElement = document.querySelector(`.pile[data-pile="${pileIndex}"]`);
    const pileRect = pileElement.getBoundingClientRect();
    
    // Create a clone for animation
    const clone = cardElement.cloneNode(true);
    clone.style.position = 'fixed';
    clone.style.top = `${cardRect.top}px`;
    clone.style.left = `${cardRect.left}px`;
    clone.style.width = `${cardRect.width}px`;
    clone.style.height = `${cardRect.height}px`;
    clone.style.transition = 'all 0.3s ease';
    clone.style.zIndex = '1000';
    document.body.appendChild(clone);
    
    // Hide the original card
    cardElement.style.visibility = 'hidden';
    
    // Animate to pile
    setTimeout(() => {
      clone.style.top = `${pileRect.top + (piles[pileIndex].length - 1) * 5}px`;
      clone.style.left = `${pileRect.left + pileRect.width/2 - cardRect.width/2}px`;
      
      // Remove clone after animation
      setTimeout(() => {
        clone.remove();
        
        // Add card to pile visually
        const cardInPile = document.createElement('div');
        cardInPile.className = `card rank-${currentDeck[cardIndex].rank}`;
        cardInPile.dataset.rank = currentDeck[cardIndex].rank;
        cardInPile.dataset.suit = currentDeck[cardIndex].suit;
        cardInPile.dataset.index = currentDeck[cardIndex].index;
        cardInPile.innerHTML = `
          <div class="card-content ${currentDeck[cardIndex].color}">
            ${currentDeck[cardIndex].rank}${currentDeck[cardIndex].suit}
          </div>
        `;
        cardInPile.style.marginTop = '-70px'; // Stack cards
        if (piles[pileIndex].length === 1) {
          cardInPile.style.marginTop = '0';
        }
        pileElement.appendChild(cardInPile);
        
        // Deal next card
        dealNextCard(cardIndex + 1);
      }, 300);
    }, 10);
  }
  
  // Start dealing animation
  dealNextCard(0);
}

// Reassemble piles into a single deck with animation
function reassemblePiles(piles, numPiles) {
  let newDeck = [];
  const deckRect = deckContainer.getBoundingClientRect();
  const deckCenter = {
    x: deckRect.left + deckRect.width / 2,
    y: deckRect.top + deckRect.height / 2
  };
  
  // Function to animate one pile at a time
  function animatePile(pileIndex) {
    if (pileIndex >= numPiles) {
      // All piles reassembled
      deck = newDeck;
      updateStatus("Piles reassembled. You can deal again or click 'Done Dealing'.");
      state = 'initial';
      animationInProgress = false;
      return;
    }
    
    const pileElement = document.querySelector(`.pile[data-pile="${pileIndex}"]`);
    const pileCards = pileElement.querySelectorAll('.card');
    
    // Animate each card in the pile to the deck
    function animateCard(cardIndex) {
      if (cardIndex >= pileCards.length) {
        // All cards in this pile animated, move to next pile
        setTimeout(() => {
          animatePile(pileIndex + 1);
        }, 200);
        return;
      }
      
      const cardElement = pileCards[cardIndex];
      const cardRect = cardElement.getBoundingClientRect();
      
      // Get the card data
      const cardRank = cardElement.dataset.rank;
      const cardSuit = cardElement.dataset.suit;
      const cardIndex2 = parseInt(cardElement.dataset.index || '0');
      
      // Find the corresponding card in the pile
      const card = piles[pileIndex][cardIndex];
      
      // Add this card to the new deck
      newDeck.push(card);
      
      // Create a clone for animation
      const clone = cardElement.cloneNode(true);
      clone.style.position = 'fixed';
      clone.style.top = `${cardRect.top}px`;
      clone.style.left = `${cardRect.left}px`;
      clone.style.width = `${cardRect.width}px`;
      clone.style.height = `${cardRect.height}px`;
      clone.style.transition = 'all 0.3s ease';
      clone.style.zIndex = '1000';
      document.body.appendChild(clone);
      
      // Hide the original card
      cardElement.style.visibility = 'hidden';
      
      // Update the temporary deck display
      tempDeck.push(card);
      
      // Animate to deck
      setTimeout(() => {
        clone.style.top = `${deckCenter.y}px`;
        clone.style.left = `${deckCenter.x - cardRect.width/2}px`;
        
        // Remove clone after animation and update deck display
        setTimeout(() => {
          clone.remove();
          
          // Render the updated temporary deck
          renderDeck(tempDeck);
          
          // Animate next card
          animateCard(cardIndex + 1);
        }, 150);
      }, 10);
    }
    
    // Start animating cards from this pile
    if (pileCards.length > 0) {
      animateCard(0);
    } else {
      // Empty pile, move to next
      animatePile(pileIndex + 1);
    }
  }
  
  // Start with the first pile
  animatePile(0);
}

// Reverse perfect shuffle
function reverseShuffleDeck() {
  if (state !== 'shuffling' || animationInProgress) return;
  
  animationInProgress = true;
  updateStatus("Performing reverse perfect shuffle...");
  
  const currentDeck = [...deck];
  const firstHalf = [];
  const secondHalf = [];
  
  // Split deck into alternating cards
  currentDeck.forEach((card, index) => {
    if (index % 2 === 0) {
      firstHalf.push(card);
    } else {
      secondHalf.push(card);
    }
  });
  
  // Place the second half on top of the first half
  const shuffledDeck = [...secondHalf, ...firstHalf];
  
  // Animate the shuffle
  const cardElements = document.querySelectorAll('.card');
  const deckRect = deckContainer.getBoundingClientRect();
  const centerX = deckRect.left + deckRect.width / 2;
  const centerY = deckRect.top + deckRect.height / 2;
  
  // Create clones for animation
  const clones = [];
  cardElements.forEach((card, i) => {
    const clone = card.cloneNode(true);
    const rect = card.getBoundingClientRect();
    
    clone.style.position = 'fixed';
    clone.style.top = `${rect.top}px`;
    clone.style.left = `${rect.left}px`;
    clone.style.width = `${rect.width}px`;
    clone.style.height = `${rect.height}px`;
    clone.style.transition = 'all 0.5s ease';
    clone.style.zIndex = i % 2 === 0 ? '100' : '200';
    clone.dataset.index = i;
    
    document.body.appendChild(clone);
    clones.push(clone);
    
    // Hide original card
    card.style.visibility = 'hidden';
  });
  
  // Animate to split positions
  setTimeout(() => {
    clones.forEach((clone, i) => {
      if (i % 2 === 0) {
        // Even cards go to the right
        clone.style.left = `${centerX + 100}px`;
      } else {
        // Odd cards go to the left
        clone.style.left = `${centerX - 100 - clone.offsetWidth}px`;
      }
    });
    
    // Reassemble in new order
    setTimeout(() => {
      // Update the deck
      deck = shuffledDeck;
      
      // Remove clones
      clones.forEach(clone => clone.remove());
      
      // Render the new deck
      renderDeck();
      
      // After reverse shuffle, perform Monge shuffle
      setTimeout(() => {
        updateStatus("Performing Monge shuffle...");
        mongeShuffle();
      }, 500);
    }, 600);
  }, 10);
}

// Monge shuffle
function mongeShuffle() {
  const currentDeck = [...deck];
  const shuffledDeck = [];
  
  // Animate the Monge shuffle
  function placeNextCard(index) {
    if (index >= currentDeck.length) {
      // Monge shuffle complete
      deck = shuffledDeck;
      renderDeck();
      showSelectionSlider();
      animationInProgress = false;
      return;
    }
    
    const card = currentDeck[index];
    
    // Alternate placing cards on top and bottom
    if (index % 2 === 0) {
      shuffledDeck.push(card); // Place on top
    } else {
      shuffledDeck.unshift(card); // Place on bottom
    }
    
    // Animate the card movement
    const cardElements = document.querySelectorAll('.card');
    const cardElement = cardElements[index];
    
    if (!cardElement) {
      // If card element doesn't exist, just continue to the next card
      placeNextCard(index + 1);
      return;
    }
    
    const cardRect = cardElement.getBoundingClientRect();
    
    // Create a clone for animation
    const clone = cardElement.cloneNode(true);
    clone.style.position = 'fixed';
    clone.style.top = `${cardRect.top}px`;
    clone.style.left = `${cardRect.left}px`;
    clone.style.width = `${cardRect.width}px`;
    clone.style.height = `${cardRect.height}px`;
    clone.style.transition = 'all 0.3s ease';
    clone.style.zIndex = '1000';
    document.body.appendChild(clone);
    
    // Hide original card
    cardElement.style.visibility = 'hidden';
    
    // Animate to temporary position
    setTimeout(() => {
      clone.style.top = `${cardRect.top + (index % 2 === 0 ? -50 : 50)}px`;
      
      // Remove clone after animation
      setTimeout(() => {
        clone.remove();
        
        // Continue with next card
        placeNextCard(index + 1);
      }, 300);
    }, 10);
  }
  
  placeNextCard(0);
}

// Show selection slider
function showSelectionSlider() {
  state = 'selecting';
  updateStatus("Select how many cards to move to the bottom using the slider, then click 'Confirm Selection':");
  
  // Show selection controls
  initialButtonsContainer.classList.add('hidden');
  selectionControlsContainer.classList.remove('hidden');
  
  // Update slider value display
  sliderValueDisplay.textContent = cardSlider.value;
}

// Process card selection
function processSelection() {
  if (state !== 'selecting' || animationInProgress) return;
  
  animationInProgress = true;
  const numToMove = parseInt(cardSlider.value);
  state = 'eliminating';
  updateStatus(`Moving ${numToMove} cards to the bottom and selecting the top card...`);
  
  // Hide selection controls
  selectionControlsContainer.classList.add('hidden');
  
  // Move cards to bottom
  const currentDeck = [...deck];
  const movedCards = currentDeck.splice(0, numToMove);
  currentDeck.push(...movedCards);
  
  // Select top card and remove from deck
  selectedCard = currentDeck.shift();
  selectedCard.selected = true;
  
  // Animate the card movement
  setTimeout(() => {
    deck = [selectedCard, ...currentDeck];
    renderDeck();
    updateStatus("Selected card set aside. Performing elimination...");
    
    // Start elimination process
    setTimeout(() => {
      startElimination();
    }, 1000);
  }, 1000);
}

// Elimination process
function startElimination() {
  const currentDeck = [...deck];
  const remainingCards = currentDeck.slice(1);
  
  // Animate the down-and-under elimination
  function eliminateNextRound() {
    if (remainingCards.length <= 1) {
      // Only one card left - show the result
      showResult(selectedCard, remainingCards[0]);
      animationInProgress = false;
      return;
    }
    
    const eliminated = remainingCards.shift();
    eliminated.eliminated = true;
    
    // Move one to the bottom (if there are cards left)
    if (remainingCards.length > 0) {
      const toBottom = remainingCards.shift();
      remainingCards.push(toBottom);
    }
    
    // Update the display
    deck = [selectedCard, eliminated, ...remainingCards];
    renderDeck();
    
    // Continue elimination
    setTimeout(() => eliminateNextRound(), 800);
  }
  
  // Start the elimination process
  eliminateNextRound();
}

// Show final result
function showResult(selectedCard, matchingCard) {
  state = 'done';
  updateStatus(`Trick complete! Your selected ${selectedCard.rank}${selectedCard.suit} matches with the remaining ${matchingCard.rank}${matchingCard.suit}!`);
  
  // Show reset controls
  resetControlsContainer.classList.remove('hidden');
}

// Reset the trick
function resetTrick() {
  if (state !== 'done') return;
  
  // Reset deck
  deck = initializeDeck();
  selectedCard = null;
  
  // Reset UI
  renderDeck();
  updateStatus("Ready to begin the trick. Click a \"Deal\" button to start.");
  
  // Show initial buttons
  resetControlsContainer.classList.add('hidden');
  initialButtonsContainer.classList.remove('hidden');
  
  // Reset state
  state = 'initial';
}

// Handle done dealing
function doneDealingClicked() {
  if (state !== 'initial' || animationInProgress) return;
  
  state = 'shuffling';
  reverseShuffleDeck();
}

// Setup the card trick
function setupCardTrick() {
  // Initialize deck
  deck = initializeDeck();
  
  // Create main container
  const container = document.createElement('div');
  container.className = 'card-trick-container';
  
  // Create status display
  statusContainer = document.createElement('div');
  statusContainer.className = 'status-container';
  statusContainer.textContent = "Ready to begin the trick. Click a \"Deal\" button to start.";
  container.appendChild(statusContainer);
  
  // Create deck container
  deckContainer = document.createElement('div');
  deckContainer.id = 'deck-container';
  container.appendChild(deckContainer);
  
  // Create button container
  buttonContainer = document.createElement('div');
  buttonContainer.className = 'button-container';
  container.appendChild(buttonContainer);
  
  // Initial buttons
  initialButtonsContainer = document.createElement('div');
  initialButtonsContainer.className = 'initial-buttons';
  buttonContainer.appendChild(initialButtonsContainer);
  
  // Deal 2 button
  const deal2Button = document.createElement('button');
  deal2Button.className = 'control-button';
  deal2Button.textContent = 'Deal 2 Piles';
  deal2Button.addEventListener('click', () => dealPiles(2));
  initialButtonsContainer.appendChild(deal2Button);
  
  // Deal 3 button
  const deal3Button = document.createElement('button');
  deal3Button.className = 'control-button';
  deal3Button.textContent = 'Deal 3 Piles';
  deal3Button.addEventListener('click', () => dealPiles(3));
  initialButtonsContainer.appendChild(deal3Button);
  
  // Deal 4 button
  const deal4Button = document.createElement('button');
  deal4Button.className = 'control-button';
  deal4Button.textContent = 'Deal 4 Piles';
  deal4Button.addEventListener('click', () => dealPiles(4));
  initialButtonsContainer.appendChild(deal4Button);
  
  // Done button
  const doneButton = document.createElement('button');
  doneButton.className = 'control-button';
  doneButton.textContent = 'Done Dealing';
  doneButton.addEventListener('click', doneDealingClicked);
  initialButtonsContainer.appendChild(doneButton);
  
  // Selection controls (hidden initially)
  selectionControlsContainer = document.createElement('div');
  selectionControlsContainer.className = 'selection-controls hidden';
  buttonContainer.appendChild(selectionControlsContainer);
  
  // Slider container
  sliderContainer = document.createElement('div');
  sliderContainer.className = 'slider-container';
  selectionControlsContainer.appendChild(sliderContainer);
  
  // Slider label
  const sliderLabel = document.createElement('label');
  sliderLabel.className = 'slider-label';
  sliderLabel.textContent = 'Cards to move to bottom:';
  sliderContainer.appendChild(sliderLabel);
  
  // Slider value display
  sliderValueDisplay = document.createElement('span');
  sliderValueDisplay.className = 'slider-value';
  sliderValueDisplay.textContent = '0';
  sliderContainer.appendChild(sliderValueDisplay);
  
  // Slider input
  cardSlider = document.createElement('input');
  cardSlider.type = 'range';
  cardSlider.min = '0';
  cardSlider.max = '11';
  cardSlider.value = '0';
  cardSlider.addEventListener('input', () => {
    sliderValueDisplay.textContent = cardSlider.value;
  });
  sliderContainer.appendChild(cardSlider);
  
  // Confirm button
  const confirmButton = document.createElement('button');
  confirmButton.className = 'control-button';
  confirmButton.textContent = 'Confirm Selection';
  confirmButton.addEventListener('click', processSelection);
  selectionControlsContainer.appendChild(confirmButton);
  
  // Reset controls (hidden initially)
  resetControlsContainer = document.createElement('div');
  resetControlsContainer.className = 'reset-controls hidden';
  buttonContainer.appendChild(resetControlsContainer);
  
  // Reset button
  const resetButton = document.createElement('button');
  resetButton.className = 'control-button';
  resetButton.textContent = 'Reset Trick';
  resetButton.addEventListener('click', resetTrick);
  resetControlsContainer.appendChild(resetButton);
  
  // Render the initial deck
  renderDeck();
  
  return container;
}

// Initialize when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  const cardTrickContainer = setupCardTrick();
  
  // Find the target element to append the card trick
  const targetElement = document.querySelector('#card-trick-demo');
  if (targetElement) {
    targetElement.appendChild(cardTrickContainer);
  }
});
