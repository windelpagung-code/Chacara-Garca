"use client";

import { useEffect, useState, useCallback } from "react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, getDay, addMonths, subMonths, isSameDay, isSameMonth } from "date-fns";
import { ptBR } from "date-fns/locale";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline";
import Card from "@/components/ui/Card";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface AgendaDate {
  id: number;
  date: string;
  contract: {
    id: number;
    client: { name: string };
    totalAmount: number;
    status: string;
  };
}

const WEEKDAYS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

const STATUS_COLORS = [
  "bg-emerald-100 text-emerald-700 border-emerald-200",
  "bg-blue-100 text-blue-700 border-blue-200",
  "bg-violet-100 text-violet-700 border-violet-200",
  "bg-orange-100 text-orange-700 border-orange-200",
  "bg-pink-100 text-pink-700 border-pink-200",
];

export default function AgendaPage() {
  const router = useRouter();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [agendaDates, setAgendaDates] = useState<AgendaDate[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);
  const [selectedDayEvents, setSelectedDayEvents] = useState<AgendaDate[]>([]);

  const fetchAgenda = useCallback(async (date: Date) => {
    setLoading(true);
    try {
      const res = await fetch(
        `/api/agenda?year=${date.getFullYear()}&month=${date.getMonth() + 1}`
      );
      const data = await res.json();
      setAgendaDates(data);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAgenda(currentDate);
  }, [currentDate, fetchAgenda]);

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const monthDays = eachDayOfInterval({ start: monthStart, end: monthEnd });
  const startWeekDay = getDay(monthStart);

  const getEventsForDay = (day: Date) =>
    agendaDates.filter((a) => {
      const dateStr = a.date.substring(0, 10);
      return isSameDay(new Date(dateStr + "T12:00:00"), day);
    });

  const handleDayClick = (day: Date) => {
    const events = getEventsForDay(day);
    if (events.length > 0) {
      setSelectedDay(day);
      setSelectedDayEvents(events);
    } else {
      router.push(`/contratos?new=1&date=${format(day, "yyyy-MM-dd")}`);
    }
  };

  const contractColorMap: Record<number, string> = {};
  const uniqueContracts = [...new Set(agendaDates.map((a) => a.contract.id))];
  uniqueContracts.forEach((id, i) => {
    contractColorMap[id] = STATUS_COLORS[i % STATUS_COLORS.length];
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Agenda</h1>
          <p className="text-gray-500 text-sm mt-1">Calendário de reservas</p>
        </div>
        <Link href="/contratos?new=1">
          <Button>Novo Contrato</Button>
        </Link>
      </div>

      <Card padding="none">
        {/* Calendar Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <button
            onClick={() => setCurrentDate(subMonths(currentDate, 1))}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ChevronLeftIcon className="w-5 h-5 text-gray-600" />
          </button>
          <h2 className="text-lg font-semibold text-gray-800 capitalize">
            {format(currentDate, "MMMM yyyy", { locale: ptBR })}
          </h2>
          <button
            onClick={() => setCurrentDate(addMonths(currentDate, 1))}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ChevronRightIcon className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Weekday Headers */}
        <div className="grid grid-cols-7 border-b border-gray-100">
          {WEEKDAYS.map((day) => (
            <div
              key={day}
              className="p-3 text-center text-xs font-semibold text-gray-500"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Grid */}
        {loading ? (
          <div className="p-12 text-center text-gray-400">Carregando...</div>
        ) : (
          <div className="grid grid-cols-7">
            {/* Empty cells for start */}
            {Array.from({ length: startWeekDay }).map((_, i) => (
              <div key={`empty-${i}`} className="min-h-[100px] border-b border-r border-gray-100 bg-gray-50/50" />
            ))}

            {monthDays.map((day) => {
              const events = getEventsForDay(day);
              const isToday = isSameDay(day, new Date());
              const isCurrentMonth = isSameMonth(day, currentDate);

              return (
                <div
                  key={day.toISOString()}
                  onClick={() => handleDayClick(day)}
                  className={`min-h-[100px] border-b border-r border-gray-100 p-2 cursor-pointer transition-colors
                    ${isCurrentMonth ? "bg-white hover:bg-emerald-50" : "bg-gray-50"}
                    ${isToday ? "ring-2 ring-emerald-400 ring-inset" : ""}`}
                >
                  <span
                    className={`inline-flex w-7 h-7 items-center justify-center rounded-full text-sm font-medium
                      ${isToday ? "bg-emerald-500 text-white" : "text-gray-700"}`}
                  >
                    {format(day, "d")}
                  </span>
                  <div className="mt-1 space-y-1">
                    {events.map((event) => (
                      <div
                        key={event.id}
                        className={`text-xs px-2 py-0.5 rounded-full border truncate font-medium
                          ${contractColorMap[event.contract.id]}`}
                        title={event.contract.client.name}
                      >
                        {event.contract.client.name}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>

      {/* Day Detail Modal */}
      <Modal
        isOpen={!!selectedDay}
        onClose={() => setSelectedDay(null)}
        title={selectedDay ? format(selectedDay, "dd 'de' MMMM 'de' yyyy", { locale: ptBR }) : ""}
      >
        <div className="space-y-4">
          {selectedDayEvents.map((event) => (
            <div
              key={event.id}
              className="p-4 rounded-lg border border-emerald-100 bg-emerald-50"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-semibold text-gray-800">{event.contract.client.name}</p>
                  <p className="text-sm text-gray-500 mt-1">
                    Contrato #{event.contract.id}
                  </p>
                  <p className="text-sm text-emerald-600 font-medium mt-1">
                    {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(event.contract.totalAmount)}
                  </p>
                </div>
                <Link href={`/contratos/${event.contract.id}`}>
                  <Button size="sm" variant="outline">Ver Contrato</Button>
                </Link>
              </div>
            </div>
          ))}
          <Link href={`/contratos?new=1&date=${selectedDay ? format(selectedDay, "yyyy-MM-dd") : ""}`}>
            <Button variant="secondary" className="w-full">
              Novo Contrato nesta Data
            </Button>
          </Link>
        </div>
      </Modal>
    </div>
  );
}
