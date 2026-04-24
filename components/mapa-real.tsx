"use client"

import { useState, useEffect, useMemo } from "react"
import { MapPin, Navigation, Search, Wifi, WifiOff, Loader2 } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import dynamic from "next/dynamic"

interface DatoRuta {
  km: number
  senal: number
  zona: string
  lat?: number
  lng?: number
}

interface Props {
  distancia: number
  datosRuta: DatoRuta[]
  zonaActual: DatoRuta
  onCalcularRuta: (origen: string, destino: string, puntosRuta: DatoRuta[]) => void
  rutaCalculada: boolean
}

// Rutas predefinidas con coordenadas reales de Chile
const rutasPredefinidas: Record<string, { coords: [number, number][], puntos: DatoRuta[] }> = {
  "santiago-valparaiso": {
    coords: [
      [-33.4489, -70.6693], // Santiago
      [-33.4372, -70.7281],
      [-33.4186, -70.8012],
      [-33.3892, -70.8845],
      [-33.3567, -70.9623],
      [-33.2984, -71.0512],
      [-33.2456, -71.1289],
      [-33.1823, -71.2134],
      [-33.1045, -71.3012],
      [-33.0472, -71.4523],
      [-33.0472, -71.6127], // Valparaiso
    ],
    puntos: [
      { km: 0, senal: 5, zona: "Santiago - Centro", lat: -33.4489, lng: -70.6693 },
      { km: 12, senal: 5, zona: "Pudahuel", lat: -33.4372, lng: -70.7281 },
      { km: 24, senal: 4, zona: "Ruta 68 - Autopista", lat: -33.4186, lng: -70.8012 },
      { km: 36, senal: 4, zona: "Curacavi cercano", lat: -33.3892, lng: -70.8845 },
      { km: 48, senal: 3, zona: "Zona rural - Curacavi", lat: -33.3567, lng: -70.9623 },
      { km: 60, senal: 2, zona: "Cuesta Zapata - Cobertura limitada", lat: -33.2984, lng: -71.0512 },
      { km: 72, senal: 1, zona: "Tunel Lo Prado - Sin senal", lat: -33.2456, lng: -71.1289 },
      { km: 84, senal: 2, zona: "Salida tunel - Recuperando", lat: -33.1823, lng: -71.2134 },
      { km: 96, senal: 3, zona: "Casablanca cercano", lat: -33.1045, lng: -71.3012 },
      { km: 108, senal: 4, zona: "Llegando a Valparaiso", lat: -33.0472, lng: -71.4523 },
      { km: 120, senal: 5, zona: "Valparaiso - Centro", lat: -33.0472, lng: -71.6127 },
    ]
  },
  "santiago-rancagua": {
    coords: [
      [-33.4489, -70.6693], // Santiago
      [-33.5012, -70.6234],
      [-33.5567, -70.5823],
      [-33.6234, -70.5412],
      [-33.6892, -70.4923],
      [-33.7456, -70.4534],
      [-33.8123, -70.4012],
      [-33.8678, -70.3534],
      [-33.9234, -70.3123],
      [-33.9789, -70.2712],
      [-34.1708, -70.7444], // Rancagua
    ],
    puntos: [
      { km: 0, senal: 5, zona: "Santiago - Centro", lat: -33.4489, lng: -70.6693 },
      { km: 8, senal: 5, zona: "San Bernardo", lat: -33.5012, lng: -70.6234 },
      { km: 16, senal: 4, zona: "Buin", lat: -33.5567, lng: -70.5823 },
      { km: 24, senal: 4, zona: "Paine", lat: -33.6234, lng: -70.5412 },
      { km: 32, senal: 3, zona: "Hospital", lat: -33.6892, lng: -70.4923 },
      { km: 40, senal: 3, zona: "Zona agricola", lat: -33.7456, lng: -70.4534 },
      { km: 48, senal: 2, zona: "Requinoa cercano", lat: -33.8123, lng: -70.4012 },
      { km: 56, senal: 3, zona: "Graneros", lat: -33.8678, lng: -70.3534 },
      { km: 64, senal: 4, zona: "Acercandose Rancagua", lat: -33.9234, lng: -70.3123 },
      { km: 72, senal: 5, zona: "Entrada Rancagua", lat: -33.9789, lng: -70.2712 },
      { km: 85, senal: 5, zona: "Rancagua - Centro", lat: -34.1708, lng: -70.7444 },
    ]
  },
  "default": {
    coords: [
      [-33.4489, -70.6693], // Santiago centro
      [-33.4312, -70.6512],
      [-33.4134, -70.6334],
      [-33.3956, -70.6156],
      [-33.3778, -70.5978],
      [-33.3600, -70.5800],
      [-33.3422, -70.5622],
      [-33.3244, -70.5444],
      [-33.3066, -70.5266],
      [-33.2888, -70.5088],
      [-33.2710, -70.4910],
    ],
    puntos: [
      { km: 0, senal: 5, zona: "Punto de partida", lat: -33.4489, lng: -70.6693 },
      { km: 5, senal: 5, zona: "Salida urbana", lat: -33.4312, lng: -70.6512 },
      { km: 10, senal: 4, zona: "Carretera", lat: -33.4134, lng: -70.6334 },
      { km: 15, senal: 3, zona: "Zona semi-rural", lat: -33.3956, lng: -70.6156 },
      { km: 20, senal: 2, zona: "Zona rural", lat: -33.3778, lng: -70.5978 },
      { km: 25, senal: 1, zona: "Sin cobertura", lat: -33.3600, lng: -70.5800 },
      { km: 30, senal: 1, zona: "Zona critica", lat: -33.3422, lng: -70.5622 },
      { km: 35, senal: 2, zona: "Recuperando senal", lat: -33.3244, lng: -70.5444 },
      { km: 40, senal: 3, zona: "Cerca de poblacion", lat: -33.3066, lng: -70.5266 },
      { km: 45, senal: 4, zona: "Acercandose destino", lat: -33.2888, lng: -70.5088 },
      { km: 50, senal: 5, zona: "Destino", lat: -33.2710, lng: -70.4910 },
    ]
  }
}

