"use client";

import { useEffect, useState, useCallback, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Badge from "@/components/ui/Badge";
import Modal from "@/components/ui/Modal";
import Textarea from "@/components/ui/Textarea";
import toast from "react-hot-toast";
import {
  MagnifyingGlassIcon,
  PlusIcon,
  EyeIcon,
  CurrencyDollarIcon,
  PencilIcon,
  PrinterIcon,
  EnvelopeIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import { format, addMonths, subMonths, eachDayOfInterval, startOfMonth, endOfMonth, getDay, isSameDay, isSameMonth } from "date-fns";
import { numberToWords } from "@/lib/numberToWords";
import { ptBR } from "date-fns/locale";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline";
import Link from "next/link";

interface Client {
  id: number;
  name: string;
  cpf?: string | null;
  cnpj?: string | null;
  razaoSocial?: string | null;
  email?: string | null;
  phones: { number: string; label: string }[];
}

interface Template {
  id: number;
  name: string;
  content: string;
}

interface Payment {
  id?: number;
  amount: string;
  dueDate: string;
  notes: string;
}

interface Contract {
  id: number;
  clientId: number;
  client: Client;
  additionalClients: { client: Client }[];
  totalAmount: number;
  amountInWords: string | null;
  paymentMethod: string | null;
  notes: string | null;
  template: string | null;
  status: "active" | "cancelled" | "completed";
  dates: { date: string }[];
  payments: { id: number; amount: number; status: string; dueDate: string; paidAt?: string | null }[];
  createdAt: string;
}

const STATUS_LABELS = { active: "Ativo", cancelled: "Cancelado", completed: "Concluído" };
const STATUS_VARIANTS: Record<string, "success" | "danger" | "info" | "default"> = {
  active: "success",
  cancelled: "danger",
  completed: "info",
};

function formatCurrency(v: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getAllClients(contract: any): any[] {
  const primary = contract.client ? [contract.client] : [];
  const additional = (contract.additionalClients ?? [])
    .map((ac: { client: Client }) => ac.client)
    .filter((c: Client) => c && c.id !== contract.clientId);
  return [...primary, ...additional];
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function substituteVarsSimple(template: string, contract: any): string {
  // Normalize triple+ braces (e.g. {{{var}}} → {{var}})
  template = template.replace(/\{+\{/g, "{{").replace(/\}+\}/g, "}}");
  const allClients = getAllClients(contract);
  const dates = (contract.dates ?? [])
    .map((d: { date: string }) => format(new Date(d.date.substring(0, 10) + "T12:00:00"), "dd/MM/yyyy"))
    .join(", ");
  const nomes = allClients.map((c) => c.name ?? "").filter(Boolean).join(" e ");
  const cpfs = allClients.map((c) => c.cpf ?? "").filter(Boolean).join(" / ");
  const phones = allClients
    .flatMap((c) => (c.phones ?? []).map((p: { number: string; label: string }) =>
      p.label ? `${p.number} (${p.label})` : p.number))
    .join(" / ");
  const dataAtual = format(new Date(), "d 'de' MMMM 'de' yyyy", { locale: ptBR });
  return template
    .replace(/\{\{cliente_nome\}\}/g, nomes)
    .replace(/\{\{cliente_cpf\}\}/g, cpfs)
    .replace(/\{\{cnpj\}\}/g, allClients.map((c) => c.cnpj ?? "").filter(Boolean).join(" / "))
    .replace(/\{\{razao_social\}\}/g, allClients.map((c) => c.razaoSocial ?? "").filter(Boolean).join(" / "))
    .replace(/\{\{cliente_telefones\}\}/g, phones)
    .replace(/\{\{data_evento\}\}/g, dates)
    .replace(/\{\{data_atual\}\}/g, dataAtual)
    .replace(/\{\{valor\}\}/g, formatCurrency(contract.totalAmount))
    .replace(/\{\{valor_extenso\}\}/g, contract.amountInWords || numberToWords(contract.totalAmount))
    .replace(/\{\{forma_pagamento\}\}/g, contract.paymentMethod ?? "")
    .replace(/\{\{observacoes\}\}/g, contract.notes ?? "")
    .replace(/\{\{chacara_nome\}\}/g, "Chácara Garça")
    .replace(/\{\{chacara_endereco\}\}/g, "")
    // Remove any remaining unsubstituted variables
    .replace(/\{\{[^}]*\}\}/g, "");
}

const WEEKDAYS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

function DatePicker({
  selectedDates,
  onChange,
  reservedDates,
}: {
  selectedDates: string[];
  onChange: (dates: string[]) => void;
  reservedDates: string[];
}) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const monthDays = eachDayOfInterval({ start: monthStart, end: monthEnd });
  const startWeekDay = getDay(monthStart);
  const today = new Date();

  const toggle = (day: Date) => {
    const key = format(day, "yyyy-MM-dd");
    if (reservedDates.includes(key)) return;
    if (day < today) return;
    onChange(
      selectedDates.includes(key)
        ? selectedDates.filter((d) => d !== key)
        : [...selectedDates, key]
    );
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <button type="button" onClick={() => setCurrentDate(subMonths(currentDate, 1))} className="p-1 hover:bg-gray-100 rounded">
          <ChevronLeftIcon className="w-4 h-4" />
        </button>
        <span className="text-sm font-semibold text-gray-700 capitalize">
          {format(currentDate, "MMMM yyyy", { locale: ptBR })}
        </span>
        <button type="button" onClick={() => setCurrentDate(addMonths(currentDate, 1))} className="p-1 hover:bg-gray-100 rounded">
          <ChevronRightIcon className="w-4 h-4" />
        </button>
      </div>
      <div className="grid grid-cols-7 gap-0.5">
        {WEEKDAYS.map((d) => (
          <div key={d} className="text-center text-xs font-medium text-gray-400 py-1">{d}</div>
        ))}
        {Array.from({ length: startWeekDay }).map((_, i) => <div key={`e-${i}`} />)}
        {monthDays.map((day) => {
          const key = format(day, "yyyy-MM-dd");
          const isSelected = selectedDates.includes(key);
          const isReserved = reservedDates.includes(key);
          const isPast = day < today && !isSameDay(day, today);
          const isCurrentMonth = isSameMonth(day, currentDate);

          return (
            <button
              key={key}
              type="button"
              onClick={() => toggle(day)}
              disabled={isReserved || isPast}
              className={`h-8 w-full rounded text-xs font-medium transition-colors
                ${isSelected ? "bg-emerald-500 text-white" : ""}
                ${isReserved ? "bg-red-100 text-red-400 cursor-not-allowed" : ""}
                ${isPast ? "text-gray-300 cursor-not-allowed" : ""}
                ${!isSelected && !isReserved && !isPast && isCurrentMonth ? "hover:bg-emerald-50 text-gray-700" : ""}
                ${!isCurrentMonth ? "opacity-30" : ""}`}
            >
              {format(day, "d")}
            </button>
          );
        })}
      </div>
      <div className="flex gap-4 mt-3 text-xs">
        <span className="flex items-center gap-1"><span className="w-3 h-3 bg-emerald-500 rounded-full" /> Selecionada</span>
        <span className="flex items-center gap-1"><span className="w-3 h-3 bg-red-100 rounded-full" /> Reservada</span>
      </div>
    </div>
  );
}

function ContractsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [contracts, setContracts] = useState<Contract[]>([]);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [loading, setLoading] = useState(true);

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);

  const [clients, setClients] = useState<Client[]>([]);
  const [clientSearch, setClientSearch] = useState("");
  const [reservedDates, setReservedDates] = useState<string[]>([]);
  const [templates, setTemplates] = useState<Template[]>([]);

  const [form, setForm] = useState({
    clientIds: [] as number[],
    dates: [] as string[],
    totalAmount: "",
    amountInWords: "",
    paymentMethod: "",
    notes: "",
    template: "",
    payments: [{ amount: "", dueDate: "", notes: "" }] as Payment[],
  });

  // Edit modal state
  const [editingContract, setEditingContract] = useState<Contract | null>(null);
  const [editForm, setEditForm] = useState({ totalAmount: "", amountInWords: "", paymentMethod: "", notes: "", template: "", status: "" });
  const [editSaving, setEditSaving] = useState(false);

  // Contract document view modal
  const [viewContract, setViewContract] = useState<Contract | null>(null);
  const [viewContractHtml, setViewContractHtml] = useState("");
  const [viewContractLoading, setViewContractLoading] = useState(false);

  // Email from list state
  const [emailContract, setEmailContract] = useState<Contract | null>(null);
  const [emailTo, setEmailTo] = useState("");
  const [sendingEmail, setSendingEmail] = useState(false);

  // Delete state
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const fetchContracts = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ search, limit: "50" });
      if (statusFilter) params.set("status", statusFilter);
      const res = await fetch(`/api/contratos?${params}`);
      if (!res.ok) {
        const text = await res.text();
        throw new Error(`Erro ${res.status}: ${text.substring(0, 200)}`);
      }
      const data = await res.json();
      setContracts(data.contracts ?? []);
      setTotal(data.total ?? 0);
    } catch (err) {
      toast.error("Erro ao carregar contratos: " + (err instanceof Error ? err.message : String(err)));
      setContracts([]);
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter]);

  useEffect(() => { fetchContracts(); }, [fetchContracts]);

  useEffect(() => {
    const newParam = searchParams.get("new");
    const dateParam = searchParams.get("date");
    if (newParam === "1") {
      openCreate(dateParam ?? undefined);
      router.replace("/contratos");
    }
  }, [searchParams, router]);

  async function openCreate(initialDate?: string) {
    setStep(1);
    setForm({
      clientIds: [], dates: initialDate ? [initialDate] : [], totalAmount: "", amountInWords: "",
      paymentMethod: "", notes: "", template: "", payments: [{ amount: "", dueDate: "", notes: "" }],
    });
    setClientSearch("");

    const [clientRes, datesRes, templatesRes] = await Promise.all([
      fetch("/api/clientes?limit=100"),
      fetch(`/api/public/disponibilidade?year=${new Date().getFullYear()}&month=${new Date().getMonth() + 1}`),
      fetch("/api/modelos"),
    ]);
    const data = await clientRes.json();
    setClients(data.clients);
    const dData = await datesRes.json();
    setReservedDates(dData.reservedDates ?? []);
    const tData = await templatesRes.json();
    const tArr = Array.isArray(tData) ? tData : [];
    setTemplates(tArr);
    // Auto-select template if there's only one available
    if (tArr.length === 1) {
      setForm((f) => ({ ...f, template: String(tArr[0].id) }));
    }

    setIsCreateOpen(true);
  }

  const filteredClients = clients.filter((c) =>
    c.name.toLowerCase().includes(clientSearch.toLowerCase())
  );

  function addPayment() {
    setForm((f) => ({ ...f, payments: [...f.payments, { amount: "", dueDate: "", notes: "" }] }));
  }

  function removePayment(index: number) {
    setForm((f) => ({ ...f, payments: f.payments.filter((_, i) => i !== index) }));
  }

  function updatePayment(index: number, field: keyof Payment, value: string) {
    setForm((f) => {
      const payments = [...f.payments];
      payments[index] = { ...payments[index], [field]: value };
      return { ...f, payments };
    });
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (form.clientIds.length === 0) { toast.error("Selecione ao menos um cliente"); return; }
    if (form.dates.length === 0) { toast.error("Selecione ao menos uma data"); return; }
    if (!form.totalAmount) { toast.error("Informe o valor total"); return; }

    setSaving(true);
    try {
      const payments = form.payments.filter((p) => p.amount && p.dueDate);
      const res = await fetch("/api/contratos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, clientIds: form.clientIds, payments }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error ?? "Erro ao criar contrato");
      }

      toast.success("Contrato criado com sucesso!");
      setIsCreateOpen(false);
      fetchContracts();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao criar contrato");
    } finally {
      setSaving(false);
    }
  }

  const selectedClients = clients.filter((c) => form.clientIds.includes(c.id));

  function toggleClientSelection(clientId: number) {
    setForm((f) => ({
      ...f,
      clientIds: f.clientIds.includes(clientId)
        ? f.clientIds.filter((id) => id !== clientId)
        : [...f.clientIds, clientId],
    }));
  }

  async function openEdit(contract: Contract) {
    setEditingContract(contract);
    const templateId = parseInt(contract.template ?? "");
    setEditForm({
      totalAmount: String(contract.totalAmount),
      amountInWords: contract.amountInWords ?? "",
      paymentMethod: contract.paymentMethod ?? "",
      notes: contract.notes ?? "",
      template: isNaN(templateId) ? "" : (contract.template ?? ""),
      status: contract.status,
    });
    if (templates.length === 0) {
      const res = await fetch("/api/modelos");
      const data = await res.json();
      setTemplates(Array.isArray(data) ? data : []);
    }
  }

  async function openViewContract(contract: Contract) {
    setViewContractHtml("");
    setViewContractLoading(true);
    setViewContract(contract);
    try {
      // Always fetch full contract to get up-to-date data
      const fullRes = await fetch(`/api/contratos/${contract.id}`);
      if (!fullRes.ok) {
        toast.error("Erro ao carregar contrato (status " + fullRes.status + ")");
        return;
      }
      const full = await fullRes.json();
      // Update viewContract with full data (includes phones, cpf, etc.)
      setViewContract(full);
      const templateId = parseInt(full.template ?? "");
      if (!full.template || isNaN(templateId)) {
        // No template associated — show fallback, no error toast needed
        return;
      }
      const tmplRes = await fetch(`/api/modelos/${templateId}`);
      if (!tmplRes.ok) {
        toast.error("Modelo de contrato não encontrado (ID: " + templateId + ")");
        return;
      }
      const tmpl = await tmplRes.json();
      const html = substituteVarsSimple(tmpl.content, full);
      setViewContractHtml(html || "<p style='color:#888'>(conteúdo do modelo está vazio)</p>");
    } catch (err) {
      toast.error("Erro ao carregar contrato: " + (err instanceof Error ? err.message : String(err)));
    } finally {
      setViewContractLoading(false);
    }
  }

  function printViewContract() {
    if (!viewContract) return;
    const win = window.open("", "_blank");
    if (!win) return;
    const body = viewContractHtml || `
      <h2 style="text-align:center">CONTRATO DE LOCAÇÃO #${viewContract.id}</h2>
      <p><strong>Cliente:</strong> ${viewContract.client.name}</p>
      <p><strong>Data(s) do Evento:</strong> ${viewContract.dates.map(d => {
        const dt = new Date(d.date.substring(0, 10) + "T12:00:00");
        return dt.toLocaleDateString("pt-BR");
      }).join(", ")}</p>
      <p><strong>Valor Total:</strong> ${formatCurrency(viewContract.totalAmount)}</p>
      ${viewContract.amountInWords ? `<p><strong>Valor por Extenso:</strong> ${viewContract.amountInWords}</p>` : ""}
      ${viewContract.paymentMethod ? `<p><strong>Forma de Pagamento:</strong> ${viewContract.paymentMethod}</p>` : ""}
      ${viewContract.notes ? `<p><strong>Observações:</strong> ${viewContract.notes}</p>` : ""}
    `;
    win.document.write(`<!DOCTYPE html><html lang="pt-BR"><head><meta charset="UTF-8"/><title>Contrato #${viewContract.id}</title><style>body{font-family:Arial,sans-serif;font-size:12pt;line-height:1.6;margin:2cm;color:#000;}@media print{body{margin:2cm;}}</style></head><body>${body}</body></html>`);
    win.document.close();
    win.focus();
    win.print();
  }

  async function handleEditSave(e: React.FormEvent) {
    e.preventDefault();
    if (!editingContract) return;
    setEditSaving(true);
    try {
      const words = editForm.amountInWords || numberToWords(parseFloat(editForm.totalAmount));
      const res = await fetch(`/api/contratos/${editingContract.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...editForm, amountInWords: words }),
      });
      if (!res.ok) throw new Error();
      toast.success("Contrato atualizado!");
      setEditingContract(null);
      fetchContracts();
    } catch {
      toast.error("Erro ao atualizar contrato");
    } finally {
      setEditSaving(false);
    }
  }

  async function handleDeleteContract(id: number) {
    if (!confirm("Excluir este contrato? Esta ação não pode ser desfeita.")) return;
    setDeletingId(id);
    try {
      const res = await fetch(`/api/contratos/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      toast.success("Contrato excluído");
      fetchContracts();
    } catch {
      toast.error("Erro ao excluir contrato");
    } finally {
      setDeletingId(null);
    }
  }

  async function handlePrintContract(contract: Contract) {
    if (!contract.template) {
      toast.error("Este contrato não tem modelo associado");
      return;
    }
    const tmplRes = await fetch(`/api/modelos/${contract.template}`);
    if (!tmplRes.ok) { toast.error("Modelo não encontrado"); return; }
    const tmpl = await tmplRes.json();
    // Need full contract with phones - fetch it
    const fullRes = await fetch(`/api/contratos/${contract.id}`);
    const full = await fullRes.json();
    const html = substituteVarsSimple(tmpl.content, full);
    const win = window.open("", "_blank");
    if (!win) return;
    win.document.write(`<!DOCTYPE html><html lang="pt-BR"><head><meta charset="UTF-8"/><title>Contrato #${contract.id}</title><style>body{font-family:Arial,sans-serif;font-size:12pt;line-height:1.6;margin:2cm;color:#000;}@media print{body{margin:2cm;}}</style></head><body>${html}</body></html>`);
    win.document.close();
    win.focus();
    win.print();
  }

  async function openEmailFromList(contract: Contract) {
    if (!contract.template) { toast.error("Este contrato não tem modelo associado"); return; }
    setEmailContract(contract);
    setEmailTo(contract.client.phones.length > 0 ? "" : "");
    // Try to get email from full contract
    const fullRes = await fetch(`/api/contratos/${contract.id}`);
    const full = await fullRes.json();
    setEmailTo(full.client.email ?? "");
    setEmailContract({ ...contract, client: full.client });
  }

  async function handleSendEmailFromList(e: React.FormEvent) {
    e.preventDefault();
    if (!emailContract || !emailTo.trim()) return;
    const tmplRes = await fetch(`/api/modelos/${emailContract.template}`);
    if (!tmplRes.ok) { toast.error("Modelo não encontrado"); return; }
    const tmpl = await tmplRes.json();
    const fullRes = await fetch(`/api/contratos/${emailContract.id}`);
    const full = await fullRes.json();
    setSendingEmail(true);
    try {
      const html = substituteVarsSimple(tmpl.content, full);
      const res = await fetch(`/api/contratos/${emailContract.id}/email`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ to: emailTo, html, clientName: emailContract.client.name, contractId: emailContract.id }),
      });
      if (!res.ok) { const err = await res.json(); throw new Error(err.error); }
      toast.success("Contrato enviado por e-mail!");
      setEmailContract(null);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao enviar e-mail");
    } finally {
      setSendingEmail(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Contratos</h1>
          <p className="text-gray-500 text-sm mt-1">{total} contratos no total</p>
        </div>
        <Button onClick={() => openCreate()}>
          <PlusIcon className="w-4 h-4" />
          Novo Contrato
        </Button>
      </div>

      <Card>
        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          <div className="flex-1">
            <Input
              placeholder="Buscar por cliente..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              icon={<MagnifyingGlassIcon className="w-4 h-4" />}
            />
          </div>
          <select
            className="rounded-lg border border-emerald-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">Todos os status</option>
            <option value="active">Ativo</option>
            <option value="completed">Concluído</option>
            <option value="cancelled">Cancelado</option>
          </select>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => <div key={i} className="skeleton h-16 rounded-lg" />)}
          </div>
        ) : contracts.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <p className="text-lg font-medium">Nenhum contrato encontrado</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left py-3 px-2 font-semibold text-gray-600">#</th>
                  <th className="text-left py-3 px-2 font-semibold text-gray-600">Cliente</th>
                  <th className="text-left py-3 px-2 font-semibold text-gray-600">Datas</th>
                  <th className="text-left py-3 px-2 font-semibold text-gray-600">Valor</th>
                  <th className="text-left py-3 px-2 font-semibold text-gray-600">Status</th>
                  <th className="text-right py-3 px-2 font-semibold text-gray-600">Ações</th>
                </tr>
              </thead>
              <tbody>
                {contracts.map((contract) => (
                  <tr key={contract.id} className="border-b border-gray-50 hover:bg-emerald-50/50 transition-colors">
                    <td className="py-3 px-2 text-gray-400 font-mono text-xs">#{contract.id}</td>
                    <td className="py-3 px-2 font-medium text-gray-800">
                      {[contract.client, ...(contract.additionalClients ?? []).map(ac => ac.client)]
                        .filter((c, i, arr) => c && arr.findIndex(x => x?.id === c.id) === i)
                        .map(c => c.name).join(" / ")}
                    </td>
                    <td className="py-3 px-2 text-gray-500">
                      <div className="flex flex-wrap gap-1">
                        {contract.dates.slice(0, 3).map((d, i) => (
                          <span key={i} className="text-xs bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full border border-emerald-100">
                            {format(new Date(d.date.substring(0, 10) + "T12:00:00"), "dd/MM/yy")}
                          </span>
                        ))}
                        {contract.dates.length > 3 && (
                          <span className="text-xs text-gray-400">+{contract.dates.length - 3}</span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-2 font-semibold text-emerald-700">
                      {formatCurrency(contract.totalAmount)}
                    </td>
                    <td className="py-3 px-2">
                      <Badge variant={STATUS_VARIANTS[contract.status]}>
                        {STATUS_LABELS[contract.status]}
                      </Badge>
                    </td>
                    <td className="py-3 px-2">
                      <div className="flex justify-end gap-0.5">
                        <button
                          className="p-1.5 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                          title="Visualizar contrato"
                          onClick={() => openViewContract(contract)}
                        >
                          <EyeIcon className="w-4 h-4" />
                        </button>
                        <Link href={`/contratos/${contract.id}`}>
                          <button className="p-1.5 text-gray-400 hover:text-green-700 hover:bg-green-50 rounded-lg transition-colors font-bold text-xs" title="Financeiro">
                            $
                          </button>
                        </Link>
                        <button
                          className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Editar"
                          onClick={() => openEdit(contract)}
                        >
                          <PencilIcon className="w-4 h-4" />
                        </button>
                        <button
                          className="p-1.5 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                          title="Imprimir"
                          onClick={() => handlePrintContract(contract)}
                        >
                          <PrinterIcon className="w-4 h-4" />
                        </button>
                        <button
                          className="p-1.5 text-gray-400 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                          title="Enviar por e-mail"
                          onClick={() => openEmailFromList(contract)}
                        >
                          <EnvelopeIcon className="w-4 h-4" />
                        </button>
                        <button
                          className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Excluir"
                          disabled={deletingId === contract.id}
                          onClick={() => handleDeleteContract(contract.id)}
                        >
                          <TrashIcon className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Contract Document View Modal */}
      <Modal isOpen={!!viewContract} onClose={() => setViewContract(null)} title={`Contrato #${viewContract?.id} — ${[viewContract?.client, ...(viewContract?.additionalClients ?? []).map(ac => ac.client)].filter((c, i, arr) => c && arr.findIndex(x => x?.id === c?.id) === i).map(c => c?.name).join(" / ")}`} size="xl">
        <div className="min-h-[400px]">
          {viewContractLoading ? (
            <div className="flex items-center justify-center h-64 text-gray-400">Carregando...</div>
          ) : viewContractHtml ? (
            <div className="space-y-4">
              <div
                className="p-4 border border-gray-100 rounded-lg bg-white text-gray-800 leading-relaxed min-h-[300px] text-sm"
                dangerouslySetInnerHTML={{ __html: viewContractHtml }}
              />
              {viewContract && viewContract.payments.length > 0 && (
                <div>
                  <p className="text-xs text-gray-400 uppercase font-semibold mb-2">Parcelas</p>
                  <div className="rounded-lg border border-gray-100 overflow-hidden">
                    <table className="w-full text-xs">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="text-left px-3 py-2 font-semibold text-gray-500">#</th>
                          <th className="text-left px-3 py-2 font-semibold text-gray-500">Vencimento</th>
                          <th className="text-left px-3 py-2 font-semibold text-gray-500">Valor</th>
                          <th className="text-left px-3 py-2 font-semibold text-gray-500">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {viewContract.payments.map((p, i) => (
                          <tr key={p.id} className="border-t border-gray-50">
                            <td className="px-3 py-2 text-gray-400">{i + 1}ª</td>
                            <td className="px-3 py-2 text-gray-700">{format(new Date(p.dueDate.substring(0, 10) + "T12:00:00"), "dd/MM/yyyy")}</td>
                            <td className="px-3 py-2 font-semibold text-gray-800">{formatCurrency(p.amount)}</td>
                            <td className="px-3 py-2">
                              <span className={`font-medium ${p.status === "paid" ? "text-emerald-600" : p.status === "overdue" ? "text-red-600" : "text-yellow-600"}`}>
                                {p.status === "paid" ? "Pago" : p.status === "overdue" ? "Atrasado" : "Pendente"}
                                {p.paidAt ? ` (${format(new Date(p.paidAt.substring(0, 10) + "T12:00:00"), "dd/MM/yy")})` : ""}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          ) : viewContract ? (
            <div className="p-4 border border-gray-100 rounded-lg bg-white text-sm text-gray-800 space-y-4 min-h-[300px]">
              <div className="text-center border-b border-gray-200 pb-4">
                <h2 className="text-lg font-bold text-gray-700">CONTRATO DE LOCAÇÃO</h2>
                <p className="text-gray-400 text-xs">Contrato #{viewContract.id}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-400 uppercase font-semibold mb-1">Cliente</p>
                  <p className="font-medium">{viewContract.client.name}</p>
                  {viewContract.client.phones.length > 0 && (
                    <p className="text-gray-500 text-xs">{viewContract.client.phones.map(p => p.label ? `${p.number} (${p.label})` : p.number).join(" / ")}</p>
                  )}
                </div>
                <div>
                  <p className="text-xs text-gray-400 uppercase font-semibold mb-1">Status</p>
                  <p className="font-medium">{STATUS_LABELS[viewContract.status]}</p>
                </div>
              </div>
              <div>
                <p className="text-xs text-gray-400 uppercase font-semibold mb-1">Data(s) do Evento</p>
                <p className="font-medium">{viewContract.dates.map(d => format(new Date(d.date.substring(0, 10) + "T12:00:00"), "dd/MM/yyyy")).join(", ")}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-400 uppercase font-semibold mb-1">Valor Total</p>
                  <p className="font-semibold text-emerald-700">{formatCurrency(viewContract.totalAmount)}</p>
                </div>
                {viewContract.paymentMethod && (
                  <div>
                    <p className="text-xs text-gray-400 uppercase font-semibold mb-1">Forma de Pagamento</p>
                    <p className="font-medium">{viewContract.paymentMethod}</p>
                  </div>
                )}
              </div>
              {viewContract.amountInWords && (
                <div>
                  <p className="text-xs text-gray-400 uppercase font-semibold mb-1">Valor por Extenso</p>
                  <p className="italic text-gray-600">{viewContract.amountInWords}</p>
                </div>
              )}
              {viewContract.notes && (
                <div>
                  <p className="text-xs text-gray-400 uppercase font-semibold mb-1">Observações</p>
                  <p className="text-gray-600 whitespace-pre-wrap">{viewContract.notes}</p>
                </div>
              )}
              {viewContract.payments.length > 0 && (
                <div>
                  <p className="text-xs text-gray-400 uppercase font-semibold mb-2">Parcelas</p>
                  <div className="rounded-lg border border-gray-100 overflow-hidden">
                    <table className="w-full text-xs">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="text-left px-3 py-2 font-semibold text-gray-500">#</th>
                          <th className="text-left px-3 py-2 font-semibold text-gray-500">Vencimento</th>
                          <th className="text-left px-3 py-2 font-semibold text-gray-500">Valor</th>
                          <th className="text-left px-3 py-2 font-semibold text-gray-500">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {viewContract.payments.map((p, i) => (
                          <tr key={p.id} className="border-t border-gray-50">
                            <td className="px-3 py-2 text-gray-400">{i + 1}ª</td>
                            <td className="px-3 py-2 text-gray-700">{format(new Date(p.dueDate.substring(0, 10) + "T12:00:00"), "dd/MM/yyyy")}</td>
                            <td className="px-3 py-2 font-semibold text-gray-800">{formatCurrency(p.amount)}</td>
                            <td className="px-3 py-2">
                              <span className={`font-medium ${p.status === "paid" ? "text-emerald-600" : p.status === "overdue" ? "text-red-600" : "text-yellow-600"}`}>
                                {p.status === "paid" ? "Pago" : p.status === "overdue" ? "Atrasado" : "Pendente"}
                                {p.paidAt ? ` (${format(new Date(p.paidAt.substring(0, 10) + "T12:00:00"), "dd/MM/yy")})` : ""}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
              <div className="pt-2 border-t border-gray-100 text-center space-y-2">
                <p className="text-xs text-gray-400">Nenhum modelo de contrato associado.</p>
                <button
                  type="button"
                  className="text-xs text-emerald-600 hover:text-emerald-700 underline"
                  onClick={() => {
                    const c = viewContract;
                    setViewContract(null);
                    if (c) openEdit(c);
                  }}
                >
                  Clique aqui para editar e adicionar um modelo
                </button>
              </div>
            </div>
          ) : null}
        </div>
        <div className="flex gap-3 mt-4 pt-4 border-t border-gray-100">
          <Button
            type="button"
            variant="secondary"
            className="flex-1"
            onClick={printViewContract}
            disabled={viewContractLoading}
          >
            <PrinterIcon className="w-4 h-4" />
            Imprimir
          </Button>
          <Button
            type="button"
            className="flex-1"
            onClick={() => {
              if (viewContract) {
                setViewContract(null);
                openEmailFromList(viewContract);
              }
            }}
            disabled={viewContractLoading}
          >
            <EnvelopeIcon className="w-4 h-4" />
            Enviar por E-mail
          </Button>
        </div>
      </Modal>

      {/* Create Contract Modal */}
      <Modal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} title="Novo Contrato" size="xl">
        <div className="mb-6">
          <div className="flex gap-2">
            {[1, 2, 3].map((s) => (
              <div key={s} className={`flex items-center gap-2 ${s < 3 ? "flex-1" : ""}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold
                  ${step >= s ? "bg-emerald-500 text-white" : "bg-gray-200 text-gray-500"}`}>
                  {s}
                </div>
                <span className={`text-sm ${step === s ? "font-semibold text-gray-800" : "text-gray-400"}`}>
                  {s === 1 ? "Cliente e Datas" : s === 2 ? "Valores" : "Finalizar"}
                </span>
                {s < 3 && <div className={`flex-1 h-0.5 ${step > s ? "bg-emerald-500" : "bg-gray-200"}`} />}
              </div>
            ))}
          </div>
        </div>

        <form onSubmit={handleCreate}>
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-semibold text-gray-700 block mb-1">
                  Selecionar Cliente(s) *
                  <span className="text-xs text-gray-400 font-normal ml-2">Clique para adicionar/remover</span>
                </label>
                <Input
                  placeholder="Buscar cliente..."
                  value={clientSearch}
                  onChange={(e) => setClientSearch(e.target.value)}
                  icon={<MagnifyingGlassIcon className="w-4 h-4" />}
                />
                <div className="mt-2 max-h-36 overflow-y-auto rounded-lg border border-emerald-100">
                  {filteredClients.map((client) => {
                    const selected = form.clientIds.includes(client.id);
                    return (
                      <button
                        key={client.id}
                        type="button"
                        onClick={() => toggleClientSelection(client.id)}
                        className={`w-full text-left px-3 py-2.5 text-sm hover:bg-emerald-50 transition-colors border-b border-gray-50 last:border-0
                          ${selected ? "bg-emerald-50 text-emerald-700 font-semibold" : "text-gray-700"}`}
                      >
                        <span className="mr-2">{selected ? "✓" : "○"}</span>
                        {client.name}
                        {client.phones[0] && (
                          <span className="text-xs text-gray-400 ml-2">{client.phones[0].number}</span>
                        )}
                      </button>
                    );
                  })}
                </div>
                {selectedClients.length > 0 && (
                  <div className="mt-1 bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2 space-y-1">
                    {selectedClients.map((c) => (
                      <div key={c.id} className="flex items-center justify-between">
                        <span className="text-xs text-emerald-700 font-medium">✓ {c.name}</span>
                        <button
                          type="button"
                          onClick={() => toggleClientSelection(c.id)}
                          className="text-red-500 hover:text-red-700 font-bold text-sm ml-2 leading-none"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <label className="text-sm font-semibold text-gray-700 block mb-2">Selecionar Datas *</label>
                <DatePicker
                  selectedDates={form.dates}
                  onChange={(dates) => setForm((f) => ({ ...f, dates }))}
                  reservedDates={reservedDates}
                />
                {form.dates.length > 0 && (
                  <p className="text-xs text-emerald-600 mt-2 font-medium">
                    {form.dates.length} data(s) selecionada(s)
                  </p>
                )}
              </div>

              <div className="flex gap-3">
                <Button type="button" variant="secondary" className="flex-1" onClick={() => setIsCreateOpen(false)}>
                  Cancelar
                </Button>
                <Button
                  type="button"
                  className="flex-1"
                  onClick={() => {
                    if (form.clientIds.length === 0) { toast.error("Selecione ao menos um cliente"); return; }
                    if (form.dates.length === 0) { toast.error("Selecione ao menos uma data"); return; }
                    setStep(2);
                  }}
                >
                  Próximo
                </Button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Valor Total (R$) *"
                  type="number"
                  step="0.01"
                  value={form.totalAmount}
                  onChange={(e) => {
                    const val = e.target.value;
                    const words = val ? numberToWords(parseFloat(val)) : "";
                    setForm((f) => ({ ...f, totalAmount: val, amountInWords: words }));
                  }}
                  placeholder="0,00"
                  icon={<CurrencyDollarIcon className="w-4 h-4" />}
                />
                <div>
                  <Input
                    label="Valor por Extenso"
                    value={form.amountInWords}
                    onChange={(e) => setForm((f) => ({ ...f, amountInWords: e.target.value }))}
                    placeholder="Gerado automaticamente"
                  />
                  <p className="text-xs text-gray-400 mt-0.5">Gerado automaticamente — pode editar</p>
                </div>
              </div>

              <div>
                <label className="text-sm font-semibold text-gray-700 block mb-1">Forma de Pagamento</label>
                <select
                  className="w-full rounded-lg border border-emerald-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
                  value={form.paymentMethod}
                  onChange={(e) => setForm((f) => ({ ...f, paymentMethod: e.target.value }))}
                >
                  <option value="">— Selecione —</option>
                  <option value="Pix">Pix</option>
                  <option value="Dinheiro">Dinheiro</option>
                  <option value="Transferência Bancária">Transferência Bancária</option>
                  <option value="Cartão de Crédito">Cartão de Crédito</option>
                  <option value="Cartão de Débito">Cartão de Débito</option>
                  <option value="Boleto Bancário">Boleto Bancário</option>
                  <option value="Cheque">Cheque</option>
                </select>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-semibold text-gray-700">Parcelas</label>
                  <button type="button" onClick={addPayment} className="text-xs text-emerald-600 hover:text-emerald-700 font-medium">
                    + Adicionar Parcela
                  </button>
                </div>
                <div className="space-y-2">
                  {form.payments.map((payment, index) => (
                    <div key={index} className="flex gap-2 items-start">
                      <div className="flex-1">
                        <input
                          type="number"
                          className="w-full rounded-lg border border-emerald-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
                          placeholder="Valor (R$)"
                          value={payment.amount}
                          onChange={(e) => updatePayment(index, "amount", e.target.value)}
                        />
                      </div>
                      <div className="flex-1">
                        <input
                          type="date"
                          className="w-full rounded-lg border border-emerald-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
                          value={payment.dueDate}
                          onChange={(e) => updatePayment(index, "dueDate", e.target.value)}
                        />
                      </div>
                      {form.payments.length > 1 && (
                        <button type="button" onClick={() => removePayment(index)} className="px-2 text-red-400 hover:text-red-600 mt-2">
                          ✕
                        </button>
                      )}
                    </div>
                  ))}
                </div>

                {/* Remaining amount calculator */}
                {(() => {
                  const total = parseFloat(form.totalAmount) || 0;
                  const allocated = form.payments.reduce((sum, p) => sum + (parseFloat(p.amount) || 0), 0);
                  const remaining = total - allocated;
                  if (total === 0) return null;
                  return (
                    <div className="mt-3 flex gap-3">
                      <div className="flex-1 bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2">
                        <p className="text-xs text-emerald-600 font-medium">Valor total</p>
                        <p className="text-sm font-bold text-emerald-700">{formatCurrency(total)}</p>
                      </div>
                      <div className="flex-1 bg-blue-50 border border-blue-200 rounded-lg px-3 py-2">
                        <p className="text-xs text-blue-600 font-medium">Parcelado</p>
                        <p className="text-sm font-bold text-blue-700">{formatCurrency(allocated)}</p>
                      </div>
                      <div className={`flex-1 rounded-lg px-3 py-2 border ${remaining < 0 ? "bg-red-50 border-red-300" : remaining === 0 ? "bg-gray-50 border-gray-200" : "bg-orange-50 border-orange-200"}`}>
                        <p className={`text-xs font-medium ${remaining < 0 ? "text-red-600" : remaining === 0 ? "text-gray-500" : "text-orange-600"}`}>
                          {remaining < 0 ? "Excesso" : remaining === 0 ? "Quitado ✓" : "Falta parcelar"}
                        </p>
                        <p className={`text-sm font-bold ${remaining < 0 ? "text-red-700" : remaining === 0 ? "text-gray-600" : "text-orange-700"}`}>
                          {formatCurrency(Math.abs(remaining))}
                        </p>
                      </div>
                    </div>
                  );
                })()}
              </div>

              <div className="flex gap-3">
                <Button type="button" variant="secondary" className="flex-1" onClick={() => setStep(1)}>
                  Voltar
                </Button>
                <Button
                  type="button"
                  className="flex-1"
                  onClick={() => {
                    if (!form.totalAmount) { toast.error("Informe o valor total"); return; }
                    setStep(3);
                  }}
                >
                  Próximo
                </Button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <div className="bg-emerald-50 rounded-lg p-4 border border-emerald-100 space-y-2">
                <h3 className="font-semibold text-gray-700">Resumo do Contrato</h3>
                <div className="text-sm space-y-1">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Cliente(s):</span>
                    <span className="font-medium text-right">{selectedClients.map(c => c.name).join(", ")}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Datas:</span>
                    <span className="font-medium">{form.dates.length} dia(s)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Valor Total:</span>
                    <span className="font-semibold text-emerald-600">
                      {form.totalAmount ? formatCurrency(parseFloat(form.totalAmount)) : "—"}
                    </span>
                  </div>
                </div>
              </div>

              <Textarea
                label="Observações"
                value={form.notes}
                onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                placeholder="Condições especiais, itens inclusos, etc."
                rows={4}
              />

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-sm font-semibold text-gray-700">Modelo de Contrato</label>
                  <a href="/modelos" target="_blank" className="text-xs text-emerald-600 hover:underline">
                    Gerenciar modelos →
                  </a>
                </div>
                {templates.length === 0 ? (
                  <div className="text-sm text-gray-400 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2">
                    Nenhum modelo cadastrado.{" "}
                    <a href="/modelos" target="_blank" className="text-emerald-600 hover:underline">
                      Criar modelo
                    </a>
                  </div>
                ) : (
                  <select
                    className="w-full rounded-lg border border-emerald-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
                    value={form.template}
                    onChange={(e) => setForm((f) => ({ ...f, template: e.target.value }))}
                  >
                    <option value="">— Sem modelo —</option>
                    {templates.map((t) => (
                      <option key={t.id} value={String(t.id)}>{t.name}</option>
                    ))}
                  </select>
                )}
              </div>

              <div className="flex gap-3">
                <Button type="button" variant="secondary" className="flex-1" onClick={() => setStep(2)}>
                  Voltar
                </Button>
                <Button type="submit" loading={saving} className="flex-1">
                  Criar Contrato
                </Button>
              </div>
            </div>
          )}
        </form>
      </Modal>

      {/* Edit Contract Modal */}
      <Modal isOpen={!!editingContract} onClose={() => setEditingContract(null)} title={`Editar Contrato #${editingContract?.id}`} size="lg">
        <form onSubmit={handleEditSave} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Input
                label="Valor Total (R$) *"
                type="number"
                step="0.01"
                value={editForm.totalAmount}
                onChange={(e) => {
                  const val = e.target.value;
                  const words = val ? numberToWords(parseFloat(val)) : "";
                  setEditForm((f) => ({ ...f, totalAmount: val, amountInWords: words }));
                }}
              />
            </div>
            <div>
              <Input
                label="Valor por Extenso"
                value={editForm.amountInWords}
                onChange={(e) => setEditForm((f) => ({ ...f, amountInWords: e.target.value }))}
              />
            </div>
          </div>
          <div>
            <label className="text-sm font-semibold text-gray-700 block mb-1">Forma de Pagamento</label>
            <select
              className="w-full rounded-lg border border-emerald-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
              value={editForm.paymentMethod}
              onChange={(e) => setEditForm((f) => ({ ...f, paymentMethod: e.target.value }))}
            >
              <option value="">— Selecione —</option>
              <option value="Pix">Pix</option>
              <option value="Dinheiro">Dinheiro</option>
              <option value="Transferência Bancária">Transferência Bancária</option>
              <option value="Cartão de Crédito">Cartão de Crédito</option>
              <option value="Cartão de Débito">Cartão de Débito</option>
              <option value="Boleto Bancário">Boleto Bancário</option>
              <option value="Cheque">Cheque</option>
            </select>
          </div>
          <div>
            <label className="text-sm font-semibold text-gray-700 block mb-1">Status</label>
            <select
              className="w-full rounded-lg border border-emerald-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
              value={editForm.status}
              onChange={(e) => setEditForm((f) => ({ ...f, status: e.target.value }))}
            >
              <option value="active">Ativo</option>
              <option value="completed">Concluído</option>
              <option value="cancelled">Cancelado</option>
            </select>
          </div>
          <div>
            <label className="text-sm font-semibold text-gray-700 block mb-1">Modelo de Contrato</label>
            <select
              className="w-full rounded-lg border border-emerald-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
              value={editForm.template}
              onChange={(e) => setEditForm((f) => ({ ...f, template: e.target.value }))}
            >
              <option value="">— Sem modelo —</option>
              {templates.map((t) => (
                <option key={t.id} value={String(t.id)}>{t.name}</option>
              ))}
            </select>
          </div>
          <Textarea
            label="Observações"
            value={editForm.notes}
            onChange={(e) => setEditForm((f) => ({ ...f, notes: e.target.value }))}
            rows={3}
          />
          <div className="flex gap-3">
            <Button type="button" variant="secondary" className="flex-1" onClick={() => setEditingContract(null)}>Cancelar</Button>
            <Button type="submit" loading={editSaving} className="flex-1">Salvar Alterações</Button>
          </div>
        </form>
      </Modal>

      {/* Email from list Modal */}
      <Modal isOpen={!!emailContract} onClose={() => setEmailContract(null)} title="Enviar Contrato por E-mail" size="sm">
        <form onSubmit={handleSendEmailFromList} className="space-y-4">
          <Input
            label="Destinatário *"
            type="email"
            value={emailTo}
            onChange={(e) => setEmailTo(e.target.value)}
            placeholder="email@exemplo.com"
            required
          />
          <p className="text-xs text-gray-500">O texto completo do contrato será enviado para este endereço.</p>
          <div className="flex gap-3">
            <Button type="button" variant="secondary" className="flex-1" onClick={() => setEmailContract(null)}>Cancelar</Button>
            <Button type="submit" loading={sendingEmail} className="flex-1">
              <EnvelopeIcon className="w-4 h-4" />
              Enviar
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

export default function ContratosPage() {
  return (
    <Suspense>
      <ContractsContent />
    </Suspense>
  );
}
