'use client';

import { useState, useMemo, useRef } from 'react'
import { searchBirds, lookupSpecies } from '../data/birdData'
import LocationPicker from '../components/LocationPicker'
import 'leaflet/dist/leaflet.css'

type Weather = '晴れ' | '曇り' | '雨' | '霧' | '雪'
type Season = '春' | '夏' | '秋' | '冬'

interface LatLng {
  lat: number
  lng: number
}

interface Observation {
  id: string
  species: string
  japaneseCommonName: string
  date: string
  time: string
  location: string
  latlng?: LatLng
  count: number | 'X'
  weather: Weather
  notes: string
  imageDataUrl?: string
}

const SAMPLE_DATA: Observation[] = [
  {
    id: '1',
    species: 'Turdus cardis',
    japaneseCommonName: 'クロツグミ',
    date: '2026-07-15',
    time: '05:42',
    location: '高尾山 6号路',
    latlng: { lat: 35.6253, lng: 139.2433 },
    count: 1,
    weather: '曇り',
    notes: '沢沿いの林床で採食中。さえずりは短く、警戒しながら移動していた。',
    imageDataUrl: 'https://images.unsplash.com/photo-1522926193341-e9ffd686c60f?w=600&h=400&fit=crop&auto=format',
  },
  {
    id: '2',
    species: 'Alcedo atthis',
    japaneseCommonName: 'カワセミ',
    date: '2026-07-12',
    time: '07:18',
    location: '多摩川 是政橋付近',
    latlng: { lat: 35.6299, lng: 139.4599 },
    count: 2,
    weather: '晴れ',
    notes: 'ペアと思われる2羽が川岸の杭に止まっていた。繁殖期の可能性あり。羽色が非常に鮮やか。',
    imageDataUrl: 'https://images.unsplash.com/photo-1578887036037-39abb04b1c24?w=600&h=400&fit=crop&auto=format',
  },
  {
    id: '3',
    species: 'Motacilla alba',
    japaneseCommonName: 'ハクセキレイ',
    date: '2026-07-10',
    time: '12:05',
    location: '皇居外苑',
    latlng: { lat: 35.6851, lng: 139.7527 },
    count: 4,
    weather: '晴れ',
    notes: '駐車場エリアで複数羽が採食。尾を上下に振る特徴的な動作を確認。',
  },
  {
    id: '4',
    species: 'Parus minor',
    japaneseCommonName: 'シジュウカラ',
    date: '2026-07-08',
    time: '06:30',
    location: '井の頭公園',
    latlng: { lat: 35.7002, lng: 139.5703 },
    count: 6,
    weather: '晴れ',
    notes: '複数の個体が混群を形成。ツツピー、ツツピーの声がよく聞こえた。',
    imageDataUrl: 'https://images.unsplash.com/photo-1612170153139-6f881ff067e0?w=600&h=400&fit=crop&auto=format',
  },
  {
    id: '5',
    species: 'Egretta garzetta',
    japaneseCommonName: 'コサギ',
    date: '2026-07-05',
    time: '16:45',
    location: '玉川上水 境橋',
    latlng: { lat: 35.7034, lng: 139.5321 },
    count: 1,
    weather: '曇り',
    notes: '浅瀬で静止し魚を待ち構える姿勢。足を使って魚を追い込む行動も見られた。',
  },
]

const WEATHER_ICONS: Record<Weather, string> = {
  '晴れ': '☀',
  '曇り': '☁',
  '雨': '☂',
  '霧': '〰',
  '雪': '❄',
}

