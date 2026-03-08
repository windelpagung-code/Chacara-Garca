import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireMaster } from "@/lib/apiAuth";
import bcrypt from "bcryptjs";

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { error } = await requireMaster();
  if (error) return error;

  const { id } = await params;
  const body = await request.json();
  const { name, email, password, role } = body;

  const data: Record<string, unknown> = { name, email, role };
  if (password) {
    data.password = await bcrypt.hash(password, 12);
  }

  const user = await prisma.user.update({
    where: { id: parseInt(id) },
    data,
    select: { id: true, name: true, email: true, role: true, createdAt: true },
  });

  return NextResponse.json(user);
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { error } = await requireMaster();
  if (error) return error;

  const { id } = await params;
  await prisma.user.delete({ where: { id: parseInt(id) } });
  return NextResponse.json({ success: true });
}
