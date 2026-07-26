import { SAMPLE_DATA } from '@/data/sampleData'
import type { Observation } from '@/types/observation'

export async function GET() {
  return Response.json(SAMPLE_DATA)
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Omit<Observation, 'id'>

    const newObservation: Observation = {
      ...body,
      id: crypto.randomUUID(),
    }

    return Response.json(newObservation, {
      status: 201,
    })
  } catch (error) {
    console.error('観察記録の作成に失敗しました', error)

    return Response.json(
      {
        message: '観察記録の作成に失敗しました',
      },
      {
        status: 400,
      }
    )
  }
}