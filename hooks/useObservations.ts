'use client'

import { useEffect, useState } from 'react'
import { SAMPLE_DATA } from '../data/sampleData'
import type { Observation } from '../types/observation'

const STORAGE_KEY = 'bird-observations'

export function useObservations() {
  const [observations, setObservations] =
    useState<Observation[]>(SAMPLE_DATA)

  const [isLoaded, setIsLoaded] = useState(false)

  // localStorageから観察記録を読み込む
  useEffect(() => {
    try {
      const savedData = localStorage.getItem(STORAGE_KEY)

      if (savedData) {
        const parsedData = JSON.parse(savedData) as Observation[]
        setObservations(parsedData)
      }
    } catch (error) {
      console.error(
        '観察記録の読み込みに失敗しました',
        error
      )
    } finally {
      setIsLoaded(true)
    }
  }, [])

  // observationsが変化したらlocalStorageへ保存する
  useEffect(() => {
    if (!isLoaded) return

    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(observations)
      )
    } catch (error) {
      console.error(
        '観察記録の保存に失敗しました',
        error
      )
    }
  }, [observations, isLoaded])

  function addObservation(
    newObservation: Observation
  ) {
    setObservations((currentObservations) => [
      newObservation,
      ...currentObservations,
    ])
  }

  function updateObservation(
    updatedObservation: Observation
  ) {
    setObservations((currentObservations) =>
      currentObservations.map((observation) =>
        observation.id === updatedObservation.id
          ? updatedObservation
          : observation
      )
    )
  }

  function deleteObservation(id: string) {
    setObservations((currentObservations) =>
      currentObservations.filter(
        (observation) => observation.id !== id
      )
    )
  }

  return {
    observations,
    addObservation,
    updateObservation,
    deleteObservation,
    isLoaded,
  }
}