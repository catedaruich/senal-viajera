"use client"

import { useState, useEffect } from "react"
import { EncabezadoSenal } from "@/components/encabezado-senal"
import { TarjetaSenal } from "@/components/tarjeta-senal"
import { MapaReal } from "@/components/mapa-real"
import { GraficoCobertura } from "@/components/grafico-cobertura"
import { AlertaZona } from "@/components/alerta-zona"
import { Consejos } from "@/components/consejos"
import type { DatoRuta } from "@/lib/rutas/catalogo"


export default function SenalViajero() {
  const [nivelSenal, setNivelSenal] = useState(4)
  const [distancia, setDistancia] = useState(0)
  const [simulando, setSimulando] = useState(false)
  const [velocidadInternet, setVelocidadInternet] = useState(45)
  const [puedesLlamar, setPuedesLlamar] = useState(true)
  const [puedeMensajes, setPuedeMensajes] = useState(true)
  const [puedesInternet, setPuedesInternet] = useState(true)
  const [rutaCalculada, setRutaCalculada] = useState(false)
  const [origen, setOrigen] = useState("")
  const [destino, setDestino] = useState("")
  const [datosRuta, setDatosRuta] = useState<DatoRuta[]>([
    { km: 0, senal: 5, zona: "Ciudad - Excelente cobertura" },
    { km: 5, senal: 5, zona: "Salida urbana" },
    { km: 10, senal: 4, zona: "Carretera principal" },
    { km: 15, senal: 3, zona: "Zona rural" },
    { km: 20, senal: 2, zona: "Montana - Cobertura limitada" },
    { km: 25, senal: 1, zona: "Valle profundo - Sin cobertura" },
    { km: 30, senal: 1, zona: "Zona sin cobertura" },
    { km: 35, senal: 2, zona: "Subida - Recuperando senal" },
    { km: 40, senal: 3, zona: "Pueblo cercano" },
    { km: 45, senal: 4, zona: "Acercandose a poblacion" },
    { km: 50, senal: 5, zona: "Destino - Buena cobertura" },
  ])

  const totalKm = datosRuta[datosRuta.length - 1]?.km || 50

  const zonaActual = datosRuta.reduce((prev, curr) => 
    curr.km <= distancia ? curr : prev
  , datosRuta[0])

  useEffect(() => {
    if (!simulando) return
    
    const intervalo = setInterval(() => {
      setDistancia(prev => {
        const nuevaDist = prev + 1
        if (nuevaDist >= totalKm) {
          setSimulando(false)
          return totalKm
        }
        
        const zonaActual = datosRuta.reduce((prev, curr) => 
          curr.km <= nuevaDist ? curr : prev
        , datosRuta[0])
        
        const variacion = (Math.random() - 0.5) * 0.5
        const senalCalculada = Math.max(1, Math.min(5, zonaActual.senal + variacion))
        setNivelSenal(Math.round(senalCalculada))
        
        const senal = Math.round(senalCalculada)
        setPuedesLlamar(senal >= 2)
        setPuedeMensajes(senal >= 1)
        setPuedesInternet(senal >= 3)
        setVelocidadInternet(senal >= 4 ? 45 : senal >= 3 ? 15 : senal >= 2 ? 3 : 0)
        
        return nuevaDist
      })
    }, 800)
    
    return () => clearInterval(intervalo)
  }, [simulando, totalKm, datosRuta])

  const handleCalcularRuta = (nuevoOrigen: string, nuevoDestino: string, nuevosPuntos: DatoRuta[]) => {
    setOrigen(nuevoOrigen)
    setDestino(nuevoDestino)
    setDatosRuta(nuevosPuntos)
    setRutaCalculada(true)
    reiniciar()
  }

  const reiniciar = () => {
    setDistancia(0)
    setNivelSenal(5)
    setSimulando(false)
    setPuedesLlamar(true)
    setPuedeMensajes(true)
    setPuedesInternet(true)
    setVelocidadInternet(45)
  }

  return (
    <div className="min-h-screen bg-background">
      <EncabezadoSenal 
        nivelSenal={nivelSenal} 
        zonaActual={zonaActual.zona}
        velocidadInternet={velocidadInternet}
      />
      
      <main className="container mx-auto p-4 space-y-6 pb-8">
        {/* Tarjetas de estado */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <TarjetaSenal 
            titulo="Senal"
            valor={nivelSenal}
            tipo="barras"
            estado={nivelSenal >= 3 ? "bueno" : nivelSenal >= 2 ? "medio" : "malo"}
          />
          <TarjetaSenal 
            titulo="Llamadas"
            valor={puedesLlamar ? "Disponible" : "Sin cobertura"}
            tipo="estado"
            estado={puedesLlamar ? "bueno" : "malo"}
            icono="telefono"
          />
          <TarjetaSenal 
            titulo="Mensajes"
            valor={puedeMensajes ? "Disponible" : "Sin cobertura"}
            tipo="estado"
            estado={puedeMensajes ? "bueno" : "malo"}
            icono="mensaje"
          />
          <TarjetaSenal 
            titulo="Internet"
            valor={puedesInternet ? `${velocidadInternet} Mbps` : "Sin datos"}
            tipo="velocidad"
            estado={puedesInternet ? (velocidadInternet >= 15 ? "bueno" : "medio") : "malo"}
            icono="internet"
          />
        </div>

        {/* Mapa y grafico */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <MapaReal 
            distancia={distancia}
            datosRuta={datosRuta}
            zonaActual={zonaActual}
            onCalcularRuta={handleCalcularRuta}
            rutaCalculada={rutaCalculada}
          />
          <div className="space-y-4">
            <GraficoCobertura 
              datosRuta={datosRuta}
              distanciaActual={distancia}
            />
            <AlertaZona 
              nivelSenal={nivelSenal}
              zonaActual={zonaActual}
              datosRuta={datosRuta}
              distancia={distancia}
            />
          </div>
        </div>

        {/* Ruta info */}
        {rutaCalculada && (
          <div className="bg-card rounded-2xl p-4 border border-border">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
              <div>
                <p className="text-sm text-muted-foreground">Tu ruta</p>
                <p className="font-medium text-foreground">{origen} → {destino}</p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setSimulando(!simulando)}
                  className={`px-5 py-2.5 rounded-xl font-medium transition-all ${
                    simulando 
                      ? "bg-amber-500 hover:bg-amber-600 text-white" 
                      : "bg-emerald-500 hover:bg-emerald-600 text-white"
                  }`}
                >
                  {simulando ? "Pausar" : distancia > 0 ? "Continuar" : "Iniciar viaje"}
                </button>
                <button
                  onClick={reiniciar}
                  className="px-5 py-2.5 rounded-xl font-medium bg-muted hover:bg-muted/80 text-foreground transition-all"
                >
                  Reiniciar
                </button>
              </div>
            </div>
            
            {/* Progreso del viaje */}
            <div className="flex justify-between text-sm text-muted-foreground mb-2">
              <span>Inicio</span>
              <span>{Math.round(distancia)} km recorridos</span>
              <span>Destino ({totalKm} km)</span>
            </div>
            <div className="h-3 bg-muted rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-emerald-500 to-sky-500 transition-all duration-300"
                style={{ width: `${(distancia / totalKm) * 100}%` }}
              />
            </div>
          </div>
        )}

        {/* Consejos */}
        <Consejos nivelSenal={nivelSenal} puedesInternet={puedesInternet} />
      </main>
    </div>
  )
}
