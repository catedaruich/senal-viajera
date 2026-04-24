"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Slider } from "@/components/ui/slider"
import { Button } from "@/components/ui/button"
import { Settings, Play, Pause, RotateCcw, Signal, Volume2, Radio, Gauge, Layers, Zap } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface ControlPanelProps {
  rssi: number
  setRssi: (v: number) => void
  sinr: number
  setSinr: (v: number) => void
  bandwidth: number
  setBandwidth: (v: number) => void
  frequency: number
  setFrequency: (v: number) => void
  modulationIndex: number
  setModulationIndex: (v: number) => void
  pathLossExponent: number
  setPathLossExponent: (v: number) => void
  isSimulating: boolean
  setIsSimulating: (v: boolean) => void
  distance: number
  setDistance: (v: number) => void
}

const FREQUENCY_BANDS = [
  { value: '700', label: 'Band 28 (700 MHz)', freq: 700 },
  { value: '800', label: 'Band 20 (800 MHz)', freq: 800 },
  { value: '1800', label: 'Band 3 (1800 MHz)', freq: 1800 },
  { value: '2100', label: 'Band 1 (2100 MHz)', freq: 2100 },
  { value: '2600', label: 'Band 7 (2600 MHz)', freq: 2600 },
]

const BANDWIDTH_OPTIONS = [
  { value: '1.4', label: '1.4 MHz (6 RB)' },
  { value: '3', label: '3 MHz (15 RB)' },
  { value: '5', label: '5 MHz (25 RB)' },
  { value: '10', label: '10 MHz (50 RB)' },
  { value: '15', label: '15 MHz (75 RB)' },
  { value: '20', label: '20 MHz (100 RB)' },
]

const ENVIRONMENT_PRESETS = [
  { name: 'Urban', pathLoss: 4.0, description: 'Dense urban area' },
  { name: 'Suburban', pathLoss: 3.5, description: 'Residential area' },
  { name: 'Rural', pathLoss: 2.8, description: 'Open countryside' },
  { name: 'Indoor', pathLoss: 4.5, description: 'Inside building' },
]

