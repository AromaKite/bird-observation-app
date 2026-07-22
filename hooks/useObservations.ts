import { Observation } from "@/types/observation";
import { useState } from "react";

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

export function useObservations() {
  const [observations, setObservations] = useState<Observation[]>(SAMPLE_DATA)
  return {
    observations,
    setObservations,
  }
}