function getSeason(dateStr: string): Season {
  const month = new Date(dateStr).getMonth() + 1
  if (month >= 3 && month <= 5) return '春'
  if (month >= 6 && month <= 8) return '夏'
  if (month >= 9 && month <= 11) return '秋'
  return '冬'
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr)
  return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`
}

function ObservationCard({ obs, onClick }: { obs: Observation; onClick: () => void }) {
  const season = getSeason(obs.date)
  const seasonColors: Record<Season, string> = {
    '春': 'text-pink-600',
    '夏': 'text-green-700',
    '秋': 'text-amber-700',
    '冬': 'text-blue-600',
  }

  return (
    <article
      onClick={onClick}
      className="group cursor-pointer bg-[#FDFAF2] border border-[#C4B898] hover:border-[#2A4A1E] transition-all duration-300 hover:shadow-lg overflow-hidden"
    >
      {obs.imageDataUrl && (
        <div className="h-40 overflow-hidden bg-[#E8E0CC]">
          <img
            src={obs.imageDataUrl}
            alt={obs.japaneseCommonName}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        </div>
      )}
      <div className="p-5">
        <div className="flex items-start justify-between gap-2 mb-2">
          <div>
            <h3 className="font-display text-xl font-semibold text-[#1C1B16] leading-tight">
              {obs.japaneseCommonName}
            </h3>
            {obs.species && (
              <p className="font-mono-custom text-xs text-[#6B6455] mt-0.5 italic">{obs.species}</p>
            )}
          </div>
          <span className="text-2xl leading-none mt-0.5">{WEATHER_ICONS[obs.weather]}</span>
        </div>

        <div className="flex items-center gap-3 mt-3 text-sm text-[#6B6455]">
          <span className="font-mono-custom">{formatDate(obs.date)}</span>
          <span className="text-[#C4B898]">·</span>
          <span className="font-mono-custom">{obs.time}</span>
          <span className={`ml-auto text-xs font-medium ${seasonColors[season]}`}>{season}</span>
        </div>

        <div className="flex items-center gap-1.5 mt-2 text-sm">
          <span className="text-[#8B6914]">📍</span>
          <span className="text-[#1C1B16] font-medium truncate">{obs.location}</span>
        </div>

        <div className="flex items-center justify-end mt-3 pt-3 border-t border-[#E8E0CC]">
          <span className="font-mono-custom text-sm font-medium text-[#2A4A1E]">
            {obs.count === 'X' ? '個体数不明' : `${obs.count}羽`}
          </span>
        </div>
      </div>
    </article>
  )
}

function ObservationDetail({ obs, onClose, onEdit }: { obs: Observation; onClose: () => void; onEdit: () => void }) {
  const mapUrl = obs.latlng
    ? `https://www.openstreetmap.org/export/embed.html?bbox=${obs.latlng.lng - 0.005},${obs.latlng.lat - 0.003},${obs.latlng.lng + 0.005},${obs.latlng.lat + 0.003}&layer=mapnik&marker=${obs.latlng.lat},${obs.latlng.lng}`
    : null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1C1B16]/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-[#FDFAF2] border border-[#C4B898] w-full max-w-xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {obs.imageDataUrl && (
          <div className="h-56 overflow-hidden bg-[#E8E0CC]">
            <img src={obs.imageDataUrl} alt={obs.japaneseCommonName} className="w-full h-full object-cover" />
          </div>
        )}
        <div className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h2 className="font-display text-3xl font-bold text-[#1C1B16]">{obs.japaneseCommonName}</h2>
              {obs.species && (
                <p className="font-mono-custom text-sm text-[#6B6455] italic mt-1">{obs.species}</p>
              )}
            </div>
            <div className="flex items-center gap-2 mt-1">
              <button
                onClick={onEdit}
                className="text-xs text-[#2A4A1E] border border-[#2A4A1E] px-3 py-1.5 hover:bg-[#2A4A1E] hover:text-[#F4EFE3] transition-colors"
              >
                編集
              </button>
              <button
                onClick={onClose}
                className="text-[#6B6455] hover:text-[#1C1B16] transition-colors text-2xl leading-none"
              >
                ×
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-5">
            {[
              { label: '観察日', value: formatDate(obs.date) },
              { label: '時刻', value: obs.time },
              { label: '場所', value: obs.location },
              { label: '個体数', value: obs.count === 'X' ? '不明' : `${obs.count}羽` },
              { label: '天候', value: `${WEATHER_ICONS[obs.weather]} ${obs.weather}` },
              { label: '季節', value: getSeason(obs.date) },
            ].map(({ label, value }) => (
              <div key={label} className="bg-[#F4EFE3] p-3">
                <p className="text-xs text-[#6B6455] font-medium mb-0.5">{label}</p>
                <p className="font-mono-custom text-sm text-[#1C1B16]">{value}</p>
              </div>
            ))}
          </div>

          {mapUrl && (
            <div className="mb-5">
              <p className="text-xs text-[#6B6455] font-medium mb-2">観察場所</p>
              <iframe
                src={mapUrl}
                className="w-full h-48 border border-[#C4B898]"
                title="観察場所"
              />
            </div>
          )}

          {obs.notes && (
            <div className="border-t border-[#C4B898] pt-4">
              <p className="text-xs text-[#6B6455] font-medium mb-2">観察メモ</p>
              <p className="text-[#1C1B16] leading-relaxed text-sm">{obs.notes}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function ObservationForm({
  initial,
  onClose,
  onSubmit,
  pastLocations,
  submitLabel,
}: {
  initial?: Observation
  onClose: () => void
  onSubmit: (obs: Observation) => void
  pastLocations: Array<{ name: string; latlng: LatLng }>
  submitLabel: string
}) {
  const [form, setForm] = useState({
    japaneseCommonName: initial?.japaneseCommonName ?? '',
    species: initial?.species ?? '',
    date: initial?.date ?? new Date().toISOString().split('T')[0],
    time: initial?.time ?? new Date().toTimeString().slice(0, 5),
    location: initial?.location ?? '',
    latlng: initial?.latlng ?? null as LatLng | null,
    countStr: initial ? String(initial.count) : '1',
    weather: initial?.weather ?? '晴れ' as Weather,
    notes: initial?.notes ?? '',
  })
  const [suggestions, setSuggestions] = useState<ReturnType<typeof searchBirds>>([])
  const [imageDataUrl, setImageDataUrl] = useState<string | undefined>(initial?.imageDataUrl)
  const [showMap, setShowMap] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const set = (k: string, v: unknown) => setForm((f) => ({ ...f, [k]: v }))

  const handleNameChange = (val: string) => {
    set('japaneseCommonName', val)
    const results = searchBirds(val)
    setSuggestions(results)
    const species = lookupSpecies(val)
    if (species) set('species', species)
    else if (!val) set('species', '')
  }

  const selectSuggestion = (ja: string, species: string) => {
    setForm((f) => ({ ...f, japaneseCommonName: ja, species }))
    setSuggestions([])
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => setImageDataUrl(ev.target?.result as string)
    reader.readAsDataURL(file)
  }

  const handleLocationChange = (latlng: LatLng, address: string) => {
    setForm((f) => ({ ...f, latlng, location: f.location || address }))
  }

  const handleSubmit = () => {
    if (!form.japaneseCommonName || !form.location) return
    const count: number | 'X' =
      form.countStr.trim().toUpperCase() === 'X' ? 'X' : parseInt(form.countStr) || 1
    onSubmit({
      id: initial?.id ?? Date.now().toString(),
      japaneseCommonName: form.japaneseCommonName,
      species: form.species,
      date: form.date,
      time: form.time,
      location: form.location,
      latlng: form.latlng ?? undefined,
      count,
      weather: form.weather,
      notes: form.notes,
      imageDataUrl,
    })
  }

  const inputClass =
    'w-full bg-[#F4EFE3] border border-[#C4B898] text-[#1C1B16] px-3 py-2 text-sm font-mono-custom focus:outline-none focus:border-[#2A4A1E] transition-colors'
  const labelClass = 'block text-xs font-medium text-[#6B6455] mb-1'

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1C1B16]/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-[#FDFAF2] border border-[#C4B898] w-full max-w-lg max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-display text-2xl font-bold text-[#1C1B16]">
              {initial ? '記録を編集' : '新規観察記録'}
            </h2>
            <button onClick={onClose} className="text-[#6B6455] hover:text-[#1C1B16] text-2xl leading-none">
              ×
            </button>
          </div>

          <div className="space-y-4">
            {/* Bird name with autocomplete */}
            <div className="grid grid-cols-2 gap-4">
              <div className="relative">
                <label className={labelClass}>和名 *</label>
                <input
                  className={inputClass}
                  placeholder="シジュウカラ"
                  value={form.japaneseCommonName}
                  onChange={(e) => handleNameChange(e.target.value)}
                  autoComplete="off"
                />
                {suggestions.length > 0 && (
                  <div className="absolute top-full left-0 right-0 z-50 bg-[#FDFAF2] border border-[#C4B898] border-t-0 shadow-lg max-h-40 overflow-y-auto">
                    {suggestions.map((s) => (
                      <button
                        key={s.ja}
                        type="button"
                        onClick={() => selectSuggestion(s.ja, s.species)}
                        className="w-full text-left px-3 py-2 hover:bg-[#F4EFE3] border-b border-[#E8E0CC] last:border-0"
                      >
                        <span className="text-sm text-[#1C1B16]">{s.ja}</span>
                        <span className="text-xs text-[#6B6455] ml-2 italic">{s.species}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <div>
                <label className={labelClass}>学名（自動入力）</label>
                <input
                  className={`${inputClass} text-[#6B6455]`}
                  placeholder="自動入力されます"
                  value={form.species}
                  onChange={(e) => set('species', e.target.value)}
                />
              </div>
            </div>

            {/* Date & Time */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>観察日 *</label>
                <input
                  type="date"
                  className={inputClass}
                  value={form.date}
                  onChange={(e) => set('date', e.target.value)}
                />
              </div>
              <div>
                <label className={labelClass}>時刻</label>
                <input
                  type="time"
                  className={inputClass}
                  value={form.time}
                  onChange={(e) => set('time', e.target.value)}
                />
              </div>
            </div>

            {/* Location */}
            <div>
              <label className={labelClass}>観察場所 *</label>
              <div className="flex gap-2 mb-2">
                <input
                  className={`${inputClass} flex-1`}
                  placeholder="高尾山 6号路"
                  value={form.location}
                  onChange={(e) => set('location', e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowMap((v) => !v)}
                  className={`px-3 py-2 text-sm border transition-colors whitespace-nowrap ${
                    showMap
                      ? 'bg-[#2A4A1E] text-[#F4EFE3] border-[#2A4A1E]'
                      : 'bg-[#F4EFE3] text-[#6B6455] border-[#C4B898] hover:border-[#2A4A1E]'
                  }`}
                >
                  🗺 地図
                </button>
              </div>
              {showMap && (
                <LocationPicker
                  value={form.latlng}
                  onChange={handleLocationChange}
                  pastLocations={pastLocations}
                />
              )}
            </div>

            {/* Count & Weather */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>個体数（不明は「X」）</label>
                <input
                  className={inputClass}
                  placeholder="1"
                  value={form.countStr}
                  onChange={(e) => set('countStr', e.target.value)}
                />
              </div>
              <div>
                <label className={labelClass}>天候</label>
                <select
                  className={inputClass}
                  value={form.weather}
                  onChange={(e) => set('weather', e.target.value)}
                >
                  {(['晴れ', '曇り', '雨', '霧', '雪'] as Weather[]).map((w) => (
                    <option key={w} value={w}>{WEATHER_ICONS[w]} {w}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Photo upload */}
            <div>
              <label className={labelClass}>写真</label>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageUpload}
              />
              {imageDataUrl ? (
                <div className="relative">
                  <img
                    src={imageDataUrl}
                    alt="アップロード画像"
                    className="w-full h-36 object-cover border border-[#C4B898]"
                  />
                  <button
                    type="button"
                    onClick={() => { setImageDataUrl(undefined); if (fileInputRef.current) fileInputRef.current.value = '' }}
                    className="absolute top-2 right-2 bg-[#1C1B16]/70 text-white w-6 h-6 flex items-center justify-center text-sm hover:bg-[#1C1B16]"
                  >
                    ×
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full border border-dashed border-[#C4B898] bg-[#F4EFE3] hover:border-[#2A4A1E] transition-colors py-6 text-sm text-[#6B6455] flex flex-col items-center gap-1"
                >
                  <span className="text-2xl">📷</span>
                  <span>クリックして写真をアップロード</span>
                </button>
              )}
            </div>

            {/* Notes */}
            <div>
              <label className={labelClass}>観察メモ</label>
              <textarea
                className={`${inputClass} resize-none h-24`}
                placeholder="観察した様子、特徴など..."
                value={form.notes}
                onChange={(e) => set('notes', e.target.value)}
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-[#C4B898]">
            <button
              onClick={onClose}
              className="px-5 py-2 text-sm text-[#6B6455] border border-[#C4B898] hover:border-[#6B6455] transition-colors"
            >
              キャンセル
            </button>
            <button
              onClick={handleSubmit}
              className="px-5 py-2 text-sm font-medium bg-[#2A4A1E] text-[#F4EFE3] hover:bg-[#3D6B2C] transition-colors"
            >
              {submitLabel}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function App() {
  const [observations, setObservations] = useState<Observation[]>(SAMPLE_DATA)
  const [selected, setSelected] = useState<Observation | null>(null)
  const [showAdd, setShowAdd] = useState(false)
  const [editing, setEditing] = useState<Observation | null>(null)
  const [filter, setFilter] = useState<'すべて' | Season>('すべて')
  const [sortBy, setSortBy] = useState<'date' | 'species'>('date')
  const [search, setSearch] = useState('')

  const stats = useMemo(() => {
    const species = new Set(observations.map((o) => o.japaneseCommonName)).size
    const locations = new Set(observations.map((o) => o.location)).size
    return { species, count: observations.length, locations }
  }, [observations])

  const pastLocations = useMemo(() => {
    const seen = new Map<string, { name: string; latlng: LatLng }>()
    for (const obs of observations) {
      if (obs.latlng && !seen.has(obs.location)) {
        seen.set(obs.location, { name: obs.location, latlng: obs.latlng })
      }
    }
    return Array.from(seen.values())
  }, [observations])

  const filtered = useMemo(() => {
    let list = observations
    if (filter !== 'すべて') list = list.filter((o) => getSeason(o.date) === filter)
    if (search) {
      const q = search.toLowerCase()
      list = list.filter(
        (o) =>
          o.japaneseCommonName.toLowerCase().includes(q) ||
          o.location.toLowerCase().includes(q) ||
          o.species.toLowerCase().includes(q)
      )
    }
    if (sortBy === 'date') list = [...list].sort((a, b) => b.date.localeCompare(a.date))
    else list = [...list].sort((a, b) => a.japaneseCommonName.localeCompare(b.japaneseCommonName, 'ja'))
    return list
  }, [observations, filter, sortBy, search])

  const addObservation = (obs: Observation) => {
    setObservations((prev) => [obs, ...prev])
    setShowAdd(false)
  }

  const updateObservation = (obs: Observation) => {
    setObservations((prev) => prev.map((o) => (o.id === obs.id ? obs : o)))
    setEditing(null)
    setSelected(obs)
  }

  const SEASONS: ('すべて' | Season)[] = ['すべて', '春', '夏', '秋', '冬']

  return (
    <div className="min-h-screen bg-[#F4EFE3]">
      <header className="border-b border-[#C4B898] bg-[#FDFAF2]">
        <div className="max-w-5xl mx-auto px-6 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-[#2A4A1E] flex items-center justify-center text-[#F4EFE3] text-lg">
                🦅
              </div>
              <div>
                <h1 className="font-display text-2xl font-bold text-[#1C1B16] leading-none">野鳥観察手帳</h1>
                <p className="text-xs text-[#6B6455] mt-0.5 font-mono-custom">Bird Watching Journal</p>
              </div>
            </div>
            <button
              onClick={() => setShowAdd(true)}
              className="flex items-center gap-2 bg-[#2A4A1E] text-[#F4EFE3] px-4 py-2.5 text-sm font-medium hover:bg-[#3D6B2C] transition-colors"
            >
              <span>＋</span>
              <span>記録を追加</span>
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-6 py-8">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[
            { label: '記録種数', value: stats.species, unit: '種', icon: '🐦' },
            { label: '記録回数', value: stats.count, unit: '回', icon: '📖' },
            { label: '観察地点', value: stats.locations, unit: '箇所', icon: '📍' },
          ].map(({ label, value, unit, icon }) => (
            <div key={label} className="bg-[#FDFAF2] border border-[#C4B898] p-5">
              <div className="flex items-center gap-2 mb-2">
                <span>{icon}</span>
                <span className="text-xs text-[#6B6455] font-medium">{label}</span>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="font-display text-4xl font-bold text-[#1C1B16]">{value}</span>
                <span className="text-sm text-[#6B6455]">{unit}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Filter + Search */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <input
              type="text"
              placeholder="鳥の名前、場所で検索..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-[#FDFAF2] border border-[#C4B898] text-[#1C1B16] px-4 py-2.5 pr-10 text-sm font-mono-custom focus:outline-none focus:border-[#2A4A1E] transition-colors"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6B6455] hover:text-[#1C1B16] text-lg leading-none transition-colors"
                aria-label="検索をクリア"
              >
                ×
              </button>
            )}
          </div>
          <div className="flex items-center gap-1">
            {SEASONS.map((s) => (
              <button
                key={s}
                onClick={() => setFilter(s)}
                className={`px-3 py-2 text-sm transition-colors ${
                  filter === s
                    ? 'bg-[#2A4A1E] text-[#F4EFE3]'
                    : 'bg-[#FDFAF2] border border-[#C4B898] text-[#6B6455] hover:border-[#2A4A1E]'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'date' | 'species')}
            className="bg-[#FDFAF2] border border-[#C4B898] text-[#6B6455] px-3 py-2 text-sm font-mono-custom focus:outline-none focus:border-[#2A4A1E] transition-colors"
          >
            <option value="date">日付順</option>
            <option value="species">種名順</option>
          </select>
        </div>

        <div className="flex items-center gap-3 mb-4">
          <div className="h-px flex-1 bg-[#C4B898]" />
          <span className="font-mono-custom text-xs text-[#6B6455]">{filtered.length} 件の記録</span>
          <div className="h-px flex-1 bg-[#C4B898]" />
        </div>

        {filtered.length === 0 ? (
          <div className="text-center py-20 text-[#6B6455]">
            <div className="text-5xl mb-4">🔭</div>
            <p className="font-display text-xl">観察記録が見つかりません</p>
            <p className="text-sm mt-2">検索条件を変えてみてください</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((obs) => (
              <ObservationCard key={obs.id} obs={obs} onClick={() => setSelected(obs)} />
            ))}
          </div>
        )}

        <footer className="mt-16 pt-6 border-t border-[#C4B898] flex items-center justify-between text-xs text-[#6B6455] font-mono-custom">
          <span>野鳥観察手帳 · Bird Watching Journal</span>
          <span>{new Date().getFullYear()}</span>
        </footer>
      </div>

      {selected && (
        <ObservationDetail
          obs={selected}
          onClose={() => setSelected(null)}
          onEdit={() => { setEditing(selected); setSelected(null) }}
        />
      )}
      {showAdd && (
        <ObservationForm
          onClose={() => setShowAdd(false)}
          onSubmit={addObservation}
          pastLocations={pastLocations}
          submitLabel="記録する"
        />
      )}
      {editing && (
        <ObservationForm
          initial={editing}
          onClose={() => setEditing(null)}
          onSubmit={updateObservation}
          pastLocations={pastLocations}
          submitLabel="保存する"
        />
      )}
    </div>
  )
}
