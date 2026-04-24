"use client"

import { AlertTriangle, Clock, MapPin, Zap, WifiOff, ArrowRight } from "lucide-react"
import { type TelecomMetrics, getStatusColor, getStatusBgColor } from "@/lib/telecom-calculations"

interface PredictionAlertProps {
  metrics: TelecomMetrics
  distance: number
}

export function PredictionAlert({ metrics, distance }: PredictionAlertProps) {
  const isWarning = metrics.distanceToLoss < 10 || metrics.signalStatus === 'poor' || metrics.signalStatus === 'critical'
  const isCritical = metrics.distanceToLoss < 3 || metrics.signalStatus === 'critical'

  if (metrics.signalStatus === 'excellent' && metrics.distanceToLoss > 20) {
    return (
      <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-emerald-500/20">
            <Zap className="h-5 w-5 text-emerald-400" />
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-emerald-400">Optimal Signal Conditions</h3>
            <p className="text-xs text-emerald-400/70 mt-0.5">
              Strong coverage for the next {metrics.distanceToLoss.toFixed(1)} km • All services available
            </p>
          </div>
          <div className="text-right">
            <div className="text-lg font-bold font-mono text-emerald-400">{metrics.throughput.toFixed(0)} Mbps</div>
            <div className="text-[10px] text-emerald-400/60 uppercase">Est. Throughput</div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`rounded-lg p-4 border ${
      isCritical 
        ? 'bg-red-500/10 border-red-500/30' 
        : isWarning 
        ? 'bg-amber-500/10 border-amber-500/30'
        : 'bg-yellow-500/10 border-yellow-500/30'
    }`}>
      <div className="flex items-start gap-4">
        {/* Alert Icon */}
        <div className={`flex items-center justify-center w-12 h-12 rounded-full ${
          isCritical 
            ? 'bg-red-500/20' 
            : isWarning 
            ? 'bg-amber-500/20'
            : 'bg-yellow-500/20'
        }`}>
          {isCritical ? (
            <WifiOff className={`h-6 w-6 ${isCritical ? 'text-red-400' : 'text-amber-400'}`} />
          ) : (
            <AlertTriangle className={`h-6 w-6 ${isWarning ? 'text-amber-400' : 'text-yellow-400'}`} />
          )}
        </div>

        {/* Alert Content */}
        <div className="flex-1 space-y-3">
          <div>
            <h3 className={`text-sm font-semibold ${
              isCritical ? 'text-red-400' : isWarning ? 'text-amber-400' : 'text-yellow-400'
            }`}>
              {isCritical 
                ? 'Critical Signal Degradation Imminent'
                : isWarning 
                ? 'Signal Loss Warning'
                : 'Reduced Signal Quality Ahead'
              }
            </h3>
            <p className={`text-xs mt-0.5 ${
              isCritical ? 'text-red-400/70' : isWarning ? 'text-amber-400/70' : 'text-yellow-400/70'
            }`}>
              {isCritical
                ? 'Prepare for potential service interruption. Take immediate action.'
                : isWarning
                ? 'Signal degradation expected. Consider preemptive measures.'
                : 'Minor signal reduction anticipated. Services may be affected.'
              }
            </p>
          </div>

          {/* Metrics Row */}
          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-1.5">
              <MapPin className={`h-3.5 w-3.5 ${isCritical ? 'text-red-400' : 'text-amber-400'}`} />
              <span className="text-muted-foreground">Distance to loss:</span>
              <span className={`font-mono font-semibold ${isCritical ? 'text-red-400' : 'text-amber-400'}`}>
                {metrics.distanceToLoss.toFixed(1)} km
              </span>
            </div>
            <div className="w-px h-4 bg-border" />
            <div className="flex items-center gap-1.5">
              <Clock className={`h-3.5 w-3.5 ${isCritical ? 'text-red-400' : 'text-amber-400'}`} />
              <span className="text-muted-foreground">Time @ 60km/h:</span>
              <span className={`font-mono font-semibold ${isCritical ? 'text-red-400' : 'text-amber-400'}`}>
                {metrics.timeToLoss.toFixed(1)} min
              </span>
            </div>
          </div>

          {/* Impact Assessment */}
          <div className="flex flex-wrap gap-2">
            {metrics.throughput < 5 && (
              <ImpactBadge 
                label="Video Streaming" 
                status="blocked" 
              />
            )}
            {metrics.throughput < 10 && metrics.throughput >= 5 && (
              <ImpactBadge 
                label="HD Video" 
                status="degraded" 
              />
            )}
            {metrics.latency > 100 && (
              <ImpactBadge 
                label="VoIP Calls" 
                status={metrics.latency > 200 ? 'blocked' : 'degraded'} 
              />
            )}
            {metrics.per > 0.1 && (
              <ImpactBadge 
                label="File Transfer" 
                status={metrics.per > 0.3 ? 'blocked' : 'degraded'} 
              />
            )}
            {metrics.mos < 3 && (
              <ImpactBadge 
                label="Voice Quality" 
                status={metrics.mos < 2 ? 'blocked' : 'degraded'} 
              />
            )}
          </div>
        </div>

        {/* Current Status */}
        <div className={`text-right px-3 py-2 rounded-lg ${getStatusBgColor(metrics.signalStatus)}`}>
          <div className={`text-lg font-bold font-mono ${getStatusColor(metrics.signalStatus)}`}>
            {metrics.rssi} dBm
          </div>
          <div className={`text-[10px] uppercase ${getStatusColor(metrics.signalStatus)}`}>
            {metrics.signalStatus}
          </div>
        </div>
      </div>
    </div>
  )
}

function ImpactBadge({ label, status }: { label: string; status: 'blocked' | 'degraded' }) {
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium ${
      status === 'blocked' 
        ? 'bg-red-500/20 text-red-400' 
        : 'bg-amber-500/20 text-amber-400'
    }`}>
      {status === 'blocked' ? '✕' : '⚠'} {label}
    </span>
  )
}
