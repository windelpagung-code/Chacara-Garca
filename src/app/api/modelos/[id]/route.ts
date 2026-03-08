import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/apiAuth";

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { error } = await requireAuth();
  if (error) return error;

  const { id } = await params;
  const numId = parseInt(id);
  if (isNaN(numId)) return NextResponse.json({ error: "Não encontrado" }, { status: 404 });
  const template = await prisma.contractTemplate.findUnique({ where: { id: numId } });
  if (!template) return NextResponse.json({ error: "Não encontrado" }, { status: 404 });

  return NextResponse.json(template);
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { error } = await requireAuth();
  if (error) return error;

  const { id } = await params;
  const { name, content } = await request.json();

  if (!name?.trim() || !content?.trim()) {
    return NextResponse.json({ error: "Nome e conteúdo são obrigatórios" }, { status: 400 });
  }

  const template = await prisma.contractTemplate.update({
    where: { id: parseInt(id) },
    data: { name: name.trim(), content: content.trim() },
  });

  return NextResponse.json(template);
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { error } = await requireAuth();
  if (error) return error;

  const { id } = await params;
  await prisma.contractTemplate.delete({ where: { id: parseInt(id) } });

  return NextResponse.json({ ok: true });
}
