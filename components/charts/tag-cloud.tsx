"use client"

import { useEffect, useRef } from "react"
import * as d3 from "d3"
import cloud from "d3-cloud"

interface TagCloudProps {
  data: Array<{
    name: string
    value: number
  }>
}

export function TagCloud({ data }: TagCloudProps) {
  const svgRef = useRef<SVGSVGElement>(null)

  useEffect(() => {
    if (!data || data.length === 0 || !svgRef.current) return

    // Clear previous content
    d3.select(svgRef.current).selectAll("*").remove()

    const width = svgRef.current.clientWidth
    const height = svgRef.current.clientHeight

    // Find min and max values for scaling
    const values = data.map((d) => d.value)
    const minValue = Math.min(...values)
    const maxValue = Math.max(...values)

    // Scale for font size
    const fontSizeScale = d3.scaleLinear().domain([minValue, maxValue]).range([14, 60])

    // Generate the layout
    const layout = cloud()
      .size([width, height])
      .words(
        data.map((d) => ({
          text: d.name,
          size: fontSizeScale(d.value),
          value: d.value,
        })),
      )
      .padding(5)
      .rotate(() => 0)
      .fontSize((d) => d.size)
      .on("end", draw)

    layout.start()

    function draw(words: any[]) {
      const svg = d3.select(svgRef.current)

      // Color scale
      const color = d3.scaleOrdinal(d3.schemeCategory10)

      svg
        .append("g")
        .attr("transform", `translate(${width / 2},${height / 2})`)
        .selectAll("text")
        .data(words)
        .enter()
        .append("text")
        .style("font-size", (d) => `${d.size}px`)
        .style("fill", (_, i) => color(i.toString()))
        .attr("text-anchor", "middle")
        .attr("transform", (d) => `translate(${d.x},${d.y}) rotate(${d.rotate})`)
        .text((d) => d.text)
        .append("title")
        .text((d) => `${d.text}: ${d.value} entries`)
    }
  }, [data])

  if (!data || data.length === 0) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-muted-foreground">No tag data available</p>
      </div>
    )
  }

  return <svg ref={svgRef} width="100%" height="100%" />
}

