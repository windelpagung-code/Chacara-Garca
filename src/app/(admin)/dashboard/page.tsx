"use client";

import { useEffect, useState } from "react";
import Card from "@/components/ui/Card";
import {
  CurrencyDollarIcon,
  DocumentTextIcon,
  ClockIcon,
  CalendarDaysIcon,
  FunnelIcon,
} from "@heroicons/react/24/outline";
import Link from "next/link";

interface Stats {
  totalRevenue: number;
  revenueThisMonth: number;
  totalContracts: number;
  contractsThisMonth: number;
  pendingPayments: number;
  pendingPaymentsInPeriod: number;
  upcomingEvents: number;
}

const MONTHS = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
];

function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);
}

function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  color,
  href,
}: {
  title: string;
  value: string;
  subtitle?: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  href?: string;
}) {
  const content = (
    <Card className="hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-500 font-medium">{title}</p>
          <p className="text-2xl font-bold text-gray-800 mt-1">{value}</p>
          {subtitle && <p className="text-xs text-gray-400 mt-1">{subtitle}</p>}
        </div>
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </Card>
  );

  if (href) return <Link href={href}>{content}</Link>;
  return content;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  const now = new Date();
  const [filterMonth, setFilterMonth] = useState(now.getMonth() + 1);
  const [filterYear, setFilterYear] = useState(now.getFullYear());
  const [filterMode, setFilterMode] = useState<"month" | "custom">("month");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const currentYear = now.getFullYear();
  const yearOptions = Array.from({ length: 5 }, (_, i) => currentYear - 2 + i);

  useEffect(() => {
    setLoading(true);
    let url = "/api/dashboard?";
    if (filterMode === "custom" && fromDate && toDate) {
      url += `from=${fromDate}&to=${toDate}`;
    } else {
      url += `month=${filterMonth}&year=${filterYear}`;
    }
    fetch(url)
      .then((r) => r.json())
      .then(setStats)
      .finally(() => setLoading(false));
  }, [filterMonth, filterYear, filterMode, fromDate, toDate]);

  const periodLabel =
    filterMode === "custom" && fromDate && toDate
      ? `${fromDate.split("-").reverse().join("/")} – ${toDate.split("-").reverse().join("/")}`
      : `${MONTHS[filterMonth - 1]} ${filterYear}`;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
          <p className="text-gray-500 text-sm mt-1">Visão geral do negócio</p>
        </div>

        {/* Financial filter */}
        <Card className="!p-3 w-full sm:w-auto">
          <div className="flex items-center gap-2 mb-2">
            <FunnelIcon className="w-4 h-4 text-emerald-600" />
            <span className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Filtro Financeiro</span>
          </div>
          <div className="flex flex-wrap gap-2 items-end">
            <div className="flex gap-1 bg-gray-100 rounded-lg p-0.5">
              <button
                type="button"
                onClick={() => setFilterMode("month")}
                className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${filterMode === "month" ? "bg-white shadow text-emerald-700" : "text-gray-500 hover:text-gray-700"}`}
              >
                Mês
              </button>
              <button
                type="button"
                onClick={() => setFilterMode("custom")}
                className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${filterMode === "custom" ? "bg-white shadow text-emerald-700" : "text-gray-500 hover:text-gray-700"}`}
              >
                Período
              </button>
            </div>

            {filterMode === "month" ? (
              <>
                <select
                  value={filterMonth}
                  onChange={(e) => setFilterMonth(Number(e.target.value))}
                  className="rounded-lg border border-emerald-200 bg-white px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
                >
                  {MONTHS.map((m, i) => (
                    <option key={i} value={i + 1}>{m}</option>
                  ))}
                </select>
                <select
                  value={filterYear}
                  onChange={(e) => setFilterYear(Number(e.target.value))}
                  className="rounded-lg border border-emerald-200 bg-white px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
                >
                  {yearOptions.map((y) => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>
              </>
            ) : (
              <>
                <input
                  type="date"
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                  className="rounded-lg border border-emerald-200 bg-white px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
                />
                <span className="text-xs text-gray-400">até</span>
                <input
                  type="date"
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                  className="rounded-lg border border-emerald-200 bg-white px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
                />
              </>
            )}
          </div>
        </Card>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <div className="skeleton h-4 w-24 rounded mb-3" />
              <div className="skeleton h-8 w-32 rounded mb-2" />
              <div className="skeleton h-3 w-20 rounded" />
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Faturamento Total"
            value={formatCurrency(stats?.totalRevenue ?? 0)}
            subtitle="Todos os contratos não cancelados"
            icon={CurrencyDollarIcon}
            color="bg-emerald-500"
          />
          <StatCard
            title={`Faturamento — ${periodLabel}`}
            value={formatCurrency(stats?.revenueThisMonth ?? 0)}
            subtitle="Contratos criados no período"
            icon={CurrencyDollarIcon}
            color="bg-blue-500"
          />
          <StatCard
            title={`Contratos — ${periodLabel}`}
            value={String(stats?.contractsThisMonth ?? 0)}
            subtitle={`${stats?.totalContracts ?? 0} ativos no total`}
            icon={DocumentTextIcon}
            color="bg-violet-500"
            href="/contratos"
          />
          <StatCard
            title={`Pagamentos Pendentes — ${periodLabel}`}
            value={String(stats?.pendingPaymentsInPeriod ?? 0)}
            subtitle={`${stats?.pendingPayments ?? 0} pendentes no total · ${stats?.upcomingEvents ?? 0} eventos no período`}
            icon={ClockIcon}
            color="bg-orange-500"
          />
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <h2 className="font-semibold text-gray-700 mb-4">Ações Rápidas</h2>
          <div className="space-y-3">
            <Link
              href="/contratos?new=1"
              className="flex items-center gap-3 p-3 rounded-lg hover:bg-emerald-50 transition-colors border border-emerald-100"
            >
              <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center">
                <DocumentTextIcon className="w-4 h-4 text-emerald-600" />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-700">Novo Contrato</p>
                <p className="text-xs text-gray-400">Criar um novo contrato de aluguel</p>
              </div>
            </Link>
            <Link
              href="/clientes?new=1"
              className="flex items-center gap-3 p-3 rounded-lg hover:bg-emerald-50 transition-colors border border-emerald-100"
            >
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <DocumentTextIcon className="w-4 h-4 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-700">Novo Cliente</p>
                <p className="text-xs text-gray-400">Cadastrar um novo cliente</p>
              </div>
            </Link>
            <Link
              href="/agenda"
              className="flex items-center gap-3 p-3 rounded-lg hover:bg-emerald-50 transition-colors border border-emerald-100"
            >
              <div className="w-8 h-8 bg-violet-100 rounded-lg flex items-center justify-center">
                <CalendarDaysIcon className="w-4 h-4 text-violet-600" />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-700">Ver Agenda</p>
                <p className="text-xs text-gray-400">Consultar calendário de reservas</p>
              </div>
            </Link>
          </div>
        </Card>

        <Card>
          <h2 className="font-semibold text-gray-700 mb-1">Resumo do Período</h2>
          <p className="text-xs text-gray-400 mb-4">{periodLabel}</p>
          <div className="space-y-4">
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-sm text-gray-600">Contratos no Período</span>
              <span className="font-semibold text-gray-800">{stats?.contractsThisMonth ?? 0}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-sm text-gray-600">Faturamento no Período</span>
              <span className="font-semibold text-emerald-600">{formatCurrency(stats?.revenueThisMonth ?? 0)}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-sm text-gray-600">Pagamentos Pendentes no Período</span>
              <span className="font-semibold text-orange-500">{stats?.pendingPaymentsInPeriod ?? 0}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-sm text-gray-600">Eventos no Período</span>
              <span className="font-semibold text-violet-600">{stats?.upcomingEvents ?? 0}</span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-sm text-gray-600">Contratos Ativos (Total)</span>
              <span className="font-semibold text-gray-800">{stats?.totalContracts ?? 0}</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
