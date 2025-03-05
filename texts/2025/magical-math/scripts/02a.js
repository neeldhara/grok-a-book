document.addEventListener('DOMContentLoaded', function() {
  // Elements
  const cardContainer = document.getElementById('card-container-b');
  const cutFlipBtn = document.getElementById('cut-flip-btn-b');
  const resetBtn = document.getElementById('reset-btn-b');
  const shufflesCompleteBtn = document.getElementById('shuffles-complete-btn-b');
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
    shufflesCompleteBtn.disabled = true;
    
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
    shufflesCompleteBtn.disabled = false;
  }
  
  // Reset deck
  function resetDeck() {
    if (isAnimating) return;
    createDeck();
  }
  
  // Perform the shuffles complete animation sequence
  async function performShufflesComplete() {
    if (isAnimating) return;
    isAnimating = true;
    
    // Disable all buttons during animation
    cutFlipBtn.disabled = true;
    resetBtn.disabled = true;
    shufflesCompleteBtn.disabled = true;
    
    // Save original card positions for reference
    const originalCards = [...cards];
    
    // Step 1: Create two rectangle containers
    const topRectangle = document.createElement('div');
    topRectangle.id = 'top-rectangle';
    topRectangle.className = 'rectangle-container';
    
    const bottomRectangle = document.createElement('div');
    bottomRectangle.id = 'bottom-rectangle';
    bottomRectangle.className = 'rectangle-container';
    
    // Add rectangles to the DOM
    cardContainer.insertAdjacentElement('beforebegin', topRectangle);
    cardContainer.insertAdjacentElement('afterend', bottomRectangle);
    
    await wait(1000);
    
    // Step 2: Move cards to appropriate rectangles based on position
    const oddCards = [];
    const evenCards = [];
    
    // Get card dimensions for proper spacing
    const cardWidth = cards[0].element.offsetWidth;
    const cardGap = 10; // Gap between cards
    
    // Separate cards into odd and even positions
    cards.forEach((card, index) => {
      const position = index + 1; // 1-based position
      
      // Set transition for smooth movement
      card.element.style.transition = 'all 0.5s ease-in-out';
      
      if (position % 2 === 1) { // Odd positions (1, 3, 5, 7, 9)
        oddCards.push(card);
        
        // Calculate position to move to bottom rectangle
        const rect = card.element.getBoundingClientRect();
        const bottomRect = bottomRectangle.getBoundingClientRect();
        
        // Move to bottom rectangle
        const yOffset = bottomRect.top - rect.top + 10; // 10px padding
        card.element.style.transform = `translateY(${yOffset}px)`;
      } else { // Even positions (2, 4, 6, 8, 10)
        evenCards.push(card);
        
        // Calculate position to move to top rectangle
        const rect = card.element.getBoundingClientRect();
        const topRect = topRectangle.getBoundingClientRect();
        
        // Move to top rectangle
        const yOffset = topRect.top - rect.top + 10; // 10px padding
        card.element.style.transform = `translateY(${yOffset}px)`;
      }
    });
    
    await wait(1000);
    
    // Step 3: Move cards to their respective rectangles in DOM
    oddCards.forEach(card => {
      bottomRectangle.appendChild(card.element);
      card.element.style.transform = '';
    });
    
    evenCards.forEach(card => {
      topRectangle.appendChild(card.element);
      card.element.style.transform = '';
    });
    
    await wait(1000);
    
    // Step 4: Move cards from top rectangle to bottom, starting from the last card (simulating stack being turned over)
    const newOrder = [...oddCards];
    
    // Create a reversed copy of evenCards to process them in reverse order
    const reversedEvenCards = [...evenCards].reverse();
    
    // Move cards from top to bottom one by one, starting from the last card
    for (let i = 0; i < reversedEvenCards.length; i++) {
      const card = reversedEvenCards[i];
      
      // Calculate positions for diagonal movement
      const rect = card.element.getBoundingClientRect();
      const bottomRect = bottomRectangle.getBoundingClientRect();
      
      // Calculate the target position in the bottom rectangle
      // The first card moved (last in original order) goes to position 10, then 9, 8, 7, 6
      const slotPosition = 10 - i;
      
      // Calculate horizontal offset based on the target position
      // We want the card to move diagonally to its final position
      const xOffset = (slotPosition - 1) * (cardWidth + cardGap) - rect.left + bottomRect.left;
      const yOffset = bottomRect.top - rect.top;
      
      // Move diagonally to the target position
      card.element.style.transition = 'all 0.7s ease-in-out';
      card.element.style.transform = `translate(${xOffset}px, ${yOffset}px)`;
      
      // Flip card state as it moves
      await wait(500);
      toggleCardFace(card);
      
      // Add to new order (in the correct position)
      newOrder.push(card);
      
      // Move to bottom rectangle in DOM
      bottomRectangle.appendChild(card.element);
      card.element.style.transform = '';
      
      await wait(500);
    }
    
    await wait(1000);
    
    // Step 5: Move all cards from bottom rectangle to original container
    // and gracefully pull them up to the middle
    bottomRectangle.innerHTML = '';
    topRectangle.innerHTML = '';
    
    // Reset cards array with new order
    cards = newOrder;
    
    // First, position all cards in their final positions but below the card container
    cards.forEach((card, index) => {
      // Add cards to the main container
      cardContainer.appendChild(card.element);
      
      // Position cards below the container
      const containerRect = cardContainer.getBoundingClientRect();
      const cardRect = card.element.getBoundingClientRect();
      const yOffset = 50; // Position below the container
      
      card.element.style.transition = 'all 0.5s ease-in-out';
      card.element.style.transform = `translateY(${yOffset}px)`;
    });
    
    await wait(500);
    
    // Then, animate them moving up to their final positions
    cards.forEach((card, index) => {
      card.element.style.transition = 'all 0.5s ease-in-out';
      card.element.style.transform = ''; // Reset to original position
    });
    
    await wait(1000);
    
    // Remove the rectangles
    topRectangle.remove();
    bottomRectangle.remove();
    
    // Update card counts
    updateCardCounts();
    
    // Re-enable buttons
    isAnimating = false;
    cutFlipBtn.disabled = false;
    resetBtn.disabled = false;
    shufflesCompleteBtn.disabled = false;
  }
  
  // Event listeners
  cutFlipBtn.addEventListener('click', cutAndFlipAction);
  resetBtn.addEventListener('click', resetDeck);
  shufflesCompleteBtn.addEventListener('click', performShufflesComplete);
  
  // Initial setup
  createDeck();
  updateCardCounts();
});