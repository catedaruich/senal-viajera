import { NextResponse } from "next/server"
import { z } from "zod"
import { detectarRuta } from "@/lib/rutas/servicio"

const calcularRutaSchema = z.object({
  origen: z.string().trim().min(2, "El origen es obligatorio"),
  destino: z.string().trim().min(2, "El destino es obligatorio"),
})

export async function POST(request: Request) {
  const payload = await request.json().catch(() => null)
  const validacion = calcularRutaSchema.safeParse(payload)

  if (!validacion.success) {
    return NextResponse.json(
      {
        error: "Datos invalidos",
        detalles: validacion.error.flatten(),
      },
      { status: 400 },
    )
  }

  const { origen, destino } = validacion.data
  const ruta = detectarRuta(origen, destino)

  return NextResponse.json({
    ruta: {
      id: ruta.id,
      nombre: ruta.nombre,
      origen,
      destino,
      coords: ruta.coords,
      puntos: ruta.puntos,
    },
  })
}