// Importar el mapa dinamicamente para evitar SSR issues
const MapaLeaflet = dynamic(() => import("./mapa-leaflet"), { 
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-slate-100">
      <div className="text-center">
        <Loader2 className="w-8 h-8 animate-spin text-sky-500 mx-auto mb-2" />
        <p className="text-slate-600">Cargando mapa...</p>
      </div>
    </div>
  )
})

export function MapaReal({ distancia, datosRuta, zonaActual, onCalcularRuta, rutaCalculada }: Props) {
  const [origen, setOrigen] = useState("")
  const [destino, setDestino] = useState("")
  const [rutaCoords, setRutaCoords] = useState<[number, number][]>([])

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

  const detectarRuta = (origen: string, destino: string): string => {
    const origenLower = origen.toLowerCase()
    const destinoLower = destino.toLowerCase()
    
    if ((origenLower.includes("santiago") && destinoLower.includes("valparaiso")) ||
        (origenLower.includes("valparaiso") && destinoLower.includes("santiago"))) {
      return "santiago-valparaiso"
    }
    if ((origenLower.includes("santiago") && destinoLower.includes("rancagua")) ||
        (origenLower.includes("rancagua") && destinoLower.includes("santiago"))) {
      return "santiago-rancagua"
    }
    return "default"
  }

  const handleCalcular = () => {
    if (origen && destino) {
      const rutaKey = detectarRuta(origen, destino)
      const ruta = rutasPredefinidas[rutaKey]
      setRutaCoords(ruta.coords)
      onCalcularRuta(origen, destino, ruta.puntos)
    }
  }

  // Calcular posicion actual basada en distancia
  const posicionActual = useMemo(() => {
    if (!rutaCalculada || rutaCoords.length === 0) return null
    
    const totalKm = datosRuta[datosRuta.length - 1]?.km || 50
    const progreso = Math.min(distancia / totalKm, 1)
    const index = Math.floor(progreso * (rutaCoords.length - 1))
    const nextIndex = Math.min(index + 1, rutaCoords.length - 1)
    
    const fraccion = (progreso * (rutaCoords.length - 1)) - index
    
    const lat = rutaCoords[index][0] + (rutaCoords[nextIndex][0] - rutaCoords[index][0]) * fraccion
    const lng = rutaCoords[index][1] + (rutaCoords[nextIndex][1] - rutaCoords[index][1]) * fraccion
    
    return [lat, lng] as [number, number]
  }, [distancia, rutaCalculada, rutaCoords, datosRuta])

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
              placeholder="Ej: Santiago"
              value={origen}
              onChange={(e) => setOrigen(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-red-500" />
            <Input
              placeholder="Ej: Valparaiso, Rancagua"
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
          <p className="text-xs text-muted-foreground text-center">
            Prueba: Santiago → Valparaiso o Santiago → Rancagua
          </p>
        </div>
      </div>

      {/* Mapa real con Leaflet */}
      <div className="flex-1 relative min-h-[350px]">
        <MapaLeaflet 
          rutaCoords={rutaCoords}
          datosRuta={datosRuta}
          posicionActual={posicionActual}
          rutaCalculada={rutaCalculada}
          zonaActual={zonaActual}
        />
      </div>

      {/* Info de zona actual */}
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
