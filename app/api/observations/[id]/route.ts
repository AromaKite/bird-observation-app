import type { Observation } from '@/types/observation'

interface RouteContext {
  params: Promise<{
    id: string
  }>
}

export async function PUT(
  request: Request,
  context: RouteContext
) {
  try {
    const { id } = await context.params
    const body = (await request.json()) as Observation

    const updatedObservation: Observation = {
      ...body,
      id,
    }

    return Response.json(updatedObservation)
  } catch (error) {
    console.error(
      '観察記録の更新に失敗しました',
      error
    )

    return Response.json(
      {
        message: '観察記録の更新に失敗しました',
      },
      {
        status: 400,
      }
    )
  }
}