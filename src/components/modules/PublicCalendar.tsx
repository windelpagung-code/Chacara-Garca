"use client";

import { useEffect, useState, useCallback } from "react";
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  getDay,
  addMonths,
  subMonths,
  isSameDay,
  isBefore,
  startOfDay,
} from "date-fns";
import { ptBR } from "date-fns/locale";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline";

const WEEKDAYS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

interface CalendarData {
  reservedDates: string[];
  whatsappNumber: string;
}

interface DayPopup {
  date: Date;
  available: boolean;
}

export default function PublicCalendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [calendarData, setCalendarData] = useState<CalendarData>({ reservedDates: [], whatsappNumber: "" });
  const [loading, setLoading] = useState(true);
  const [popup, setPopup] = useState<DayPopup | null>(null);

  const fetchData = useCallback(async (date: Date) => {
    setLoading(true);
    try {
      const res = await fetch(
        `/api/public/disponibilidade?year=${date.getFullYear()}&month=${date.getMonth() + 1}`
      );
      const data = await res.json();
      setCalendarData(data);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData(currentDate);
  }, [currentDate, fetchData]);

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const monthDays = eachDayOfInterval({ start: monthStart, end: monthEnd });
  const startWeekDay = getDay(monthStart);
  const today = startOfDay(new Date());

  const isReserved = (day: Date) => {
    const key = format(day, "yyyy-MM-dd");
    return calendarData.reservedDates.includes(key);
  };

  const isPast = (day: Date) => isBefore(startOfDay(day), today);

  const handleDayClick = (day: Date) => {
    if (isPast(day)) return;
    setPopup({ date: day, available: !isReserved(day) });
  };

  const whatsappLink = `https://wa.me/${calendarData.whatsappNumber}?text=${encodeURIComponent(
    `Olá! Gostaria de verificar a disponibilidade para o dia ${popup ? format(popup.date, "dd 'de' MMMM 'de' yyyy", { locale: ptBR }) : ""}.`
  )}`;

  return (
    <div className="relative">
      <div className="bg-white rounded-2xl shadow-lg border border-emerald-100 overflow-hidden">
        {/* Header */}
        <div className="bg-emerald-500 p-4 flex items-center justify-between">
          <button
            onClick={() => setCurrentDate(subMonths(currentDate, 1))}
            className="p-2 hover:bg-emerald-400 rounded-lg transition-colors text-white"
          >
            <ChevronLeftIcon className="w-5 h-5" />
          </button>
          <h3 className="text-white font-bold text-lg capitalize">
            {format(currentDate, "MMMM yyyy", { locale: ptBR })}
          </h3>
          <button
            onClick={() => setCurrentDate(addMonths(currentDate, 1))}
            className="p-2 hover:bg-emerald-400 rounded-lg transition-colors text-white"
          >
            <ChevronRightIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Weekdays */}
        <div className="grid grid-cols-7 bg-emerald-50 border-b border-emerald-100">
          {WEEKDAYS.map((d) => (
            <div key={d} className="py-2 text-center text-xs font-semibold text-emerald-600">
              {d}
            </div>
          ))}
        </div>

        {/* Days */}
        {loading ? (
          <div className="grid grid-cols-7 gap-1 p-3">
            {Array.from({ length: 35 }).map((_, i) => (
              <div key={i} className="skeleton h-9 rounded-lg" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-7 p-2 gap-1">
            {Array.from({ length: startWeekDay }).map((_, i) => <div key={`e-${i}`} />)}
            {monthDays.map((day) => {
              const past = isPast(day);
              const reserved = isReserved(day);
              const isToday = isSameDay(day, today);

              let bgClass = "bg-emerald-100 text-emerald-800 hover:bg-emerald-200 cursor-pointer";
              if (past) bgClass = "bg-gray-100 text-gray-400 cursor-default";
              else if (reserved) bgClass = "bg-red-100 text-red-600 cursor-pointer";

              return (
                <button
                  key={format(day, "yyyy-MM-dd")}
                  onClick={() => handleDayClick(day)}
                  className={`h-10 w-full rounded-lg text-sm font-medium transition-all duration-150
                    ${bgClass}
                    ${isToday ? "ring-2 ring-emerald-500 ring-offset-1" : ""}`}
                >
                  {format(day, "d")}
                </button>
              );
            })}
          </div>
        )}

        {/* Legend */}
        <div className="px-4 pb-4 flex gap-4 justify-center text-xs">
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-emerald-100" /> Disponível
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-red-100" /> Reservado
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-gray-100" /> Passado
          </span>
        </div>
      </div>

      {/* Popup */}
      {popup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40" onClick={() => setPopup(null)} />
          <div className="relative bg-white rounded-2xl shadow-2xl p-6 max-w-sm w-full">
            <button
              onClick={() => setPopup(null)}
              className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 text-xl leading-none"
            >
              ✕
            </button>
            <div className="text-center">
              <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${popup.available ? "bg-emerald-100" : "bg-red-100"}`}>
                <span className="text-3xl">{popup.available ? "✓" : "✕"}</span>
              </div>
              <p className="text-sm text-gray-500 mb-1">
                {format(popup.date, "EEEE, dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
              </p>
              {popup.available ? (
                <>
                  <p className="text-lg font-bold text-emerald-700 mb-4">
                    Ótima escolha! Esta data está disponível.
                  </p>
                  <a
                    href={whatsappLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 bg-green-500 text-white px-6 py-3 rounded-xl font-bold hover:bg-green-600 transition-colors w-full justify-center"
                  >
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
                      <path d="M12 0C5.373 0 0 5.373 0 12c0 2.126.558 4.116 1.524 5.85L.057 23.869l6.168-1.438A11.945 11.945 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.948 0-3.77-.534-5.327-1.459l-.38-.225-3.965.924.993-3.875-.245-.393A9.942 9.942 0 012 12c0-5.514 4.486-10 10-10s10 4.486 10 10-4.486 10-10 10z" />
                    </svg>
                    Reservar via WhatsApp
                  </a>
                </>
              ) : (
                <p className="text-lg font-bold text-red-600">
                  Esta data já está reservada. Por favor, selecione outra data.
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
