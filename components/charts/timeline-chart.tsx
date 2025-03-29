"use client"

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

interface TimelineChartProps {
  data: Array<{
    date: string
    count: number
  }>
}

export function TimelineChart({ data }: TimelineChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-muted-foreground">No timeline data available</p>
      </div>
    )
  }

  // Format date for display
  const formattedData = data.map((item) => ({
    ...item,
    formattedDate: new Date(item.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
  }))

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart
        data={formattedData}
        margin={{
          top: 20,
          right: 30,
          left: 20,
          bottom: 5,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="formattedDate" />
        <YAxis />
        <Tooltip formatter={(value) => [`${value} entries`, "Count"]} labelFormatter={(label) => `Date: ${label}`} />
        <Line type="monotone" dataKey="count" stroke="#8884d8" activeDot={{ r: 8 }} />
      </LineChart>
    </ResponsiveContainer>
  )
}

