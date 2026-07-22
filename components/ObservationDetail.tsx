import type { Observation, Season } from '../types/observation'
import { WEATHER_ICONS, formatDate, getSeason} from '../utils/observation'

export default function ObservationDetail({ obs, onClose, onEdit }: { obs: Observation; onClose: () => void; onEdit: () => void }) {
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