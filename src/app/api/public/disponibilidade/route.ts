import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { startOfMonth, endOfMonth, addMonths } from "date-fns";

export async function GET(request: NextRequest) {
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
    select: { date: true },
  });

  const settings = await prisma.setting.findMany({
    where: { key: { in: ["whatsapp_number", "chacara_name"] } },
  });

  const settingsMap: Record<string, string> = {};
  settings.forEach((s) => { settingsMap[s.key] = s.value; });

  return NextResponse.json({
    reservedDates: dates.map((d) => d.date.toISOString().split("T")[0]),
    whatsappNumber: settingsMap["whatsapp_number"] ?? "",
    chacaraName: settingsMap["chacara_name"] ?? "Chácara Garcia",
  });
}
