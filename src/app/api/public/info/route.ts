import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  const settings = await prisma.setting.findMany({
    where: { key: { in: ["chacara_name", "chacara_description"] } },
  });
  const map = Object.fromEntries(settings.map((s) => [s.key, s.value]));
  return NextResponse.json({
    name: map["chacara_name"] ?? "Chácara Garça",
    description: map["chacara_description"] ?? "Área Administrativa",
  });
}
