"use client"

import { Signal, Wifi, MapPin } from "lucide-react"

interface Props {
  nivelSenal: number
  zonaActual: string
  velocidadInternet: number
}

export function EncabezadoSenal({ nivelSenal, zonaActual, velocidadInternet }: Props) {
  const getColorSenal = () => {
    if (nivelSenal >= 4) return "text-emerald-500"
    if (nivelSenal >= 3) return "text-sky-500"
    if (nivelSenal >= 2) return "text-amber-500"
    return "text-red-500"
  }

  const getEstadoTexto = () => {
    if (nivelSenal >= 4) return "Excelente"
    if (nivelSenal >= 3) return "Buena"
    if (nivelSenal >= 2) return "Limitada"
    return "Sin cobertura"
  }

  return (
    <header className="sticky top-0 z-50 bg-card/95 backdrop-blur border-b border-border">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Logo y titulo */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-sky-500 flex items-center justify-center">
              <Signal className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-lg text-foreground">Senal Viajero</h1>
              <p className="text-xs text-muted-foreground">Tu cobertura en el camino</p>
            </div>
          </div>

          {/* Estado actual */}
          <div className="flex items-center gap-4">
            {/* Ubicacion */}
            <div className="hidden sm:flex items-center gap-2 text-sm">
              <MapPin className="w-4 h-4 text-muted-foreground" />
              <span className="text-muted-foreground max-w-[150px] truncate">{zonaActual}</span>
            </div>

            {/* Velocidad */}
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-muted rounded-lg">
              <Wifi className="w-4 h-4 text-sky-500" />
              <span className="text-sm font-medium">
                {velocidadInternet > 0 ? `${velocidadInternet} Mbps` : "Sin datos"}
              </span>
            </div>

            {/* Indicador de senal */}
            <div className="flex items-center gap-2 px-3 py-1.5 bg-muted rounded-lg">
              <div className="flex items-end gap-0.5 h-4">
                {[1, 2, 3, 4, 5].map((barra) => (
                  <div
                    key={barra}
                    className={`w-1.5 rounded-sm transition-all ${
                      barra <= nivelSenal 
                        ? getColorSenal().replace("text-", "bg-")
                        : "bg-muted-foreground/30"
                    }`}
                    style={{ height: `${barra * 3 + 4}px` }}
                  />
                ))}
              </div>
              <span className={`text-sm font-medium ${getColorSenal()}`}>
                {getEstadoTexto()}
              </span>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
