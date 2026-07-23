'use client'

import { useState } from 'react'
import { SAMPLE_DATA } from '../data/sampleData'
import type { Observation } from '../types/observation'

export function useObservations() {
  const [observations, setObservations] =
    useState<Observation[]>(SAMPLE_DATA)

  function addObservation(newObservation: Observation) {
    setObservations((currentObservations) => [
      newObservation,
      ...currentObservations,
    ])
  }

  function updateObservation(updatedObservation: Observation) {
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
  }
}