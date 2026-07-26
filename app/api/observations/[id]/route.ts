
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function PUT(
  request: Request,
  context: RouteContext
) {
  try {
    const { id } = await context.params;
    const observationId = Number(id);

    if (!Number.isInteger(observationId)) {
      return NextResponse.json(
        {
          message: "IDが不正です",
        },
        {
          status: 400,
        }
      );
    }

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

    const observation = await prisma.observation.update({
      where: {
        id: observationId,
      },
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

    return NextResponse.json(observation);
  } catch (error) {
    console.error("観察記録の更新に失敗しました:", error);

    return NextResponse.json(
      {
        message: "観察記録の更新に失敗しました",
      },
      {
        status: 500,
      }
    );
  }
}

export async function DELETE(
  _request: Request,
  context: RouteContext
) {
  try {
    const { id } = await context.params;
    const observationId = Number(id);

    if (!Number.isInteger(observationId)) {
      return NextResponse.json(
        {
          message: "IDが不正です",
        },
        {
          status: 400,
        }
      );
    }

    await prisma.observation.delete({
      where: {
        id: observationId,
      },
    });

    return NextResponse.json({
      message: "観察記録を削除しました",
      id: observationId,
    });
  } catch (error) {
    console.error("観察記録の削除に失敗しました:", error);

    return NextResponse.json(
      {
        message: "観察記録の削除に失敗しました",
      },
      {
        status: 500,
      }
    );
  }
}