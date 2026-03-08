import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireMaster } from "@/lib/apiAuth";

export async function GET() {
  const { error } = await requireMaster();
  if (error) return error;

  const settings = await prisma.setting.findMany();
  const result: Record<string, string> = {};
  settings.forEach((s) => { result[s.key] = s.value; });
  return NextResponse.json(result);
}

export async function PUT(request: NextRequest) {
  const { error } = await requireMaster();
  if (error) return error;

  const body = await request.json();

  for (const [key, value] of Object.entries(body)) {
    await prisma.setting.upsert({
      where: { key },
      update: { value: String(value) },
      create: { key, value: String(value) },
    });
  }

  return NextResponse.json({ success: true });
}
