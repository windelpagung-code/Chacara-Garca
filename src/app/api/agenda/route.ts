import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/apiAuth";
import { startOfMonth, endOfMonth, addMonths } from "date-fns";

export async function GET(request: NextRequest) {
  const { error } = await requireAuth();
  if (error) return error;

  const { searchParams } = new URL(request.url);
  const year = parseInt(searchParams.get("year") ?? String(new Date().getFullYear()));
  const month = parseInt(searchParams.get("month") ?? String(new Date().getMonth() + 1));

  const start = startOfMonth(new Date(year, month - 1));
  const end = endOfMonth(addMonths(start, 0));

  const dates = await prisma.contractDate.findMany({
    where: {
      date: { gte: start, lte: end },
      contract: { status: { not: "cancelled" } },
    },
    include: {
      contract: {
        include: { client: true },
      },
    },
    orderBy: { date: "asc" },
  });

  return NextResponse.json(dates);
}
