"use client"

import { Lightbulb, Download, Battery, MessageCircle, Music, Map } from "lucide-react"

interface Props {
  nivelSenal: number
  puedesInternet: boolean
}

export function Consejos({ nivelSenal, puedesInternet }: Props) {
  const consejosPorSituacion = () => {
    if (nivelSenal <= 1) {
      return {
        titulo: "Consejos para zonas sin senal",
        items: [
          {
            icono: <Map className="w-5 h-5" />,
            titulo: "Usa mapas offline",
            descripcion: "Google Maps y otras apps te permiten descargar mapas para usar sin internet"
          },
          {
            icono: <Music className="w-5 h-5" />,
            titulo: "Musica descargada",
            descripcion: "Spotify y otras apps te permiten descargar canciones para escuchar sin conexion"
          },
          {
            icono: <Battery className="w-5 h-5" />,
            titulo: "Ahorra bateria",
            descripcion: "Activa el modo avion para que tu celular no gaste bateria buscando senal"
          },
        ]
      }
    }
    
    if (nivelSenal <= 2) {
      return {
        titulo: "Consejos para senal limitada",
        items: [
          {
            icono: <MessageCircle className="w-5 h-5" />,
            titulo: "Usa mensajes de texto",
            descripcion: "Los SMS funcionan mejor que WhatsApp cuando la senal es debil"
          },
          {
            icono: <Download className="w-5 h-5" />,
            titulo: "Evita descargas grandes",
            descripcion: "No intentes descargar videos o archivos pesados"
          },
          {
            icono: <Battery className="w-5 h-5" />,
            titulo: "Llama en lugares altos",
            descripcion: "Si necesitas hacer una llamada, busca un lugar elevado"
          },
        ]
      }
    }

    return {
      titulo: "Aprovecha la buena senal",
      items: [
        {
          icono: <Download className="w-5 h-5" />,
          titulo: "Descarga contenido",
          descripcion: "Ahora es buen momento para descargar mapas, musica o videos para el camino"
        },
        {
          icono: <MessageCircle className="w-5 h-5" />,
          titulo: "Envia mensajes importantes",
          descripcion: "Aprovecha para comunicarte antes de entrar a zonas con menos cobertura"
        },
        {
          icono: <Battery className="w-5 h-5" />,
          titulo: "Actualiza tu ubicacion",
          descripcion: "Comparte tu ubicacion en tiempo real con familiares o amigos"
        },
      ]
    }
  }

  const consejos = consejosPorSituacion()

  return (
    <div className="bg-card rounded-2xl border border-border p-5">
      <div className="flex items-center gap-2 mb-4">
        <Lightbulb className="w-5 h-5 text-amber-500" />
        <h2 className="font-semibold text-lg text-foreground">{consejos.titulo}</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {consejos.items.map((consejo, index) => (
          <div 
            key={index}
            className="bg-slate-50 rounded-xl p-4 hover:bg-slate-100 transition-colors"
          >
            <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center mb-3 text-slate-600">
              {consejo.icono}
            </div>
            <h3 className="font-medium text-slate-800 mb-1">{consejo.titulo}</h3>
            <p className="text-sm text-slate-600">{consejo.descripcion}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
