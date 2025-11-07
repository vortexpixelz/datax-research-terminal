/**
 * Technical Indicators Calculation Library
 */

export interface OHLCV {
  timestamp: number
  open: number
  high: number
  low: number
  close: number
  volume: number
}

export interface IndicatorResult {
  timestamp: number
  value: number
}

/**
 * Simple Moving Average (SMA)
 */
export function calculateSMA(
  data: OHLCV[],
  period: number,
  priceType: "close" | "open" | "high" | "low" = "close"
): IndicatorResult[] {
  const result: IndicatorResult[] = []

  for (let i = period - 1; i < data.length; i++) {
    let sum = 0
    for (let j = i - period + 1; j <= i; j++) {
      sum += data[j][priceType]
    }
    result.push({
      timestamp: data[i].timestamp,
      value: sum / period,
    })
  }

  return result
}

/**
 * Exponential Moving Average (EMA)
 */
export function calculateEMA(
  data: OHLCV[],
  period: number,
  priceType: "close" | "open" | "high" | "low" = "close"
): IndicatorResult[] {
  const result: IndicatorResult[] = []
  const multiplier = 2 / (period + 1)

  // Start with SMA for the first period
  let sum = 0
  for (let i = 0; i < period; i++) {
    sum += data[i][priceType]
  }
  let ema = sum / period

  result.push({
    timestamp: data[period - 1].timestamp,
    value: ema,
  })

  // Calculate EMA for remaining data
  for (let i = period; i < data.length; i++) {
    ema = (data[i][priceType] - ema) * multiplier + ema
    result.push({
      timestamp: data[i].timestamp,
      value: ema,
    })
  }

  return result
}

/**
 * Relative Strength Index (RSI)
 */
export function calculateRSI(
  data: OHLCV[],
  period: number = 14
): IndicatorResult[] {
  const result: IndicatorResult[] = []

  if (data.length <= period) {
    return result
  }

  // Calculate price changes
  const changes: number[] = []
  for (let i = 1; i < data.length; i++) {
    changes.push(data[i].close - data[i - 1].close)
  }

  // Calculate average gains and losses
  let gainSum = 0
  let lossSum = 0

  for (let i = 0; i < period; i++) {
    if (changes[i] > 0) {
      gainSum += changes[i]
    } else {
      lossSum += Math.abs(changes[i])
    }
  }

  let avgGain = gainSum / period
  let avgLoss = lossSum / period
  let rs = avgGain / (avgLoss || 1)
  let rsi = 100 - 100 / (1 + rs)

  result.push({
    timestamp: data[period].timestamp,
    value: rsi,
  })

  // Calculate RSI for remaining data using smoothed averages
  for (let i = period; i < changes.length; i++) {
    const change = changes[i]
    const gain = change > 0 ? change : 0
    const loss = change < 0 ? Math.abs(change) : 0

    avgGain = (avgGain * (period - 1) + gain) / period
    avgLoss = (avgLoss * (period - 1) + loss) / period

    rs = avgGain / (avgLoss || 1)
    rsi = 100 - 100 / (1 + rs)

    result.push({
      timestamp: data[i + 1].timestamp,
      value: rsi,
    })
  }

  return result
}

/**
 * MACD (Moving Average Convergence Divergence)
 */
export interface MACDResult {
  timestamp: number
  macd: number
  signal: number
  histogram: number
}

export function calculateMACD(
  data: OHLCV[],
  fastPeriod: number = 12,
  slowPeriod: number = 26,
  signalPeriod: number = 9
): MACDResult[] {
  const result: MACDResult[] = []

  const fastEMA = calculateEMA(data, fastPeriod)
  const slowEMA = calculateEMA(data, slowPeriod)

  // Calculate MACD line
  const macdLine: IndicatorResult[] = []
  const slowMap = new Map(slowEMA.map((e) => [e.timestamp, e.value]))

  for (const fast of fastEMA) {
    const slow = slowMap.get(fast.timestamp)
    if (slow !== undefined) {
      macdLine.push({
        timestamp: fast.timestamp,
        value: fast.value - slow,
      })
    }
  }

  // Calculate signal line (9-period EMA of MACD)
  if (macdLine.length === 0) {
    return result
  }

  // Convert MACD line to OHLCV format for EMA calculation
  const macdOHLCV: OHLCV[] = macdLine.map((m) => ({
    timestamp: m.timestamp,
    open: m.value,
    high: m.value,
    low: m.value,
    close: m.value,
    volume: 0,
  }))

  const signalLine = calculateEMA(macdOHLCV, signalPeriod)
  const signalMap = new Map(signalLine.map((s) => [s.timestamp, s.value]))

  // Combine MACD, Signal, and Histogram
  for (const macd of macdLine) {
    const signal = signalMap.get(macd.timestamp)
    if (signal !== undefined) {
      result.push({
        timestamp: macd.timestamp,
        macd: macd.value,
        signal,
        histogram: macd.value - signal,
      })
    }
  }

  return result
}

/**
 * Bollinger Bands
 */
export interface BollingerBandsResult {
  timestamp: number
  upper: number
  middle: number
  lower: number
}

export function calculateBollingerBands(
  data: OHLCV[],
  period: number = 20,
  stdDevMultiplier: number = 2
): BollingerBandsResult[] {
  const result: BollingerBandsResult[] = []

  const sma = calculateSMA(data, period)

  for (let i = period - 1; i < data.length; i++) {
    // Calculate standard deviation
    let sumSquareDiff = 0
    for (let j = i - period + 1; j <= i; j++) {
      const diff = data[j].close - sma[i - period + 1].value
      sumSquareDiff += diff * diff
    }
    const stdDev = Math.sqrt(sumSquareDiff / period)

    const middle = data[i].close
    const upper = middle + stdDev * stdDevMultiplier
    const lower = middle - stdDev * stdDevMultiplier

    result.push({
      timestamp: data[i].timestamp,
      upper,
      middle,
      lower,
    })
  }

  return result
}

/**
 * Average True Range (ATR)
 */
export function calculateATR(
  data: OHLCV[],
  period: number = 14
): IndicatorResult[] {
  const result: IndicatorResult[] = []

  if (data.length <= period) {
    return result
  }

  const trueRanges: number[] = []

  for (let i = 1; i < data.length; i++) {
    const high = data[i].high
    const low = data[i].low
    const prevClose = data[i - 1].close

    const tr = Math.max(high - low, Math.abs(high - prevClose), Math.abs(low - prevClose))
    trueRanges.push(tr)
  }

  // Calculate ATR using SMA of true ranges
  let sum = 0
  for (let i = 0; i < period; i++) {
    sum += trueRanges[i]
  }
  let atr = sum / period

  result.push({
    timestamp: data[period].timestamp,
    value: atr,
  })

  // Calculate ATR using smoothed method
  for (let i = period; i < trueRanges.length; i++) {
    atr = (atr * (period - 1) + trueRanges[i]) / period
    result.push({
      timestamp: data[i + 1].timestamp,
      value: atr,
    })
  }

  return result
}
