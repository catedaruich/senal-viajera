"use client"

import { useState } from "react"
import { MapPin, Navigation, Search, Radio, AlertTriangle, Wifi, WifiOff } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

interface DatoRuta {
  km: number
  senal: number
  zona: string
}

interface Props {
  distancia: number
  datosRuta: DatoRuta[]
  zonaActual: DatoRuta
  onCalcularRuta: (origen: string, destino: string) => void
  rutaCalculada: boolean
}

export function PlanificadorRuta({ distancia, datosRuta, zonaActual, onCalcularRuta, rutaCalculada }: Props) {
  const [origen, setOrigen] = useState("")
  const [destino, setDestino] = useState("")

  const getColorSenal = (senal: number) => {
    if (senal >= 4) return "#22c55e" // emerald-500
    if (senal >= 3) return "#0ea5e9" // sky-500
    if (senal >= 2) return "#f59e0b" // amber-500
    return "#ef4444" // red-500
  }

  const getColorClaseSenal = (senal: number) => {
    if (senal >= 4) return "bg-emerald-500"
    if (senal >= 3) return "bg-sky-500"
    if (senal >= 2) return "bg-amber-500"
    return "bg-red-500"
  }

  const getColorFondo = (senal: number) => {
    if (senal >= 4) return "bg-emerald-50"
    if (senal >= 3) return "bg-sky-50"
    if (senal >= 2) return "bg-amber-50"
    return "bg-red-50"
  }

  const handleCalcular = () => {
    if (origen && destino) {
      onCalcularRuta(origen, destino)
    }
  }

  // Calcular porcentaje de progreso
  const progreso = (distancia / 50) * 100

  return (
    <div className="bg-card rounded-2xl border border-border overflow-hidden h-full flex flex-col">
      {/* Panel de entrada de ruta */}
      <div className="p-4 border-b border-border bg-muted/30">
        <h2 className="font-semibold text-lg text-foreground mb-3 flex items-center gap-2">
          <Navigation className="w-5 h-5 text-sky-500" />
          Planifica tu ruta
        </h2>
        <div className="space-y-3">
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-500" />
            <Input
              placeholder="Punto de origen"
              value={origen}
              onChange={(e) => setOrigen(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-red-500" />
            <Input
              placeholder="Destino"
              value={destino}
              onChange={(e) => setDestino(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button 
            onClick={handleCalcular} 
            className="w-full bg-sky-500 hover:bg-sky-600"
            disabled={!origen || !destino}
          >
            <Search className="w-4 h-4 mr-2" />
            Calcular ruta
          </Button>
        </div>
      </div>

      {/* Mapa visual */}
      <div className="flex-1 relative bg-slate-100 min-h-[300px]">
        {/* Fondo del mapa con patron */}
        <div className="absolute inset-0">
          <svg className="w-full h-full" viewBox="0 0 400 300" preserveAspectRatio="xMidYMid slice">
            {/* Grid de fondo */}
            <defs>
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#e2e8f0" strokeWidth="1"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
            
            {/* Elementos del mapa decorativos */}
            <circle cx="60" cy="60" r="25" fill="#dcfce7" stroke="#86efac" strokeWidth="2" />
            <text x="60" y="65" textAnchor="middle" className="text-xs" fill="#166534">Ciudad</text>
            
            <circle cx="340" cy="240" r="25" fill="#fef3c7" stroke="#fcd34d" strokeWidth="2" />
            <text x="340" y="245" textAnchor="middle" className="text-xs" fill="#92400e">Destino</text>

            {/* Areas de cobertura */}
            <ellipse cx="100" cy="100" rx="60" ry="40" fill="#dcfce7" opacity="0.5" />
            <ellipse cx="320" cy="220" rx="50" ry="35" fill="#dcfce7" opacity="0.5" />
            <ellipse cx="200" cy="150" rx="40" ry="30" fill="#fef9c3" opacity="0.5" />
            
            {/* Zona sin cobertura */}
            <ellipse cx="250" cy="180" rx="35" ry="25" fill="#fee2e2" opacity="0.6" />
            <text x="250" y="185" textAnchor="middle" className="text-xs" fill="#dc2626">Sin senal</text>

            {rutaCalculada && (
              <>
                {/* Ruta principal */}
                <path 
                  d="M 60 60 Q 120 80 150 120 T 200 150 Q 230 170 260 190 T 340 240" 
                  fill="none" 
                  stroke="#cbd5e1" 
                  strokeWidth="8" 
                  strokeLinecap="round"
                />
                
                {/* Segmentos de cobertura sobre la ruta */}
                {/* Segmento verde - buena cobertura */}
                <path 
                  d="M 60 60 Q 120 80 150 120" 
                  fill="none" 
                  stroke="#22c55e" 
                  strokeWidth="6" 
                  strokeLinecap="round"
                  strokeDasharray={progreso > 20 ? "none" : `${progreso * 2} 200`}
                />
                
                {/* Segmento amarillo - cobertura media */}
                <path 
                  d="M 150 120 T 200 150" 
                  fill="none" 
                  stroke="#f59e0b" 
                  strokeWidth="6" 
                  strokeLinecap="round"
                  opacity={progreso > 20 ? 1 : 0.3}
                />
                
                {/* Segmento rojo - sin cobertura */}
                <path 
                  d="M 200 150 Q 230 170 260 190" 
                  fill="none" 
                  stroke="#ef4444" 
                  strokeWidth="6" 
                  strokeLinecap="round"
                  opacity={progreso > 40 ? 1 : 0.3}
                />
                
                {/* Segmento verde final */}
                <path 
                  d="M 260 190 T 340 240" 
                  fill="none" 
                  stroke="#22c55e" 
                  strokeWidth="6" 
                  strokeLinecap="round"
                  opacity={progreso > 70 ? 1 : 0.3}
                />

                {/* Marcadores de puntos clave */}
                {datosRuta.map((punto, index) => {
                  const positions = [
                    { x: 60, y: 60 },
                    { x: 90, y: 75 },
                    { x: 120, y: 95 },
                    { x: 150, y: 120 },
                    { x: 175, y: 135 },
                    { x: 200, y: 150 },
                    { x: 230, y: 170 },
                    { x: 260, y: 190 },
                    { x: 290, y: 210 },
                    { x: 315, y: 225 },
                    { x: 340, y: 240 },
                  ]
                  const pos = positions[index] || positions[0]
                  const esActual = punto.km <= distancia && (index === datosRuta.length - 1 || datosRuta[index + 1].km > distancia)
                  const yaPaso = punto.km < distancia
                  
                  return (
                    <g key={punto.km}>
                      <circle 
                        cx={pos.x} 
                        cy={pos.y} 
                        r={esActual ? 10 : 6}
                        fill={yaPaso || esActual ? getColorSenal(punto.senal) : "#94a3b8"}
                        stroke="white"
                        strokeWidth="2"
                      />
                      {esActual && (
                        <>
                          <circle 
                            cx={pos.x} 
                            cy={pos.y} 
                            r="16"
                            fill="none"
                            stroke={getColorSenal(punto.senal)}
                            strokeWidth="2"
                            opacity="0.5"
                          >
                            <animate attributeName="r" values="12;20;12" dur="2s" repeatCount="indefinite" />
                            <animate attributeName="opacity" values="0.5;0;0.5" dur="2s" repeatCount="indefinite" />
                          </circle>
                          <text x={pos.x} y={pos.y - 20} textAnchor="middle" fill="#1e293b" className="text-xs font-medium">
                            Tu ubicacion
                          </text>
                        </>
                      )}
                      {punto.senal <= 1 && !yaPaso && !esActual && (
                        <text x={pos.x + 12} y={pos.y - 5} fill="#ef4444" className="text-xs">⚠</text>
                      )}
                    </g>
                  )
                })}

                {/* Torres de senal */}
                <g transform="translate(80, 40)">
                  <rect x="-2" y="0" width="4" height="15" fill="#64748b" />
                  <circle cx="0" cy="-5" r="8" fill="#22c55e" opacity="0.3" />
                  <circle cx="0" cy="-5" r="4" fill="#22c55e" />
                </g>
                <g transform="translate(310, 195)">
                  <rect x="-2" y="0" width="4" height="15" fill="#64748b" />
                  <circle cx="0" cy="-5" r="8" fill="#22c55e" opacity="0.3" />
                  <circle cx="0" cy="-5" r="4" fill="#22c55e" />
                </g>
              </>
            )}
          </svg>
        </div>

        {/* Mensaje si no hay ruta calculada */}
        {!rutaCalculada && (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-100/80">
            <div className="text-center p-6">
              <Navigation className="w-12 h-12 text-slate-400 mx-auto mb-3" />
              <p className="text-slate-600 font-medium">Ingresa origen y destino</p>
              <p className="text-slate-500 text-sm">para ver la cobertura en tu ruta</p>
            </div>
          </div>
        )}
      </div>

      {/* Info de zona actual y leyenda */}
      <div className="p-4 border-t border-border bg-muted/30">
        {rutaCalculada && (
          <div className={`rounded-xl p-3 mb-3 ${getColorFondo(zonaActual.senal)}`}>
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-full ${getColorClaseSenal(zonaActual.senal)} flex items-center justify-center`}>
                {zonaActual.senal >= 2 ? (
                  <Wifi className="w-5 h-5 text-white" />
                ) : (
                  <WifiOff className="w-5 h-5 text-white" />
                )}
              </div>
              <div>
                <p className="font-medium text-slate-800">{zonaActual.zona}</p>
                <p className="text-sm text-slate-600">
                  Km {Math.round(distancia)} - Senal {zonaActual.senal}/5
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Leyenda */}
        <div className="flex flex-wrap gap-3 text-xs">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-emerald-500" />
            <span className="text-muted-foreground">Excelente</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-sky-500" />
            <span className="text-muted-foreground">Buena</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-amber-500" />
            <span className="text-muted-foreground">Limitada</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-500" />
            <span className="text-muted-foreground">Sin cobertura</span>
          </div>
        </div>
      </div>
    </div>
  )
}
