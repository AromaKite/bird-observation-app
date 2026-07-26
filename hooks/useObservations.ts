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

  async function addObservation(
    observation: Observation
  ) {
    try {
      setError(null)

      const response = await fetch('/api/observations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(observation),
      })

      if (!response.ok) {
        throw new Error(
          `観察記録の追加に失敗しました: ${response.status}`
        )
      }

      const createdObservation =
        (await response.json()) as Observation

      setObservations((current) => [
        createdObservation,
        ...current,
      ])

      return createdObservation
    } catch (error) {
      console.error('観察記録の追加エラー:', error)

      const message =
        error instanceof Error
          ? error.message
          : '観察記録の追加に失敗しました'

      setError(message)
      throw error
    }
  }

  async function updateObservation(
    observation: Observation
  ) {
    try {
      setError(null)

      const response = await fetch(
        `/api/observations/${observation.id}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(observation),
        }
      )

      if (!response.ok) {
        throw new Error(
          `観察記録の更新に失敗しました: ${response.status}`
        )
      }

      const updatedObservation =
        (await response.json()) as Observation

      setObservations((current) =>
        current.map((currentObservation) =>
          currentObservation.id ===
          updatedObservation.id
            ? updatedObservation
            : currentObservation
        )
      )

      return updatedObservation
    } catch (error) {
      console.error(
        '観察記録の更新エラー:',
        error
      )

      const message =
        error instanceof Error
          ? error.message
          : '観察記録の更新に失敗しました'

      setError(message)
      throw error
    }
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