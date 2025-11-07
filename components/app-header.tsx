"use client"

import { Button } from "@/components/ui/button"
import { TrendingUp, Menu } from "lucide-react"
import Link from "next/link"
import { useState } from "react"

export function AppHeader() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 font-bold text-xl">
            <div className="h-8 w-8 rounded-lg bg-chart-1 flex items-center justify-center">
              <TrendingUp className="h-5 w-5 text-primary-foreground" />
            </div>
            <span>Datax Market Research</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            <Link href="/chat" className="text-sm font-medium hover:text-chart-1 transition-colors">
              AI Chat
            </Link>
            <Link href="/notes" className="text-sm font-medium hover:text-chart-1 transition-colors">
              Notes
            </Link>
            <Link href="/portfolio" className="text-sm font-medium hover:text-chart-1 transition-colors">
              Portfolio
            </Link>
            <Link href="/screener" className="text-sm font-medium hover:text-chart-1 transition-colors">
              Screener
            </Link>
            <Link href="/markets" className="text-sm font-medium hover:text-chart-1 transition-colors">
              Markets
            </Link>
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-4">
            <Button variant="ghost" className="hidden md:inline-flex">
              Sign In
            </Button>
            <Button className="hidden md:inline-flex">Get Started</Button>

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <Menu className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <nav className="md:hidden py-4 space-y-2 border-t">
            <Link href="/chat" className="block py-2 text-sm font-medium hover:text-chart-1 transition-colors">
              AI Chat
            </Link>
            <Link href="/notes" className="block py-2 text-sm font-medium hover:text-chart-1 transition-colors">
              Notes
            </Link>
            <Link href="/portfolio" className="block py-2 text-sm font-medium hover:text-chart-1 transition-colors">
              Portfolio
            </Link>
            <Link href="/screener" className="block py-2 text-sm font-medium hover:text-chart-1 transition-colors">
              Screener
            </Link>
            <Link href="/markets" className="block py-2 text-sm font-medium hover:text-chart-1 transition-colors">
              Markets
            </Link>
            <div className="pt-4 space-y-2">
              <Button variant="ghost" className="w-full">
                Sign In
              </Button>
              <Button className="w-full">Get Started</Button>
            </div>
          </nav>
        )}
      </div>
    </header>
  )
}
