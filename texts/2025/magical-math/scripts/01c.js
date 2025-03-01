document.addEventListener('DOMContentLoaded', function() {
  // Elements
  const playerCardsContainer = document.getElementById('player-cards-c');
  const targetCardsContainer = document.getElementById('target-cards-c');
  const cutFlipBtn = document.getElementById('cut-flip-btn-c');
  const resetBtn = document.getElementById('reset-btn-c');
  const impossibleBtn = document.getElementById('impossible-btn-c');
  const cutSlider = document.getElementById('cut-slider-c');
  const sliderValue = document.getElementById('slider-value-c');
  const movesCounter = document.getElementById('moves-counter-c');
  const resultMessage = document.getElementById('result-message-c');
  
  // Game state
  const numbers = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'];
  let playerCards = [];
  let targetCards = [];
  let moves = 0;
  let isAnimating = false;
  
  // Update slider value display
  cutSlider.addEventListener('input', function() {
    sliderValue.textContent = this.value;
  });
  
  // Create a card element
  function createCard(number, index, isTarget = false) {
    const card = document.createElement('div');
    card.className = 'card-c face-up';
    card.dataset.index = index;
    card.dataset.number = number;
    
    card.innerHTML = `
      <div class="card-value">${number}</div>
    `;
    
    return card;
  }
  
  // Generate random permutation
  function getRandomPermutation(array) {
    const result = [...array];
    for (let i = result.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
  }
  
  // Generate achievable face states for a given permutation
  // Uses the rule: position + value + (1 if face up) should all have the same parity
  function createAchievablePattern(permutation) {
    // Choose a target parity (0 for even, 1 for odd)
    const targetParity = Math.random() < 0.5 ? 0 : 1;
    console.log(`Creating achievable pattern with target parity: ${targetParity === 0 ? 'EVEN' : 'ODD'}`);
    
    const faceStates = [];
    
    // For each card, determine face state to achieve target parity
    for (let i = 0; i < permutation.length; i++) {
      const position = parseInt(i + 1); // 1-indexed
      const value = parseInt(permutation[i]);
      
      // Calculate: position + value
      const baseSum = position + value;
      const baseParity = baseSum % 2;
      
      // Determine if card should be face up or face down
      // If baseParity matches targetParity, card should be face down (0)
      // If baseParity doesn't match targetParity, card should be face up (1)
      const shouldBeFaceUp = baseParity !== targetParity;
      
      faceStates.push(shouldBeFaceUp);
      
      const finalSum = baseSum + parseInt(shouldBeFaceUp ? 1 : 0);
      console.log(`Card ${i+1}: position=${position}, value=${value}, baseSum=${baseSum}, faceUp=${shouldBeFaceUp}, finalSum=${finalSum}, finalParity=${finalSum % 2}`);
    }
    
    return faceStates;
  }
  
  // Create an impossible pattern by ensuring mixed parities
  function createImpossiblePattern(permutation) {
    console.log("Creating impossible pattern");
    
    // First create an achievable pattern with a specific target parity
    const targetParity = Math.random() < 0.5 ? 0 : 1;
    const faceStates = [];
    
    // Create most cards following the target parity rule
    for (let i = 0; i < permutation.length - 2; i++) {
      const position = i + 1;
      const value = permutation[i];
      const baseSum = position + value;
      const baseParity = baseSum % 2;
      
      // Determine if card should be face up or face down to match target parity
      const shouldBeFaceUp = baseParity !== targetParity;
      faceStates.push(shouldBeFaceUp);
      
      const finalSum = baseSum + (shouldBeFaceUp ? 1 : 0);
      console.log(`Card ${i+1}: position=${position}, value=${value}, baseSum=${baseSum}, faceUp=${shouldBeFaceUp}, finalSum=${finalSum}, finalParity=${finalSum % 2}`);
    }
    
    // For the last two cards, ensure they have the opposite parity
    for (let i = permutation.length - 2; i < permutation.length; i++) {
      const position = i + 1;
      const value = permutation[i];
      const baseSum = position + value;
      const baseParity = baseSum % 2;
      
      // Make the opposite of what would produce the target parity
      const shouldBeFaceUp = baseParity === targetParity;
      faceStates.push(shouldBeFaceUp);
      
      const finalSum = baseSum + (shouldBeFaceUp ? 1 : 0);
      console.log(`Card ${i+1} (OPPOSITE): position=${position}, value=${value}, baseSum=${baseSum}, faceUp=${shouldBeFaceUp}, finalSum=${finalSum}, finalParity=${finalSum % 2}`);
    }
    
    return faceStates;
  }

  // Check if the pattern is achievable
  function isPatternAchievable() {
    // Calculate the sums as per the given rule: position + value + (1 if face up)
    const sums = [];
    
    for (let i = 0; i < targetCards.length; i++) {
      const targetCard = targetCards[i];
      const position = i + 1;
      const value = parseInt(targetCard.number);
      const faceUpValue = targetCard.faceUp ? 1 : 0;
      const sum = position + value + faceUpValue;
      sums.push(sum);
    }
    
    // Check if all sums are even or all sums are odd
    const firstParityIsEven = sums[0] % 2 === 0;
    let isAchievable = true;
    
    // Check if all other values have the same parity as the first one
    for (let i = 1; i < sums.length; i++) {
      const currentParityIsEven = sums[i] % 2 === 0;
      if (currentParityIsEven !== firstParityIsEven) {
        isAchievable = false;
        break;
      }
    }
    
    // Debug: log the sums and whether pattern is achievable
    const parityName = firstParityIsEven ? 'even' : 'odd';
    console.log(`Position + Value + FaceUp sums:`, sums);
    console.log(`Expected all sums to be ${parityName}, pattern achievable: ${isAchievable}`);
    
    return isAchievable;
  }

  // Initialize target deck with random permutation and face states
  function createTargetDeck() {
    targetCardsContainer.innerHTML = '';
    targetCards = [];
    
    // Create a random permutation of the numbers
    const permutation = getRandomPermutation(numbers);
    
    // 75% chance of creating an achievable pattern, 25% impossible
    const makeAchievable = Math.random() < 0.75;
    console.log(`Attempting to create ${makeAchievable ? 'ACHIEVABLE' : 'IMPOSSIBLE'} pattern`);
    
    // Generate face states based on achievability
    if (makeAchievable) {
      console.log("Creating achievable pattern");
      faceStates = createAchievablePattern(permutation);
    }
    else {
      console.log("Creating impossible pattern");
      faceStates = createImpossiblePattern(permutation);
    }
   
    // Create target cards with the random permutation and states
    permutation.forEach((number, index) => {
      const cardElement = createCard(number, index, true);
      const isFaceUp = faceStates[index];
      
      if (!isFaceUp) {
        cardElement.className = 'card-c face-down';
      }
      
      targetCardsContainer.appendChild(cardElement);
      targetCards.push({
        element: cardElement,
        number: number,
        faceUp: isFaceUp,
        originalIndex: index
      });
    });
    
    // Verify the pattern type (just for debugging)
    const actuallyAchievable = isPatternAchievable();
    console.log(`Pattern verification: ${actuallyAchievable ? 'ACHIEVABLE' : 'IMPOSSIBLE'}`);
    console.log(`Expected: ${makeAchievable ? 'ACHIEVABLE' : 'IMPOSSIBLE'}`);
    
    if (actuallyAchievable !== makeAchievable) {
      console.error("WARNING: Pattern type doesn't match what was requested!");
    }
  }
  
  // Initialize player's deck
  function createPlayerDeck() {
    playerCardsContainer.innerHTML = '';
    playerCards = [];
    
    // Create 10 numbered cards all face-up initially
    numbers.forEach((number, index) => {
      const cardElement = createCard(number, index);
      playerCardsContainer.appendChild(cardElement);
      playerCards.push({
        element: cardElement,
        number: number,
        faceUp: true,
        originalIndex: index
      });
    });
  }
  
  // Toggle card face
  function toggleCardFace(cardObj) {
    cardObj.faceUp = !cardObj.faceUp;
    cardObj.element.className = `card-c ${cardObj.faceUp ? 'face-up' : 'face-down'}`;
  }
  
  // Check if player's cards match the target
  function checkMatch() {
    // First check if all cards match in number and face state
    for (let i = 0; i < playerCards.length; i++) {
      const playerCard = playerCards[i];
      const targetCard = targetCards[i];
      
      if (playerCard.number !== targetCard.number || playerCard.faceUp !== targetCard.faceUp) {
        return false;
      }
    }
    
    return true;
  }
  
  // Animation utility function
  function wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
  
  // Calculate card width including gap
  function getCardWidthWithGap() {
    if (playerCards.length < 2) return 0;
    
    const firstRect = playerCards[0].element.getBoundingClientRect();
    const secondRect = playerCards[1].element.getBoundingClientRect();
    return secondRect.left - firstRect.left;
  }
  
  // Perform the cut operation
  async function performCut() {
    const cutAmount = parseInt(cutSlider.value);
    const cardWidth = getCardWidthWithGap();
    
    // Split cards into two groups
    const cutCards = playerCards.slice(0, cutAmount);
    const remainingCards = playerCards.slice(cutAmount);
    
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
    playerCards = [...remainingCards, ...cutCards];
    
    // Reset all transformations and update DOM
    playerCards.forEach(card => {
      card.element.style.transition = '';
      card.element.style.transform = '';
    });
    
    // Reorder cards in DOM
    playerCardsContainer.innerHTML = '';
    playerCards.forEach(card => {
      playerCardsContainer.appendChild(card.element);
    });
  }
  
  // Perform the flip and swap operation
  async function performFlipAndSwap() {
    const cardWidth = getCardWidthWithGap();
    
    // Get the top two cards
    const firstCard = playerCards[0];
    const secondCard = playerCards[1];
    
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
    [playerCards[0], playerCards[1]] = [playerCards[1], playerCards[0]];
    
    // Reset all transformations and update DOM
    playerCards.forEach(card => {
      card.element.style.transition = '';
      card.element.style.transform = '';
    });
    
    // Update DOM with swapped cards
    playerCardsContainer.innerHTML = '';
    playerCards.forEach(card => {
      playerCardsContainer.appendChild(card.element);
    });
  }
  
  // Cut and flip action
  async function cutAndFlipAction() {
    if (isAnimating) return;
    isAnimating = true;
    cutFlipBtn.disabled = true;
    resetBtn.disabled = true;
    impossibleBtn.disabled = true;
    
    // First perform the cut
    await performCut();
    
    // Pause between operations
    await wait(500);
    
    // Then perform flip and swap
    await performFlipAndSwap();
    
    // Increment move counter
    moves++;
    movesCounter.textContent = `Moves: ${moves}`;
    
    // Check if the player has matched the target
    if (checkMatch()) {
      showResult('success', `Congratulations! You matched the pattern in ${moves} moves!`);
    }
    
    // Re-enable buttons
    isAnimating = false;
    cutFlipBtn.disabled = false;
    resetBtn.disabled = false;
    impossibleBtn.disabled = false;
  }
  
  // Display the calculation values with position+value+faceUp as the formula,
  // but highlight the position+faceUp parity to show why pattern is or isn't achievable
  function showCalculationValues() {
    // First, check if the pattern is achievable - this is for double-checking
    const positionFaceUpSums = [];
    for (let i = 0; i < targetCards.length; i++) {
      const position = i + 1;
      const value = parseInt(targetCards[i].number);
      const faceUpValue = targetCards[i].faceUp ? 1 : 0;
      positionFaceUpSums.push(position + value + faceUpValue);
    }
    
    // Check for the same parity across all position+faceUp sums
    const firstSumIsEven = positionFaceUpSums[0] % 2 === 0;
    let allSameParity = true;
    
    for (let i = 1; i < positionFaceUpSums.length; i++) {
      const currentSumIsEven = positionFaceUpSums[i] % 2 === 0;
      if (currentSumIsEven !== firstSumIsEven) {
        allSameParity = false;
        break;
      }
    }
    
    console.log("Double-check in display: Pattern achievable:", allSameParity);
    console.log("Position+Value+FaceUp sums:", positionFaceUpSums);
    
    // Now display the calculation values for each card
    for (let i = 0; i < targetCards.length; i++) {
      const targetCard = targetCards[i];
      const cardElement = targetCard.element;
      
      // Remove any existing card info
      const existingInfo = cardElement.querySelector('.card-info');
      if (existingInfo) {
        existingInfo.remove();
      }
      
      // Remove any existing formula
      const existingFormula = cardElement.querySelector('.card-formula');
      if (existingFormula) {
        existingFormula.remove();
      }
      
      // Calculate values for display
      const position = i + 1; // 1-indexed position
      const value = parseInt(targetCard.number);
      const faceUpValue = targetCard.faceUp ? 1 : 0;
      
      // Calculate sums
      const positionFaceUpSum = position + value + faceUpValue;
      const totalSum = position + value + faceUpValue;
      
      // Create and append the formula element (above the card)
      const formulaElement = document.createElement('div');
      formulaElement.className = 'card-formula';
      formulaElement.textContent = `${position}+${value}+${faceUpValue}`;
      cardElement.appendChild(formulaElement);
      
      // Create and append the total element (below the card)
      const infoElement = document.createElement('div');
      infoElement.className = 'card-info';
      infoElement.textContent = `${totalSum}`;
      cardElement.appendChild(infoElement);
    }
  }
  
  // Handle "This seems impossible" button click
  function handleImpossibleClick() {
    if (isAnimating) return;
    
    // Show the calculation values below each target card
    showCalculationValues();
    
    // Use the same logic as in isPatternAchievable
    const achievable = isPatternAchievable();
    
    if (achievable) {
      showResult('error', 'Sorry, this pattern is actually achievable! You lost this round. Try again!');
    } else {
      showResult('success', 'You\'re right! This pattern is impossible to achieve. Good job spotting it!');
    }
  }
  
  // Show result message
  function showResult(type, message) {
    resultMessage.textContent = message;
    resultMessage.className = '';
    resultMessage.classList.add(type);
    
    // Add a "Try Again" button if not already present
    if (!document.getElementById('try-again-btn')) {
      const tryAgainBtn = document.createElement('button');
      tryAgainBtn.id = 'try-again-btn';
      tryAgainBtn.textContent = 'Try Again';
      tryAgainBtn.addEventListener('click', resetGame);
      resultMessage.appendChild(document.createElement('br'));
      resultMessage.appendChild(tryAgainBtn);
    }
    
    // Disable game controls
    cutFlipBtn.disabled = true;
    impossibleBtn.disabled = true;
  }
  
  // Reset game
  function resetGame() {
    if (isAnimating) return;
    
    moves = 0;
    movesCounter.textContent = `Moves: ${moves}`;
    resultMessage.textContent = '';
    resultMessage.className = '';
    
    // Clear all card info displays
    document.querySelectorAll('.card-info').forEach(el => el.remove());
    document.querySelectorAll('.card-formula').forEach(el => el.remove());
    
    createPlayerDeck();
    createTargetDeck();
    
    // Re-enable controls
    cutFlipBtn.disabled = false;
    impossibleBtn.disabled = false;
  }
  
  // Event listeners
  cutFlipBtn.addEventListener('click', cutAndFlipAction);
  resetBtn.addEventListener('click', resetGame);
  impossibleBtn.addEventListener('click', handleImpossibleClick);
  
  // Initial setup
  resetGame();
});