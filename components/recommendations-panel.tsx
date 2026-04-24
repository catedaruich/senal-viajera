"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { 
  Lightbulb, 
  MessageSquare, 
  Download, 
  Wifi, 
  Phone, 
  Video, 
  Cloud, 
  BatteryLow,
  MapPin,
  Radio,
  Smartphone,
  ArrowDown,
  Check,
  X
} from "lucide-react"
import { type TelecomMetrics } from "@/lib/telecom-calculations"

interface RecommendationsPanelProps {
  metrics: TelecomMetrics
}

interface Recommendation {
  icon: React.ReactNode
  title: string
  description: string
  priority: 'critical' | 'high' | 'medium' | 'low'
  action?: string
}

export function RecommendationsPanel({ metrics }: RecommendationsPanelProps) {
  const recommendations: Recommendation[] = []

  // Critical signal recommendations
  if (metrics.signalStatus === 'critical') {
    recommendations.push({
      icon: <Radio className="h-4 w-4" />,
      title: 'Switch to 2G/GSM Fallback',
      description: 'LTE signal too weak. Enable GSM fallback for voice/SMS.',
      priority: 'critical',
      action: 'Enable Network Mode: 2G/3G/LTE Auto'
    })
    recommendations.push({
      icon: <MapPin className="h-4 w-4" />,
      title: 'Download Offline Maps Now',
      description: 'GPS will work but navigation data may be unavailable.',
      priority: 'critical',
    })
  }

  // Poor signal recommendations
  if (metrics.signalStatus === 'poor' || metrics.signalStatus === 'critical') {
    recommendations.push({
      icon: <MessageSquare className="h-4 w-4" />,
      title: 'Queue Messages for Send',
      description: 'Compose messages now, they will send when signal improves.',
      priority: 'high',
    })
    recommendations.push({
      icon: <BatteryLow className="h-4 w-4" />,
      title: 'Enable Battery Saver Mode',
      description: 'Weak signal increases power consumption by up to 3x.',
      priority: 'high',
    })
  }

  // Throughput-based recommendations
  if (metrics.throughput < 1) {
    recommendations.push({
      icon: <Video className="h-4 w-4" />,
      title: 'Video Services Unavailable',
      description: `Current throughput (${metrics.throughput.toFixed(1)} Mbps) insufficient for video.`,
      priority: 'critical',
    })
  } else if (metrics.throughput < 5) {
    recommendations.push({
      icon: <ArrowDown className="h-4 w-4" />,
      title: 'Switch to Low Quality Streaming',
      description: 'Reduce video quality to 480p or lower for stable playback.',
      priority: 'high',
    })
  } else if (metrics.throughput < 15) {
    recommendations.push({
      icon: <Video className="h-4 w-4" />,
      title: 'HD Streaming May Buffer',
      description: 'Consider pre-downloading content for uninterrupted viewing.',
      priority: 'medium',
    })
  }

  // VoIP/Call quality recommendations
  if (metrics.mos < 3) {
    recommendations.push({
      icon: <Phone className="h-4 w-4" />,
      title: 'Use Circuit-Switched Voice',
      description: `MOS ${metrics.mos.toFixed(1)} too low for VoLTE. Use traditional calls.`,
      priority: metrics.mos < 2 ? 'critical' : 'high',
    })
  }

  // Latency recommendations
  if (metrics.latency > 150) {
    recommendations.push({
      icon: <Cloud className="h-4 w-4" />,
      title: 'Avoid Real-Time Applications',
      description: `${metrics.latency.toFixed(0)}ms latency will affect gaming, video calls.`,
      priority: metrics.latency > 300 ? 'critical' : 'high',
    })
  }

  // PER recommendations
  if (metrics.per > 0.05) {
    recommendations.push({
      icon: <Download className="h-4 w-4" />,
      title: 'Pause Large Downloads',
      description: `${(metrics.per * 100).toFixed(1)}% packet loss will cause retransmissions.`,
      priority: metrics.per > 0.2 ? 'critical' : 'high',
    })
  }

  // Distance to loss recommendations
  if (metrics.distanceToLoss < 5 && metrics.distanceToLoss > 0) {
    recommendations.push({
      icon: <Wifi className="h-4 w-4" />,
      title: 'Signal Loss in ' + metrics.distanceToLoss.toFixed(1) + ' km',
      description: 'Complete pending tasks requiring connectivity now.',
      priority: 'critical',
    })
  }

  // General optimization recommendations
  if (metrics.signalStatus === 'fair') {
    recommendations.push({
      icon: <Smartphone className="h-4 w-4" />,
      title: 'Optimize Data Usage',
      description: 'Disable auto-sync and background app refresh.',
      priority: 'medium',
    })
  }

  // Good signal - positive recommendations
  if (metrics.signalStatus === 'excellent' || metrics.signalStatus === 'good') {
    if (recommendations.length === 0) {
      recommendations.push({
        icon: <Download className="h-4 w-4" />,
        title: 'Optimal Time for Downloads',
        description: 'Download maps, media, and updates while signal is strong.',
        priority: 'low',
      })
      recommendations.push({
        icon: <Cloud className="h-4 w-4" />,
        title: 'Sync Cloud Services',
        description: 'Back up photos and documents to cloud storage.',
        priority: 'low',
      })
    }
  }

  // Sort by priority
  const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 }
  recommendations.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority])

  return (
    <Card className="bg-card/80 backdrop-blur border-border">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Lightbulb className="h-5 w-5 text-amber-400" />
          <span className="text-foreground">Smart Recommendations</span>
          <span className={`ml-auto text-xs px-2 py-0.5 rounded ${
            recommendations.some(r => r.priority === 'critical')
              ? 'bg-red-500/20 text-red-400'
              : recommendations.some(r => r.priority === 'high')
              ? 'bg-amber-500/20 text-amber-400'
              : 'bg-emerald-500/20 text-emerald-400'
          }`}>
            {recommendations.filter(r => r.priority === 'critical').length} Critical
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {recommendations.slice(0, 5).map((rec, i) => (
          <RecommendationItem key={i} recommendation={rec} />
        ))}

        {/* Service Availability Grid */}
        <div className="border-t border-border pt-3 mt-3">
          <h4 className="text-xs font-medium text-muted-foreground mb-2">Service Availability</h4>
          <div className="grid grid-cols-4 gap-2">
            <ServiceStatus 
              name="Voice" 
              available={metrics.mos >= 2.5} 
              degraded={metrics.mos >= 2.5 && metrics.mos < 3.5}
            />
            <ServiceStatus 
              name="SMS" 
              available={metrics.rssi >= -110} 
            />
            <ServiceStatus 
              name="Data" 
              available={metrics.throughput >= 0.1} 
              degraded={metrics.throughput < 5}
            />
            <ServiceStatus 
              name="VoLTE" 
              available={metrics.mos >= 3.5 && metrics.latency < 100} 
              degraded={metrics.mos >= 3 && metrics.latency < 150}
            />
          </div>
        </div>

        {/* Recommended Actions Summary */}
        <div className="bg-muted/30 rounded p-3 text-xs">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-muted-foreground">Recommended Network Mode:</span>
            <span className="font-mono font-medium text-foreground">
              {metrics.signalStatus === 'critical' ? '2G/3G Auto' 
               : metrics.signalStatus === 'poor' ? '3G/LTE Auto'
               : 'LTE Preferred'}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground">Max Recommended Bitrate:</span>
            <span className="font-mono font-medium text-foreground">
              {Math.max(0, Math.min(metrics.throughput * 0.7, 50)).toFixed(1)} Mbps
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function RecommendationItem({ recommendation }: { recommendation: Recommendation }) {
  const priorityColors = {
    critical: 'border-red-500/30 bg-red-500/5',
    high: 'border-amber-500/30 bg-amber-500/5',
    medium: 'border-yellow-500/30 bg-yellow-500/5',
    low: 'border-emerald-500/30 bg-emerald-500/5',
  }

  const iconColors = {
    critical: 'text-red-400',
    high: 'text-amber-400',
    medium: 'text-yellow-400',
    low: 'text-emerald-400',
  }

  return (
    <div className={`border rounded-lg p-3 ${priorityColors[recommendation.priority]}`}>
      <div className="flex items-start gap-3">
        <div className={`mt-0.5 ${iconColors[recommendation.priority]}`}>
          {recommendation.icon}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h4 className="text-sm font-medium text-foreground">{recommendation.title}</h4>
            <span className={`text-[10px] uppercase px-1.5 py-0.5 rounded ${
              recommendation.priority === 'critical' ? 'bg-red-500/20 text-red-400'
              : recommendation.priority === 'high' ? 'bg-amber-500/20 text-amber-400'
              : recommendation.priority === 'medium' ? 'bg-yellow-500/20 text-yellow-400'
              : 'bg-emerald-500/20 text-emerald-400'
            }`}>
              {recommendation.priority}
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">{recommendation.description}</p>
          {recommendation.action && (
            <p className="text-[10px] text-muted-foreground mt-1 font-mono bg-muted/50 px-1.5 py-0.5 rounded inline-block">
              {recommendation.action}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

function ServiceStatus({ name, available, degraded = false }: { name: string; available: boolean; degraded?: boolean }) {
  return (
    <div className={`text-center p-2 rounded text-xs ${
      !available 
        ? 'bg-red-500/10 text-red-400' 
        : degraded 
        ? 'bg-amber-500/10 text-amber-400'
        : 'bg-emerald-500/10 text-emerald-400'
    }`}>
      <div className="flex justify-center mb-1">
        {!available ? (
          <X className="h-3.5 w-3.5" />
        ) : degraded ? (
          <span className="text-amber-400">~</span>
        ) : (
          <Check className="h-3.5 w-3.5" />
        )}
      </div>
      <span className="font-medium">{name}</span>
    </div>
  )
}
