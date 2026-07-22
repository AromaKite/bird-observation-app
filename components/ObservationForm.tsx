import { useRef, useState } from "react"
import { lookupSpecies, searchBirds } from "../data/birdData"
import type { LatLng, Observation, Weather } from "../types/observation"
import { WEATHER_ICONS } from '../utils/observation'
import LocationPicker from "./LocationPicker"

interface ObservationFormProps {
  initial?: Observation
  onClose: () => void
  onSubmit: (observation: Observation) => void
  pastLocations: Array<{ name: string; latlng: LatLng }>
  submitLabel: string
}

export default function ObservationForm({
  initial,
  onClose,
  onSubmit,
  pastLocations,
  submitLabel,
}: ObservationFormProps) {
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
