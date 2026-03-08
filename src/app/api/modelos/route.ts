import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/apiAuth";

export async function GET() {
  const { error } = await requireAuth();
  if (error) return error;

  const templates = await prisma.contractTemplate.findMany({
    orderBy: { createdAt: "asc" },
  });

  return NextResponse.json(templates);
}

export async function POST(request: NextRequest) {
  const { error } = await requireAuth();
  if (error) return error;

  const { name, content } = await request.json();

  if (!name?.trim() || !content?.trim()) {
    return NextResponse.json({ error: "Nome e conteúdo são obrigatórios" }, { status: 400 });
  }

  const template = await prisma.contractTemplate.create({
    data: { name: name.trim(), content: content.trim() },
  });

  return NextResponse.json(template, { status: 201 });
}
