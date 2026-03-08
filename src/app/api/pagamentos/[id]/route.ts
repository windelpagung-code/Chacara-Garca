import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/apiAuth";

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { error } = await requireAuth();
  if (error) return error;

  const { id } = await params;
  const body = await request.json();
  const { status, paidAt } = body;

  const payment = await prisma.payment.update({
    where: { id: parseInt(id) },
    data: {
      status,
      paidAt: paidAt ? new Date(paidAt) : status === "paid" ? new Date() : null,
    },
  });

  return NextResponse.json(payment);
}
