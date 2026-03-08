import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/apiAuth";

export async function GET(request: NextRequest) {
  const { error } = await requireAuth();
  if (error) return error;

  const { searchParams } = new URL(request.url);
  const search = searchParams.get("search") ?? "";
  const page = parseInt(searchParams.get("page") ?? "1");
  const limit = parseInt(searchParams.get("limit") ?? "20");
  const skip = (page - 1) * limit;

  const where = search
    ? {
        OR: [
          { name: { contains: search } },
          { email: { contains: search } },
          { cpf: { contains: search } },
        ],
      }
    : {};

  const [clients, total] = await Promise.all([
    prisma.client.findMany({
      where,
      include: { phones: true },
      orderBy: { name: "asc" },
      skip,
      take: limit,
    }),
    prisma.client.count({ where }),
  ]);

  return NextResponse.json({ clients, total, page, limit });
}

export async function POST(request: NextRequest) {
  const { error } = await requireAuth();
  if (error) return error;

  const body = await request.json();
  const { type, name, cpf, cnpj, razaoSocial, email, address, notes, phones } = body;

  if (!name) {
    return NextResponse.json({ error: "Nome é obrigatório" }, { status: 400 });
  }

  const client = await prisma.client.create({
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

  return NextResponse.json(client, { status: 201 });
}
