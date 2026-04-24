"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart3, Cpu, Layers, Gauge, Binary, Wifi } from "lucide-react"
import { type TelecomMetrics } from "@/lib/telecom-calculations"
import { Progress } from "@/components/ui/progress"

interface ChannelAnalysisPanelProps {
  metrics: TelecomMetrics
  bandwidth: number
}

export function ChannelAnalysisPanel({ metrics, bandwidth }: ChannelAnalysisPanelProps) {
  // Calculate resource block utilization
  const maxRBs = Math.floor(bandwidth / 0.18)
  const utilizationPercent = Math.min(100, (metrics.throughput / metrics.shannonCapacity) * 100)

  return (
    <Card className="bg-card/80 backdrop-blur border-border">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <BarChart3 className="h-5 w-5 text-emerald-400" />
          <span className="text-foreground">Channel Capacity Analysis</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Shannon Capacity Display */}
        <div className="bg-gradient-to-br from-emerald-500/10 to-cyan-500/10 rounded-lg p-4 border border-emerald-500/20">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">Shannon Capacity</span>
            <span className="text-xs font-mono text-muted-foreground">
              C = B × log₂(1 + SINR)
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-emerald-400 font-mono">
              {metrics.shannonCapacity.toFixed(2)}
            </span>
            <span className="text-lg text-emerald-400/70">Mbps</span>
          </div>
          <div className="mt-2 text-xs text-muted-foreground">
            Theoretical maximum: {(bandwidth * Math.log2(1 + Math.pow(10, 30/10))).toFixed(1)} Mbps @ 30dB SINR
          </div>
        </div>

        {/* Throughput vs Capacity */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Channel Utilization</span>
            <span className="font-mono text-foreground">{utilizationPercent.toFixed(1)}%</span>
          </div>
          <div className="relative h-6 bg-muted rounded overflow-hidden">
            <div
              className="absolute inset-y-0 left-0 bg-gradient-to-r from-emerald-500 to-cyan-500 transition-all duration-500"
              style={{ width: `${utilizationPercent}%` }}
            />
            <div className="absolute inset-0 flex items-center justify-between px-2 text-xs">
              <span className="text-foreground font-medium">Throughput: {metrics.throughput.toFixed(1)} Mbps</span>
              <span className="text-muted-foreground">Max: {metrics.shannonCapacity.toFixed(1)} Mbps</span>
            </div>
          </div>
        </div>

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-muted/30 rounded p-3 space-y-1">
            <div className="flex items-center gap-1.5 text-amber-400">
              <Gauge className="h-4 w-4" />
              <span className="text-xs">Spectral Efficiency</span>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-xl font-bold font-mono text-foreground">{metrics.spectralEfficiency.toFixed(2)}</span>
              <span className="text-xs text-muted-foreground">bits/s/Hz</span>
            </div>
          </div>

          <div className="bg-muted/30 rounded p-3 space-y-1">
            <div className="flex items-center gap-1.5 text-purple-400">
              <Binary className="h-4 w-4" />
              <span className="text-xs">Code Rate</span>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-xl font-bold font-mono text-foreground">{metrics.codeRate.toFixed(3)}</span>
              <span className="text-xs text-muted-foreground">R</span>
            </div>
          </div>

          <div className="bg-muted/30 rounded p-3 space-y-1">
            <div className="flex items-center gap-1.5 text-cyan-400">
              <Cpu className="h-4 w-4" />
              <span className="text-xs">CQI / MCS</span>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-xl font-bold font-mono text-foreground">{metrics.cqi}</span>
              <span className="text-muted-foreground">/</span>
              <span className="text-xl font-bold font-mono text-foreground">{metrics.mcs}</span>
            </div>
          </div>

          <div className="bg-muted/30 rounded p-3 space-y-1">
            <div className="flex items-center gap-1.5 text-rose-400">
              <Layers className="h-4 w-4" />
              <span className="text-xs">Resource Blocks</span>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-xl font-bold font-mono text-foreground">{maxRBs}</span>
              <span className="text-xs text-muted-foreground">RBs</span>
            </div>
          </div>
        </div>

        {/* Modulation Info */}
        <div className="flex items-center justify-between bg-muted/30 rounded p-3">
          <div className="flex items-center gap-2">
            <Wifi className="h-4 w-4 text-cyan-400" />
            <span className="text-sm text-muted-foreground">Active Modulation</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold font-mono text-cyan-400">{metrics.modulationType}</span>
            <ModulationBadge type={metrics.modulationType} />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function ModulationBadge({ type }: { type: string }) {
  const getColor = () => {
    switch (type) {
      case '1024-QAM': return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
      case '256-QAM': return 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30'
      case '64-QAM': return 'bg-blue-500/20 text-blue-400 border-blue-500/30'
      case '16-QAM': return 'bg-amber-500/20 text-amber-400 border-amber-500/30'
      case 'QPSK': return 'bg-orange-500/20 text-orange-400 border-orange-500/30'
      default: return 'bg-red-500/20 text-red-400 border-red-500/30'
    }
  }

  return (
    <span className={`text-[10px] px-1.5 py-0.5 rounded border ${getColor()}`}>
      {type === 'BPSK' ? '1' : type === 'QPSK' ? '2' : type.replace('-QAM', '')} bits/sym
    </span>
  )
}
