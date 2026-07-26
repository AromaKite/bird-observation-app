'use client'

import { useEffect, useState } from 'react'
import type { Observation } from '../types/observation'

export function useObservations() {
  const [observations, setObservations] =
    useState<Observation[]>([])

  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchObservations() {
      try {
        setIsLoading(true)
        setError(null)

        const response = await fetch('/api/observations')

        if (!response.ok) {
          throw new Error(
            `観察記録の取得に失敗しました: ${response.status}`
          )
        }

        const data =
          (await response.json()) as Observation[]

        setObservations(data)
      } catch (error) {
        console.error(error)

        setError(
          error instanceof Error
            ? error.message
            : '観察記録の取得に失敗しました'
        )
      } finally {
        setIsLoading(false)
      }
    }

    fetchObservations()
  }, [])

  function addObservation(
    newObservation: Observation
  ) {
    setObservations((current) => [
      newObservation,
      ...current,
    ])
  }

  function updateObservation(
    updatedObservation: Observation
  ) {
    setObservations((current) =>
      current.map((observation) =>
        observation.id === updatedObservation.id
          ? updatedObservation
          : observation
      )
    )
  }

  function deleteObservation(id: string) {
    setObservations((current) =>
      current.filter(
        (observation) => observation.id !== id
      )
    )
  }

  return {
    observations,
    isLoading,
    error,
    addObservation,
    updateObservation,
    deleteObservation,
  }
}