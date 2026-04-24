"use client"

import { BarChart3 } from "lucide-react"

interface DatoRuta {
  km: number
  senal: number
  zona: string
}

interface Props {
  datosRuta: DatoRuta[]
  distanciaActual: number
}

export function GraficoCobertura({ datosRuta, distanciaActual }: Props) {
  const getColorBarra = (senal: number, esActual: boolean) => {
    if (esActual) {
      if (senal >= 4) return "bg-emerald-500 ring-2 ring-emerald-300"
      if (senal >= 3) return "bg-sky-500 ring-2 ring-sky-300"
      if (senal >= 2) return "bg-amber-500 ring-2 ring-amber-300"
      return "bg-red-500 ring-2 ring-red-300"
    }
    if (senal >= 4) return "bg-emerald-400"
    if (senal >= 3) return "bg-sky-400"
    if (senal >= 2) return "bg-amber-400"
    return "bg-red-400"
  }

  const getEtiquetaSenal = (senal: number) => {
    if (senal >= 4) return "Muy buena"
    if (senal >= 3) return "Buena"
    if (senal >= 2) return "Regular"
    return "Mala"
  }

  return (
    <div className="bg-card rounded-2xl border border-border p-5">
      <div className="flex items-center gap-2 mb-4">
        <BarChart3 className="w-5 h-5 text-sky-500" />
        <h2 className="font-semibold text-lg text-foreground">Cobertura en tu ruta</h2>
      </div>

      <p className="text-sm text-muted-foreground mb-4">
        Asi sera la senal durante tu viaje de 50 km
      </p>

      {/* Grafico de barras */}
      <div className="space-y-3">
        {datosRuta.map((punto, index) => {
          const esActual = punto.km <= distanciaActual && 
            (index === datosRuta.length - 1 || datosRuta[index + 1].km > distanciaActual)
          const yaPaso = punto.km < distanciaActual
          
          return (
            <div key={punto.km} className="flex items-center gap-3">
              {/* Etiqueta de km */}
              <div className="w-12 text-right">
                <span className={`text-sm ${esActual ? "font-bold text-foreground" : "text-muted-foreground"}`}>
                  {punto.km} km
                </span>
              </div>
              
              {/* Barra de senal */}
              <div className="flex-1 h-8 bg-slate-100 rounded-lg overflow-hidden relative">
                <div 
                  className={`h-full transition-all duration-300 rounded-lg ${
                    yaPaso || esActual 
                      ? getColorBarra(punto.senal, esActual)
                      : "bg-slate-200"
                  }`}
                  style={{ width: `${(punto.senal / 5) * 100}%` }}
                />
                
                {/* Etiqueta dentro de la barra */}
                <div className="absolute inset-0 flex items-center px-3">
                  <span className={`text-xs font-medium ${
                    punto.senal >= 3 ? "text-white" : "text-slate-600"
                  } ${!yaPaso && !esActual ? "opacity-50" : ""}`}>
                    {getEtiquetaSenal(punto.senal)}
                  </span>
                </div>

                {/* Indicador de posicion actual */}
                {esActual && (
                  <div className="absolute right-2 top-1/2 -translate-y-1/2">
                    <span className="text-xs bg-white/90 px-2 py-0.5 rounded-full font-medium text-slate-700">
                      Aqui
                    </span>
                  </div>
                )}
              </div>

              {/* Indicador numerico */}
              <div className="w-8 text-center">
                <span className={`text-sm font-medium ${
                  esActual ? "text-foreground" : "text-muted-foreground"
                }`}>
                  {punto.senal}/5
                </span>
              </div>
            </div>
          )
        })}
      </div>

      {/* Resumen */}
      <div className="mt-6 p-4 bg-slate-50 rounded-xl">
        <h3 className="font-medium text-sm text-slate-700 mb-2">Resumen de tu ruta</h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-slate-500">Zonas sin cobertura</p>
            <p className="font-semibold text-red-600">
              {datosRuta.filter(d => d.senal <= 1).length} tramos
            </p>
          </div>
          <div>
            <p className="text-slate-500">Mejor cobertura</p>
            <p className="font-semibold text-emerald-600">
              {datosRuta.filter(d => d.senal >= 4).length} tramos
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
