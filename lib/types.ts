// Core types for Datax Market Research

export interface User {
  id: string
  email: string
}

export interface StockQuote {
  symbol: string
  name: string
  price: number
  change: number
  changePercent: number
  volume: number
  marketCap?: number
  pe?: number
  high52Week?: number
  low52Week?: number
}

export interface CryptoQuote {
  symbol: string
  name: string
  price: number
  change24h: number
  changePercent24h: number
  volume24h: number
  marketCap: number
}

export interface Note {
  id: number
  userId: number
  title: string
  content: string
  tags: string[]
  createdAt: Date
  updatedAt: Date
}

export interface NoteLink {
  id: number
  sourceNoteId: number
  targetNoteId?: number
  targetTitle?: string
  createdAt: Date
}

export interface PortfolioPosition {
  id: number
  userId: number
  symbol: string
  assetType: "stock" | "crypto"
  quantity: number
  avgCost: number
  currentPrice?: number
  value?: number
  gainLoss?: number
  gainLossPercent?: number
  createdAt: Date
  updatedAt: Date
}

export interface WatchlistItem {
  id: number
  userId: number
  symbol: string
  assetType: "stock" | "crypto"
  createdAt: Date
}

export interface ChatMessage {
  id: number
  userId: number
  role: "user" | "assistant"
  content: string
  createdAt: Date
}

export interface ScreenerCriteria {
  marketCap?: { min?: number; max?: number }
  pe?: { min?: number; max?: number }
  volume?: { min?: number; max?: number }
  price?: { min?: number; max?: number }
  sector?: string[]
  exchange?: string[]
}
