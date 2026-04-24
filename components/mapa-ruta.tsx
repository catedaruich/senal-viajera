"use client"

import { MapPin, Radio, AlertTriangle } from "lucide-react"

interface DatoRuta {
  km: number
  senal: number
  zona: string
}

interface Props {
  distancia: number
  datosRuta: DatoRuta[]
  zonaActual: DatoRuta
}

export function MapaRuta({ distancia, datosRuta, zonaActual }: Props) {
  const getColorSenal = (senal: number) => {
    if (senal >= 4) return "bg-emerald-500"
    if (senal >= 3) return "bg-sky-500"
    if (senal >= 2) return "bg-amber-500"
    return "bg-red-500"
  }

  const getColorFondo = (senal: number) => {
    if (senal >= 4) return "bg-emerald-100"
    if (senal >= 3) return "bg-sky-100"
    if (senal >= 2) return "bg-amber-100"
    return "bg-red-100"
  }

  return (
    <div className="bg-card rounded-2xl border border-border p-5">
      <div className="flex items-center gap-2 mb-4">
        <MapPin className="w-5 h-5 text-sky-500" />
        <h2 className="font-semibold text-lg text-foreground">Mapa de cobertura</h2>
      </div>

      {/* Mapa visual simplificado */}
      <div className="relative bg-slate-100 rounded-xl p-4 mb-4 overflow-hidden">
        {/* Fondo con patron de carretera */}
        <div className="absolute inset-0 opacity-10">
          <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            <path d="M0,50 Q25,30 50,50 T100,50" stroke="currentColor" strokeWidth="8" fill="none" className="text-slate-400"/>
          </svg>
        </div>

        {/* Ruta con puntos de cobertura */}
        <div className="relative flex items-center justify-between py-8">
          {datosRuta.map((punto, index) => {
            const esActual = punto.km <= distancia && (index === datosRuta.length - 1 || datosRuta[index + 1].km > distancia)
            const yaPaso = punto.km < distancia
            
            return (
              <div key={punto.km} className="flex flex-col items-center relative z-10">
                {/* Punto en el mapa */}
                <div 
                  className={`w-4 h-4 rounded-full border-2 border-white shadow-md transition-all ${
                    esActual 
                      ? `${getColorSenal(punto.senal)} ring-4 ring-offset-2 ${getColorFondo(punto.senal)} scale-125` 
                      : yaPaso 
                        ? getColorSenal(punto.senal) 
                        : "bg-slate-300"
                  }`}
                />
                
                {/* Indicador de tu posicion */}
                {esActual && (
                  <div className="absolute -top-8 left-1/2 -translate-x-1/2">
                    <div className="bg-slate-800 text-white text-xs px-2 py-1 rounded-lg whitespace-nowrap">
                      Tu estas aqui
                    </div>
                  </div>
                )}

                {/* Icono de alerta para zonas sin cobertura */}
                {punto.senal <= 1 && !yaPaso && (
                  <AlertTriangle className="absolute -top-6 w-4 h-4 text-red-500" />
                )}
              </div>
            )
          })}
          
          {/* Linea de conexion */}
          <div className="absolute top-1/2 left-0 right-0 h-1 bg-slate-200 -translate-y-1/2 -z-0">
            <div 
              className="h-full bg-gradient-to-r from-emerald-500 to-sky-500 transition-all duration-300"
              style={{ width: `${(distancia / 50) * 100}%` }}
            />
          </div>
        </div>

        {/* Etiquetas de inicio y fin */}
        <div className="flex justify-between text-xs text-slate-500 mt-2">
          <span>Ciudad</span>
          <span>Destino</span>
        </div>
      </div>

      {/* Info de zona actual */}
      <div className={`rounded-xl p-4 ${getColorFondo(zonaActual.senal)}`}>
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-full ${getColorSenal(zonaActual.senal)} flex items-center justify-center`}>
            <Radio className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="font-medium text-slate-800">{zonaActual.zona}</p>
            <p className="text-sm text-slate-600">
              Km {zonaActual.km} - Senal {zonaActual.senal}/5
            </p>
          </div>
        </div>
      </div>

      {/* Leyenda */}
      <div className="flex flex-wrap gap-3 mt-4 text-xs">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full bg-emerald-500" />
          <span className="text-slate-600">Excelente</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full bg-sky-500" />
          <span className="text-slate-600">Buena</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full bg-amber-500" />
          <span className="text-slate-600">Limitada</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full bg-red-500" />
          <span className="text-slate-600">Sin cobertura</span>
        </div>
      </div>
    </div>
  )
}
