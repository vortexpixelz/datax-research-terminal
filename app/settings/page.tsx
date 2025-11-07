"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import { Save, Eye, EyeOff } from "lucide-react"

export default function SettingsPage() {
  const [groqApiKey, setGroqApiKey] = useState("")
  const [polygonApiKey, setPolygonApiKey] = useState("")
  const [showGroqKey, setShowGroqKey] = useState(false)
  const [showPolygonKey, setShowPolygonKey] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    // Load saved keys from localStorage
    const savedGroqKey = localStorage.getItem("groq_api_key") || ""
    const savedPolygonKey = localStorage.getItem("polygon_api_key") || ""
    setGroqApiKey(savedGroqKey)
    setPolygonApiKey(savedPolygonKey)
  }, [])

  const handleSave = () => {
    localStorage.setItem("groq_api_key", groqApiKey)
    localStorage.setItem("polygon_api_key", polygonApiKey)
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  return (
    <div className="flex h-screen">
      <div className="flex-1 overflow-y-auto">
        <div className="container max-w-4xl mx-auto p-6 space-y-6">
          <div className="border-l-2 border-primary pl-4">
            <h1 className="text-xl font-bold text-primary mb-1">SETTINGS</h1>
            <p className="text-sm text-muted-foreground uppercase tracking-wide">
              Configure API keys and system settings
            </p>
          </div>

          <div className="bg-card border p-6 space-y-6">
            <div className="space-y-4">
              <div className="border-l-2 border-primary/50 pl-3">
                <h2 className="text-sm font-bold text-primary uppercase tracking-wider">API CONFIGURATION</h2>
              </div>

              <div className="space-y-4">
                {/* Groq API Key */}
                <div className="space-y-2">
                  <Label htmlFor="groq-key" className="text-xs uppercase tracking-wider text-muted-foreground">
                    Groq API Key
                  </Label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Input
                        id="groq-key"
                        type={showGroqKey ? "text" : "password"}
                        value={groqApiKey}
                        onChange={(e) => setGroqApiKey(e.target.value)}
                        placeholder="gsk_..."
                        className="font-mono text-xs pr-10"
                      />
                      <Button
                        type="button"
                        size="icon"
                        variant="ghost"
                        className="absolute right-0 top-0 h-full"
                        onClick={() => setShowGroqKey(!showGroqKey)}
                      >
                        {showGroqKey ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                      </Button>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Get your free API key from{" "}
                    <a
                      href="https://console.groq.com/keys"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      console.groq.com/keys
                    </a>
                  </p>
                </div>

                {/* Polygon API Key */}
                <div className="space-y-2">
                  <Label htmlFor="polygon-key" className="text-xs uppercase tracking-wider text-muted-foreground">
                    Polygon.io API Key (Optional)
                  </Label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Input
                        id="polygon-key"
                        type={showPolygonKey ? "text" : "password"}
                        value={polygonApiKey}
                        onChange={(e) => setPolygonApiKey(e.target.value)}
                        placeholder="Your Polygon.io API key"
                        className="font-mono text-xs pr-10"
                      />
                      <Button
                        type="button"
                        size="icon"
                        variant="ghost"
                        className="absolute right-0 top-0 h-full"
                        onClick={() => setShowPolygonKey(!showPolygonKey)}
                      >
                        {showPolygonKey ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                      </Button>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Get your API key from{" "}
                    <a
                      href="https://polygon.io/dashboard/api-keys"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      polygon.io
                    </a>
                  </p>
                </div>
              </div>

              <Button onClick={handleSave} className="w-full bg-primary hover:bg-primary/90">
                <Save className="h-4 w-4 mr-2" />
                {saved ? "SAVED!" : "SAVE CONFIGURATION"}
              </Button>

              {saved && (
                <div className="bg-success/10 border border-success p-3 text-xs text-success">
                  [SUCCESS] Configuration saved successfully
                </div>
              )}
            </div>
          </div>

          <div className="bg-muted border p-4 space-y-2">
            <div className="text-xs font-bold text-primary uppercase tracking-wider">SECURITY NOTE</div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              API keys are stored locally in your browser and are never sent to any server except the respective API
              providers. The Groq key is required for AI chat functionality.
            </p>
          </div>
        </div>
      </div>

      <aside className="w-44 border-l bg-sidebar flex flex-col">
        <div className="p-3 border-b">
          <div className="text-primary font-bold text-xs tracking-wider">DATAX</div>
          <div className="text-xs text-muted-foreground mt-0.5">TERMINAL</div>
        </div>

        <nav className="flex flex-col p-1.5 gap-0.5">
          <Link
            href="/"
            className="px-2.5 py-1.5 text-xs font-medium uppercase tracking-wider hover:bg-sidebar-accent transition-colors"
          >
            AI Chat
          </Link>
          <Link
            href="/notes"
            className="px-2.5 py-1.5 text-xs font-medium uppercase tracking-wider hover:bg-sidebar-accent transition-colors"
          >
            Notes
          </Link>
          <Link
            href="/portfolio"
            className="px-2.5 py-1.5 text-xs font-medium uppercase tracking-wider hover:bg-sidebar-accent transition-colors"
          >
            Portfolio
          </Link>
          <Link
            href="/screener"
            className="px-2.5 py-1.5 text-xs font-medium uppercase tracking-wider hover:bg-sidebar-accent transition-colors"
          >
            Screener
          </Link>
          <Link
            href="/markets"
            className="px-2.5 py-1.5 text-xs font-medium uppercase tracking-wider hover:bg-sidebar-accent transition-colors"
          >
            Markets
          </Link>
          <Link
            href="/settings"
            className="px-2.5 py-1.5 text-xs font-medium uppercase tracking-wider bg-primary text-primary-foreground"
          >
            Settings
          </Link>
        </nav>

        <div className="mt-auto p-2.5 border-t space-y-1.5">
          <div className="text-xs text-muted-foreground space-y-0.5">
            <div className="flex justify-between">
              <span>Status:</span>
              <span className="text-success">ONLINE</span>
            </div>
          </div>
        </div>
      </aside>
    </div>
  )
}
