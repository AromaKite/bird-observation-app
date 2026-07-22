'use client';

import { useObservations } from '@/hooks/useObservations';
import 'leaflet/dist/leaflet.css';
import { useMemo, useState } from 'react';
import ObservationCard from "../components/ObservationCard";
import ObservationDetail from '../components/ObservationDetail';
import ObservationForm from "../components/ObservationForm";
import type { LatLng, Observation, Season } from "../types/observation";
import { getSeason } from '../utils/observation';



export default function App() {

  const {
    observations,
    setObservations,
  } = useObservations()

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
