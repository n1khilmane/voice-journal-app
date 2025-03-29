"use client"

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

interface TopicsChartProps {
  data: Array<{
    name: string
    value: number
  }>
}

export function TopicsChart({ data }: TopicsChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-muted-foreground">No topic data available</p>
      </div>
    )
  }

  // Sort data by value in descending order
  const sortedData = [...data].sort((a, b) => b.value - a.value)

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart
        data={sortedData}
        layout="vertical"
        margin={{
          top: 20,
          right: 30,
          left: 100,
          bottom: 5,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis type="number" domain={[0, 100]} tickFormatter={(value) => `${value}%`} />
        <YAxis type="category" dataKey="name" />
        <Tooltip formatter={(value) => [`${value.toFixed(1)}%`, "Average Percentage"]} />
        <Bar dataKey="value" fill="#82ca9d" />
      </BarChart>
    </ResponsiveContainer>
  )
}

