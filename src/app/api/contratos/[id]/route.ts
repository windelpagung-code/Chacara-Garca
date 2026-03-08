import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/apiAuth";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { error } = await requireAuth();
  if (error) return error;

  const { id } = await params;
  const contract = await prisma.contract.findUnique({
    where: { id: parseInt(id) },
    include: {
      client: { include: { phones: true } },
      additionalClients: { include: { client: { include: { phones: true } } } },
      dates: { orderBy: { date: "asc" } },
      payments: { orderBy: { dueDate: "asc" } },
    },
  });

  if (!contract) return NextResponse.json({ error: "Contrato não encontrado" }, { status: 404 });
  return NextResponse.json(contract);
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { error } = await requireAuth();
  if (error) return error;

  const { id } = await params;
  const body = await request.json();
  const { status, notes, amountInWords, totalAmount, paymentMethod, template } = body;

  const contract = await prisma.contract.update({
    where: { id: parseInt(id) },
    data: {
      status: status ?? undefined,
      notes: notes ?? undefined,
      amountInWords: amountInWords ?? undefined,
      totalAmount: totalAmount ? parseFloat(totalAmount) : undefined,
      paymentMethod: paymentMethod !== undefined ? (paymentMethod || null) : undefined,
      template: template !== undefined ? (template || null) : undefined,
    },
    include: {
      client: { include: { phones: true } },
      additionalClients: { include: { client: { include: { phones: true } } } },
      dates: true,
      payments: true,
    },
  });

  return NextResponse.json(contract);
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { error } = await requireAuth();
  if (error) return error;

  const { id } = await params;
  await prisma.contract.delete({ where: { id: parseInt(id) } });
  return NextResponse.json({ success: true });
}
