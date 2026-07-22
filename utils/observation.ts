import type { Season, Weather } from '../types/observation'

export const WEATHER_ICONS: Record<Weather, string> = {
  晴れ: '☀',
  曇り: '☁',
  雨: '☂',
  霧: '〰',
  雪: '❄',
}

export function getSeason(dateStr: string): Season {
  const month = new Date(dateStr).getMonth() + 1

  if (month >= 3 && month <= 5) return '春'
  if (month >= 6 && month <= 8) return '夏'
  if (month >= 9 && month <= 11) return '秋'

  return '冬'
}

export function formatDate(dateStr: string): string {
  const d = new Date(dateStr)

  return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`
}