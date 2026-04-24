import { rutaDefault, rutasPredefinidas, type RutaPredefinida } from "@/lib/rutas/catalogo"

const normalizarTexto = (valor: string) =>
  valor
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")

export function detectarRuta(origen: string, destino: string): RutaPredefinida {
  const origenNormalizado = normalizarTexto(origen)
  const destinoNormalizado = normalizarTexto(destino)

  const rutaEncontrada = rutasPredefinidas.find((ruta) => {
    if (ruta.aliases.length < 2) return false

    const [a, b] = ruta.aliases
    const matchDirecto = origenNormalizado.includes(a) && destinoNormalizado.includes(b)
    const matchInverso = origenNormalizado.includes(b) && destinoNormalizado.includes(a)

    return matchDirecto || matchInverso
  })

  return rutaEncontrada ?? rutaDefault
}

export function listarRutasDisponibles() {
  return rutasPredefinidas.map((ruta) => ({
    id: ruta.id,
    nombre: ruta.nombre,
    aliases: ruta.aliases,
  }))
}
