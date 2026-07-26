import { SAMPLE_DATA } from '@/data/sampleData'

export async function GET() {
  return Response.json(SAMPLE_DATA)
}