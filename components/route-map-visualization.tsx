"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Map, Navigation, Radio, AlertTriangle } from "lucide-react"
import { type TelecomMetrics, getStatusColor } from "@/lib/telecom-calculations"
import { useMemo } from "react"

interface RouteMapVisualizationProps {
  distance: number
  rssi: number
  metrics: TelecomMetrics
}

export function RouteMapVisualization({ distance, rssi, metrics }: RouteMapVisualizationProps) {
  // Generate cell towers along route
  const cellTowers = useMemo(() => [
    { id: 1, x: 50, y: 80, range: 8, name: 'Tower A', frequency: '1800 MHz', type: 'Macro' },
    { id: 2, x: 140, y: 50, range: 6, name: 'Tower B', frequency: '2600 MHz', type: 'Micro' },
    { id: 3, x: 250, y: 90, range: 10, name: 'Tower C', frequency: '800 MHz', type: 'Macro' },
    { id: 4, x: 350, y: 60, range: 5, name: 'Tower D', frequency: '2100 MHz', type: 'Small Cell' },
  ], [])

  // Low signal zones
  const lowSignalZones = useMemo(() => [
    { x: 170, y: 70, width: 40, height: 50, severity: 'low', name: 'Urban Canyon' },
    { x: 280, y: 40, width: 50, height: 40, severity: 'critical', name: 'Tunnel' },
  ], [])

  // Current position on route (0-400px based on distance 0-50km)
  const currentX = 30 + (distance / 50) * 370

  // Calculate which tower is serving
  const servingTower = useMemo(() => {
    let closest = cellTowers[0]
    let minDist = Infinity
    cellTowers.forEach(tower => {
      const dist = Math.abs(tower.x - currentX)
      if (dist < minDist) {
        minDist = dist
        closest = tower
      }
    })
    return closest
  }, [cellTowers, currentX])

  return (
    <Card className="bg-card/80 backdrop-blur border-border">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Map className="h-5 w-5 text-blue-400" />
          <span className="text-foreground">Route Signal Coverage Map</span>
          <span className="ml-auto text-xs text-muted-foreground font-normal">
            {distance.toFixed(1)} km traveled
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Map Visualization */}
        <div className="relative h-48 bg-gradient-to-b from-slate-900/50 to-slate-800/30 rounded-lg overflow-hidden border border-border">
          <svg viewBox="0 0 420 160" className="w-full h-full">
            <defs>
              {/* Tower coverage gradients */}
              <radialGradient id="coverageGood">
                <stop offset="0%" stopColor="rgb(34, 197, 94)" stopOpacity="0.3" />
                <stop offset="100%" stopColor="rgb(34, 197, 94)" stopOpacity="0" />
              </radialGradient>
              <radialGradient id="coverageFair">
                <stop offset="0%" stopColor="rgb(234, 179, 8)" stopOpacity="0.2" />
                <stop offset="100%" stopColor="rgb(234, 179, 8)" stopOpacity="0" />
              </radialGradient>
              
              {/* Route gradient */}
              <linearGradient id="routeGradient" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="rgb(59, 130, 246)" />
                <stop offset="100%" stopColor="rgb(168, 85, 247)" />
              </linearGradient>

              {/* Glow filter */}
              <filter id="glow">
                <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
                <feMerge>
                  <feMergeNode in="coloredBlur"/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
            </defs>

            {/* Grid background */}
            <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
              <path d="M 20 0 L 0 0 0 20" fill="none" stroke="currentColor" strokeOpacity="0.05" strokeWidth="0.5"/>
            </pattern>
            <rect width="100%" height="100%" fill="url(#grid)" />

            {/* Cell tower coverage areas */}
            {cellTowers.map((tower) => (
              <circle
                key={tower.id}
                cx={tower.x}
                cy={tower.y}
                r={tower.range * 8}
                fill={tower.id === servingTower.id ? 'url(#coverageGood)' : 'url(#coverageFair)'}
                className="transition-all duration-500"
              />
            ))}

            {/* Low signal zones */}
            {lowSignalZones.map((zone, i) => (
              <g key={i}>
                <rect
                  x={zone.x}
                  y={zone.y}
                  width={zone.width}
                  height={zone.height}
                  rx="4"
                  fill={zone.severity === 'critical' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(249, 115, 22, 0.15)'}
                  stroke={zone.severity === 'critical' ? 'rgb(239, 68, 68)' : 'rgb(249, 115, 22)'}
                  strokeWidth="1"
                  strokeDasharray="4,2"
                  opacity="0.8"
                />
                <text
                  x={zone.x + zone.width / 2}
                  y={zone.y + zone.height / 2}
                  textAnchor="middle"
                  fontSize="8"
                  fill={zone.severity === 'critical' ? 'rgb(239, 68, 68)' : 'rgb(249, 115, 22)'}
                  fontWeight="500"
                >
                  {zone.name}
                </text>
              </g>
            ))}

            {/* Route path */}
            <path
              d="M 30 100 Q 80 85 140 95 T 250 85 T 350 90 L 400 80"
              fill="none"
              stroke="url(#routeGradient)"
              strokeWidth="4"
              strokeLinecap="round"
              opacity="0.8"
            />

            {/* Distance markers */}
            {[0, 10, 20, 30, 40, 50].map((km, i) => {
              const x = 30 + (i / 5) * 370
              return (
                <g key={km}>
                  <circle cx={x} cy={130} r="2" fill="currentColor" fillOpacity="0.3" />
                  <text x={x} y={145} textAnchor="middle" fontSize="8" fill="currentColor" fillOpacity="0.4">
                    {km}km
                  </text>
                </g>
              )
            })}

            {/* Cell towers */}
            {cellTowers.map((tower) => (
              <g key={tower.id} className="cursor-pointer">
                <circle
                  cx={tower.x}
                  cy={tower.y}
                  r="8"
                  fill={tower.id === servingTower.id ? 'rgb(34, 197, 94)' : 'rgb(100, 116, 139)'}
                  stroke="white"
                  strokeWidth="2"
                  filter={tower.id === servingTower.id ? 'url(#glow)' : undefined}
                />
                <circle cx={tower.x} cy={tower.y - 12} r="3" fill="currentColor" fillOpacity="0.5" />
                <line x1={tower.x} y1={tower.y - 8} x2={tower.x} y2={tower.y - 4} stroke="currentColor" strokeOpacity="0.5" strokeWidth="1" />
                
                {/* Tower label */}
                <text
                  x={tower.x}
                  y={tower.y + 18}
                  textAnchor="middle"
                  fontSize="7"
                  fill="currentColor"
                  fillOpacity="0.6"
                >
                  {tower.name}
                </text>
              </g>
            ))}

            {/* Current position */}
            <g transform={`translate(${currentX}, 92)`} filter="url(#glow)">
              <circle r="10" fill="rgb(168, 85, 247)" opacity="0.3" className="animate-ping" />
              <circle r="6" fill="rgb(168, 85, 247)" stroke="white" strokeWidth="2" />
              <path
                d="M 0 -4 L 3 2 L 0 0 L -3 2 Z"
                fill="white"
              />
            </g>
          </svg>

          {/* Signal strength overlay */}
          <div className={`absolute top-2 right-2 px-2 py-1 rounded text-xs font-mono ${
            metrics.signalStatus === 'excellent' || metrics.signalStatus === 'good'
              ? 'bg-emerald-500/20 text-emerald-400'
              : metrics.signalStatus === 'fair'
              ? 'bg-yellow-500/20 text-yellow-400'
              : 'bg-red-500/20 text-red-400'
          }`}>
            {rssi} dBm
          </div>
        </div>

        {/* Tower Info and Stats */}
        <div className="grid grid-cols-2 gap-3">
          {/* Serving Cell Info */}
          <div className="bg-muted/30 rounded-lg p-3 space-y-2">
            <div className="flex items-center gap-2 text-emerald-400">
              <Radio className="h-4 w-4" />
              <span className="text-xs font-medium">Serving Cell</span>
            </div>
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Tower</span>
                <span className="font-mono text-foreground">{servingTower.name}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Frequency</span>
                <span className="font-mono text-foreground">{servingTower.frequency}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Type</span>
                <span className="font-mono text-foreground">{servingTower.type}</span>
              </div>
            </div>
          </div>

          {/* Link Quality */}
          <div className="bg-muted/30 rounded-lg p-3 space-y-2">
            <div className="flex items-center gap-2 text-cyan-400">
              <Navigation className="h-4 w-4" />
              <span className="text-xs font-medium">Link Quality</span>
            </div>
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Path Loss</span>
                <span className="font-mono text-foreground">{metrics.pathLoss} dB</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Link Budget</span>
                <span className={`font-mono ${metrics.linkBudget > 10 ? 'text-emerald-400' : metrics.linkBudget > 0 ? 'text-yellow-400' : 'text-red-400'}`}>
                  {metrics.linkBudget} dB
                </span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Fading Margin</span>
                <span className="font-mono text-foreground">{metrics.fadingMargin} dB</span>
              </div>
            </div>
          </div>
        </div>

        {/* Handover Prediction */}
        {distance > 0 && (
          <div className="flex items-center gap-2 bg-purple-500/10 text-purple-400 rounded p-2 text-xs">
            <AlertTriangle className="h-4 w-4" />
            <span>
              Next handover predicted in ~{Math.max(0, (15 - (distance % 15))).toFixed(1)} km
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
