import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/apiAuth";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { error } = await requireAuth();
  if (error) return error;

  const { id } = await params;
  const client = await prisma.client.findUnique({
    where: { id: parseInt(id) },
    include: {
      phones: true,
      contracts: {
        include: { dates: true, payments: true },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (\!client) return NextResponse.json({ error: "Cliente não encontrado" }, { status: 404 });
  return NextResponse.json(client);
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { error } = await requireAuth();
  if (error) return error;

  const { id } = await params;
  const body = await request.json();
  const { type, name, cpf, cnpj, razaoSocial, email, address, notes, phones } = body;

  await prisma.phone.deleteMany({ where: { clientId: parseInt(id) } });

  const client = await prisma.client.update({
    where: { id: parseInt(id) },
    data: {
      type: type || "fisica",
      name,
      cpf: cpf || null,
      cnpj: cnpj || null,
      razaoSocial: razaoSocial || null,
      email: email || null,
      address: address || null,
      notes: notes || null,
      phones: {
        create: phones?.map((p: { number: string; label: string }) => ({
          number: p.number,
          label: p.label || "principal",
        })) ?? [],
      },
    },
    include: { phones: true },
  });

  return NextResponse.json(client);
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { error } = await requireAuth();
  if (error) return error;

  const { id } = await params;
  await prisma.client.delete({ where: { id: parseInt(id) } });
  return NextResponse.json({ success: true });
}
