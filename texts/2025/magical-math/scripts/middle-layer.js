document.addEventListener('DOMContentLoaded', function() {
  // DOM elements
  const slider = document.getElementById('n-slider');
  const nValueDisplay = document.getElementById('n-value');
  const sliderLabel = document.getElementById('slider-label');
  const generateBtn = document.getElementById('generate-btn');
  const resetBtn = document.getElementById('reset-btn');
  const graphContainer = document.getElementById('graph-container');
  
  // Constants
  const N_VALUES = [3, 5, 7, 9, 11, 13];
  const R_VALUES = [1, 2, 3, 4, 5, 6];
  
  // Variables
  let svg = null;
  let simulation = null;
  
  // Make resetGraph available globally
  window.resetGraph = resetGraph;
  
  // Initialize
  init();
  
  function init() {
    // Set up event listeners
    slider.addEventListener('input', updateSliderValue);
    generateBtn.addEventListener('click', generateGraph);
    
    // Make sure reset button event listener is properly attached
    console.log('Reset button element:', resetBtn);
    resetBtn.addEventListener('click', function() {
      console.log('Reset button clicked via direct handler');
      resetGraph();
    });
    
    // Initialize slider value display
    updateSliderValue();
  }
  
  function updateSliderValue() {
    const index = parseInt(slider.value);
    nValueDisplay.textContent = N_VALUES[index];
  }
  
  function generateGraph() {
    // Disable slider and generate button, enable reset button
    slider.disabled = true;
    sliderLabel.style.display = 'none';
    generateBtn.disabled = true;
    resetBtn.disabled = false; // Make sure reset button is enabled
    
    // Get selected n and r values
    const index = parseInt(slider.value);
    const n = N_VALUES[index];
    const r = R_VALUES[index];
    
    // Generate graph data
    const graphData = generateMiddleLayerGraph(n, r);
    
    // Log the node structure for debugging
    console.log("Graph data:", graphData.nodes);
    
    // Draw the graph
    drawGraph(graphData);
    
    // Double-check that reset button is enabled
    setTimeout(() => {
      resetBtn.disabled = false;
    }, 100);
  }
  
  function resetGraph() {
    console.log('Reset button clicked');
    
    // Enable slider and generate button, disable reset button
    slider.disabled = false;
    sliderLabel.style.display = 'inline';
    generateBtn.disabled = false;
    resetBtn.disabled = true;
    
    // Clear the graph
    if (svg) {
      svg.remove();
      svg = null;
    }
    
    // Stop simulation if running
    if (simulation) {
      simulation.stop();
      simulation = null;
    }
    
    graphContainer.innerHTML = '';
  }
  
  function generateMiddleLayerGraph(n, r) {
    const nodes = [];
    const links = [];
    const nodeMap = new Map();
    
    // Generate all r-element subsets
    const rSubsets = generateSubsets(n, r);
    
    // Generate all (r+1)-element subsets
    const rPlusOneSubsets = generateSubsets(n, r + 1);
    
    console.log('r-element subsets:', rSubsets);
    console.log('(r+1)-element subsets:', rPlusOneSubsets);
    
    // Add nodes for r-element subsets
    rSubsets.forEach((subset, index) => {
      const nodeId = `r_${subset.join('')}`;
      nodes.push({
        id: nodeId,
        label: `{${subset.join(',')}}`,
        group: 'r',
        type: 'r-element'
      });
      nodeMap.set(nodeId, index);
    });
    
    // Add nodes for (r+1)-element subsets
    rPlusOneSubsets.forEach((subset, index) => {
      const nodeId = `r+1_${subset.join('')}`;
      nodes.push({
        id: nodeId,
        label: `{${subset.join(',')}}`,
        group: 'r+1',
        type: 'r+1-element'
      });
      nodeMap.set(nodeId, rSubsets.length + index);
    });
    
    console.log('Generated nodes:', nodes);
    
    // Add edges between r-element and (r+1)-element subsets
    rSubsets.forEach(rSubset => {
      rPlusOneSubsets.forEach(rPlusOneSubset => {
        // Check if rSubset can be obtained by removing one element from rPlusOneSubset
        if (isSubsetByRemovingOne(rSubset, rPlusOneSubset)) {
          links.push({
            source: `r_${rSubset.join('')}`,
            target: `r+1_${rPlusOneSubset.join('')}`
          });
        }
      });
    });
    
    return { nodes, links };
  }
  
  function generateSubsets(n, k) {
    const result = [];
    
    // Helper function to generate combinations
    function backtrack(start, current) {
      if (current.length === k) {
        result.push([...current]);
        return;
      }
      
      for (let i = start; i <= n; i++) {
        current.push(i);
        backtrack(i + 1, current);
        current.pop();
      }
    }
    
    backtrack(1, []);
    return result;
  }
  
  function isSubsetByRemovingOne(smaller, larger) {
    if (smaller.length !== larger.length - 1) {
      return false;
    }
    
    let missingCount = 0;
    for (const item of larger) {
      if (!smaller.includes(item)) {
        missingCount++;
      }
    }
    
    return missingCount === 1;
  }
  
  function drawGraph(graphData) {
    // Clear previous graph
    graphContainer.innerHTML = '';
    
    // Get selected n and r values
    const index = parseInt(slider.value);
    const n = N_VALUES[index];
    const r = R_VALUES[index];
    
    // Set up SVG dimensions
    const width = graphContainer.clientWidth || 600;
    const height = 400;
    
    // Create SVG element
    svg = d3.create('svg')
      .attr('width', width)
      .attr('height', height)
      .attr('viewBox', [0, 0, width, height])
      .attr('style', 'max-width: 100%; height: auto;');
    
    // Separate nodes by type
    const rNodes = graphData.nodes.filter(d => String(d.id).startsWith('r_'));
    const rPlusOneNodes = graphData.nodes.filter(d => !String(d.id).startsWith('r_'));
    
    // Calculate positions
    const topY = 80;
    const bottomY = height - 70;
    const rNodeSpacing = width / (rNodes.length + 1);
    const rPlusOneNodeSpacing = width / (rPlusOneNodes.length + 1);
    
    // Assign fixed positions
    rNodes.forEach((node, i) => {
      node.fx = (i + 1) * rNodeSpacing;
      node.fy = topY;
    });
    
    rPlusOneNodes.forEach((node, i) => {
      node.fx = (i + 1) * rPlusOneNodeSpacing;
      node.fy = bottomY;
    });
    
    // Create a force simulation with minimal forces
    simulation = d3.forceSimulation(graphData.nodes)
      .force('link', d3.forceLink(graphData.links).id(d => d.id).distance(50))
      .force('charge', d3.forceManyBody().strength(-10))
      .force('x', d3.forceX().strength(0.1))
      .force('y', d3.forceY().strength(0.1));
    
    // Add links
    const link = svg.append('g')
      .attr('stroke', '#999')
      .attr('stroke-opacity', 0.6)
      .selectAll('line')
      .data(graphData.links)
      .join('line')
      .attr('stroke-width', 1.5);
    
    // Add nodes
    const node = svg.append('g')
      .selectAll('.node')
      .data(graphData.nodes)
      .join('g')
      .attr('class', 'node')
      .call(drag(simulation));
    
    // Add circles for nodes with distinct colors
    node.append('circle')
      .attr('r', 10)
      .attr('fill', d => {
        // Simplified logic to check ID prefix for node coloring
        return d.type === 'r+1-element' ? '#DB4437' : '#4285F4';
      });
    
    // Top row labels (vertical orientation with proper spacing)
    node.filter(d => d.id.startsWith('r_'))
      .append('text')
      .attr('x', 0)
      .attr('y', -35) // Position text far above the node
      .attr('text-anchor', 'end') // Align the end of text with rotation point
      .attr('transform', function(d) {
        return 'rotate(-90, 0, -35)'; // Rotate around the offset point
      })
      .text(d => d.label)
      .attr('font-size', '10px')
      .attr('fill', '#333');
    
    // Bottom row labels (vertical orientation with proper spacing)
    node.filter(d => !d.id.startsWith('r_'))
      .append('text')
      .attr('x', 0)
      .attr('y', 35) // Position text far below the node
      .attr('text-anchor', 'start') // Align the start of text with rotation point
      .attr('transform', function(d) {
        return 'rotate(-90, 0, 35)'; // Rotate around the offset point
      })
      .text(d => d.label)
      .attr('font-size', '10px')
      .attr('fill', '#333');
    
    // Add title for hover effect
    node.append('title')
      .text(d => d.label);
    
    // Update positions on each tick
    simulation.on('tick', () => {
      link
        .attr('x1', d => d.source.x)
        .attr('y1', d => d.source.y)
        .attr('x2', d => d.target.x)
        .attr('y2', d => d.target.y);
      
      node.attr('transform', d => `translate(${d.x},${d.y})`);
    });
    
    // Draw legend centered at the bottom
    const legendWidth = 250;
    const legendHeight = 75;
    const legendX = (width - legendWidth) / 2; // Center horizontally
    const legendY = height - legendHeight - 10; // Very bottom with some padding
    
    const legendContainer = svg.append('g')
      .attr('class', 'legend-container');
      
    // Add white background for legend
    legendContainer.append('rect')
      .attr('x', legendX)
      .attr('y', legendY)
      .attr('width', legendWidth)
      .attr('height', legendHeight)
      .attr('fill', 'white')
      .attr('stroke', '#ccc')
      .attr('rx', 5);
    
    // Add legend centered at the bottom
    const legend = legendContainer.append('g')
      .attr('class', 'legend')
      .attr('transform', `translate(${legendX + 20}, ${legendY + 5})`); // Position with some padding
    
    // r-element subsets
    legend.append('circle')
      .attr('r', 6)
      .attr('cx', 10)
      .attr('cy', 10)
      .attr('fill', '#4285F4');
    
    legend.append('text')
      .attr('x', 25)
      .attr('y', 15)
      .text(`r-element subsets (${r})`)
      .attr('font-size', '12px');
    
    // (r+1)-element subsets
    legend.append('circle')
      .attr('r', 6)
      .attr('cx', 10)
      .attr('cy', 35)
      .attr('fill', '#DB4437');
    
    legend.append('text')
      .attr('x', 25)
      .attr('y', 40)
      .text(`(r+1)-element subsets (${r+1})`)
      .attr('font-size', '12px');
    
    // Append SVG to container
    graphContainer.appendChild(svg.node());
  }
  
  function drag(simulation) {
    function dragstarted(event) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      event.subject.fx = event.subject.x;
      event.subject.fy = event.subject.y;
    }
    
    function dragged(event) {
      event.subject.fx = event.x;
      event.subject.fy = event.y;
    }
    
    function dragended(event) {
      if (!event.active) simulation.alphaTarget(0);
      event.subject.fx = null;
      event.subject.fy = null;
    }
    
    return d3.drag()
      .on('start', dragstarted)
      .on('drag', dragged)
      .on('end', dragended);
  }
});
