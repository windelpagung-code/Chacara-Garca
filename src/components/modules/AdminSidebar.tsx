"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import {
  HomeIcon,
  CalendarDaysIcon,
  DocumentTextIcon,
  UsersIcon,
  Cog6ToothIcon,
  UserGroupIcon,
  ArrowRightOnRectangleIcon,
  ClipboardDocumentListIcon,
} from "@heroicons/react/24/outline";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: HomeIcon },
  { href: "/agenda", label: "Agenda", icon: CalendarDaysIcon },
  { href: "/contratos", label: "Contratos", icon: DocumentTextIcon },
  { href: "/modelos", label: "Modelos de Contrato", icon: ClipboardDocumentListIcon },
  { href: "/clientes", label: "Clientes", icon: UsersIcon },
];

const adminItems = [
  { href: "/usuarios", label: "Usuários", icon: UserGroupIcon },
  { href: "/configuracoes", label: "Configurações", icon: Cog6ToothIcon },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const isMaster = (session?.user as { role?: string })?.role === "master";

  return (
    <aside className="w-64 min-h-screen bg-white border-r border-emerald-100 shadow-md flex flex-col">
      <div className="p-6 border-b border-emerald-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center">
            <span className="text-white text-sm font-bold">CG</span>
          </div>
          <div>
            <h1 className="font-bold text-gray-800 text-sm">Chácara Garcia</h1>
            <p className="text-xs text-gray-500">Sistema de Gestão</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${
                active
                  ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-800"
              }`}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              {label}
            </Link>
          );
        })}

        {isMaster && (
          <>
            <div className="pt-4 pb-2">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-3">
                Administração
              </p>
            </div>
            {adminItems.map(({ href, label, icon: Icon }) => {
              const active = pathname === href || pathname.startsWith(href + "/");
              return (
                <Link
                  key={href}
                  href={href}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${
                    active
                      ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-800"
                  }`}
                >
                  <Icon className="w-5 h-5 flex-shrink-0" />
                  {label}
                </Link>
              );
            })}
          </>
        )}
      </nav>

      <div className="p-4 border-t border-emerald-100">
        <div className="flex items-center gap-3 mb-3 px-3">
          <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center">
            <span className="text-emerald-700 text-xs font-bold">
              {session?.user?.name?.[0]?.toUpperCase() ?? "U"}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-800 truncate">
              {session?.user?.name}
            </p>
            <p className="text-xs text-gray-500 capitalize">
              {(session?.user as { role?: string })?.role ?? "attendant"}
            </p>
          </div>
        </div>
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="flex items-center gap-3 w-full px-3 py-2 rounded-lg text-sm text-gray-500 hover:bg-red-50 hover:text-red-600 transition-all duration-150"
        >
          <ArrowRightOnRectangleIcon className="w-5 h-5" />
          Sair
        </button>
      </div>
    </aside>
  );
}
