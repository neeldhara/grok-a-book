document.addEventListener('DOMContentLoaded', function() {
  // Card container and controls
  const cardContainer = document.getElementById('card-container');
  const initializeBtn = document.getElementById('initialize-btn');
  const cutFlipBtn = document.getElementById('cut-flip-btn');
  const finalizeBtn = document.getElementById('finalize-btn');
  const resetBtn = document.getElementById('reset-btn');
  const toggleStateBtn = document.getElementById('toggle-state-btn');
  const cutFlipControls = document.getElementById('cut-flip-controls');
  const cutSlider = document.getElementById('cut-slider');
  const sliderValue = document.getElementById('slider-value');
  
  // Update slider value display
  cutSlider.addEventListener('input', function() {
    sliderValue.textContent = this.value;
  });
  
  // Card deck setup
  const suits = ['hearts', 'diamonds', 'clubs', 'spades'];
  const values = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
  let deck = [];
  let cards = [];
  let originalBottomCard = null; // Store the original bottom card
  
  // Set up all event listeners
  initializeBtn.addEventListener('click', initializeAction);
  cutFlipBtn.addEventListener('click', cutAndFlipAction);
  finalizeBtn.addEventListener('click', finalizeAction);
  resetBtn.addEventListener('click', resetDeck);
  toggleStateBtn.addEventListener('click', toggleAllCardsState);
  
  // Create and initialize the deck
  function createDeck() {
    // Clear previous cards
    cardContainer.innerHTML = '';
    cards = [];
    
    // Create full deck
    deck = [];
    for (let suit of suits) {
      for (let value of values) {
        deck.push({ suit, value });
      }
    }
    
    // Shuffle and select 4 cards
    const shuffledDeck = shuffleDeck([...deck]);
    const selectedCards = shuffledDeck.slice(0, 4);
    
    // Store the original bottom card (index 3 in a 4-card deck)
    originalBottomCard = selectedCards[3];
    
    // Update the bottom card info display
    updateBottomCardInfo();
    
    // Create card elements
    selectedCards.forEach((card, index) => {
      const cardElement = createCardElement(card, index);
      cardContainer.appendChild(cardElement);
      cards.push({ 
        element: cardElement, 
        data: card, 
        faceUp: false,
        position: index
      });
    });
    
    // Reset button states
    resetButtonStates();
  }
  
  // Update the bottom card info display
  function updateBottomCardInfo() {
    const bottomCardInfo = document.getElementById('bottom-card-info');
    if (originalBottomCard) {
      const suitSymbol = getSuitSymbol(originalBottomCard.suit);
      const color = originalBottomCard.suit === 'hearts' || originalBottomCard.suit === 'diamonds' ? 'red' : 'black';
      bottomCardInfo.innerHTML = `The original bottom card was <span style="color: ${color}; font-weight: bold;">${originalBottomCard.value}${suitSymbol}</span>`;
    } else {
      bottomCardInfo.textContent = '';
    }
  }
  
  // Create a card element
  function createCardElement(card, index) {
    const cardElement = document.createElement('div');
    cardElement.className = 'card';
    cardElement.dataset.index = index;
    cardElement.style.width = '100px';
    cardElement.style.height = '140px';
    cardElement.style.margin = '0 10px';
    cardElement.style.backgroundColor = '#2c3e50';
    cardElement.style.borderRadius = '10px';
    cardElement.style.position = 'relative';
    cardElement.style.boxShadow = '0 4px 8px rgba(0,0,0,0.2)';
    cardElement.style.cursor = 'pointer';
    cardElement.style.transition = 'transform 0.6s, top 0.5s, left 0.5s';
    cardElement.style.transformStyle = 'preserve-3d';
    
    // Create face side
    const faceSide = document.createElement('div');
    faceSide.className = 'card-face';
    faceSide.style.position = 'absolute';
    faceSide.style.width = '100%';
    faceSide.style.height = '100%';
    faceSide.style.backfaceVisibility = 'hidden';
    faceSide.style.backgroundColor = 'white';
    faceSide.style.borderRadius = '10px';
    faceSide.style.display = 'flex';
    faceSide.style.flexDirection = 'column';
    faceSide.style.justifyContent = 'center';
    faceSide.style.alignItems = 'center';
    faceSide.style.transform = 'rotateY(180deg)';
    
    // Set card face content
    const color = card.suit === 'hearts' || card.suit === 'diamonds' ? 'red' : 'black';
    const suitSymbol = getSuitSymbol(card.suit);
    
    faceSide.innerHTML = `
      <div style="font-size: 24px; color: ${color}; font-weight: bold;">${card.value}</div>
      <div style="font-size: 30px; color: ${color};">${suitSymbol}</div>
    `;
    
    // Create back side
    const backSide = document.createElement('div');
    backSide.className = 'card-back';
    backSide.style.position = 'absolute';
    backSide.style.width = '100%';
    backSide.style.height = '100%';
    backSide.style.backfaceVisibility = 'hidden';
    backSide.style.backgroundColor = '#2c3e50';
    backSide.style.borderRadius = '10px';
    backSide.style.backgroundImage = 'repeating-linear-gradient(45deg, #3498db, #3498db 10px, #2c3e50 10px, #2c3e50 20px)';
    
    // Add faces to card
    cardElement.appendChild(faceSide);
    cardElement.appendChild(backSide);
    
    // Add click event - still allow manual flipping
    cardElement.addEventListener('click', function() {
      if (!isAnimating) {
        // Use the current index from the cards array instead of the data attribute
        const currentIndex = cards.findIndex(card => card.element === this);
        if (currentIndex !== -1) {
          flipCard(currentIndex);
        }
      }
    });
    
    return cardElement;
  }
  
  // Add position labels to cards
  function addPositionLabels() {
    // Labels are now outside the cards, no need to add them here
  }
  
  // Reset button states
  function resetButtonStates() {
    initializeBtn.disabled = false;
    cutFlipBtn.disabled = true; // Start with cut/flip disabled until initialize happens
    finalizeBtn.disabled = true; // Start with finalize disabled
    cutFlipCount = 0; // Reset the counter
    hideCutFlipControls();
  }
  
  // Shuffle function
  function shuffleDeck(deck) {
    for (let i = deck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [deck[i], deck[j]] = [deck[j], deck[i]];
    }
    return deck;
  }
  
  // Get suit symbol
  function getSuitSymbol(suit) {
    switch(suit) {
      case 'hearts': return '♥';
      case 'diamonds': return '♦';
      case 'clubs': return '♣';
      case 'spades': return '♠';
    }
  }
  
  // Animation flag
  let isAnimating = false;
  let cutFlipCount = 0;
  
  // Flip a card (toggle face up/down)
  function flipCard(index) {
    const card = cards[index];
    card.faceUp = !card.faceUp;
    card.element.style.transform = card.faceUp ? 'rotateY(180deg)' : '';
  }
  
  // Move a card from position x to position y with animation
  function moveCard(fromIndex, toIndex) {
    return new Promise(resolve => {
      isAnimating = true;
      
      // For the initialize action (top card to bottom)
      if (fromIndex === 0 && toIndex === cards.length - 1) {
        // Clone the cards for animation
        const cardElements = [];
        const cardPositions = [];
        
        // Create a wrapper for animation that won't affect layout
        const animationWrapper = document.createElement('div');
        animationWrapper.style.position = 'absolute';
        animationWrapper.style.top = '0';
        animationWrapper.style.left = '0';
        animationWrapper.style.width = '100%';
        animationWrapper.style.height = '100%';
        animationWrapper.style.pointerEvents = 'none';
        cardContainer.appendChild(animationWrapper);
        
        // Clone each card and position it exactly over the original
        cards.forEach((card, idx) => {
          const rect = card.element.getBoundingClientRect();
          const containerRect = cardContainer.getBoundingClientRect();
          
          // Create clone
          const clone = card.element.cloneNode(true);
          clone.style.position = 'absolute';
          clone.style.top = `${rect.top - containerRect.top}px`;
          clone.style.left = `${rect.left - containerRect.left}px`;
          clone.style.width = `${rect.width}px`;
          clone.style.height = `${rect.height}px`;
          clone.style.margin = '0';
          clone.style.zIndex = idx === 0 ? '100' : '10';
          
          // Store position
          cardPositions.push({
            top: rect.top - containerRect.top,
            left: rect.left - containerRect.left
          });
          
          // Add to animation wrapper
          cardElements.push(clone);
          animationWrapper.appendChild(clone);
        });
        
        // Hide original cards during animation
        cards.forEach(card => {
          card.element.style.visibility = 'hidden';
        });
        
        // Animation timing
        const step1Duration = 300; // Top card moves up
        const step2Duration = 300; // Cards shift left
        const step3Duration = 300; // Top card moves right and down
        const totalDuration = step1Duration + step2Duration + step3Duration;
        
        // Get card height for animation
        const cardHeight = cardElements[0].getBoundingClientRect().height;
        const moveUpDistance = cardHeight * 1.2; // 120% of card height
        
        // Step 1: Top card moves up
        setTimeout(() => {
          cardElements[0].style.transition = `top ${step1Duration}ms ease-out`;
          cardElements[0].style.top = `${cardPositions[0].top - moveUpDistance}px`;
        }, 10);
        
        // Step 2: Cards 2, 3, 4 move left one spot
        setTimeout(() => {
          for (let i = 1; i < cardElements.length; i++) {
            cardElements[i].style.transition = `left ${step2Duration}ms ease-in-out`;
            // Each card moves to the position of the card to its left
            cardElements[i].style.left = `${cardPositions[i-1].left}px`;
          }
        }, step1Duration + 10);
        
        // Step 3: Top card moves right and down into last position
        setTimeout(() => {
          // First move right
          cardElements[0].style.transition = `left ${step3Duration/2}ms ease-in-out`;
          cardElements[0].style.left = `${cardPositions[cardPositions.length-1].left}px`;
          
          // Then move down
          setTimeout(() => {
            cardElements[0].style.transition = `top ${step3Duration/2}ms ease-in`;
            cardElements[0].style.top = `${cardPositions[cardPositions.length-1].top}px`;
          }, step3Duration/2);
        }, step1Duration + step2Duration + 10);
        
        // After animation completes, update the actual cards
        setTimeout(() => {
          // Remove animation wrapper
          animationWrapper.remove();
          
          // Rearrange cards in the array
          const cardToMove = cards.splice(fromIndex, 1)[0];
          cards.splice(toIndex, 0, cardToMove);
          
          // Physically rearrange the cards in the DOM
          cardContainer.innerHTML = '';
          cards.forEach((card, idx) => {
            card.position = idx;
            card.element.style.visibility = 'visible';
            card.element.style.position = 'relative';
            card.element.style.top = '';
            card.element.style.left = '';
            card.element.style.zIndex = '';
            card.element.style.transition = '';
            cardContainer.appendChild(card.element);
          });
          
          isAnimating = false;
          resolve();
        }, totalDuration + 100);
      } else {
        // For other card movements, use a simpler approach
        // Clone the card we're moving
        const fromCard = cards[fromIndex];
        const toCard = cards[toIndex];
        
        const fromRect = fromCard.element.getBoundingClientRect();
        const toRect = toCard.element.getBoundingClientRect();
        const containerRect = cardContainer.getBoundingClientRect();
        
        // Create a clone for animation
        const clone = fromCard.element.cloneNode(true);
        clone.style.position = 'absolute';
        clone.style.top = `${fromRect.top - containerRect.top}px`;
        clone.style.left = `${fromRect.left - containerRect.left}px`;
        clone.style.width = `${fromRect.width}px`;
        clone.style.height = `${fromRect.height}px`;
        clone.style.margin = '0';
        clone.style.zIndex = '100';
        
        // Create animation wrapper
        const animationWrapper = document.createElement('div');
        animationWrapper.style.position = 'absolute';
        animationWrapper.style.top = '0';
        animationWrapper.style.left = '0';
        animationWrapper.style.width = '100%';
        animationWrapper.style.height = '100%';
        animationWrapper.style.pointerEvents = 'none';
        animationWrapper.appendChild(clone);
        cardContainer.appendChild(animationWrapper);
        
        // Hide original card
        fromCard.element.style.visibility = 'hidden';
        
        // Animate the clone
        setTimeout(() => {
          clone.style.transition = 'all 0.4s ease-in-out';
          clone.style.top = `${toRect.top - containerRect.top}px`;
          clone.style.left = `${toRect.left - containerRect.left}px`;
          
          // After animation completes
          setTimeout(() => {
            // Remove animation wrapper
            animationWrapper.remove();
            
            // Rearrange cards in the array
            const cardToMove = cards.splice(fromIndex, 1)[0];
            cards.splice(toIndex, 0, cardToMove);
            
            // Physically rearrange the cards in the DOM
            cardContainer.innerHTML = '';
            cards.forEach((card, idx) => {
              card.position = idx;
              card.element.style.visibility = 'visible';
              card.element.style.position = 'relative';
              card.element.style.top = '';
              card.element.style.left = '';
              card.element.style.zIndex = '';
              card.element.style.transition = '';
              cardContainer.appendChild(card.element);
            });
            
            isAnimating = false;
            resolve();
          }, 500);
        }, 10);
      }
    });
  }

  // Move multiple cards from top to bottom
  async function moveMultipleCards(fromIndex, count) {
    return new Promise(resolve => {
      if (isAnimating) {
        resolve();
        return;
      }
      
      isAnimating = true;
      
      // Create a wrapper for animation that won't affect layout
      const animationWrapper = document.createElement('div');
      animationWrapper.style.position = 'absolute';
      animationWrapper.style.top = '0';
      animationWrapper.style.left = '0';
      animationWrapper.style.width = '100%';
      animationWrapper.style.height = '100%';
      animationWrapper.style.pointerEvents = 'none';
      cardContainer.appendChild(animationWrapper);
      
      // Store card positions and create clones
      const cardPositions = [];
      const cardElements = [];
      
      // Clone each card and position it exactly over the original
      cards.forEach((card, idx) => {
        const rect = card.element.getBoundingClientRect();
        const containerRect = cardContainer.getBoundingClientRect();
        
        // Create clone
        const clone = card.element.cloneNode(true);
        clone.style.position = 'absolute';
        clone.style.top = `${rect.top - containerRect.top}px`;
        clone.style.left = `${rect.left - containerRect.left}px`;
        clone.style.width = `${rect.width}px`;
        clone.style.height = `${rect.height}px`;
        clone.style.margin = '0';
        
        // Give higher z-index to cards being moved
        if (idx < count) {
          clone.style.zIndex = '100';
        } else {
          clone.style.zIndex = '10';
        }
        
        // Store position
        cardPositions.push({
          top: rect.top - containerRect.top,
          left: rect.left - containerRect.left
        });
        
        // Add to animation wrapper
        cardElements.push(clone);
        animationWrapper.appendChild(clone);
      });
      
      // Hide original cards during animation
      cards.forEach(card => {
        card.element.style.visibility = 'hidden';
      });
      
      // Animation timing
      const step1Duration = 300; // Cards move up
      const step2Duration = 300; // Remaining cards shift left
      const step3Duration = 300; // Lifted cards move right and down
      const totalDuration = step1Duration + step2Duration + step3Duration;
      
      // Get card height for animation
      const cardHeight = cardElements[0].getBoundingClientRect().height;
      const moveUpDistance = cardHeight * 1.2; // 120% of card height
      
      // Step 1: Top cards move up together
      setTimeout(() => {
        for (let i = 0; i < count; i++) {
          cardElements[i].style.transition = `top ${step1Duration}ms ease-out`;
          cardElements[i].style.top = `${cardPositions[i].top - moveUpDistance}px`;
          
          // Stagger the cards slightly when multiple are lifted
          if (i > 0) {
            // Distribute cards evenly with a consistent spacing
            const offsetX = 10; // Smaller horizontal offset for more even spacing
            cardElements[i].style.left = `${cardPositions[i].left + (offsetX * i)}px`;
            // Slightly stagger the vertical position for a fan effect
            cardElements[i].style.top = `${cardPositions[i].top - moveUpDistance + (5 * i)}px`;
          }
        }
      }, 10);
      
      // Step 2: Remaining cards shift left
      setTimeout(() => {
        for (let i = count; i < cardElements.length; i++) {
          cardElements[i].style.transition = `left ${step2Duration}ms ease-in-out`;
          // Each card moves to the position of the card 'count' positions to its left
          const newPosition = i - count;
          if (newPosition >= 0) {
            cardElements[i].style.left = `${cardPositions[newPosition].left}px`;
          }
        }
      }, step1Duration + 10);
      
      // Step 3: Lifted cards move right and down into final positions
      setTimeout(() => {
        for (let i = 0; i < count; i++) {
          // Calculate the target position (at the end of the deck)
          const targetIndex = cardElements.length - count + i;
          
          // First move right
          cardElements[i].style.transition = `left ${step3Duration/2}ms ease-in-out`;
          cardElements[i].style.left = `${cardPositions[targetIndex].left}px`;
          
          // Then move down (with a small delay for each card)
          setTimeout(() => {
            cardElements[i].style.transition = `top ${step3Duration/2}ms ease-in`;
            cardElements[i].style.top = `${cardPositions[targetIndex].top}px`;
          }, step3Duration/2 + (i * 50)); // Staggered timing
        }
      }, step1Duration + step2Duration + 10);
      
      // After animation completes, update the actual cards
      setTimeout(() => {
        // Remove animation wrapper
        animationWrapper.remove();
        
        // Rearrange cards in the array
        const cardsToMove = cards.splice(fromIndex, count);
        cards.push(...cardsToMove);
        
        // Physically rearrange the cards in the DOM
        cardContainer.innerHTML = '';
        cards.forEach((card, idx) => {
          card.position = idx;
          card.element.style.visibility = 'visible';
          cardContainer.appendChild(card.element);
        });
        
        isAnimating = false;
        resolve();
      }, totalDuration + 100);
    });
  }

  // Initialize action: move top card to bottom
  async function initializeAction() {
    if (isAnimating) return;
    
    // Move the top card to the bottom
    await moveCard(0, cards.length - 1);
    
    // Flip the new top card
    await flipCard(0);
    
    // Disable initialize button and enable cut/flip
    initializeBtn.disabled = true;
    cutFlipBtn.disabled = false;
    finalizeBtn.disabled = false;
    
    // Show cut and flip controls
    showCutFlipControls();
  }
  
  // Show cut and flip controls
  function showCutFlipControls() {
    if (isAnimating) return;
    
    // Set slider to a random value
    const randomValue = Math.floor(Math.random() * 4); // Random number 0-3
    cutSlider.value = randomValue;
    sliderValue.textContent = randomValue;
    
    cutFlipControls.style.display = 'flex';
    cutFlipControls.style.flexDirection = 'column';
    cutFlipControls.style.alignItems = 'center';
  }
  
  // Hide cut and flip controls
  function hideCutFlipControls() {
    cutFlipControls.style.display = 'none';
  }
  
  // Cut and flip action
  async function cutAndFlipAction() {
    if (isAnimating) return;
    
    const cutValue = parseInt(cutSlider.value);
    
    // Move cards based on cut value
    if (cutValue > 0) {
      await moveMultipleCards(0, cutValue);
    }
    
    // Flip and swap the top two cards with enhanced animation
    await flipAndSwapTopTwo();
    
    // Increment the cut/flip count
    cutFlipCount++;
    
    // Update the counter display
    cutFlipBtn.textContent = `Cut and Flip (${cutFlipCount})`;
    
    // Set slider to a new random value for next time
    const randomValue = Math.floor(Math.random() * 4); // Random number 0-3
    cutSlider.value = randomValue;
    sliderValue.textContent = randomValue;
  }
  
  // Enhanced animation: Lift, flip, and swap the top two cards
  async function flipAndSwapTopTwo() {
    return new Promise(resolve => {
      if (isAnimating) {
        resolve();
        return;
      }
      
      isAnimating = true;
      
      // Create a wrapper for animation that won't affect layout
      const animationWrapper = document.createElement('div');
      animationWrapper.style.position = 'absolute';
      animationWrapper.style.top = '0';
      animationWrapper.style.left = '0';
      animationWrapper.style.width = '100%';
      animationWrapper.style.height = '100%';
      animationWrapper.style.pointerEvents = 'none';
      cardContainer.appendChild(animationWrapper);
      
      // Store card positions and create clones
      const cardPositions = [];
      const cardElements = [];
      
      // Clone each card and position it exactly over the original
      cards.forEach((card, idx) => {
        const rect = card.element.getBoundingClientRect();
        const containerRect = cardContainer.getBoundingClientRect();
        
        // Create clone
        const clone = card.element.cloneNode(true);
        clone.style.position = 'absolute';
        clone.style.top = `${rect.top - containerRect.top}px`;
        clone.style.left = `${rect.left - containerRect.left}px`;
        clone.style.width = `${rect.width}px`;
        clone.style.height = `${rect.height}px`;
        clone.style.margin = '0';
        
        // Apply the current face-up/face-down state of the card
        const cloneFace = clone.querySelector('.card-face');
        const cloneBack = clone.querySelector('.card-back');
        
        if (card.faceUp) {
          clone.style.transform = 'rotateY(180deg)';
          cloneFace.style.display = 'flex';
          cloneBack.style.display = 'block';
        } else {
          clone.style.transform = '';
          cloneFace.style.display = 'flex';
          cloneBack.style.display = 'block';
        }
        
        // Give higher z-index to cards being animated
        if (idx < 2) {
          clone.style.zIndex = idx === 0 ? '100' : '99';
        } else {
          clone.style.zIndex = '10';
        }
        
        // Store position
        cardPositions.push({
          top: rect.top - containerRect.top,
          left: rect.left - containerRect.left
        });
        
        // Add to animation wrapper
        cardElements.push(clone);
        animationWrapper.appendChild(clone);
      });
      
      // Hide original cards during animation
      cards.forEach(card => {
        card.element.style.visibility = 'hidden';
      });
      
      // Animation timing
      const liftDuration = 300;      // Cards move up
      const flipDuration = 400;      // Cards flip over
      const settleDuration = 300;    // Cards settle down in new positions
      const totalDuration = liftDuration + flipDuration + settleDuration + 100;
      
      // Get card height for animation
      const cardHeight = cardElements[0].getBoundingClientRect().height;
      const moveUpDistance = cardHeight * 1.2; // 120% of card height
      
      // Step 1: Lift the top two cards
      setTimeout(() => {
        // First card
        cardElements[0].style.transition = `top ${liftDuration}ms ease-out`;
        cardElements[0].style.top = `${cardPositions[0].top - moveUpDistance}px`;
        // Add a slight left movement to make room
        cardElements[0].style.left = `${cardPositions[0].left - 10}px`;
        
        // Second card
        cardElements[1].style.transition = `top ${liftDuration}ms ease-out`;
        cardElements[1].style.top = `${cardPositions[1].top - moveUpDistance * 0.9}px`;
        // Add a slight right movement to make room
        cardElements[1].style.left = `${cardPositions[1].left + 10}px`;
      }, 10);
      
      // Step 2: Flip the cards
      setTimeout(() => {
        // Flip animation using rotateY transform
        const flip = (element, idx) => {
          // Get original state
          const isCurrentlyFaceUp = cards[idx].faceUp;
          
          // Set transition for smooth rotation
          element.style.transition = `transform ${flipDuration}ms ease-in-out`;
          
          // Apply the flip transform
          if (isCurrentlyFaceUp) {
            // If currently face up, flip to face down
            element.style.transform = '';
          } else {
            // If currently face down, flip to face up
            element.style.transform = 'rotateY(180deg)';
          }
        };
        
        // Flip both cards with a slight delay between them
        flip(cardElements[0], 0);
        setTimeout(() => flip(cardElements[1], 1), 150);
      }, liftDuration + 50);
      
      // Step 3: Swap positions and settle down
      setTimeout(() => {
        // First card moves to second position
        cardElements[0].style.transition = `top ${settleDuration}ms ease-in, left ${settleDuration}ms ease-in-out`;
        cardElements[0].style.top = `${cardPositions[1].top}px`;
        cardElements[0].style.left = `${cardPositions[1].left}px`;
        
        // Second card moves to first position
        cardElements[1].style.transition = `top ${settleDuration}ms ease-in, left ${settleDuration}ms ease-in-out`;
        cardElements[1].style.top = `${cardPositions[0].top}px`;
        cardElements[1].style.left = `${cardPositions[0].left}px`;
      }, liftDuration + flipDuration + 50);
      
      // After animation completes, update the actual cards
      setTimeout(() => {
        // Remove animation wrapper
        animationWrapper.remove();
        
        // Flip card states
        cards[0].faceUp = !cards[0].faceUp;
        cards[1].faceUp = !cards[1].faceUp;
        
        // Swap the cards in the array
        [cards[0], cards[1]] = [cards[1], cards[0]];
        
        // Physically rearrange the cards in the DOM and update visibility
        cardContainer.innerHTML = '';
        cards.forEach((card, idx) => {
          card.position = idx;
          
          // Apply the correct transform based on face-up state
          card.element.style.transform = card.faceUp ? 'rotateY(180deg)' : '';
          
          card.element.style.visibility = 'visible';
          cardContainer.appendChild(card.element);
        });
        
        isAnimating = false;
        resolve();
      }, totalDuration);
    });
  }
  
  // Toggle the face-up/face-down state of all cards
  async function toggleAllCardsState() {
    if (isAnimating) return;
    
    isAnimating = true;
    
    // Sequential flipping with slight delay
    for (let i = 0; i < cards.length; i++) {
      await new Promise(resolve => {
        setTimeout(() => {
          flipCard(i);
          resolve();
        }, 150); // 150ms delay between each card flip
      });
    }
    
    isAnimating = false;
  }
  
  // Finalize action
  async function finalizeAction() {
    if (isAnimating) return;
    
    // 1. Turn the top card over and put it on the bottom
    await flipCard(0);
    await moveCard(0, cards.length - 1);
    
    // 2. Put current top card on bottom without flipping
    await moveCard(0, cards.length - 1);
    
    // 3. Turn the top card over and place it back on top
    await flipCard(0);
    
    // Disable all buttons except reset
    initializeBtn.disabled = true;
    cutFlipBtn.disabled = true;
    finalizeBtn.disabled = true;
    
    // Keep the cut/flip controls visible but disable interaction
    cutSlider.disabled = true;
  }
  
  // Reset the deck
  function resetDeck() {
    if (isAnimating) return;
    
    createDeck();
    
    // Update bottom card info when resetting
    updateBottomCardInfo();
  }
  
  // Initial setup
  createDeck();
});