import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/apiAuth";

export async function GET(request: NextRequest) {
  const { error } = await requireAuth();
  if (error) return error;

  const { searchParams } = new URL(request.url);
  const search = searchParams.get("search") ?? "";
  const status = searchParams.get("status") ?? "";
  const page = parseInt(searchParams.get("page") ?? "1");
  const limit = parseInt(searchParams.get("limit") ?? "20");
  const skip = (page - 1) * limit;

  const where: Record<string, unknown> = {};
  if (status) where.status = status;
  if (search) {
    where.client = { name: { contains: search } };
  }

  try {
    const [contracts, total] = await Promise.all([
      prisma.contract.findMany({
        where,
        include: {
          client: { include: { phones: true } },
          additionalClients: { include: { client: { include: { phones: true } } } },
          dates: true,
          payments: true,
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.contract.count({ where }),
    ]);

    return NextResponse.json({ contracts, total, page, limit });
  } catch (err) {
    console.error("Erro ao listar contratos:", err);
    return NextResponse.json(
      { error: "Erro ao buscar contratos: " + (err instanceof Error ? err.message : String(err)) },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const { error } = await requireAuth();
  if (error) return error;

  try {
    const body = await request.json();
    const { clientIds, totalAmount, amountInWords, paymentMethod, notes, template, dates, payments } = body;
    // Support both clientIds array and legacy clientId
    const allClientIds: number[] = Array.isArray(clientIds) && clientIds.length > 0
      ? clientIds.map(Number)
      : [Number(body.clientId)];
    const primaryClientId = allClientIds[0];

    if (!primaryClientId || !totalAmount || !dates?.length) {
      return NextResponse.json({ error: "Dados obrigatórios faltando" }, { status: 400 });
    }

    // Check for date conflicts
    const conflictDates = await prisma.contractDate.findMany({
      where: {
        date: { in: dates.map((d: string) => new Date(d)) },
        contract: { status: { not: "cancelled" } },
      },
    });

    if (conflictDates.length > 0) {
      return NextResponse.json({ error: "Uma ou mais datas já estão reservadas" }, { status: 409 });
    }

    const contract = await prisma.contract.create({
      data: {
        clientId: primaryClientId,
        totalAmount: parseFloat(totalAmount),
        amountInWords: amountInWords || null,
        paymentMethod: paymentMethod || null,
        notes: notes || null,
        template: template || null,
        dates: {
          create: dates.map((d: string) => ({ date: new Date(d) })),
        },
        payments: {
          create: payments?.map((p: { amount: number; dueDate: string; notes?: string }) => ({
            amount: parseFloat(String(p.amount)),
            dueDate: new Date(p.dueDate),
            notes: p.notes || null,
          })) ?? [],
        },
        additionalClients: {
          create: allClientIds.map((cid) => ({ clientId: cid })),
        },
      },
      include: {
        client: { include: { phones: true } },
        additionalClients: { include: { client: { include: { phones: true } } } },
        dates: true,
        payments: true,
      },
    });

    return NextResponse.json(contract, { status: 201 });
  } catch (err) {
    console.error("Erro ao criar contrato:", err);
    return NextResponse.json(
      { error: "Erro ao criar contrato: " + (err instanceof Error ? err.message : String(err)) },
      { status: 500 }
    );
  }
}
