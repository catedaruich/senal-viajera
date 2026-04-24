"use client"

import { useEffect, useRef } from "react"
import { MapContainer, TileLayer, Polyline, Marker, Popup, useMap, Circle } from "react-leaflet"
import L from "leaflet"
import "leaflet/dist/leaflet.css"

interface DatoRuta {
  km: number
  senal: number
  zona: string
  lat?: number
  lng?: number
}

interface Props {
  rutaCoords: [number, number][]
  datosRuta: DatoRuta[]
  posicionActual: [number, number] | null
  rutaCalculada: boolean
  zonaActual: DatoRuta
}

// Iconos personalizados
const createIcon = (color: string, isCurrentPosition = false) => {
  const size = isCurrentPosition ? 24 : 12
  return L.divIcon({
    className: "custom-marker",
    html: `
      <div style="
        width: ${size}px;
        height: ${size}px;
        background-color: ${color};
        border: 3px solid white;
        border-radius: 50%;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        ${isCurrentPosition ? 'animation: pulse 2s infinite;' : ''}
      "></div>
      ${isCurrentPosition ? `
        <style>
          @keyframes pulse {
            0% { transform: scale(1); opacity: 1; }
            50% { transform: scale(1.3); opacity: 0.7; }
            100% { transform: scale(1); opacity: 1; }
          }
        </style>
      ` : ''}
    `,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  })
}

const torreIcon = L.divIcon({
  className: "torre-marker",
  html: `
    <div style="
      display: flex;
      flex-direction: column;
      align-items: center;
    ">
      <div style="
        width: 20px;
        height: 20px;
        background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%);
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 2px 8px rgba(34, 197, 94, 0.4);
      ">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
          <path d="M5 12.55a11 11 0 0 1 14.08 0"/>
          <path d="M1.42 9a16 16 0 0 1 21.16 0"/>
          <path d="M8.53 16.11a6 6 0 0 1 6.95 0"/>
          <circle cx="12" cy="20" r="1"/>
        </svg>
      </div>
      <div style="
        width: 3px;
        height: 15px;
        background: #64748b;
        margin-top: -2px;
      "></div>
    </div>
  `,
  iconSize: [20, 35],
  iconAnchor: [10, 35],
})

const getColorSenal = (senal: number) => {
  if (senal >= 4) return "#22c55e"
  if (senal >= 3) return "#0ea5e9"
  if (senal >= 2) return "#f59e0b"
  return "#ef4444"
}

// Componente para ajustar el mapa a la ruta
function FitBounds({ coords }: { coords: [number, number][] }) {
  const map = useMap()
  
  useEffect(() => {
    if (coords.length > 0) {
      const bounds = L.latLngBounds(coords.map(c => [c[0], c[1]]))
      map.fitBounds(bounds, { padding: [50, 50] })
    }
  }, [coords, map])
  
  return null
}

// Componente para seguir la posicion actual
function FollowPosition({ position }: { position: [number, number] | null }) {
  const map = useMap()
  const lastPosition = useRef<[number, number] | null>(null)
  
  useEffect(() => {
    if (position && position !== lastPosition.current) {
      map.panTo(position, { animate: true, duration: 0.5 })
      lastPosition.current = position
    }
  }, [position, map])
  
  return null
}

