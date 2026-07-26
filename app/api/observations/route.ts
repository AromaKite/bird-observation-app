import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

// GET
export async function GET() {
  try {
    const observations = await prisma.observation.findMany({
      orderBy: {
        date: "desc",
      },
    });

    return NextResponse.json(observations);
  } catch (error) {
    console.error("観察記録の取得に失敗しました:", error);

    return NextResponse.json(
      {
        message: "観察記録の取得に失敗しました",
      },
      {
        status: 500,
      }
    );
  }
}

// POST
export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (!body.commonName || !body.location || !body.date) {
      return NextResponse.json(
        {
          message: "和名、観察場所、観察日は必須です",
        },
        {
          status: 400,
        }
      );
    }

    const observation = await prisma.observation.create({
      data: {
        commonName: body.commonName,
        scientificName: body.scientificName || null,
        date: body.date,
        time: body.time || null,
        location: body.location,
        latitude:
          typeof body.latitude === "number" ? body.latitude : null,
        longitude:
          typeof body.longitude === "number" ? body.longitude : null,
        count: typeof body.count === "number" ? body.count : null,
        weather: body.weather || null,
        season: body.season || null,
        memo: body.memo || null,
        imageUrl: body.imageUrl || null,
      },
    });

    return NextResponse.json(observation, {
      status: 201,
    });
  } catch (error) {
    console.error("観察記録の登録に失敗しました:", error);

    return NextResponse.json(
      {
        message: "観察記録の登録に失敗しました",
      },
      {
        status: 500,
      }
    );
  }
}