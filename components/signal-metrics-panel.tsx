"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Signal, Antenna, Volume2, Zap, Timer, Activity } from "lucide-react"
import { type TelecomMetrics, getStatusColor, getStatusBgColor, formatScientific } from "@/lib/telecom-calculations"
import { Progress } from "@/components/ui/progress"

interface SignalMetricsPanelProps {
  metrics: TelecomMetrics
  rssi: number
  sinr: number
}

export function SignalMetricsPanel({ metrics, rssi, sinr }: SignalMetricsPanelProps) {
  // Normalize values for progress bars
  const rssiNormalized = Math.max(0, Math.min(100, ((rssi + 120) / 60) * 100))
  const sinrNormalized = Math.max(0, Math.min(100, ((sinr + 10) / 40) * 100))
  const rsrpNormalized = Math.max(0, Math.min(100, ((metrics.rsrp + 140) / 60) * 100))
  const rsrqNormalized = Math.max(0, Math.min(100, ((metrics.rsrq + 20) / 17) * 100))

  return (
    <Card className="bg-card/80 backdrop-blur border-border">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Signal className="h-5 w-5 text-cyan-400" />
          <span className="text-foreground">Signal Quality Metrics</span>
          <span className={`ml-auto text-xs px-2 py-0.5 rounded ${getStatusBgColor(metrics.signalStatus)} ${getStatusColor(metrics.signalStatus)}`}>
            {metrics.signalStatus.toUpperCase()}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Primary Signal Indicators */}
        <div className="grid grid-cols-2 gap-3">
          <MetricCard
            icon={<Antenna className="h-4 w-4" />}
            label="RSSI"
            value={`${rssi} dBm`}
            subLabel="Received Signal Strength"
            progress={rssiNormalized}
            color="cyan"
          />
          <MetricCard
            icon={<Volume2 className="h-4 w-4" />}
            label="SINR"
            value={`${sinr} dB`}
            subLabel="Signal-to-Interference+Noise"
            progress={sinrNormalized}
            color="emerald"
          />
        </div>

        {/* LTE-specific Metrics */}
        <div className="grid grid-cols-2 gap-3">
          <MetricCard
            icon={<Zap className="h-4 w-4" />}
            label="RSRP"
            value={`${metrics.rsrp} dBm`}
            subLabel="Ref Signal Received Power"
            progress={rsrpNormalized}
            color="amber"
          />
          <MetricCard
            icon={<Activity className="h-4 w-4" />}
            label="RSRQ"
            value={`${metrics.rsrq} dB`}
            subLabel="Ref Signal Received Quality"
            progress={rsrqNormalized}
            color="purple"
          />
        </div>

        {/* QoS Metrics */}
        <div className="border-t border-border pt-3">
          <h4 className="text-xs font-medium text-muted-foreground mb-2">Quality of Service</h4>
          <div className="grid grid-cols-4 gap-2 text-center">
            <div className="bg-muted/50 rounded p-2">
              <div className="text-xs text-muted-foreground">BER</div>
              <div className="text-sm font-mono text-foreground">{formatScientific(metrics.ber)}</div>
            </div>
            <div className="bg-muted/50 rounded p-2">
              <div className="text-xs text-muted-foreground">PER</div>
              <div className="text-sm font-mono text-foreground">{(metrics.per * 100).toFixed(2)}%</div>
            </div>
            <div className="bg-muted/50 rounded p-2">
              <div className="text-xs text-muted-foreground">Latency</div>
              <div className="text-sm font-mono text-foreground">{metrics.latency}ms</div>
            </div>
            <div className="bg-muted/50 rounded p-2">
              <div className="text-xs text-muted-foreground flex items-center justify-center gap-1">
                <Timer className="h-3 w-3" /> Jitter
              </div>
              <div className="text-sm font-mono text-foreground">{metrics.jitter}ms</div>
            </div>
          </div>
        </div>

        {/* MOS Score */}
        <div className="flex items-center justify-between bg-muted/30 rounded p-2">
          <span className="text-sm text-muted-foreground">MOS (Voice Quality)</span>
          <div className="flex items-center gap-2">
            <div className="flex gap-0.5">
              {[1, 2, 3, 4, 5].map((star) => (
                <div
                  key={star}
                  className={`h-3 w-3 rounded-full ${
                    star <= Math.round(metrics.mos)
                      ? metrics.mos >= 4 ? 'bg-emerald-400'
                        : metrics.mos >= 3 ? 'bg-yellow-400'
                        : 'bg-red-400'
                      : 'bg-muted'
                  }`}
                />
              ))}
            </div>
            <span className="font-mono text-sm text-foreground">{metrics.mos.toFixed(2)}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

interface MetricCardProps {
  icon: React.ReactNode
  label: string
  value: string
  subLabel: string
  progress: number
  color: 'cyan' | 'emerald' | 'amber' | 'purple' | 'red'
}

function MetricCard({ icon, label, value, subLabel, progress, color }: MetricCardProps) {
  const colorClasses = {
    cyan: 'text-cyan-400',
    emerald: 'text-emerald-400',
    amber: 'text-amber-400',
    purple: 'text-purple-400',
    red: 'text-red-400',
  }

  const progressColors = {
    cyan: '[&>div]:bg-cyan-400',
    emerald: '[&>div]:bg-emerald-400',
    amber: '[&>div]:bg-amber-400',
    purple: '[&>div]:bg-purple-400',
    red: '[&>div]:bg-red-400',
  }

  return (
    <div className="bg-muted/30 rounded-lg p-3 space-y-2">
      <div className="flex items-center justify-between">
        <div className={`flex items-center gap-1.5 ${colorClasses[color]}`}>
          {icon}
          <span className="text-xs font-medium">{label}</span>
        </div>
        <span className={`text-sm font-mono font-semibold ${colorClasses[color]}`}>{value}</span>
      </div>
      <Progress value={progress} className={`h-1.5 ${progressColors[color]}`} />
      <div className="text-[10px] text-muted-foreground truncate">{subLabel}</div>
    </div>
  )
}
