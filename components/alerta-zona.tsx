"use client"

import { AlertTriangle, CheckCircle, Info, MapPin } from "lucide-react"

interface DatoRuta {
  km: number
  senal: number
  zona: string
}

interface Props {
  nivelSenal: number
  zonaActual: DatoRuta
  datosRuta: DatoRuta[]
  distancia: number
}

export function AlertaZona({ nivelSenal, zonaActual, datosRuta, distancia }: Props) {
  // Encontrar proxima zona sin cobertura
  const proximaZonaMala = datosRuta.find(d => d.km > distancia && d.senal <= 1)
  const distanciaAZonaMala = proximaZonaMala ? proximaZonaMala.km - distancia : null

  // Encontrar proxima zona con buena cobertura si estamos en zona mala
  const proximaZonaBuena = datosRuta.find(d => d.km > distancia && d.senal >= 3)
  const distanciaAZonaBuena = proximaZonaBuena ? proximaZonaBuena.km - distancia : null

  if (nivelSenal <= 1) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-2xl p-5">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
            <AlertTriangle className="w-6 h-6 text-red-600" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-red-800 text-lg mb-1">
              Zona sin cobertura
            </h3>
            <p className="text-red-700 mb-3">
              Actualmente no tienes senal. No podras hacer llamadas ni usar internet.
            </p>
            
            {distanciaAZonaBuena && (
              <div className="flex items-center gap-2 bg-white/80 rounded-lg px-4 py-2 inline-flex">
                <MapPin className="w-4 h-4 text-emerald-600" />
                <span className="text-sm">
                  Recuperaras senal en aproximadamente <strong>{Math.round(distanciaAZonaBuena)} km</strong>
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  if (nivelSenal === 2) {
    return (
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
            <Info className="w-6 h-6 text-amber-600" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-amber-800 text-lg mb-1">
              Senal limitada
            </h3>
            <p className="text-amber-700 mb-3">
              Puedes hacer llamadas y enviar mensajes, pero el internet sera muy lento.
            </p>
            
            {proximaZonaMala && distanciaAZonaMala && distanciaAZonaMala < 10 && (
              <div className="flex items-center gap-2 bg-white/80 rounded-lg px-4 py-2 inline-flex">
                <AlertTriangle className="w-4 h-4 text-red-500" />
                <span className="text-sm">
                  Atencion: zona sin cobertura en <strong>{Math.round(distanciaAZonaMala)} km</strong>
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  if (proximaZonaMala && distanciaAZonaMala && distanciaAZonaMala < 15) {
    return (
      <div className="bg-sky-50 border border-sky-200 rounded-2xl p-5">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-full bg-sky-100 flex items-center justify-center flex-shrink-0">
            <Info className="w-6 h-6 text-sky-600" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-sky-800 text-lg mb-1">
              Prepara para zona sin cobertura
            </h3>
            <p className="text-sky-700 mb-3">
              En aproximadamente {Math.round(distanciaAZonaMala)} km entraras a una zona sin senal. 
              Te recomendamos:
            </p>
            <ul className="space-y-2 text-sm text-sky-700">
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-sky-500" />
                Descarga mapas sin conexion ahora
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-sky-500" />
                Avisa a alguien que perderas cobertura
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-sky-500" />
                Guarda informacion importante que necesites
              </li>
            </ul>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5">
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
          <CheckCircle className="w-6 h-6 text-emerald-600" />
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-emerald-800 text-lg mb-1">
            Buena cobertura
          </h3>
          <p className="text-emerald-700">
            Tienes buena senal. Puedes hacer llamadas, enviar mensajes y navegar sin problemas.
          </p>
        </div>
      </div>
    </div>
  )
}
