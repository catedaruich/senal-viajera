"use client"

import { useState, useEffect, useMemo } from "react"
import { SignalMetricsPanel } from "@/components/signal-metrics-panel"
import { ChannelAnalysisPanel } from "@/components/channel-analysis-panel"
import { SignalDegradationChart } from "@/components/signal-degradation-chart"
import { RouteMapVisualization } from "@/components/route-map-visualization"
import { ControlPanel } from "@/components/control-panel"
import { RecommendationsPanel } from "@/components/recommendations-panel"
import { PredictionAlert } from "@/components/prediction-alert"
import { NetworkStatusHeader } from "@/components/network-status-header"
import { SpectralAnalysis } from "@/components/spectral-analysis"
import { calculateTelecomMetrics, type TelecomMetrics } from "@/lib/telecom-calculations"

export default function SmartSignalRoute() {
  const [rssi, setRssi] = useState(-65) // dBm
  const [sinr, setSinr] = useState(15) // dB
  const [distance, setDistance] = useState(0) // km from current position
  const [bandwidth, setBandwidth] = useState(20) // MHz
  const [frequency, setFrequency] = useState(1800) // MHz (LTE Band 3)
  const [modulationIndex, setModulationIndex] = useState(4) // 64-QAM
  const [pathLossExponent, setPathLossExponent] = useState(3.5)
  const [isSimulating, setIsSimulating] = useState(false)

  // Calculate all telecom metrics
  const metrics: TelecomMetrics = useMemo(() => 
    calculateTelecomMetrics({
      rssi,
      sinr,
      bandwidth,
      frequency,
      modulationIndex,
      pathLossExponent,
      distance
    }),
    [rssi, sinr, bandwidth, frequency, modulationIndex, pathLossExponent, distance]
  )

  // Simulation effect for route traversal
  useEffect(() => {
    if (!isSimulating) return
    
    const interval = setInterval(() => {
      setDistance(prev => {
        const newDist = prev + 0.5
        if (newDist >= 50) {
          setIsSimulating(false)
          return 0
        }
        // Simulate signal degradation based on distance
        const degradation = Math.sin(newDist * 0.3) * 15 + (newDist * 0.4)
        setRssi(Math.max(-120, -65 - degradation))
        setSinr(Math.max(-5, 15 - (degradation * 0.5)))
        return newDist
      })
    }, 500)
    
    return () => clearInterval(interval)
  }, [isSimulating])

  return (
    <div className="min-h-screen bg-background">
      <NetworkStatusHeader metrics={metrics} />
      
      <main className="container mx-auto p-4 space-y-4">
        {/* Top Row: Map and Signal Degradation */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <RouteMapVisualization 
            distance={distance} 
            rssi={rssi}
            metrics={metrics}
          />
          <SignalDegradationChart 
            rssi={rssi}
            sinr={sinr}
            distance={distance}
            metrics={metrics}
          />
        </div>

        {/* Middle Row: Metrics and Analysis */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <SignalMetricsPanel metrics={metrics} rssi={rssi} sinr={sinr} />
          <ChannelAnalysisPanel metrics={metrics} bandwidth={bandwidth} />
          <SpectralAnalysis 
            frequency={frequency}
            bandwidth={bandwidth}
            sinr={sinr}
            modulationIndex={modulationIndex}
          />
        </div>

        {/* Prediction Alert */}
        <PredictionAlert metrics={metrics} distance={distance} />

        {/* Bottom Row: Controls and Recommendations */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <ControlPanel
            rssi={rssi}
            setRssi={setRssi}
            sinr={sinr}
            setSinr={setSinr}
            bandwidth={bandwidth}
            setBandwidth={setBandwidth}
            frequency={frequency}
            setFrequency={setFrequency}
            modulationIndex={modulationIndex}
            setModulationIndex={setModulationIndex}
            pathLossExponent={pathLossExponent}
            setPathLossExponent={setPathLossExponent}
            isSimulating={isSimulating}
            setIsSimulating={setIsSimulating}
            distance={distance}
            setDistance={setDistance}
          />
          <RecommendationsPanel metrics={metrics} />
        </div>
      </main>
    </div>
  )
}
