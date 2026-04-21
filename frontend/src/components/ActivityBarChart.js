import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

/**
 * D3.js Bar Chart — Activity counts by category.
 * Renders directly into an SVG using D3's DOM manipulation,
 * while React manages the lifecycle (mount/update/cleanup).
 */
export default function ActivityBarChart({ data }) {
  const svgRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    if (!data || data.length === 0 || !svgRef.current) return;

    const container = containerRef.current;
    const totalWidth = container ? container.offsetWidth : 500;
    const margin = { top: 10, right: 20, bottom: 50, left: 50 };
    const width = totalWidth - margin.left - margin.right;
    const height = 240 - margin.top - margin.bottom;

    // Clear previous render
    d3.select(svgRef.current).selectAll('*').remove();

    const svg = d3.select(svgRef.current)
      .attr('width', totalWidth)
      .attr('height', 240)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Scales
    const x = d3.scaleBand()
      .domain(data.map(d => d.category))
      .range([0, width])
      .padding(0.35);

    const y = d3.scaleLinear()
      .domain([0, d3.max(data, d => d.count) * 1.15])
      .nice()
      .range([height, 0]);

    // Color scale using D3 interpolation
    const colorScale = d3.scaleSequential()
      .domain([0, data.length - 1])
      .interpolator(d3.interpolateRgb('#6c63ff', '#00d4aa'));

    // Grid lines
    svg.append('g')
      .attr('class', 'd3-axis')
      .call(d3.axisLeft(y).ticks(5).tickSize(-width).tickFormat(''))
      .select('.domain').remove();

    svg.selectAll('.tick line')
      .attr('stroke', 'rgba(46,51,72,0.5)')
      .attr('stroke-dasharray', '3,3');

    // Bars with enter animation
    svg.selectAll('.d3-bar')
      .data(data)
      .enter()
      .append('rect')
      .attr('class', 'd3-bar')
      .attr('x', d => x(d.category))
      .attr('width', x.bandwidth())
      .attr('y', height)          // start at bottom for animation
      .attr('height', 0)
      .attr('rx', 6)
      .attr('fill', (d, i) => colorScale(i))
      .transition()
      .duration(600)
      .delay((d, i) => i * 80)
      .attr('y', d => y(d.count))
      .attr('height', d => height - y(d.count));

    // Value labels on top of bars
    svg.selectAll('.bar-label')
      .data(data)
      .enter()
      .append('text')
      .attr('class', 'bar-label')
      .attr('x', d => x(d.category) + x.bandwidth() / 2)
      .attr('y', d => y(d.count) - 6)
      .attr('text-anchor', 'middle')
      .attr('fill', '#e8eaf6')
      .attr('font-size', '12px')
      .attr('font-family', 'Inter, sans-serif')
      .attr('font-weight', '600')
      .attr('opacity', 0)
      .transition()
      .duration(600)
      .delay((d, i) => i * 80 + 300)
      .attr('opacity', 1)
      .text(d => d.count);

    // X Axis
    svg.append('g')
      .attr('class', 'd3-axis')
      .attr('transform', `translate(0,${height})`)
      .call(d3.axisBottom(x).tickSize(0))
      .select('.domain')
      .attr('stroke', 'rgba(46,51,72,0.5)');

    svg.selectAll('.d3-axis .tick text')
      .attr('fill', '#8892b0')
      .attr('font-size', '11px')
      .attr('dy', '14px');

    // Y Axis
    svg.append('g')
      .attr('class', 'd3-axis')
      .call(d3.axisLeft(y).ticks(5).tickFormat(d3.format('d')))
      .select('.domain').remove();

    // Hover tooltip using D3
    const tooltip = d3.select(container)
      .append('div')
      .style('position', 'absolute')
      .style('background', '#1a1d27')
      .style('border', '1px solid #2e3348')
      .style('border-radius', '8px')
      .style('padding', '8px 12px')
      .style('font-size', '13px')
      .style('color', '#e8eaf6')
      .style('pointer-events', 'none')
      .style('opacity', 0)
      .style('z-index', 10);

    svg.selectAll('.d3-bar-hover')
      .data(data)
      .enter()
      .append('rect')
      .attr('class', 'd3-bar-hover')
      .attr('x', d => x(d.category))
      .attr('width', x.bandwidth())
      .attr('y', 0)
      .attr('height', height)
      .attr('fill', 'transparent')
      .on('mouseover', (event, d) => {
        tooltip.style('opacity', 1)
          .html(`<strong>${d.category}</strong><br/>${d.count} activities`);
      })
      .on('mousemove', (event) => {
        tooltip
          .style('left', (event.offsetX + 12) + 'px')
          .style('top', (event.offsetY - 30) + 'px');
      })
      .on('mouseout', () => tooltip.style('opacity', 0));

    return () => {
      // Cleanup D3 tooltip on unmount
      d3.select(container).selectAll('div').remove();
    };
  }, [data]);

  if (!data || data.length === 0) {
    return <div className="empty-state">No activity data available yet.</div>;
  }

  return (
    <div ref={containerRef} style={{ position: 'relative', width: '100%' }}>
      <svg ref={svgRef} className="d3-chart" />
    </div>
  );
}
