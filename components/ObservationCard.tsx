import type { Observation, Season } from '../types/observation'
import { WEATHER_ICONS, formatDate, getSeason} from '../utils/observation'

export default function ObservationCard({ obs, onClick }: { obs: Observation; onClick: () => void }) {
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