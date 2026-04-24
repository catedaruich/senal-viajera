"use client"

import { Phone, MessageCircle, Wifi, Signal } from "lucide-react"

interface Props {
  titulo: string
  valor: string | number
  tipo: "barras" | "estado" | "velocidad"
  estado: "bueno" | "medio" | "malo"
  icono?: "telefono" | "mensaje" | "internet" | "senal"
}

export function TarjetaSenal({ titulo, valor, tipo, estado, icono }: Props) {
  const getColorFondo = () => {
    switch (estado) {
      case "bueno": return "bg-emerald-50 border-emerald-200"
      case "medio": return "bg-amber-50 border-amber-200"
      case "malo": return "bg-red-50 border-red-200"
    }
  }

  const getColorTexto = () => {
    switch (estado) {
      case "bueno": return "text-emerald-600"
      case "medio": return "text-amber-600"
      case "malo": return "text-red-600"
    }
  }

  const getColorIcono = () => {
    switch (estado) {
      case "bueno": return "text-emerald-500"
      case "medio": return "text-amber-500"
      case "malo": return "text-red-500"
    }
  }

  const renderIcono = () => {
    const className = `w-6 h-6 ${getColorIcono()}`
    switch (icono) {
      case "telefono": return <Phone className={className} />
      case "mensaje": return <MessageCircle className={className} />
      case "internet": return <Wifi className={className} />
      default: return <Signal className={className} />
    }
  }

  const renderBarras = () => {
    const nivelSenal = typeof valor === "number" ? valor : 0
    return (
      <div className="flex items-end gap-1 h-8">
        {[1, 2, 3, 4, 5].map((barra) => (
          <div
            key={barra}
            className={`w-3 rounded-sm transition-all ${
              barra <= nivelSenal 
                ? getColorIcono().replace("text-", "bg-")
                : "bg-slate-200"
            }`}
            style={{ height: `${barra * 5 + 6}px` }}
          />
        ))}
      </div>
    )
  }

  return (
    <div className={`rounded-2xl border p-4 ${getColorFondo()}`}>
      <div className="flex items-start justify-between mb-2">
        <span className="text-sm font-medium text-slate-600">{titulo}</span>
        {tipo !== "barras" && renderIcono()}
      </div>
      
      {tipo === "barras" ? (
        <div className="flex items-center justify-between">
          {renderBarras()}
          <span className={`text-2xl font-bold ${getColorTexto()}`}>
            {valor}/5
          </span>
        </div>
      ) : (
        <p className={`text-lg font-semibold ${getColorTexto()}`}>
          {valor}
        </p>
      )}
    </div>
  )
}