export function ControlPanel({
  rssi,
  setRssi,
  sinr,
  setSinr,
  bandwidth,
  setBandwidth,
  frequency,
  setFrequency,
  modulationIndex,
  setModulationIndex,
  pathLossExponent,
  setPathLossExponent,
  isSimulating,
  setIsSimulating,
  distance,
  setDistance,
}: ControlPanelProps) {
  const handleReset = () => {
    setRssi(-65)
    setSinr(15)
    setDistance(0)
    setIsSimulating(false)
  }

  return (
    <Card className="bg-card/80 backdrop-blur border-border">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Settings className="h-5 w-5 text-slate-400" />
          <span className="text-foreground">Channel Simulation Controls</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        {/* Simulation Controls */}
        <div className="flex items-center gap-2">
          <Button
            variant={isSimulating ? 'destructive' : 'default'}
            size="sm"
            onClick={() => setIsSimulating(!isSimulating)}
            className="flex-1"
          >
            {isSimulating ? (
              <>
                <Pause className="h-4 w-4 mr-2" />
                Stop Simulation
              </>
            ) : (
              <>
                <Play className="h-4 w-4 mr-2" />
                Start Route Simulation
              </>
            )}
          </Button>
          <Button variant="outline" size="sm" onClick={handleReset}>
            <RotateCcw className="h-4 w-4" />
          </Button>
        </div>

        {/* Signal Parameters */}
        <div className="space-y-4">
          <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Signal Parameters</h4>
          
          {/* RSSI Slider */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-sm">
                <Signal className="h-4 w-4 text-cyan-400" />
                <span className="text-foreground">RSSI (dBm)</span>
              </div>
              <span className="font-mono text-sm text-cyan-400">{rssi} dBm</span>
            </div>
            <Slider
              value={[rssi]}
              onValueChange={([v]) => setRssi(v)}
              min={-120}
              max={-40}
              step={1}
              disabled={isSimulating}
              className="[&>span:first-child]:bg-gradient-to-r [&>span:first-child]:from-red-500 [&>span:first-child]:via-yellow-500 [&>span:first-child]:to-green-500"
            />
            <div className="flex justify-between text-[10px] text-muted-foreground">
              <span>-120 (No Signal)</span>
              <span>-40 (Excellent)</span>
            </div>
          </div>

          {/* SINR Slider */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-sm">
                <Volume2 className="h-4 w-4 text-emerald-400" />
                <span className="text-foreground">SINR (dB)</span>
              </div>
              <span className="font-mono text-sm text-emerald-400">{sinr} dB</span>
            </div>
            <Slider
              value={[sinr]}
              onValueChange={([v]) => setSinr(v)}
              min={-10}
              max={30}
              step={0.5}
              disabled={isSimulating}
            />
            <div className="flex justify-between text-[10px] text-muted-foreground">
              <span>-10 (Heavy Interference)</span>
              <span>30 (Clean Channel)</span>
            </div>
          </div>

          {/* Distance Slider (manual when not simulating) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-sm">
                <Gauge className="h-4 w-4 text-purple-400" />
                <span className="text-foreground">Route Position (km)</span>
              </div>
              <span className="font-mono text-sm text-purple-400">{distance.toFixed(1)} km</span>
            </div>
            <Slider
              value={[distance]}
              onValueChange={([v]) => setDistance(v)}
              min={0}
              max={50}
              step={0.5}
              disabled={isSimulating}
            />
          </div>
        </div>

        {/* Channel Configuration */}
        <div className="space-y-4 border-t border-border pt-4">
          <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Channel Configuration</h4>
          
          <div className="grid grid-cols-2 gap-3">
            {/* Frequency Band */}
            <div className="space-y-1.5">
              <label className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Radio className="h-3 w-3" />
                Frequency Band
              </label>
              <Select
                value={String(frequency)}
                onValueChange={(v) => setFrequency(Number(v))}
              >
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {FREQUENCY_BANDS.map((band) => (
                    <SelectItem key={band.value} value={String(band.freq)} className="text-xs">
                      {band.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Bandwidth */}
            <div className="space-y-1.5">
              <label className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Layers className="h-3 w-3" />
                Channel Bandwidth
              </label>
              <Select
                value={String(bandwidth)}
                onValueChange={(v) => setBandwidth(Number(v))}
              >
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {BANDWIDTH_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value} className="text-xs">
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Path Loss Exponent with Environment Presets */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Zap className="h-3 w-3" />
                Path Loss Exponent (n)
              </label>
              <span className="font-mono text-xs text-foreground">{pathLossExponent.toFixed(1)}</span>
            </div>
            <Slider
              value={[pathLossExponent]}
              onValueChange={([v]) => setPathLossExponent(v)}
              min={2}
              max={5}
              step={0.1}
            />
            <div className="flex gap-1 mt-2">
              {ENVIRONMENT_PRESETS.map((preset) => (
                <button
                  key={preset.name}
                  onClick={() => setPathLossExponent(preset.pathLoss)}
                  className={`flex-1 text-[10px] py-1 px-2 rounded transition-colors ${
                    Math.abs(pathLossExponent - preset.pathLoss) < 0.15
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted/50 text-muted-foreground hover:bg-muted'
                  }`}
                >
                  {preset.name}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex gap-2 pt-2 border-t border-border">
          <Button
            variant="outline"
            size="sm"
            className="flex-1 text-xs"
            onClick={() => {
              setRssi(-95)
              setSinr(5)
            }}
          >
            Simulate Weak Signal
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="flex-1 text-xs"
            onClick={() => {
              setRssi(-110)
              setSinr(-5)
            }}
          >
            Simulate Dead Zone
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
