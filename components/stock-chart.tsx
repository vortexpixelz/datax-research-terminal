"use client"

import { useEffect, useMemo, useState } from "react"
import { Line, Bar } from "react-chartjs-2"
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js"
import type { ChartData, ChartOptions } from "chart.js"
import { Button } from "@/components/ui/button"

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, Filler)

type StockChartProps = {
  ticker: string
}

export function StockChart({ ticker }: StockChartProps) {
  const [data, setData] = useState<{
    labels: string[]
    prices: number[]
    volumes: number[]
  } | null>(null)
  const [loading, setLoading] = useState(true)
  const [showVolume, setShowVolume] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        const now = new Date()
        const fromDate = new Date(now.getTime() - 24 * 60 * 60 * 1000)
        const to = now.toISOString().split("T")[0]
        const from = fromDate.toISOString().split("T")[0]
        const params = new URLSearchParams({
          symbol: ticker.toUpperCase(),
          from,
          to,
          timespan: "minute",
          multiplier: "15",
        })

        const response = await fetch(`/api/market/history?${params.toString()}`)

        if (!response.ok) {
          throw new Error("Failed to fetch history")
        }

        const result = await response.json()

        if (Array.isArray(result) && result.length > 0) {
          const labels = result.map((bar: any) =>
            new Date(bar.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          )
          const prices = result.map((bar: any) => bar.close)
          const volumes = result.map((bar: any) => bar.volume)

          setData({ labels, prices, volumes })
        } else {
          setData(null)
        }
      } catch (error) {
        console.error("[v0] Failed to fetch chart data:", error)
        setData(null)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [ticker])

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

  const priceChartData: ChartData<"line"> = useMemo(
    () => ({
      labels: data.labels,
      datasets: [
        {
          label: ticker,
          data: data.prices,
          borderColor: "hsl(var(--primary))",
          backgroundColor: "hsl(var(--primary) / 0.1)",
          fill: true,
          tension: 0.35,
          pointRadius: 0,
          pointHoverRadius: 4,
        },
      ],
    }),
    [data.labels, data.prices, ticker],
  )

  const priceOptions: ChartOptions<"line"> = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false,
        },
        tooltip: {
          mode: "index",
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
            maxRotation: 0,
            autoSkip: true,
            maxTicksLimit: 8,
          },
        },
        y: {
          grid: {
            color: "hsl(var(--border))",
          },
          ticks: {
            color: "hsl(var(--muted-foreground))",
            callback: (value) => (typeof value === "number" ? `$${value.toFixed(2)}` : value),
          },
        },
      },
      interaction: {
        mode: "nearest",
        axis: "x",
        intersect: false,
      },
    }),
    [],
  )

  const volumeChartData: ChartData<"bar"> = useMemo(
    () => ({
      labels: data.labels,
      datasets: [
        {
          label: "Volume",
          data: data.volumes,
          backgroundColor: "hsl(var(--primary) / 0.35)",
          borderRadius: 2,
          barPercentage: 1,
          categoryPercentage: 1,
        },
      ],
    }),
    [data.labels, data.volumes],
  )

  const volumeOptions: ChartOptions<"bar"> = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false,
        },
        tooltip: {
          mode: "index",
          intersect: false,
          callbacks: {
            label: (context) =>
              context.parsed.y
                ? `${Number(context.parsed.y).toLocaleString()} shares`
                : "",
          },
        },
      },
      scales: {
        x: {
          grid: {
            display: false,
          },
          ticks: {
            color: "hsl(var(--muted-foreground))",
            maxRotation: 0,
            autoSkip: true,
            maxTicksLimit: 8,
          },
        },
        y: {
          grid: {
            color: "hsl(var(--border))",
          },
          ticks: {
            color: "hsl(var(--muted-foreground))",
            callback: (value) =>
              typeof value === "number" ? `${Math.round(value / 1000)}K` : value,
          },
        },
      },
      interaction: {
        mode: "nearest",
        axis: "x",
        intersect: false,
      },
    }),
    [],
  )

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-end">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowVolume((prev) => !prev)}
          aria-pressed={showVolume}
        >
          {showVolume ? "Hide Volume" : "Show Volume"}
        </Button>
      </div>
      <div className="h-[260px]">
        <Line data={priceChartData} options={priceOptions} />
      </div>
      {showVolume && (
        <div className="h-[140px]">
          <Bar data={volumeChartData} options={volumeOptions} />
        </div>
      )}
    </div>
  )
}
