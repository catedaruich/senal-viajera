"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingDown, MapPin } from "lucide-react"
import { type TelecomMetrics } from "@/lib/telecom-calculations"
import { useMemo } from "react"

interface SignalDegradationChartProps {
  rssi: number
  sinr: number
  distance: number
  metrics: TelecomMetrics
}

export function SignalDegradationChart({ rssi, sinr, distance, metrics }: SignalDegradationChartProps) {
  // Generate route signal prediction data
  const routeData = useMemo(() => {
    const points = 50
    const totalDistance = 50 // km
    
    return Array.from({ length: points }, (_, i) => {
      const dist = (i / points) * totalDistance
      
      // Simulate terrain effects
      const terrainLoss = Math.sin(dist * 0.5) * 10 + Math.sin(dist * 0.15) * 5
      const urbanFade = dist > 15 && dist < 25 ? 15 : 0 // Urban canyon
      const tunnelLoss = dist > 35 && dist < 38 ? 30 : 0 // Tunnel
      
      // Path loss model
      const baseLoss = dist * 0.8
      const predictedRssi = -65 - baseLoss - terrainLoss - urbanFade - tunnelLoss
      const predictedSinr = 15 - (baseLoss * 0.3) - (terrainLoss * 0.2) - urbanFade * 0.5
      
      return {
        distance: dist,
        rssi: Math.max(-120, predictedRssi),
        sinr: Math.max(-10, predictedSinr),
        isLowSignal: predictedRssi < -100,
        isCritical: predictedRssi < -110,
      }
    })
  }, [])

  // Find low signal zones
  const lowSignalZones = useMemo(() => {
    const zones: { start: number; end: number; severity: 'low' | 'critical' }[] = []
    let currentZone: { start: number; end: number; severity: 'low' | 'critical' } | null = null
    
    routeData.forEach((point, i) => {
      if (point.isCritical || point.isLowSignal) {
        const severity = point.isCritical ? 'critical' : 'low'
        if (!currentZone) {
          currentZone = { start: point.distance, end: point.distance, severity }
        } else {
          currentZone.end = point.distance
          if (point.isCritical) currentZone.severity = 'critical'
        }
      } else if (currentZone) {
        zones.push(currentZone)
        currentZone = null
      }
    })
    if (currentZone) zones.push(currentZone)
    return zones
  }, [routeData])

  // Chart dimensions
  const chartWidth = 400
  const chartHeight = 160
  const padding = { top: 20, right: 20, bottom: 30, left: 45 }
  const graphWidth = chartWidth - padding.left - padding.right
  const graphHeight = chartHeight - padding.top - padding.bottom

  // Scales
  const xScale = (d: number) => padding.left + (d / 50) * graphWidth
  const rssiScale = (v: number) => padding.top + (((-60) - v) / 60) * graphHeight
  const sinrScale = (v: number) => padding.top + ((20 - v) / 35) * graphHeight

  // Generate path strings
  const rssiPath = routeData.map((d, i) => 
    `${i === 0 ? 'M' : 'L'} ${xScale(d.distance)} ${rssiScale(d.rssi)}`
  ).join(' ')
  
  const sinrPath = routeData.map((d, i) => 
    `${i === 0 ? 'M' : 'L'} ${xScale(d.distance)} ${sinrScale(d.sinr)}`
  ).join(' ')

  return (
    <Card className="bg-card/80 backdrop-blur border-border">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <TrendingDown className="h-5 w-5 text-orange-400" />
          <span className="text-foreground">Signal Degradation Forecast</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Main Chart */}
        <div className="relative bg-muted/20 rounded-lg p-2 overflow-hidden">
          <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="w-full h-auto">
            <defs>
              {/* Gradient for RSSI line */}
              <linearGradient id="rssiGradient" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="rgb(34, 197, 94)" />
                <stop offset="40%" stopColor="rgb(234, 179, 8)" />
                <stop offset="70%" stopColor="rgb(249, 115, 22)" />
                <stop offset="100%" stopColor="rgb(239, 68, 68)" />
              </linearGradient>
              
              {/* Gradient for fill */}
              <linearGradient id="rssiFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="rgb(34, 197, 94)" stopOpacity="0.3" />
                <stop offset="100%" stopColor="rgb(239, 68, 68)" stopOpacity="0.1" />
              </linearGradient>

              {/* Critical zone pattern */}
              <pattern id="criticalPattern" patternUnits="userSpaceOnUse" width="4" height="4">
                <path d="M-1,1 l2,-2 M0,4 l4,-4 M3,5 l2,-2" stroke="rgba(239, 68, 68, 0.3)" strokeWidth="1"/>
              </pattern>
            </defs>

            {/* Grid lines */}
            {[-80, -100, -120].map((v) => (
              <g key={v}>
                <line
                  x1={padding.left}
                  y1={rssiScale(v)}
                  x2={chartWidth - padding.right}
                  y2={rssiScale(v)}
                  stroke="currentColor"
                  strokeOpacity="0.1"
                  strokeDasharray="2,2"
                />
                <text
                  x={padding.left - 5}
                  y={rssiScale(v)}
                  textAnchor="end"
                  fontSize="8"
                  fill="currentColor"
                  fillOpacity="0.5"
                  dominantBaseline="middle"
                >
                  {v}
                </text>
              </g>
            ))}

            {/* X-axis labels */}
            {[0, 10, 20, 30, 40, 50].map((km) => (
              <text
                key={km}
                x={xScale(km)}
                y={chartHeight - 8}
                textAnchor="middle"
                fontSize="8"
                fill="currentColor"
                fillOpacity="0.5"
              >
                {km}km
              </text>
            ))}

            {/* Low signal zones */}
            {lowSignalZones.map((zone, i) => (
              <rect
                key={i}
                x={xScale(zone.start)}
                y={padding.top}
                width={xScale(zone.end) - xScale(zone.start) + 2}
                height={graphHeight}
                fill={zone.severity === 'critical' ? 'url(#criticalPattern)' : 'rgba(249, 115, 22, 0.15)'}
                rx="2"
              />
            ))}

            {/* RSSI area fill */}
            <path
              d={`${rssiPath} L ${xScale(50)} ${chartHeight - padding.bottom} L ${xScale(0)} ${chartHeight - padding.bottom} Z`}
              fill="url(#rssiFill)"
            />

            {/* Signal threshold lines */}
            <line
              x1={padding.left}
              y1={rssiScale(-100)}
              x2={chartWidth - padding.right}
              y2={rssiScale(-100)}
              stroke="rgb(234, 179, 8)"
              strokeWidth="1"
              strokeDasharray="4,2"
              opacity="0.7"
            />
            <line
              x1={padding.left}
              y1={rssiScale(-110)}
              x2={chartWidth - padding.right}
              y2={rssiScale(-110)}
              stroke="rgb(239, 68, 68)"
              strokeWidth="1"
              strokeDasharray="4,2"
              opacity="0.7"
            />

            {/* RSSI line */}
            <path
              d={rssiPath}
              fill="none"
              stroke="url(#rssiGradient)"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* SINR line */}
            <path
              d={sinrPath}
              fill="none"
              stroke="rgb(34, 211, 238)"
              strokeWidth="1.5"
              strokeDasharray="4,2"
              opacity="0.7"
            />

            {/* Current position marker */}
            <g transform={`translate(${xScale(distance)}, 0)`}>
              <line
                y1={padding.top}
                y2={chartHeight - padding.bottom}
                stroke="rgb(168, 85, 247)"
                strokeWidth="2"
              />
              <circle
                cy={rssiScale(rssi)}
                r="4"
                fill="rgb(168, 85, 247)"
                stroke="white"
                strokeWidth="2"
              />
              <g transform={`translate(0, ${padding.top - 8})`}>
                <rect x="-12" y="-6" width="24" height="12" rx="2" fill="rgb(168, 85, 247)" />
                <text textAnchor="middle" fontSize="7" fill="white" dy="3" fontWeight="bold">
                  HERE
                </text>
              </g>
            </g>

            {/* Y-axis label */}
            <text
              x="12"
              y={chartHeight / 2}
              textAnchor="middle"
              fontSize="8"
              fill="currentColor"
              fillOpacity="0.5"
              transform={`rotate(-90, 12, ${chartHeight / 2})`}
            >
              RSSI (dBm)
            </text>
          </svg>
        </div>

        {/* Legend */}
        <div className="flex items-center justify-center gap-4 text-xs">
          <div className="flex items-center gap-1.5">
            <div className="w-4 h-0.5 bg-gradient-to-r from-green-500 via-yellow-500 to-red-500 rounded" />
            <span className="text-muted-foreground">RSSI</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-4 h-0.5 border-t-2 border-dashed border-cyan-400" />
            <span className="text-muted-foreground">SINR</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 bg-orange-500/20 rounded" />
            <span className="text-muted-foreground">Low Signal</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 bg-red-500/20 rounded border border-red-500/30" style={{backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 2px, rgba(239, 68, 68, 0.2) 2px, rgba(239, 68, 68, 0.2) 4px)'}} />
            <span className="text-muted-foreground">Critical</span>
          </div>
        </div>

        {/* Low Signal Zones List */}
        {lowSignalZones.length > 0 && (
          <div className="border-t border-border pt-3">
            <h4 className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              Predicted Low Signal Zones
            </h4>
            <div className="space-y-1">
              {lowSignalZones.slice(0, 3).map((zone, i) => (
                <div 
                  key={i} 
                  className={`flex items-center justify-between text-xs p-2 rounded ${
                    zone.severity === 'critical' 
                      ? 'bg-red-500/10 text-red-400' 
                      : 'bg-orange-500/10 text-orange-400'
                  }`}
                >
                  <span className="font-mono">
                    {zone.start.toFixed(1)} - {zone.end.toFixed(1)} km
                  </span>
                  <span className="uppercase text-[10px] font-medium">
                    {zone.severity}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
