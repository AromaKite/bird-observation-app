import { useEffect, useRef, useState } from 'react'
import type { Map, Marker, LeafletMouseEvent } from 'leaflet'

interface LatLng {
  lat: number
  lng: number
}

interface LocationPickerProps {
  value: LatLng | null
  onChange: (latlng: LatLng, address: string) => void
  pastLocations: Array<{ name: string; latlng: LatLng }>
}

async function reverseGeocode(lat: number, lng: number): Promise<string> {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&accept-language=ja`,
      { headers: { 'Accept-Language': 'ja' } }
    )
    const data = await res.json()
    const addr = data.address
    const parts = [
      addr.city || addr.town || addr.village || addr.county || '',
      addr.suburb || addr.neighbourhood || addr.quarter || '',
      addr.road || addr.pedestrian || '',
    ].filter(Boolean)
    return parts.join(' ') || data.display_name?.split(',')[0] || `${lat.toFixed(5)}, ${lng.toFixed(5)}`
  } catch {
    return `${lat.toFixed(5)}, ${lng.toFixed(5)}`
  }
}

export default function LocationPicker({ value, onChange, pastLocations }: LocationPickerProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const leafletMap = useRef<Map | null>(null)
  const markerRef = useRef<Marker | null>(null)
  const [geocoding, setGeocoding] = useState(false)
  const [showPast, setShowPast] = useState(false)

  useEffect(() => {
    if (!mapRef.current || leafletMap.current) return

    import('leaflet').then((L) => {
      const map = L.map(mapRef.current!, {
        center: [35.6762, 139.6503],
        zoom: 11,
        zoomControl: true,
      })

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19,
      }).addTo(map)

      const icon = L.divIcon({
        html: `<div style="width:24px;height:24px;background:#2A4A1E;border:2px solid #FDFAF2;border-radius:50% 50% 50% 0;transform:rotate(-45deg);box-shadow:0 2px 6px rgba(0,0,0,0.3)"></div>`,
        iconSize: [24, 24],
        iconAnchor: [12, 24],
        className: '',
      })

      map.on('click', async (e: LeafletMouseEvent) => {
        const { lat, lng } = e.latlng
        if (markerRef.current) {
          markerRef.current.setLatLng([lat, lng])
        } else {
          markerRef.current = L.marker([lat, lng], { icon }).addTo(map)
        }
        setGeocoding(true)
        const addr = await reverseGeocode(lat, lng)
        setGeocoding(false)
        onChange({ lat, lng }, addr)
      })

      if (value) {
        markerRef.current = L.marker([value.lat, value.lng], { icon }).addTo(map)
        map.setView([value.lat, value.lng], 14)
      }

      leafletMap.current = map
    })

    return () => {
      leafletMap.current?.remove()
      leafletMap.current = null
      markerRef.current = null
    }
  }, [])

  const flyTo = (latlng: LatLng, name: string) => {
    import('leaflet').then((L) => {
      const map = leafletMap.current
      if (!map) return
      map.flyTo([latlng.lat, latlng.lng], 15, { duration: 1 })
      const icon = L.divIcon({
        html: `<div style="width:24px;height:24px;background:#2A4A1E;border:2px solid #FDFAF2;border-radius:50% 50% 50% 0;transform:rotate(-45deg);box-shadow:0 2px 6px rgba(0,0,0,0.3)"></div>`,
        iconSize: [24, 24],
        iconAnchor: [12, 24],
        className: '',
      })
      if (markerRef.current) {
        markerRef.current.setLatLng([latlng.lat, latlng.lng])
      } else {
        markerRef.current = L.marker([latlng.lat, latlng.lng], { icon }).addTo(map)
      }
      onChange(latlng, name)
      setShowPast(false)
    })
  }

  return (
    <div className="space-y-2">
      {pastLocations.length > 0 && (
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowPast((v) => !v)}
            className="text-xs text-[#2A4A1E] border border-[#2A4A1E] px-3 py-1.5 hover:bg-[#2A4A1E] hover:text-[#F4EFE3] transition-colors"
          >
            過去の観察場所を選択 ({pastLocations.length}件)
          </button>
          {showPast && (
            <div className="absolute top-full left-0 z-[9999] mt-1 bg-[#FDFAF2] border border-[#C4B898] shadow-lg min-w-56 max-h-48 overflow-y-auto">
              {pastLocations.map((loc, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => flyTo(loc.latlng, loc.name)}
                  className="w-full text-left px-3 py-2 text-sm text-[#1C1B16] hover:bg-[#F4EFE3] border-b border-[#E8E0CC] last:border-0 flex items-center gap-2"
                >
                  <span className="text-[#8B6914]">📍</span>
                  {loc.name}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
      <div className="relative">
        <div
          ref={mapRef}
          className="w-full h-56 border border-[#C4B898] z-0"
          style={{ zIndex: 0 }}
        />
        {geocoding && (
          <div className="absolute bottom-2 left-2 bg-[#FDFAF2]/90 border border-[#C4B898] px-3 py-1.5 text-xs text-[#6B6455] font-mono-custom">
            場所を取得中...
          </div>
        )}
        {!value && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="bg-[#FDFAF2]/80 border border-[#C4B898] px-4 py-2 text-sm text-[#6B6455] text-center">
              地図をクリックして<br />場所を選択
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
