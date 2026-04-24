"use client"

import { useState, useMemo } from "react"
import { MapPin, Navigation, Search, Wifi, WifiOff, Loader2, AlertTriangle } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import dynamic from "next/dynamic"
import type { DatoRuta } from "@/lib/rutas/catalogo"

interface Props {
  distancia: number
  datosRuta: DatoRuta[]
  zonaActual: DatoRuta
  onCalcularRuta: (origen: string, destino: string, puntosRuta: DatoRuta[]) => void
  rutaCalculada: boolean
}

interface CalculoRutaResponse {
  ruta: {
    id: string
    nombre: string
    origen: string
    destino: string
    coords: [number, number][]
    puntos: DatoRuta[]
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
  ),
})

export function MapaReal({ distancia, datosRuta, zonaActual, onCalcularRuta, rutaCalculada }: Props) {
  const [origen, setOrigen] = useState("")
  const [destino, setDestino] = useState("")
  const [rutaCoords, setRutaCoords] = useState<[number, number][]>([])
  const [calculando, setCalculando] = useState(false)
  const [errorCalculo, setErrorCalculo] = useState<string | null>(null)

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

  const handleCalcular = async () => {
    if (!origen || !destino) return

    try {
      setCalculando(true)
      setErrorCalculo(null)

      const response = await fetch("/api/rutas/calcular", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ origen, destino }),
      })

      if (!response.ok) {
        throw new Error("No se pudo calcular la ruta. Intenta nuevamente.")
      }

      const data = (await response.json()) as CalculoRutaResponse
      setRutaCoords(data.ruta.coords)
      onCalcularRuta(origen, destino, data.ruta.puntos)
    } catch (error) {
      const mensaje = error instanceof Error ? error.message : "Error inesperado"
      setErrorCalculo(mensaje)
    } finally {
      setCalculando(false)
    }
  }

  // Calcular posicion actual basada en distancia
  const posicionActual = useMemo(() => {
    if (!rutaCalculada || rutaCoords.length === 0) return null

    const totalKm = datosRuta[datosRuta.length - 1]?.km || 50
    const progreso = Math.min(distancia / totalKm, 1)
    const index = Math.floor(progreso * (rutaCoords.length - 1))
    const nextIndex = Math.min(index + 1, rutaCoords.length - 1)

    const fraccion = progreso * (rutaCoords.length - 1) - index

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
            disabled={!origen || !destino || calculando}
          >
            {calculando ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Search className="w-4 h-4 mr-2" />}
            {calculando ? "Calculando..." : "Calcular ruta"}
          </Button>
          <p className="text-xs text-muted-foreground text-center">Prueba: Santiago → Valparaiso o Santiago → Rancagua</p>
          {errorCalculo && (
            <p className="text-xs text-red-600 bg-red-50 border border-red-100 rounded-md px-3 py-2 flex items-center gap-2">
              <AlertTriangle className="w-3.5 h-3.5" />
              {errorCalculo}
            </p>
          )}
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
                {zonaActual.senal >= 2 ? <Wifi className="w-5 h-5 text-white" /> : <WifiOff className="w-5 h-5 text-white" />}
              </div>
              <div>
                <p className="font-medium text-slate-800">{zonaActual.zona}</p>
                <p className="text-sm text-slate-600">Km {Math.round(distancia)} - Senal {zonaActual.senal}/5</p>
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
