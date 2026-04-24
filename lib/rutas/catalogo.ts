export interface DatoRuta {
  km: number
  senal: number
  zona: string
  lat?: number
  lng?: number
}

export interface RutaPredefinida {
  id: string
  nombre: string
  aliases: string[]
  coords: [number, number][]
  puntos: DatoRuta[]
}

export const rutasPredefinidas: RutaPredefinida[] = [
  {
    id: "santiago-valparaiso",
    nombre: "Santiago ↔ Valparaiso",
    aliases: ["santiago", "valparaiso"],
    coords: [
      [-33.4489, -70.6693],
      [-33.4372, -70.7281],
      [-33.4186, -70.8012],
      [-33.3892, -70.8845],
      [-33.3567, -70.9623],
      [-33.2984, -71.0512],
      [-33.2456, -71.1289],
      [-33.1823, -71.2134],
      [-33.1045, -71.3012],
      [-33.0472, -71.4523],
      [-33.0472, -71.6127],
    ],
    puntos: [
      { km: 0, senal: 5, zona: "Santiago - Centro", lat: -33.4489, lng: -70.6693 },
      { km: 12, senal: 5, zona: "Pudahuel", lat: -33.4372, lng: -70.7281 },
      { km: 24, senal: 4, zona: "Ruta 68 - Autopista", lat: -33.4186, lng: -70.8012 },
      { km: 36, senal: 4, zona: "Curacavi cercano", lat: -33.3892, lng: -70.8845 },
      { km: 48, senal: 3, zona: "Zona rural - Curacavi", lat: -33.3567, lng: -70.9623 },
      { km: 60, senal: 2, zona: "Cuesta Zapata - Cobertura limitada", lat: -33.2984, lng: -71.0512 },
      { km: 72, senal: 1, zona: "Tunel Lo Prado - Sin senal", lat: -33.2456, lng: -71.1289 },
      { km: 84, senal: 2, zona: "Salida tunel - Recuperando", lat: -33.1823, lng: -71.2134 },
      { km: 96, senal: 3, zona: "Casablanca cercano", lat: -33.1045, lng: -71.3012 },
      { km: 108, senal: 4, zona: "Llegando a Valparaiso", lat: -33.0472, lng: -71.4523 },
      { km: 120, senal: 5, zona: "Valparaiso - Centro", lat: -33.0472, lng: -71.6127 },
    ],
  },
  {
    id: "santiago-rancagua",
    nombre: "Santiago ↔ Rancagua",
    aliases: ["santiago", "rancagua"],
    coords: [
      [-33.4489, -70.6693],
      [-33.5012, -70.6234],
      [-33.5567, -70.5823],
      [-33.6234, -70.5412],
      [-33.6892, -70.4923],
      [-33.7456, -70.4534],
      [-33.8123, -70.4012],
      [-33.8678, -70.3534],
      [-33.9234, -70.3123],
      [-33.9789, -70.2712],
      [-34.1708, -70.7444],
    ],
    puntos: [
      { km: 0, senal: 5, zona: "Santiago - Centro", lat: -33.4489, lng: -70.6693 },
      { km: 8, senal: 5, zona: "San Bernardo", lat: -33.5012, lng: -70.6234 },
      { km: 16, senal: 4, zona: "Buin", lat: -33.5567, lng: -70.5823 },
      { km: 24, senal: 4, zona: "Paine", lat: -33.6234, lng: -70.5412 },
      { km: 32, senal: 3, zona: "Hospital", lat: -33.6892, lng: -70.4923 },
      { km: 40, senal: 3, zona: "Zona agricola", lat: -33.7456, lng: -70.4534 },
      { km: 48, senal: 2, zona: "Requinoa cercano", lat: -33.8123, lng: -70.4012 },
      { km: 56, senal: 3, zona: "Graneros", lat: -33.8678, lng: -70.3534 },
      { km: 64, senal: 4, zona: "Acercandose Rancagua", lat: -33.9234, lng: -70.3123 },
      { km: 72, senal: 5, zona: "Entrada Rancagua", lat: -33.9789, lng: -70.2712 },
      { km: 85, senal: 5, zona: "Rancagua - Centro", lat: -34.1708, lng: -70.7444 },
    ],
  },
]

export const rutaDefault: RutaPredefinida = {
  id: "default",
  nombre: "Ruta simulada",
  aliases: [],
  coords: [
    [-33.4489, -70.6693],
    [-33.4312, -70.6512],
    [-33.4134, -70.6334],
    [-33.3956, -70.6156],
    [-33.3778, -70.5978],
    [-33.36, -70.58],
    [-33.3422, -70.5622],
    [-33.3244, -70.5444],
    [-33.3066, -70.5266],
    [-33.2888, -70.5088],
    [-33.271, -70.491],
  ],
  puntos: [
    { km: 0, senal: 5, zona: "Punto de partida", lat: -33.4489, lng: -70.6693 },
    { km: 5, senal: 5, zona: "Salida urbana", lat: -33.4312, lng: -70.6512 },
    { km: 10, senal: 4, zona: "Carretera", lat: -33.4134, lng: -70.6334 },
    { km: 15, senal: 3, zona: "Zona semi-rural", lat: -33.3956, lng: -70.6156 },
    { km: 20, senal: 2, zona: "Zona rural", lat: -33.3778, lng: -70.5978 },
    { km: 25, senal: 1, zona: "Sin cobertura", lat: -33.36, lng: -70.58 },
    { km: 30, senal: 1, zona: "Zona critica", lat: -33.3422, lng: -70.5622 },
    { km: 35, senal: 2, zona: "Recuperando senal", lat: -33.3244, lng: -70.5444 },
    { km: 40, senal: 3, zona: "Cerca de poblacion", lat: -33.3066, lng: -70.5266 },
    { km: 45, senal: 4, zona: "Acercandose destino", lat: -33.2888, lng: -70.5088 },
    { km: 50, senal: 5, zona: "Destino", lat: -33.271, lng: -70.491 },
  ],
}
