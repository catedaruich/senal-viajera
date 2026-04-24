"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Radio, Waves } from "lucide-react"
import { useMemo } from "react"

interface SpectralAnalysisProps {
  frequency: number
  bandwidth: number
  sinr: number
  modulationIndex: number
}

export function SpectralAnalysis({ frequency, bandwidth, sinr, modulationIndex }: SpectralAnalysisProps) {
  // Generate spectral data
  const spectralData = useMemo(() => {
    const points = 64
    const centerFreq = frequency
    const halfBw = bandwidth / 2
    
    return Array.from({ length: points }, (_, i) => {
      const freq = centerFreq - halfBw + (i / points) * bandwidth
      const offset = (i - points / 2) / (points / 2)
      
      // Signal component (raised cosine shape)
      const signalPower = sinr + 10 - Math.pow(offset * 3, 2) * 5
      
      // Add some noise variation
      const noise = Math.random() * 3 - 1.5
      
      // Interference spikes
      const interference = (i === 15 || i === 48) ? 8 : 0
      
      return {
        frequency: freq,
        power: Math.max(-120, Math.min(0, signalPower + noise + interference)),
        noiseFloor: -100 + Math.random() * 5,
      }
    })
  }, [frequency, bandwidth, sinr])

  // Calculate frequency bounds
  const minFreq = frequency - bandwidth / 2
  const maxFreq = frequency + bandwidth / 2

  // Determine LTE band
  const getLteBand = (freq: number) => {
    if (freq >= 700 && freq < 900) return 'Band 28 (700 MHz)'
    if (freq >= 800 && freq < 900) return 'Band 20 (800 MHz)'
    if (freq >= 1700 && freq < 2000) return 'Band 3 (1800 MHz)'
    if (freq >= 2100 && freq < 2200) return 'Band 1 (2100 MHz)'
    if (freq >= 2500 && freq < 2700) return 'Band 7 (2600 MHz)'
    return 'Custom Band'
  }

  const maxPower = Math.max(...spectralData.map(d => d.power))
  const minPower = -120

  return (
    <Card className="bg-card/80 backdrop-blur border-border">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Waves className="h-5 w-5 text-purple-400" />
          <span className="text-foreground">Spectral Analysis</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Frequency Info */}
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2">
            <Radio className="h-4 w-4 text-purple-400" />
            <span className="text-muted-foreground">Center Frequency</span>
          </div>
          <div className="text-right">
            <span className="font-mono font-bold text-foreground">{frequency} MHz</span>
            <div className="text-xs text-muted-foreground">{getLteBand(frequency)}</div>
          </div>
        </div>

        {/* Spectrum Visualization */}
        <div className="relative h-32 bg-muted/30 rounded-lg overflow-hidden border border-border">
          {/* Grid lines */}
          <div className="absolute inset-0 flex flex-col justify-between py-2 pointer-events-none">
            {[-80, -90, -100, -110].map((db) => (
              <div key={db} className="flex items-center">
                <span className="text-[8px] text-muted-foreground w-8 pl-1">{db}</span>
                <div className="flex-1 border-t border-border/30" />
              </div>
            ))}
          </div>

          {/* Spectrum bars */}
          <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none">
            <defs>
              <linearGradient id="spectrumGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="rgb(192, 132, 252)" stopOpacity="1" />
                <stop offset="50%" stopColor="rgb(34, 211, 238)" stopOpacity="0.8" />
                <stop offset="100%" stopColor="rgb(34, 211, 238)" stopOpacity="0.2" />
              </linearGradient>
              <linearGradient id="noiseGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="rgb(239, 68, 68)" stopOpacity="0.3" />
                <stop offset="100%" stopColor="rgb(239, 68, 68)" stopOpacity="0.1" />
              </linearGradient>
            </defs>
            
            {/* Noise floor area */}
            <path
              d={`M 32 128 ${spectralData.map((d, i) => {
                const x = 32 + (i / spectralData.length) * (256 - 32)
                const y = 128 - ((d.noiseFloor - minPower) / (maxPower - minPower)) * 128
                return `L ${x} ${y}`
              }).join(' ')} L 256 128 Z`}
              fill="url(#noiseGradient)"
            />

            {/* Signal spectrum */}
            <path
              d={`M 32 128 ${spectralData.map((d, i) => {
                const x = 32 + (i / spectralData.length) * (256 - 32)
                const y = 128 - ((d.power - minPower) / (maxPower - minPower)) * 128
                return `L ${x} ${y}`
              }).join(' ')} L 256 128 Z`}
              fill="url(#spectrumGradient)"
              opacity="0.6"
            />

            {/* Signal line */}
            <path
              d={`M ${spectralData.map((d, i) => {
                const x = 32 + (i / spectralData.length) * (256 - 32)
                const y = 128 - ((d.power - minPower) / (maxPower - minPower)) * 128
                return `${i === 0 ? '' : 'L '}${x} ${y}`
              }).join(' ')}`}
              fill="none"
              stroke="rgb(192, 132, 252)"
              strokeWidth="1.5"
            />
          </svg>

          {/* Frequency labels */}
          <div className="absolute bottom-0 left-8 right-0 flex justify-between text-[8px] text-muted-foreground px-1 pb-1">
            <span>{minFreq.toFixed(0)}</span>
            <span>{frequency.toFixed(0)}</span>
            <span>{maxFreq.toFixed(0)} MHz</span>
          </div>
        </div>

        {/* Spectrum Stats */}
        <div className="grid grid-cols-3 gap-2 text-center text-xs">
          <div className="bg-muted/30 rounded p-2">
            <div className="text-muted-foreground">Bandwidth</div>
            <div className="font-mono font-bold text-foreground">{bandwidth} MHz</div>
          </div>
          <div className="bg-muted/30 rounded p-2">
            <div className="text-muted-foreground">Peak Power</div>
            <div className="font-mono font-bold text-purple-400">{maxPower.toFixed(1)} dBm</div>
          </div>
          <div className="bg-muted/30 rounded p-2">
            <div className="text-muted-foreground">Noise Floor</div>
            <div className="font-mono font-bold text-red-400">-100 dBm</div>
          </div>
        </div>

        {/* OFDM Subcarriers Info */}
        <div className="flex items-center justify-between bg-muted/20 rounded p-2 text-xs">
          <span className="text-muted-foreground">OFDM Subcarriers</span>
          <span className="font-mono text-foreground">
            {Math.floor(bandwidth * 1000 / 15)} @ 15kHz spacing
          </span>
        </div>
      </CardContent>
    </Card>
  )
}
