import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/apiAuth";
import { startOfMonth, endOfMonth } from "date-fns";

export async function GET(request: NextRequest) {
  const { error } = await requireAuth();
  if (error) return error;

  const { searchParams } = request.nextUrl;
  const monthParam = searchParams.get("month");
  const yearParam = searchParams.get("year");
  const fromParam = searchParams.get("from");
  const toParam = searchParams.get("to");

  const now = new Date();

  let periodStart: Date;
  let periodEnd: Date;

  if (fromParam && toParam) {
    periodStart = new Date(fromParam + "T00:00:00");
    periodEnd = new Date(toParam + "T23:59:59");
  } else if (monthParam && yearParam) {
    const month = parseInt(monthParam) - 1;
    const year = parseInt(yearParam);
    const ref = new Date(year, month, 1);
    periodStart = startOfMonth(ref);
    periodEnd = endOfMonth(ref);
  } else {
    periodStart = startOfMonth(now);
    periodEnd = endOfMonth(now);
  }

  const [
    totalContracts,
    contractsThisMonth,
    totalRevenue,
    revenueThisMonth,
    pendingPayments,
    pendingPaymentsInPeriod,
    upcomingDates,
  ] = await Promise.all([
    prisma.contract.count({ where: { status: "active" } }),
    prisma.contract.count({
      where: { status: { not: "cancelled" }, createdAt: { gte: periodStart, lte: periodEnd } },
    }),
    prisma.contract.aggregate({
      _sum: { totalAmount: true },
      where: { status: { not: "cancelled" } },
    }),
    prisma.contract.aggregate({
      _sum: { totalAmount: true },
      where: { status: { not: "cancelled" }, createdAt: { gte: periodStart, lte: periodEnd } },
    }),
    prisma.payment.count({ where: { status: "pending" } }),
    prisma.payment.count({
      where: { status: "pending", dueDate: { gte: periodStart, lte: periodEnd } },
    }),
    prisma.contractDate.count({
      where: { date: { gte: periodStart, lte: periodEnd } },
    }),
  ]);

  return NextResponse.json({
    totalContracts,
    contractsThisMonth,
    totalRevenue: totalRevenue._sum.totalAmount ?? 0,
    revenueThisMonth: revenueThisMonth._sum.totalAmount ?? 0,
    pendingPayments,
    pendingPaymentsInPeriod,
    upcomingEvents: upcomingDates,
    periodStart: periodStart.toISOString(),
    periodEnd: periodEnd.toISOString(),
  });
}
