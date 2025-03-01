document.addEventListener('DOMContentLoaded', function() {
  // Elements
  const cardContainer = document.getElementById('card-container-b');
  const cutFlipBtn = document.getElementById('cut-flip-btn-b');
  const resetBtn = document.getElementById('reset-btn-b');
  const cutSlider = document.getElementById('cut-slider-b');
  const sliderValue = document.getElementById('slider-value-b');
  const oddCountElement = document.getElementById('odd-count-b');
  const evenCountElement = document.getElementById('even-count-b');
  
  // Card setup
  const numbers = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'];
  let cards = [];
  let isAnimating = false;
  
  // Update slider value display
  cutSlider.addEventListener('input', function() {
    sliderValue.textContent = this.value;
  });
  
  // Create a card element
  function createCard(number, index) {
    const card = document.createElement('div');
    card.className = 'card-b face-up';
    card.dataset.index = index;
    
    card.innerHTML = `
      <div class="card-value">${number}</div>
    `;
    
    return card;
  }
  
  // Update card counts
  function updateCardCounts() {
    let oddCount = 0;
    let evenCount = 0;
    
    cards.forEach((card, index) => {
      // For visual position, we need position + 1 (converting from 0-based index to 1-based position)
      const position = index + 1;
      
      // Check if card is face up and at odd/even position
      if (card.faceUp) {
        if (position % 2 === 1) { // Odd positions (1, 3, 5, 7, 9)
          oddCount++;
        } else { // Even positions (2, 4, 6, 8, 10)
          evenCount++;
        }
      }
    });
    
    // Update the display
    oddCountElement.textContent = oddCount;
    evenCountElement.textContent = evenCount;
  }
  
  // Initialize deck
  function createDeck() {
    cardContainer.innerHTML = '';
    cards = [];
    
    // Create 10 numbered cards
    numbers.forEach((number, index) => {
      const cardElement = createCard(number, index);
      cardContainer.appendChild(cardElement);
      cards.push({
        element: cardElement,
        number: number,
        faceUp: true
      });
    });
    
    // Update counts after creating deck
    updateCardCounts();
  }
  
  // Toggle card face
  function toggleCardFace(cardObj) {
    cardObj.faceUp = !cardObj.faceUp;
    cardObj.element.className = `card-b ${cardObj.faceUp ? 'face-up' : 'face-down'}`;
  }
  
  // Animation utility function
  function wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
  
  // Calculate card width including gap
  function getCardWidthWithGap() {
    if (cards.length < 2) return 0;
    
    const firstRect = cards[0].element.getBoundingClientRect();
    const secondRect = cards[1].element.getBoundingClientRect();
    return secondRect.left - firstRect.left;
  }
  
  // Perform the cut operation
  async function performCut() {
    const cutAmount = parseInt(cutSlider.value);
    const cardWidth = getCardWidthWithGap();
    
    // Split cards into two groups
    const cutCards = cards.slice(0, cutAmount);
    const remainingCards = cards.slice(cutAmount);
    
    // Step 1: Lift the top X cards
    cutCards.forEach(card => {
      card.element.style.transition = 'transform 0.4s ease-in-out';
      card.element.style.transform = 'translateY(-60px)';
    });
    
    await wait(400);
    
    // Step 2: Slide the remaining cards to the left
    remainingCards.forEach((card, index) => {
      card.element.style.transition = 'transform 0.4s ease-in-out';
      card.element.style.transform = `translateX(-${cardWidth * cutAmount}px)`;
    });
    
    // Step 3: Move the lifted cards to the right
    cutCards.forEach((card, index) => {
      card.element.style.transition = 'transform 0.4s ease-in-out';
      card.element.style.transform = `translate(${cardWidth * remainingCards.length}px, -60px)`;
    });
    
    await wait(400);
    
    // Step 4: Drop the cards back down
    cutCards.forEach(card => {
      card.element.style.transition = 'transform 0.3s ease-in-out';
      card.element.style.transform = `translateX(${cardWidth * remainingCards.length}px)`;
    });
    
    await wait(300);
    
    // Reorder cards in memory
    cards = [...remainingCards, ...cutCards];
    
    // Reset all transformations and update DOM
    cards.forEach(card => {
      card.element.style.transition = '';
      card.element.style.transform = '';
    });
    
    // Reorder cards in DOM
    cardContainer.innerHTML = '';
    cards.forEach(card => {
      cardContainer.appendChild(card.element);
    });
    
    // Update card counts after cut
    updateCardCounts();
  }
  
  // Perform the flip and swap operation
  async function performFlipAndSwap() {
    const cardWidth = getCardWidthWithGap();
    
    // Get the top two cards
    const firstCard = cards[0];
    const secondCard = cards[1];
    
    // Step 1: Lift both cards
    firstCard.element.style.transition = 'transform 0.4s ease-in-out';
    secondCard.element.style.transition = 'transform 0.4s ease-in-out';
    firstCard.element.style.transform = 'translateY(-60px)';
    secondCard.element.style.transform = 'translateY(-60px)';
    
    await wait(400);
    
    // Step 2: Toggle card states while they're lifted
    toggleCardFace(firstCard);
    toggleCardFace(secondCard);
    
    await wait(400);
    
    // Step 3: Move cards horizontally to swap positions
    firstCard.element.style.transform = `translate(${cardWidth}px, -60px)`;
    secondCard.element.style.transform = `translate(-${cardWidth}px, -60px)`;
    
    await wait(400);
    
    // Step 4: Drop cards back down in swapped positions
    firstCard.element.style.transform = `translateX(${cardWidth}px)`;
    secondCard.element.style.transform = `translateX(-${cardWidth}px)`;
    
    await wait(300);
    
    // Swap cards in memory
    [cards[0], cards[1]] = [cards[1], cards[0]];
    
    // Reset all transformations and update DOM
    cards.forEach(card => {
      card.element.style.transition = '';
      card.element.style.transform = '';
    });
    
    // Update DOM with swapped cards
    cardContainer.innerHTML = '';
    cards.forEach(card => {
      cardContainer.appendChild(card.element);
    });
    
    // Update card counts after flip and swap
    updateCardCounts();
  }
  
  // Cut and flip action
  async function cutAndFlipAction() {
    if (isAnimating) return;
    isAnimating = true;
    cutFlipBtn.disabled = true;
    resetBtn.disabled = true;
    
    // First perform the cut
    await performCut();
    
    // Update counts after cut
    updateCardCounts();
    
    // Pause between operations
    await wait(800);
    
    // Then perform flip and swap
    await performFlipAndSwap();
    
    // Re-enable buttons
    isAnimating = false;
    cutFlipBtn.disabled = false;
    resetBtn.disabled = false;
  }
  
  // Reset deck
  function resetDeck() {
    if (isAnimating) return;
    createDeck();
  }
  
  // Event listeners
  cutFlipBtn.addEventListener('click', cutAndFlipAction);
  resetBtn.addEventListener('click', resetDeck);
  
  // Initial setup
  createDeck();
  updateCardCounts();
});