"use client"

import { useId } from "react"
import { Pie } from "react-chartjs-2"
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js"
import type { Holding } from "@/app/portfolio/page"

ChartJS.register(ArcElement, Tooltip, Legend)

type AllocationChartProps = {
  holdings: Holding[]
}

export function AllocationChart({ holdings }: AllocationChartProps) {
  const descriptionId = useId()
  const sectorAllocations = holdings.reduce(
    (acc, holding) => {
      const value = holding.shares * holding.currentPrice
      acc[holding.sector] = (acc[holding.sector] || 0) + value
      return acc
    },
    {} as Record<string, number>,
  )

  const data = {
    labels: Object.keys(sectorAllocations),
    datasets: [
      {
        data: Object.values(sectorAllocations),
        backgroundColor: [
          "hsl(var(--primary))",
          "hsl(var(--primary) / 0.8)",
          "hsl(var(--primary) / 0.6)",
          "hsl(var(--primary) / 0.4)",
          "hsl(var(--primary) / 0.2)",
        ],
        borderColor: "hsl(var(--background))",
        borderWidth: 2,
      },
    ],
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "right" as const,
        labels: {
          color: "hsl(var(--foreground))",
          padding: 15,
          font: {
            size: 14,
          },
        },
      },
      tooltip: {
        callbacks: {
          label: (context: any) => {
            const label = context.label || ""
            const value = context.parsed || 0
            const total = context.dataset.data.reduce((sum: number, val: number) => sum + val, 0)
            const percentage = ((value / total) * 100).toFixed(1)
            return `${label}: $${value.toFixed(2)} (${percentage}%)`
          },
        },
      },
    },
  }

  const summary = Object.entries(sectorAllocations)
    .map(([sector, value]) => `${sector}: $${value.toFixed(2)}`)
    .join("; ")

  return (
    <div className="bg-card border rounded-lg p-6">
      <h3 className="text-lg font-semibold mb-4">Sector Allocation</h3>
      <div className="h-[400px]">
        <p id={descriptionId} className="sr-only">
          Portfolio allocation by sector. {summary || "No holdings available"}.
        </p>
        <Pie
          data={data}
          options={options}
          role="img"
          aria-label="Portfolio allocation by sector"
          aria-describedby={descriptionId}
        />
      </div>
    </div>
  )
}