export default function MapaLeaflet({ rutaCoords, datosRuta, posicionActual, rutaCalculada, zonaActual }: Props) {
  // Centro por defecto en Santiago, Chile
  const defaultCenter: [number, number] = [-33.4489, -70.6693]
  
  // Generar segmentos de ruta por color de senal
  const segmentosRuta = () => {
    if (rutaCoords.length < 2 || datosRuta.length < 2) return []
    
    const segmentos: { coords: [number, number][]; color: string }[] = []
    const puntosPerSegmento = Math.ceil(rutaCoords.length / (datosRuta.length - 1))
    
    for (let i = 0; i < datosRuta.length - 1; i++) {
      const startIdx = i * puntosPerSegmento
      const endIdx = Math.min((i + 1) * puntosPerSegmento + 1, rutaCoords.length)
      const segCoords = rutaCoords.slice(startIdx, endIdx)
      
      if (segCoords.length >= 2) {
        segmentos.push({
          coords: segCoords,
          color: getColorSenal(datosRuta[i].senal)
        })
      }
    }
    
    return segmentos
  }

  // Ubicaciones de torres (simuladas cerca de la ruta)
  const torres = datosRuta.filter(p => p.senal >= 4 && p.lat && p.lng).slice(0, 3)

  if (!rutaCalculada) {
    return (
      <MapContainer
        center={defaultCenter}
        zoom={11}
        style={{ height: "100%", width: "100%" }}
        zoomControl={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <div className="absolute inset-0 flex items-center justify-center z-[1000] pointer-events-none">
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-lg text-center">
            <svg className="w-12 h-12 text-slate-400 mx-auto mb-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
              <circle cx="12" cy="10" r="3"/>
            </svg>
            <p className="text-slate-600 font-medium">Ingresa origen y destino</p>
            <p className="text-slate-500 text-sm">para ver la cobertura en tu ruta</p>
          </div>
        </div>
      </MapContainer>
    )
  }

  return (
    <MapContainer
      center={rutaCoords[0] || defaultCenter}
      zoom={10}
      style={{ height: "100%", width: "100%" }}
      zoomControl={false}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      
      <FitBounds coords={rutaCoords} />
      
      {/* Segmentos de ruta coloreados segun senal */}
      {segmentosRuta().map((seg, idx) => (
        <Polyline
          key={idx}
          positions={seg.coords}
          pathOptions={{
            color: seg.color,
            weight: 6,
            opacity: 0.8,
            lineCap: "round",
            lineJoin: "round"
          }}
        />
      ))}
      
      {/* Circulos de cobertura de torres */}
      {torres.map((torre, idx) => (
        torre.lat && torre.lng && (
          <Circle
            key={`coverage-${idx}`}
            center={[torre.lat, torre.lng]}
            radius={8000}
            pathOptions={{
              color: "#22c55e",
              fillColor: "#22c55e",
              fillOpacity: 0.1,
              weight: 1,
              dashArray: "5, 5"
            }}
          />
        )
      ))}
      
      {/* Zonas sin cobertura */}
      {datosRuta.filter(p => p.senal <= 1 && p.lat && p.lng).map((punto, idx) => (
        <Circle
          key={`nocoverage-${idx}`}
          center={[punto.lat!, punto.lng!]}
          radius={3000}
          pathOptions={{
            color: "#ef4444",
            fillColor: "#ef4444",
            fillOpacity: 0.15,
            weight: 2,
            dashArray: "3, 3"
          }}
        />
      ))}
      
      {/* Marcadores de puntos clave */}
      {datosRuta.filter(p => p.lat && p.lng).map((punto, idx) => (
        <Marker
          key={idx}
          position={[punto.lat!, punto.lng!]}
          icon={createIcon(getColorSenal(punto.senal))}
        >
          <Popup>
            <div className="text-sm">
              <p className="font-semibold">{punto.zona}</p>
              <p className="text-slate-600">Km {punto.km} - Senal {punto.senal}/5</p>
            </div>
          </Popup>
        </Marker>
      ))}
      
      {/* Torres de senal */}
      {torres.map((torre, idx) => (
        torre.lat && torre.lng && (
          <Marker
            key={`torre-${idx}`}
            position={[torre.lat, torre.lng]}
            icon={torreIcon}
          >
            <Popup>
              <div className="text-sm">
                <p className="font-semibold">Torre de senal</p>
                <p className="text-slate-600">Cobertura excelente</p>
              </div>
            </Popup>
          </Marker>
        )
      ))}
      
      {/* Posicion actual del usuario */}
      {posicionActual && (
        <>
          <Marker
            position={posicionActual}
            icon={createIcon(getColorSenal(zonaActual.senal), true)}
          >
            <Popup>
              <div className="text-sm">
                <p className="font-semibold">Tu ubicacion</p>
                <p className="text-slate-600">{zonaActual.zona}</p>
                <p className="text-slate-600">Senal: {zonaActual.senal}/5</p>
              </div>
            </Popup>
          </Marker>
          <FollowPosition position={posicionActual} />
        </>
      )}
      
      {/* Marcador de inicio */}
      {rutaCoords.length > 0 && (
        <Marker
          position={rutaCoords[0]}
          icon={L.divIcon({
            className: "start-marker",
            html: `
              <div style="
                width: 28px;
                height: 28px;
                background: #22c55e;
                border: 3px solid white;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                box-shadow: 0 2px 8px rgba(0,0,0,0.3);
              ">
                <span style="color: white; font-weight: bold; font-size: 12px;">A</span>
              </div>
            `,
            iconSize: [28, 28],
            iconAnchor: [14, 14],
          })}
        >
          <Popup>Punto de partida</Popup>
        </Marker>
      )}
      
      {/* Marcador de destino */}
      {rutaCoords.length > 0 && (
        <Marker
          position={rutaCoords[rutaCoords.length - 1]}
          icon={L.divIcon({
            className: "end-marker",
            html: `
              <div style="
                width: 28px;
                height: 28px;
                background: #ef4444;
                border: 3px solid white;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                box-shadow: 0 2px 8px rgba(0,0,0,0.3);
              ">
                <span style="color: white; font-weight: bold; font-size: 12px;">B</span>
              </div>
            `,
            iconSize: [28, 28],
            iconAnchor: [14, 14],
          })}
        >
          <Popup>Destino</Popup>
        </Marker>
      )}
    </MapContainer>
  )
}
