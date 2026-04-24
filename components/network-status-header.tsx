"use client"

import { Signal, Wifi, Activity, Gauge, Radio } from "lucide-react"
import { type TelecomMetrics, getStatusColor } from "@/lib/telecom-calculations"

interface NetworkStatusHeaderProps {
  metrics: TelecomMetrics
}

export function NetworkStatusHeader({ metrics }: NetworkStatusHeaderProps) {
  return (
    <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Radio className="h-6 w-6 text-cyan-400" />
              <span className="text-lg font-bold text-foreground">SmartSignal Route</span>
            </div>
            <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">
              v2.1 Technical
            </span>
          </div>
          
          <div className="flex items-center gap-6">
            {/* Quick Metrics Bar */}
            <div className="hidden md:flex items-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <Signal className={`h-4 w-4 ${getStatusColor(metrics.signalStatus)}`} />
                <span className="text-muted-foreground">RSSI:</span>
                <span className={`font-mono ${getStatusColor(metrics.signalStatus)}`}>
                  {metrics.rssi} dBm
                </span>
              </div>
              
              <div className="w-px h-4 bg-border" />
              
              <div className="flex items-center gap-2">
                <Wifi className="h-4 w-4 text-cyan-400" />
                <span className="text-muted-foreground">SINR:</span>
                <span className="font-mono text-cyan-400">{metrics.sinr} dB</span>
              </div>
              
              <div className="w-px h-4 bg-border" />
              
              <div className="flex items-center gap-2">
                <Activity className="h-4 w-4 text-emerald-400" />
                <span className="text-muted-foreground">Throughput:</span>
                <span className="font-mono text-emerald-400">
                  {metrics.throughput.toFixed(1)} Mbps
                </span>
              </div>
              
              <div className="w-px h-4 bg-border" />
              
              <div className="flex items-center gap-2">
                <Gauge className="h-4 w-4 text-amber-400" />
                <span className="text-muted-foreground">CQI:</span>
                <span className="font-mono text-amber-400">{metrics.cqi}</span>
              </div>
            </div>
            
            {/* Signal Bars */}
            <div className="flex items-end gap-0.5">
              {[1, 2, 3, 4, 5].map((bar) => (
                <div
                  key={bar}
                  className={`w-1.5 rounded-sm transition-all duration-300 ${
                    bar <= metrics.signalBars
                      ? bar <= 1 ? 'bg-red-500' 
                        : bar <= 2 ? 'bg-orange-500'
                        : bar <= 3 ? 'bg-yellow-500'
                        : 'bg-emerald-500'
                      : 'bg-muted'
                  }`}
                  style={{ height: `${bar * 4 + 4}px` }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
