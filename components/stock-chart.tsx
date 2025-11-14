"use client"

import { useEffect, useMemo, useState } from "react"
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

type StockChartProps = {
  tickers: string[]
}

const colorPalette = [
  { border: "rgb(37, 99, 235)", background: "rgba(37, 99, 235, 0.1)" },
  { border: "rgb(22, 163, 74)", background: "rgba(22, 163, 74, 0.1)" },
  { border: "rgb(249, 115, 22)", background: "rgba(249, 115, 22, 0.1)" },
  { border: "rgb(220, 38, 38)", background: "rgba(220, 38, 38, 0.1)" },
  { border: "rgb(124, 58, 237)", background: "rgba(124, 58, 237, 0.1)" },
  { border: "rgb(13, 148, 136)", background: "rgba(13, 148, 136, 0.1)" },
  { border: "rgb(250, 204, 21)", background: "rgba(250, 204, 21, 0.1)" },
]

export function StockChart({ tickers }: StockChartProps) {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  const normalizedTickers = useMemo(
    () =>
      Array.from(
        new Set(
          tickers
            .filter((ticker) => ticker && ticker.trim().length > 0)
            .map((ticker) => ticker.trim().toUpperCase()),
        ),
      ),
    [tickers],
  )

  useEffect(() => {
    let isMounted = true

    const fetchData = async () => {
      if (normalizedTickers.length === 0) {
        if (isMounted) {
          setData(null)
          setLoading(false)
        }
        return
      }

      if (isMounted) {
        setLoading(true)
      }

      try {
        const to = new Date().toISOString().split("T")[0]
        const from = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]

        const responses = await Promise.all(
          normalizedTickers.map(async (ticker) => {
            try {
              const response = await fetch(`/api/market/history?ticker=${ticker}&from=${from}&to=${to}`)
              const result = await response.json()
              return { ticker, results: Array.isArray(result.results) ? result.results : [] }
            } catch (error) {
              console.error(`[v0] Failed to fetch chart data for ${ticker}:`, error)
              return { ticker, results: [] }
            }
          }),
        )

        if (!isMounted) {
          return
        }

        const validResponses = responses.filter((entry) => entry.results.length > 0)

        if (validResponses.length === 0) {
          setData(null)
          return
        }

        const timestamps = Array.from(
          new Set(
            validResponses.flatMap((entry) => entry.results.map((point: any) => point.t)).filter(Boolean),
          ),
        ).sort((a, b) => new Date(a).getTime() - new Date(b).getTime())

        const labels = timestamps.map((timestamp) => new Date(timestamp).toLocaleDateString())

        const datasets = validResponses.map((entry, index) => {
          const color = colorPalette[index % colorPalette.length]
          const priceMap = new Map(entry.results.map((point: any) => [point.t, point.c]))

          return {
            label: entry.ticker,
            data: timestamps.map((timestamp) => {
              const value = priceMap.get(timestamp)
              return typeof value === "number" ? value : value ? Number(value) : null
            }),
            borderColor: color.border,
            backgroundColor: color.background,
            fill: false,
            tension: 0.4,
            pointRadius: 0,
            pointHoverRadius: 4,
          }
        })

        setData({
          labels,
          datasets,
        })
      } catch (error) {
        console.error("[v0] Failed to fetch chart data:", error)
        if (isMounted) {
          setData(null)
        }
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    fetchData()

    return () => {
      isMounted = false
    }
  }, [normalizedTickers])

  if (loading) {
    return <div className="h-[400px] flex items-center justify-center text-muted-foreground">Loading chart data...</div>
  }

  if (!data) {
    const label = normalizedTickers.length > 0 ? normalizedTickers.join(", ") : "selected tickers"
    return (
      <div className="h-[400px] flex items-center justify-center text-muted-foreground">
        No data available for {label}
      </div>
    )
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: "top" as const,
        labels: {
          usePointStyle: true,
          color: "hsl(var(--muted-foreground))",
          padding: 16,
        },
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
          callback: (value: any) => {
            const numericValue = typeof value === "number" ? value : Number(value)
            return Number.isFinite(numericValue) ? `$${numericValue.toFixed(2)}` : value
          },
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
