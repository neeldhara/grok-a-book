document.addEventListener('DOMContentLoaded', function() {
  // Elements
  const mainDeck = document.getElementById('main-deck-c');
  const oddPile = document.getElementById('odd-pile-c');
  const evenPile = document.getElementById('even-pile-c');
  const pilesContainer = document.querySelector('.piles-container-c');
  const shuffleBtn = document.getElementById('shuffle-btn-c');
  const arrangePairsBtn = document.getElementById('arrange-pairs-btn-c');
  const splitPilesBtn = document.getElementById('split-piles-btn-c');
  const flipPileBtn = document.getElementById('flip-pile-btn-c');
  const combineBtn = document.getElementById('combine-btn-c');
  const resetBtn = document.getElementById('reset-btn-c');
  const explanation = document.getElementById('explanation-c');
  
  // Card data
  const suits = {
    hearts: { symbol: '♥', color: 'red' },
    spades: { symbol: '♠', color: 'black' }
  };
  
  const ranks = ['10', 'J', 'Q', 'K', 'A'];
  
  let cards = [];
  let isAnimating = false;
  
  // Function to create the deck
  function createDeck() {
    // Clear the array
    cards = [];
    
    // Reset the UI
    mainDeck.innerHTML = '';
    oddPile.innerHTML = '';
    evenPile.innerHTML = '';
    
    // Show main deck, hide piles
    mainDeck.style.display = 'flex';
    pilesContainer.style.display = 'none';
    
    // Remove bottom row if it exists
    const bottomRow = document.getElementById('bottom-row-c');
    if (bottomRow) {
      bottomRow.remove();
    }
    
    // Create 5 hearts and 5 spades
    for (const rank of ranks) {
      // Create heart card
      const heartCard = createCardElement(rank, 'hearts');
      const heartCardObj = {
        element: heartCard,
        rank: rank,
        suit: 'hearts',
        faceUp: true
      };
      
      // Add data attributes for tracking
      heartCard.dataset.rank = rank;
      heartCard.dataset.suit = 'hearts';
      
      cards.push(heartCardObj);
      mainDeck.appendChild(heartCard);
      
      // Create spade card
      const spadeCard = createCardElement(rank, 'spades');
      const spadeCardObj = {
        element: spadeCard,
        rank: rank,
        suit: 'spades',
        faceUp: true
      };
      
      // Add data attributes for tracking
      spadeCard.dataset.rank = rank;
      spadeCard.dataset.suit = 'spades';
      
      cards.push(spadeCardObj);
      mainDeck.appendChild(spadeCard);
    }
    
    // Initialize UI
    shuffleBtn.disabled = false;
    arrangePairsBtn.disabled = true;
    splitPilesBtn.disabled = true;
    flipPileBtn.disabled = true;
    combineBtn.disabled = true;
    resetBtn.disabled = false;
    
    updateExplanation('Welcome to the Royal Flush card trick! Click "Shuffle Cards" to begin.');
  }
  
  // Create a card element
  function createCardElement(rank, suit) {
    const card = document.createElement('div');
    card.className = 'card-c';
    
    const cardInner = document.createElement('div');
    cardInner.className = 'card-inner';
    
    const cardFront = document.createElement('div');
    cardFront.className = 'card-front';
    
    // Create a centered content container
    const cardContent = document.createElement('div');
    cardContent.className = 'card-content';
    
    // Add rank
    const rankElement = document.createElement('div');
    rankElement.className = `card-value ${suits[suit].color}`;
    rankElement.textContent = rank;
    
    // Add suit symbol
    const suitElement = document.createElement('div');
    suitElement.className = `card-suit ${suits[suit].color}`;
    suitElement.textContent = suits[suit].symbol;
    
    // Add elements to content container
    cardContent.appendChild(rankElement);
    cardContent.appendChild(suitElement);
    
    // Add content container to card front
    cardFront.appendChild(cardContent);
    
    const cardBack = document.createElement('div');
    cardBack.className = 'card-back';
    
    cardInner.appendChild(cardFront);
    cardInner.appendChild(cardBack);
    card.appendChild(cardInner);
    
    return card;
  }
  
  // Flip a card
  function flipCard(card, faceUp) {
    card.faceUp = faceUp;
    if (faceUp) {
      card.element.classList.remove('flipped');
    } else {
      card.element.classList.add('flipped');
    }
  }
  
  // Animation utility
  function wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
  
  // Shuffle the cards
  async function shuffleCards() {
    if (isAnimating) return;
    isAnimating = true;
    
    // Disable buttons during animation
    shuffleBtn.disabled = true;
    resetBtn.disabled = true;
    
    // Visual shuffle animation
    for (let i = 0; i < 3; i++) {
      cards.forEach(card => {
        card.element.classList.add('shuffling');
      });
      
      await wait(600);
      
      cards.forEach(card => {
        card.element.classList.remove('shuffling');
      });
      
      await wait(200);
    }
    
    // Actually shuffle the array
    for (let i = cards.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [cards[i], cards[j]] = [cards[j], cards[i]];
    }
    
    // Update DOM
    mainDeck.innerHTML = '';
    cards.forEach(card => {
      mainDeck.appendChild(card.element);
    });
    
    // Enable next step
    arrangePairsBtn.disabled = false;
    resetBtn.disabled = false;
    isAnimating = false;
    
    updateExplanation('Now arrange the cards in pairs according to the trick rules.');
  }
  
  // Arrange cards in special pairs
  async function arrangePairs() {
    if (isAnimating) return;
    isAnimating = true;
    
    // Disable buttons during animation
    arrangePairsBtn.disabled = true;
    resetBtn.disabled = true;
    
    // Create a bottom row for arranged cards
    const bottomRow = document.createElement('div');
    bottomRow.id = 'bottom-row-c';
    bottomRow.className = 'deck-container-c';
    
    // Add the bottom row to the trick container
    const trickContainer = document.getElementById('trick-container-c');
    trickContainer.insertBefore(bottomRow, document.getElementById('piles-container-c'));
    
    // Get all cards from the main deck
    const allCards = [...cards];
    const pairs = [];
    
    // Group cards into pairs
    for (let i = 0; i < allCards.length; i += 2) {
      if (i + 1 < allCards.length) {
        pairs.push([allCards[i], allCards[i + 1]]);
      }
    }
    
    // Reverse the order of pairs for placement
    // First pair from top → last pair in bottom, etc.
    pairs.reverse();
    
    // Process each pair and apply rules
    for (const pair of pairs) {
      const card1 = pair[0];
      const card2 = pair[1];
      
      // Get suit information
      const suit1 = card1.suit;
      const suit2 = card2.suit;
      
      let leftCard, rightCard;
      
      // Apply rules based on suits
      if (suit1 === 'spades' && suit2 === 'spades') {
        // Both spades - left face down, right face up
        leftCard = card1;
        rightCard = card2;
        flipCard(leftCard, false); // face down
        flipCard(rightCard, true);  // face up
      } else if (suit1 === 'hearts' && suit2 === 'hearts') {
        // Both hearts - left face up, right face down
        leftCard = card1;
        rightCard = card2;
        flipCard(leftCard, true);   // face up
        flipCard(rightCard, false); // face down
      } else {
        // One spade and one heart
        // Heart on left (face up), spade on right (face down)
        if (suit1 === 'hearts') {
          leftCard = card1;  // heart
          rightCard = card2; // spade
        } else {
          leftCard = card2;  // heart
          rightCard = card1; // spade
        }
        flipCard(leftCard, true);   // heart face up
        flipCard(rightCard, false); // spade face down
      }
      
      // Create a pair container for visual grouping
      const pairContainer = document.createElement('div');
      pairContainer.className = 'card-pair';
      
      // Get current positions for animation
      const leftRect = leftCard.element.getBoundingClientRect();
      const rightRect = rightCard.element.getBoundingClientRect();
      
      // Move cards to the bottom row
      bottomRow.appendChild(pairContainer);
      pairContainer.appendChild(leftCard.element);
      pairContainer.appendChild(rightCard.element);
      
      // Animate the movement
      const newLeftRect = leftCard.element.getBoundingClientRect();
      const newRightRect = rightCard.element.getBoundingClientRect();
      
      // Apply initial offset
      leftCard.element.style.transition = 'none';
      rightCard.element.style.transition = 'none';
      
      leftCard.element.style.transform = `translate(${leftRect.left - newLeftRect.left}px, ${leftRect.top - newLeftRect.top}px)`;
      rightCard.element.style.transform = `translate(${rightRect.left - newRightRect.left}px, ${rightRect.top - newRightRect.top}px)`;
      
      // Force reflow
      void leftCard.element.offsetWidth;
      
      // Animate to final position
      leftCard.element.style.transition = 'transform 0.5s ease';
      rightCard.element.style.transition = 'transform 0.5s ease';
      
      leftCard.element.style.transform = '';
      rightCard.element.style.transform = '';
      
      await wait(600);
    }
    
    // Clear the main deck
    mainDeck.innerHTML = '';
    
    // Collect all cards in their new arrangement
    const arrangedCards = [];
    const arrangedElements = bottomRow.querySelectorAll('.card-c');
    
    arrangedElements.forEach(element => {
      const card = cards.find(c => c.element === element);
      if (card) {
        arrangedCards.push(card);
      }
    });
    
    // Update the cards array with the new arrangement
    cards = arrangedCards;
    
    // Enable next button
    splitPilesBtn.disabled = false;
    resetBtn.disabled = false;
    isAnimating = false;
    
    updateExplanation('The cards are now arranged in pairs according to the rules. Notice how hearts are placed on the left (face up) and spades on the right (face down). Click "Split Into Odd/Even Piles" to continue.');
  }
  
  // Split cards into odd and even position piles
  async function splitIntoPiles() {
    if (isAnimating) return;
    isAnimating = true;
    
    // Disable buttons during animation
    splitPilesBtn.disabled = true;
    resetBtn.disabled = true;
    
    // Show the piles container
    pilesContainer.style.display = 'flex';
    
    // Clear existing cards in piles
    oddPile.innerHTML = '';
    evenPile.innerHTML = '';
    
    // Get all cards from pairs
    const allCards = [...cards];
    
    // Move cards to respective piles based on position
    for (let i = 0; i < allCards.length; i++) {
      const card = allCards[i];
      const isOddPosition = i % 2 === 0; // 0-indexed, so even indices are odd positions
      
      // Add animation class
      card.element.classList.add('moving');
      
      // Calculate the direction for animation
      const startRect = card.element.getBoundingClientRect();
      const targetPile = isOddPosition ? oddPile : evenPile;
      const targetRect = targetPile.getBoundingClientRect();
      
      // Calculate offsets for animation
      const xOffset = targetRect.left - startRect.left + 10; // 10px for padding
      const yOffset = targetRect.top - startRect.top + 10;
      
      // Apply transition
      card.element.style.transition = 'transform 0.5s ease-in-out';
      card.element.style.transform = `translate(${xOffset}px, ${yOffset}px)`;
      
      await wait(300);
      
      // Move to target pile in DOM
      targetPile.appendChild(card.element);
      
      // Reset styles
      card.element.style.transition = '';
      card.element.style.transform = '';
      card.element.classList.remove('moving');
      
      await wait(200);
    }
    
    // Remove pair containers
    mainDeck.innerHTML = '';
    mainDeck.style.display = 'none';
    
    // Enable next step
    flipPileBtn.disabled = false;
    resetBtn.disabled = false;
    isAnimating = false;
    
    updateExplanation('Now the cards are separated into odd and even position piles. Next, flip the even position pile over onto the odd pile.');
  }
  
  // Flip the even position pile onto the odd position pile
  async function flipEvenPile() {
    if (isAnimating) return;
    isAnimating = true;
    
    // Disable buttons during animation
    flipPileBtn.disabled = true;
    resetBtn.disabled = false;
    
    // Get all cards from the even pile
    const evenCards = cards.filter((_, i) => i % 2 === 1); // even positions (1-indexed)
    
    // Animate flipping the even pile
    // First, flip each card in the even pile
    for (const card of evenCards) {
      flipCard(card, !card.faceUp);
      await wait(200);
    }
    
    await wait(500);
    
    // Enable combine button
    combineBtn.disabled = false;
    isAnimating = false;
    
    updateExplanation('The even position pile has been flipped. Notice that each spade card is now face up in the even pile and face down in the odd pile. Each heart card is face up in the odd pile and face down in the even pile. Now combine the piles to see the result.');
  }
  
  // Combine the piles to show the final result
  async function combinePiles() {
    if (isAnimating) return;
    isAnimating = true;
    
    // Disable buttons during animation
    combineBtn.disabled = true;
    resetBtn.disabled = true;
    
    // Show the main deck again
    mainDeck.style.display = 'flex';
    
    // Clear the main deck
    mainDeck.innerHTML = '';
    
    // Get all odd position cards (hearts face up)
    const oddCards = cards.filter((_, i) => i % 2 === 0);
    
    // Get all even position cards (spades face up)
    const evenCards = cards.filter((_, i) => i % 2 === 1);
    
    // Combine the cards with odd positions first, then even positions
    const combinedCards = [...oddCards, ...evenCards];
    
    // Move all cards to the main deck
    for (const card of combinedCards) {
      mainDeck.appendChild(card.element);
      await wait(200);
    }
    
    // Hide the piles container
    pilesContainer.style.display = 'none';
    
    // Update explanation
    updateExplanation('The trick is complete! Notice that all heart cards are face up, showing a royal flush, while all spade cards are face down.');
    
    // Enable reset button
    resetBtn.disabled = false;
    isAnimating = false;
  }
  
  // Update the explanation text
  function updateExplanation(text) {
    explanation.innerHTML = `<p>${text}</p>`;
  }
  
  // Reset the trick
  function resetTrick() {
    if (isAnimating) return;
    createDeck();
  }
  
  // Event listeners
  shuffleBtn.addEventListener('click', shuffleCards);
  arrangePairsBtn.addEventListener('click', arrangePairs);
  splitPilesBtn.addEventListener('click', splitIntoPiles);
  flipPileBtn.addEventListener('click', flipEvenPile);
  combineBtn.addEventListener('click', combinePiles);
  resetBtn.addEventListener('click', resetTrick);
  
  // Initialize
  createDeck();
});
