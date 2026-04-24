import { NextResponse } from "next/server"
import { listarRutasDisponibles } from "@/lib/rutas/servicio"

export async function GET() {
  return NextResponse.json({
    rutas: listarRutasDisponibles(),
  })
}
