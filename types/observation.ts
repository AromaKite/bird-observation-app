export type Weather = '晴れ' | '曇り' | '雨' | '霧' | '雪'
export type Season = '春' | '夏' | '秋' | '冬'

export interface LatLng {
  lat: number
  lng: number
}

export interface Observation {
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