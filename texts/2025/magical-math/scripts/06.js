document.addEventListener('DOMContentLoaded', function() {
  // DOM elements
  const dnaInput = document.getElementById('dna-input');
  const clearBtn = document.getElementById('clear-btn');
  const exampleBtn = document.getElementById('example-btn');
  const prevBtn = document.getElementById('prev-btn');
  const playPauseBtn = document.getElementById('play-pause-btn');
  const nextBtn = document.getElementById('next-btn');
  const resetBtn = document.getElementById('reset-btn');
  const errorMessage = document.getElementById('error-message');
  const sequenceDisplay = document.getElementById('sequence-display');
  const triplesGrid = document.getElementById('triples-grid');
  const walkResult = document.getElementById('walk-result');
  const graphSvg = document.getElementById('graph-svg');

  // Constants
  const NUCLEOTIDES = ['A', 'C', 'G', 'T'];
  const EXAMPLE_SEQUENCE = 'AACTCCAGTATGGC';
  const ANIMATION_DELAY = 800; // milliseconds

  // Graph data
  let graph = {
    nodes: [],
    links: []
  };
  
  // Euler walk state
  let eulerPath = [];
  let currentPathIndex = -1;
  let animationTimers = [];
  let isPlaying = false;
  let walkInitialized = false;
  
  // Initialize the application
  init();

  function init() {
    // Set up event listeners
    dnaInput.addEventListener('input', validateInput);
    clearBtn.addEventListener('click', clearAll);
    exampleBtn.addEventListener('click', loadExample);
    playPauseBtn.addEventListener('click', togglePlayPause);
    prevBtn.addEventListener('click', previousStep);
    nextBtn.addEventListener('click', nextStep);
    resetBtn.addEventListener('click', resetWalk);
    
    // Initialize with empty graph
    initializeEmptyGraph();
    drawGraph();
    createEmptyGrid();
    
    // Initialize walk controls
    updateWalkControls();
    
    // Initialize the sequence display with an empty box
    sequenceDisplay.innerHTML = '';
  }

  function validateInput() {
    const input = dnaInput.value.toUpperCase();
    dnaInput.value = input;
    
    // Reset walk state when input changes
    if (walkInitialized) {
      resetWalk();
    }
    
    // Check if input contains only valid nucleotides
    const invalidChars = input.split('').filter(char => !NUCLEOTIDES.includes(char));
    
    if (invalidChars.length > 0) {
      showError(`Invalid characters: ${invalidChars.join(', ')}. Please use only A, C, G, and T.`);
      return;
    }
    
    hideError();
    
    // Display the sequence
    displaySequence(input);
    
    // Update the graph and grid based on the input
    if (input.length >= 3) {
      updateGraphRealTime(input);
      highlightTriplets(input);
    } else {
      // If sequence is too short, show empty graph with just nodes
      initializeEmptyGraph();
      drawGraph();
      createEmptyGrid();
      updateWalkControls(); // Update controls even for empty graph
    }
  }

  function showError(message) {
    errorMessage.textContent = message;
    errorMessage.classList.remove('hidden');
  }

  function hideError() {
    errorMessage.classList.add('hidden');
  }

  function displaySequence(sequence) {
    sequenceDisplay.innerHTML = '';
    
    for (let i = 0; i < sequence.length; i++) {
      const nucleotide = sequence[i];
      const span = document.createElement('span');
      span.className = `nucleotide nucleotide-${nucleotide}`;
      span.textContent = nucleotide;
      span.dataset.position = i;
      sequenceDisplay.appendChild(span);
    }
  }

  function createEmptyGrid() {
    triplesGrid.innerHTML = '';
    
    // Create a 16x4 grid
    const pairs = [];
    for (const nuc1 of NUCLEOTIDES) {
      for (const nuc2 of NUCLEOTIDES) {
        pairs.push(nuc1 + nuc2);
      }
    }
    
    // Sort pairs to ensure consistent order
    pairs.sort();
    
    // Create grid cells
    for (let i = 0; i < 16; i++) {
      for (let j = 0; j < 4; j++) {
        const cellIndex = i * 4 + j;
        if (cellIndex < 64) { // Ensure we don't exceed the number of possible triplets
          const cell = document.createElement('div');
          cell.className = 'grid-cell';
          
          // Create the triplet label (pair + nucleotide)
          const pair = pairs[i];
          const nucleotide = NUCLEOTIDES[j];
          const triplet = pair + nucleotide;
          
          cell.textContent = triplet;
          cell.dataset.triplet = triplet;
          
          triplesGrid.appendChild(cell);
        }
      }
    }
  }

  function highlightTriplets(sequence) {
    // Clear previous highlights
    const tripletCells = document.querySelectorAll('.grid-cell');
    tripletCells.forEach(cell => {
      cell.classList.remove('highlighted');
    });
    
    // Highlight cells for each triplet in the sequence
    for (let i = 0; i <= sequence.length - 3; i++) {
      const triplet = sequence.substring(i, i + 3);
      const cell = document.querySelector(`.grid-cell[data-triplet="${triplet}"]`);
      
      if (cell) {
        cell.classList.add('highlighted');
      }
    }
  }

  function createEmptyGraph() {
    // Clear SVG
    while (graphSvg.firstChild) {
      graphSvg.removeChild(graphSvg.firstChild);
    }
    
    // Reset graph data
    graph = {
      nodes: [],
      links: []
    };
  }

  function initializeEmptyGraph() {
    createEmptyGraph();
    
    // Create nodes for all possible pairs
    const pairs = [];
    for (const nuc1 of NUCLEOTIDES) {
      for (const nuc2 of NUCLEOTIDES) {
        const pair = nuc1 + nuc2;
        pairs.push(pair);
        graph.nodes.push({
          id: pair,
          label: pair
        });
      }
    }
  }

  function createGraph(sequence) {
    createEmptyGraph();
    
    // Create nodes for all possible pairs
    const pairs = [];
    for (const nuc1 of NUCLEOTIDES) {
      for (const nuc2 of NUCLEOTIDES) {
        const pair = nuc1 + nuc2;
        pairs.push(pair);
        graph.nodes.push({
          id: pair,
          label: pair
        });
      }
    }
    
    // Create links based on triplets in the sequence
    for (let i = 0; i <= sequence.length - 3; i++) {
      const triplet = sequence.substring(i, i + 3);
      const sourcePair = triplet.substring(0, 2);
      const targetPair = triplet.substring(1, 3);
      
      // Check if this link already exists
      const existingLink = graph.links.find(link => 
        link.source === sourcePair && link.target === targetPair
      );
      
      if (!existingLink) {
        graph.links.push({
          source: sourcePair,
          target: targetPair
        });
      }
    }
  }

  function updateGraphRealTime(sequence) {
    createEmptyGraph();
    
    // Create nodes for all possible pairs
    const pairs = [];
    for (const nuc1 of NUCLEOTIDES) {
      for (const nuc2 of NUCLEOTIDES) {
        const pair = nuc1 + nuc2;
        pairs.push(pair);
        graph.nodes.push({
          id: pair,
          label: pair
        });
      }
    }
    
    // Create links based on triplets in the sequence
    for (let i = 0; i <= sequence.length - 3; i++) {
      const triplet = sequence.substring(i, i + 3);
      const sourcePair = triplet.substring(0, 2);
      const targetPair = triplet.substring(1, 3);
      
      // Check if this link already exists
      const existingLink = graph.links.find(link => 
        link.source === sourcePair && link.target === targetPair
      );
      
      if (!existingLink) {
        graph.links.push({
          source: sourcePair,
          target: targetPair
        });
      }
    }
    
    drawGraph();
    updateWalkControls();
  }

  function drawGraph() {
    const svg = d3.select('#graph-svg');
    const width = svg.node().getBoundingClientRect().width;
    const height = svg.node().getBoundingClientRect().height;
    const radius = Math.min(width, height) * 0.4;
    const centerX = width / 2;
    const centerY = height / 2;
    
    // Clear previous content
    svg.selectAll('*').remove();
    
    // Create a group for the graph
    const g = svg.append('g')
      .attr('transform', `translate(${centerX}, ${centerY})`);
    
    // Create arrowhead markers
    svg.append('defs').append('marker')
      .attr('id', 'arrowhead')
      .attr('viewBox', '-0 -5 10 10')
      .attr('refX', 20)
      .attr('refY', 0)
      .attr('orient', 'auto')
      .attr('markerWidth', 6)
      .attr('markerHeight', 6)
      .attr('xoverflow', 'visible')
      .append('svg:path')
      .attr('d', 'M 0,-5 L 10 ,0 L 0,5')
      .attr('fill', '#e74c3c')
      .style('stroke', 'none');

    // Create arrowhead marker for highlighted links
    svg.append('defs').append('marker')
      .attr('id', 'arrowhead-highlight')
      .attr('viewBox', '-0 -5 10 10')
      .attr('refX', 20)
      .attr('refY', 0)
      .attr('orient', 'auto')
      .attr('markerWidth', 6)
      .attr('markerHeight', 6)
      .attr('xoverflow', 'visible')
      .append('svg:path')
      .attr('d', 'M 0,-5 L 10 ,0 L 0,5')
      .attr('fill', '#2ecc71')
      .style('stroke', 'none');
    
    // Calculate node positions in a circle
    const angleStep = (2 * Math.PI) / graph.nodes.length;
    graph.nodes.forEach((node, i) => {
      const angle = i * angleStep;
      node.x = radius * Math.cos(angle);
      node.y = radius * Math.sin(angle);
      node.angle = angle; // Store the angle for later use
    });
    
    // Create links
    const links = g.selectAll('.link')
      .data(graph.links)
      .enter()
      .append('path')
      .attr('class', 'link')
      .attr('d', d => {
        const source = graph.nodes.find(node => node.id === d.source);
        const target = graph.nodes.find(node => node.id === d.target);
        
        // Self-loop
        if (source.id === target.id) {
          const nodeRadius = 15; // Same as the circle radius
          const x = source.x;
          const y = source.y;
          const angle = source.angle;
          
          // Calculate points for the self-loop
          // Position the loop on the outside of the circle
          const startX = x + Math.cos(angle) * nodeRadius;
          const startY = y + Math.sin(angle) * nodeRadius;
          
          // Create a circular loop
          const loopRadius = 15;
          const loopCenterX = x + Math.cos(angle) * (nodeRadius + loopRadius);
          const loopCenterY = y + Math.sin(angle) * (nodeRadius + loopRadius);
          
          // Calculate start and end angles for the arc
          const startAngle = angle + Math.PI / 2;
          const endAngle = angle - Math.PI / 2;
          
          // Create an arc path
          const arcPath = d3.arc()
            .innerRadius(loopRadius)
            .outerRadius(loopRadius)
            .startAngle(startAngle)
            .endAngle(endAngle);
          
          // Translate the arc to the loop center
          return `M ${startX} ${startY} 
                  ${arcPath.toString().substring(1)}
                  translate(${loopCenterX}, ${loopCenterY})`;
        }
        
        // Regular link
        return `M ${source.x} ${source.y} L ${target.x} ${target.y}`;
      })
      .attr('marker-end', 'url(#arrowhead)');
    
    // Add self-loops as separate elements for better control
    graph.links.filter(d => d.source === d.target).forEach(d => {
      const node = graph.nodes.find(n => n.id === d.source);
      const x = node.x;
      const y = node.y;
      const angle = node.angle;
      const nodeRadius = 15;
      
      // Create a larger circle that sits slightly behind the node
      const circleRadius = 12;
      const circleDistance = nodeRadius + circleRadius - 2;
      const circleX = x + Math.cos(angle) * circleDistance;
      const circleY = y + Math.sin(angle) * circleDistance;
      
      // Draw a simple circle for self-loops
      g.append('circle')
        .attr('class', 'link self-loop')
        .attr('data-node-id', node.id)
        .attr('cx', circleX)
        .attr('cy', circleY)
        .attr('r', circleRadius)
        .attr('fill', 'none')
        .attr('stroke', '#e74c3c')
        .attr('stroke-width', 2);
    });
    
    // Create nodes
    const nodes = g.selectAll('.node')
      .data(graph.nodes)
      .enter()
      .append('g')
      .attr('class', 'node')
      .attr('transform', d => `translate(${d.x}, ${d.y})`);
    
    nodes.append('circle')
      .attr('r', 15);
    
    nodes.append('text')
      .text(d => d.label);
  }

  function startEulerWalk() {
    if (walkInitialized) {
      return;
    }
    
    walkInitialized = true;
    walkResult.textContent = '';
    
    if (graph.links.length === 0) {
      walkResult.textContent = 'No valid path found. Please enter a DNA sequence.';
      walkInitialized = false;
      return;
    }
    
    // Create an adjacency list representation of the graph
    const adjList = {};
    graph.nodes.forEach(node => {
      adjList[node.id] = [];
    });
    
    graph.links.forEach(link => {
      adjList[link.source].push({
        target: link.target
      });
    });
    
    // Calculate in-degree and out-degree for each node
    const inDegree = {};
    const outDegree = {};
    
    // Initialize degrees to zero
    graph.nodes.forEach(node => {
      inDegree[node.id] = 0;
      outDegree[node.id] = 0;
    });
    
    // Count degrees
    graph.links.forEach(link => {
      outDegree[link.source]++;
      inDegree[link.target]++;
    });
    
    // Find start and end nodes based on degree difference
    let startNode = null;
    let endNode = null;
    
    for (const nodeId in inDegree) {
      const inDeg = inDegree[nodeId];
      const outDeg = outDegree[nodeId];
      
      if (outDeg - inDeg === 1) {
        startNode = nodeId;
      } else if (inDeg - outDeg === 1) {
        endNode = nodeId;
      }
    }
    
    // If no special start/end nodes found, check for a node with outgoing edges
    if (!startNode) {
      // Look for any node with outgoing edges
      for (const nodeId in outDegree) {
        if (outDegree[nodeId] > 0) {
          startNode = nodeId;
          break;
        }
      }
    }
    
    if (!startNode) {
      walkResult.textContent = 'No valid Euler path found: no suitable start node.';
      walkInitialized = false;
      return;
    }
    
    // Find Euler path
    eulerPath = findEulerPath(adjList, startNode);
    
    if (eulerPath.length === 0) {
      walkResult.textContent = 'No valid Euler path found.';
      walkInitialized = false;
      return;
    }
    
    // Reset walk state
    resetWalkState();
    walkInitialized = true; // Set this again after resetWalkState
    
    // Enable walk controls
    prevBtn.disabled = true; // Initially disabled as we're at the start
    nextBtn.disabled = false;
    resetBtn.disabled = false;
    
    // Initialize with just the first node
    walkResult.textContent = eulerPath[0];
    
    // Start the animation
    isPlaying = true;
    playPauseBtn.textContent = 'Pause';
    playPauseBtn.classList.add('playing');
    animateEulerPath();
  }

  function animateEulerPath() {
    if (!isPlaying || currentPathIndex >= eulerPath.length - 1) {
      return;
    }
    
    // Move to the next step
    currentPathIndex++;
    
    // Update the visualization
    updateWalkDisplay();
    
    // Update button states
    prevBtn.disabled = false;
    nextBtn.disabled = currentPathIndex >= eulerPath.length - 1;
    
    // Stop playing if we've reached the end
    if (currentPathIndex >= eulerPath.length - 1) {
      isPlaying = false;
      playPauseBtn.textContent = 'Play';
      playPauseBtn.classList.remove('playing');
      return;
    }
    
    // Schedule the next step
    const timerId = setTimeout(animateEulerPath, ANIMATION_DELAY);
    animationTimers.push(timerId);
  }
  
  function nextStep() {
    if (!walkInitialized || currentPathIndex >= eulerPath.length - 1) {
      return;
    }
    
    currentPathIndex++;
    updateWalkDisplay();
    
    // Enable/disable buttons based on current position
    prevBtn.disabled = false;
    nextBtn.disabled = currentPathIndex >= eulerPath.length - 1;
  }
  
  function previousStep() {
    if (!walkInitialized || currentPathIndex <= 0) {
      return;
    }
    
    currentPathIndex--;
    updateWalkDisplay();
    
    // Enable/disable buttons based on current position
    prevBtn.disabled = currentPathIndex <= 0;
    nextBtn.disabled = false;
  }
  
  function togglePlayPause() {
    // If walk hasn't been initialized yet, start it
    if (!walkInitialized) {
      startEulerWalk();
      return;
    }
    
    isPlaying = !isPlaying;
    
    if (isPlaying) {
      playPauseBtn.textContent = 'Pause';
      playPauseBtn.classList.add('playing');
      animateEulerPath();
    } else {
      playPauseBtn.textContent = 'Play';
      playPauseBtn.classList.remove('playing');
      // Cancel any pending animations
      animationTimers.forEach(timerId => clearTimeout(timerId));
      animationTimers = [];
    }
  }
  
  function resetWalk() {
    resetWalkState();
    resetHighlights();
    
    // Disable walk controls except play
    prevBtn.disabled = true;
    nextBtn.disabled = true;
    resetBtn.disabled = true;
    
    // Re-enable the walk button
    walkInitialized = false;
  }
  
  function resetWalkState() {
    // Cancel any pending animations
    animationTimers.forEach(timerId => clearTimeout(timerId));
    animationTimers = [];
    
    // Reset state variables
    currentPathIndex = -1;
    isPlaying = false;
    
    // Reset UI
    playPauseBtn.textContent = 'Play';
    playPauseBtn.classList.remove('playing');
    walkResult.textContent = '';
  }
  
  function updateWalkDisplay() {
    // Clear previous highlights
    resetHighlights();
    
    // Apply highlights up to the current index
    for (let i = 0; i <= currentPathIndex; i++) {
      highlightPathSegment(i);
    }
    
    // Update the sequence display
    updateSequenceDisplay();
    
    // Update the walk result text
    if (currentPathIndex >= 0 && currentPathIndex < eulerPath.length) {
      const currentPath = eulerPath.slice(0, currentPathIndex + 1).join('');
      walkResult.textContent = currentPath;
    }
  }
  
  function updateSequenceDisplay() {
    if (currentPathIndex < 0) {
      walkResult.textContent = '';
      return;
    }
    
    // Start with the first node (which gives us two letters)
    let sequence = eulerPath[0];
    
    // Add the second character of each subsequent node up to the current index
    for (let i = 1; i <= currentPathIndex + 1 && i < eulerPath.length; i++) {
      sequence += eulerPath[i][1];
    }
    
    // Update the display
    walkResult.textContent = sequence;
  }
  
  function highlightPathSegment(index) {
    const svg = d3.select('#graph-svg');
    const source = eulerPath[index];
    const target = eulerPath[index + 1];
    
    // Highlight the source node (only on first step)
    if (index === 0) {
      svg.selectAll('.node')
        .filter(d => d.id === source)
        .classed('node-highlight', true);
    }
    
    // Find the corresponding link in the graph data
    const linkIndex = graph.links.findIndex(l => 
      l.source === source && l.target === target
    );
    
    if (linkIndex !== -1) {
      // For self-loops
      if (source === target) {
        svg.selectAll('.self-loop')
          .filter(function() {
            const nodeId = d3.select(this).attr('data-node-id');
            return nodeId === source;
          })
          .classed('link-highlight', true);
      } else {
        // Regular links - select by index in the data array
        svg.selectAll('path.link')
          .filter((d, i) => i === linkIndex)
          .classed('link-highlight', true)
          .attr('marker-end', 'url(#arrowhead-highlight)');
      }
      
      // Highlight the target node
      svg.selectAll('.node')
        .filter(d => d.id === target)
        .classed('node-highlight', true);
    }
  }

  function resetHighlights() {
    const svg = d3.select('#graph-svg');
    svg.selectAll('.node-highlight').classed('node-highlight', false);
    svg.selectAll('.link-highlight').classed('link-highlight', false)
      .attr('marker-end', function() {
        // Only update marker-end for regular links, not self-loops
        if (!d3.select(this).classed('self-loop')) {
          return 'url(#arrowhead)';
        }
        return null;
      });
  }

  function findEulerPath(adjList, startNode) {
    // Hierholzer's algorithm for finding Euler path
    const path = [];
    const stack = [startNode];
    
    while (stack.length > 0) {
      const node = stack[stack.length - 1];
      
      if (adjList[node].length > 0) {
        const edge = adjList[node].pop();
        stack.push(edge.target);
      } else {
        path.push(stack.pop());
      }
    }
    
    // Reverse the path to get the correct order
    return path.reverse();
  }

  function clearAll() {
    dnaInput.value = '';
    sequenceDisplay.innerHTML = '';
    walkResult.textContent = '';
    hideError();
    createEmptyGrid();
    initializeEmptyGraph();
    drawGraph();
    resetWalk();
  }

  function loadExample() {
    dnaInput.value = EXAMPLE_SEQUENCE;
    validateInput(); // This will trigger all the real-time updates
  }

  function updateWalkControls() {
    // Enable play button if there's at least one edge in the graph
    const hasEdges = graph.links.length > 0;
    
    // If walk is not initialized, only enable play if there are edges
    if (!walkInitialized) {
      prevBtn.disabled = true;
      nextBtn.disabled = true;
      resetBtn.disabled = true;
      playPauseBtn.disabled = !hasEdges;
    }
  }
});
