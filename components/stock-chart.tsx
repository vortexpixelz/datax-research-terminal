"use client"

import { useEffect, useState } from "react"
import { Line } from "react-chartjs-2"
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js"

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler)

export type Timeframe = "1D" | "5D" | "1M" | "3M" | "1Y" | "5Y"

type StockChartProps = {
  ticker: string
  timeframe: Timeframe
}

const TIMEFRAME_CONFIG: Record<Timeframe, { days: number; timespan: "day" | "week" | "month" }> = {
  "1D": { days: 1, timespan: "day" },
  "5D": { days: 5, timespan: "day" },
  "1M": { days: 30, timespan: "day" },
  "3M": { days: 90, timespan: "week" },
  "1Y": { days: 365, timespan: "week" },
  "5Y": { days: 365 * 5, timespan: "month" },
}

function formatDate(date: Date) {
  return date.toISOString().split("T")[0]
}

export function StockChart({ ticker, timeframe }: StockChartProps) {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        const { days, timespan } = TIMEFRAME_CONFIG[timeframe]
        const now = new Date()
        const fromDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000)
        const to = formatDate(now)
        const from = formatDate(fromDate)

        const response = await fetch(
          `/api/market/history?symbol=${ticker}&from=${from}&to=${to}&timespan=${timespan}`,
        )
        const result = await response.json()

        if (result.results && result.results.length > 0) {
          const labels = result.results.map((d: any) => new Date(d.t).toLocaleDateString())
          const prices = result.results.map((d: any) => d.c)

          setData({
            labels,
            datasets: [
              {
                label: ticker,
                data: prices,
                borderColor: "hsl(var(--primary))",
                backgroundColor: "hsl(var(--primary) / 0.1)",
                fill: true,
                tension: 0.4,
                pointRadius: 0,
                pointHoverRadius: 4,
              },
            ],
          })
        } else {
          setData(null)
        }
      } catch (error) {
        console.error("[v0] Failed to fetch chart data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [ticker, timeframe])

  if (loading) {
    return <div className="h-[400px] flex items-center justify-center text-muted-foreground">Loading chart data...</div>
  }

  if (!data) {
    return (
      <div className="h-[400px] flex items-center justify-center text-muted-foreground">
        No data available for {ticker}
      </div>
    )
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        mode: "index" as const,
        intersect: false,
      },
    },
    scales: {
      x: {
        grid: {
          color: "hsl(var(--border))",
        },
        ticks: {
          color: "hsl(var(--muted-foreground))",
        },
      },
      y: {
        grid: {
          color: "hsl(var(--border))",
        },
        ticks: {
          color: "hsl(var(--muted-foreground))",
          callback: (value: any) => "$" + value.toFixed(2),
        },
      },
    },
    interaction: {
      mode: "nearest" as const,
      axis: "x" as const,
      intersect: false,
    },
  }

  return (
    <div className="h-[400px]">
      <Line data={data} options={options} />
    </div>
  )
}
