"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import Modal from "@/components/ui/Modal";
import Input from "@/components/ui/Input";
import toast from "react-hot-toast";
import { format } from "date-fns";
import { numberToWords } from "@/lib/numberToWords";
import { ptBR } from "date-fns/locale";
import {
  ArrowLeftIcon,
  PhoneIcon,
  CalendarDaysIcon,
  CurrencyDollarIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  PrinterIcon,
  DocumentArrowDownIcon,
  EnvelopeIcon,
  DocumentTextIcon,
} from "@heroicons/react/24/outline";
import Link from "next/link";

interface Payment {
  id: number;
  amount: number;
  dueDate: string;
  paidAt: string | null;
  status: "pending" | "paid" | "overdue";
  notes: string | null;
}

interface ContractClientInfo {
  id: number;
  name: string;
  type?: string;
  cpf: string | null;
  cnpj?: string | null;
  razaoSocial?: string | null;
  email: string | null;
  address: string | null;
  phones: { number: string; label: string }[];
}

interface Contract {
  id: number;
  clientId: number;
  client: ContractClientInfo;
  additionalClients: { client: ContractClientInfo }[];
  totalAmount: number;
  amountInWords: string | null;
  paymentMethod: string | null;
  status: "active" | "cancelled" | "completed";
  notes: string | null;
  template: string | null;
  dates: { id: number; date: string }[];
  payments: Payment[];
  createdAt: string;
}

function formatCurrency(v: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v);
}

const STATUS_LABELS = { active: "Ativo", cancelled: "Cancelado", completed: "Concluído" };
const STATUS_VARIANTS: Record<string, "success" | "danger" | "info"> = {
  active: "success",
  cancelled: "danger",
  completed: "info",
};

const PAY_STATUS_LABELS = { pending: "Pendente", paid: "Pago", overdue: "Atrasado" };
const PAY_STATUS_ICONS = {
  pending: <ClockIcon className="w-4 h-4 text-yellow-500" />,
  paid: <CheckCircleIcon className="w-4 h-4 text-emerald-500" />,
  overdue: <XCircleIcon className="w-4 h-4 text-red-500" />,
};

function substituteVars(template: string, contract: Contract): string {
  // Normalize triple+ braces (e.g. {{{var}}} → {{var}})
  template = template.replace(/\{+\{/g, "{{").replace(/\}+\}/g, "}}");
  const allClients = [
    contract.client,
    ...(contract.additionalClients ?? [])
      .map((ac) => ac.client)
      .filter((c) => c && c.id !== contract.clientId),
  ];

  const dates = contract.dates
    .map((d) => format(new Date(d.date.substring(0, 10) + "T12:00:00"), "dd/MM/yyyy"))
    .join(", ");

  const nomes = allClients.map((c) => c.name ?? "").filter(Boolean).join(" e ");
  const cpfs = allClients.map((c) => c.cpf ?? "").filter(Boolean).join(" / ");
  const phones = allClients
    .flatMap((c) => c.phones.map((p) => p.label ? `${p.number} (${p.label})` : p.number))
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

export default function ContratoDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [contract, setContract] = useState<Contract | null>(null);
  const [loading, setLoading] = useState(true);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [updatingPayment, setUpdatingPayment] = useState<number | null>(null);
  const [templateContent, setTemplateContent] = useState<string | null>(null);
  const [showContract, setShowContract] = useState(false);
  const [emailModalOpen, setEmailModalOpen] = useState(false);
  const [emailTo, setEmailTo] = useState("");
  const [sendingEmail, setSendingEmail] = useState(false);

  useEffect(() => {
    fetch(`/api/contratos/${id}`)
      .then((r) => r.json())
      .then((data: Contract) => {
        setContract(data);
        if (data.client.email) setEmailTo(data.client.email);
        // Load template content if template ID is set
        if (data.template) {
          fetch(`/api/modelos/${data.template}`)
            .then((r) => r.ok ? r.json() : null)
            .then((tmpl) => {
              if (tmpl?.content) setTemplateContent(tmpl.content);
            })
            .catch(() => {});
        }
      })
      .finally(() => setLoading(false));
  }, [id]);

  async function updateContractStatus(status: string) {
    setUpdatingStatus(true);
    try {
      const res = await fetch(`/api/contratos/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error();
      const updated = await res.json();
      setContract(updated);
      toast.success("Status atualizado!");
    } catch {
      toast.error("Erro ao atualizar status");
    } finally {
      setUpdatingStatus(false);
    }
  }

  async function markPayment(paymentId: number, status: "paid" | "pending") {
    setUpdatingPayment(paymentId);
    try {
      const res = await fetch(`/api/pagamentos/${paymentId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error();
      toast.success(status === "paid" ? "Pagamento confirmado!" : "Pagamento revertido");
      const updated = await fetch(`/api/contratos/${id}`).then((r) => r.json());
      setContract(updated);
    } catch {
      toast.error("Erro ao atualizar pagamento");
    } finally {
      setUpdatingPayment(null);
    }
  }

  async function handleDelete() {
    if (!confirm("Excluir este contrato? Esta ação não pode ser desfeita.")) return;
    const res = await fetch(`/api/contratos/${id}`, { method: "DELETE" });
    if (res.ok) {
      toast.success("Contrato excluído");
      router.push("/contratos");
    } else {
      toast.error("Erro ao excluir");
    }
  }

  function handlePrint() {
    if (!contract || !templateContent) return;
    const html = substituteVars(templateContent, contract);
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;
    printWindow.document.write(`
      <!DOCTYPE html>
      <html lang="pt-BR">
      <head>
        <meta charset="UTF-8" />
        <title>Contrato #${contract.id} - ${contract.client.name}</title>
        <style>
          body { font-family: Arial, sans-serif; font-size: 12pt; line-height: 1.6; margin: 2cm; color: #000; }
          @media print { body { margin: 2cm; } }
        </style>
      </head>
      <body>${html}</body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
  }

  function handleExportPDF() {
    handlePrint();
  }

  async function handleSendEmail(e: React.FormEvent) {
    e.preventDefault();
    if (!contract || !templateContent || !emailTo.trim()) return;
    setSendingEmail(true);
    try {
      const html = substituteVars(templateContent, contract);
      const res = await fetch(`/api/contratos/${id}/email`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ to: emailTo, html, clientName: contract.client.name, contractId: contract.id }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error ?? "Erro ao enviar");
      }
      toast.success("Contrato enviado por e-mail!");
      setEmailModalOpen(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao enviar e-mail");
    } finally {
      setSendingEmail(false);
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="skeleton h-8 w-48 rounded" />
        <div className="skeleton h-48 w-full rounded-lg" />
        <div className="skeleton h-32 w-full rounded-lg" />
      </div>
    );
  }

  if (!contract) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-500">Contrato não encontrado</p>
        <Link href="/contratos"><Button variant="ghost" className="mt-4">Voltar</Button></Link>
      </div>
    );
  }

  const paidAmount = contract.payments.filter((p) => p.status === "paid").reduce((sum, p) => sum + p.amount, 0);
  const pendingAmount = contract.totalAmount - paidAmount;
  const renderedContract = templateContent ? substituteVars(templateContent, contract) : null;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/contratos">
          <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <ArrowLeftIcon className="w-5 h-5 text-gray-600" />
          </button>
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-gray-800">Contrato #{contract.id}</h1>
            <Badge variant={STATUS_VARIANTS[contract.status]}>
              {STATUS_LABELS[contract.status]}
            </Badge>
          </div>
          <p className="text-gray-500 text-sm mt-1">
            Criado em {format(new Date(contract.createdAt), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {/* Contract document actions */}
          {renderedContract && (
            <>
              <Button variant="secondary" size="sm" onClick={() => setShowContract(!showContract)}>
                <DocumentTextIcon className="w-4 h-4" />
                {showContract ? "Ocultar" : "Ver Contrato"}
              </Button>
              <Button variant="secondary" size="sm" onClick={handlePrint}>
                <PrinterIcon className="w-4 h-4" />
                Imprimir
              </Button>
              <Button variant="secondary" size="sm" onClick={handleExportPDF}>
                <DocumentArrowDownIcon className="w-4 h-4" />
                PDF
              </Button>
              {contract.client.email && (
                <Button variant="secondary" size="sm" onClick={() => { setEmailTo(contract.client.email ?? ""); setEmailModalOpen(true); }}>
                  <EnvelopeIcon className="w-4 h-4" />
                  E-mail
                </Button>
              )}
            </>
          )}
          {contract.status === "active" && (
            <>
              <Button variant="secondary" size="sm" loading={updatingStatus} onClick={() => updateContractStatus("completed")}>
                Marcar Concluído
              </Button>
              <Button variant="danger" size="sm" loading={updatingStatus} onClick={() => updateContractStatus("cancelled")}>
                Cancelar
              </Button>
            </>
          )}
          <Button variant="danger" size="sm" onClick={handleDelete}>
            Excluir
          </Button>
        </div>
      </div>

      {/* Rendered contract */}
      {showContract && renderedContract && (
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-700">Texto do Contrato</h2>
            <div className="flex gap-2">
              <button
                onClick={handlePrint}
                className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-emerald-600 px-2 py-1 rounded hover:bg-emerald-50 transition-colors"
              >
                <PrinterIcon className="w-4 h-4" /> Imprimir / Salvar PDF
              </button>
            </div>
          </div>
          <div
            className="prose prose-sm max-w-none text-gray-800 border border-gray-100 rounded-lg p-6 bg-white"
            dangerouslySetInnerHTML={{ __html: renderedContract }}
          />
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Client Info */}
        <Card>
          <h2 className="font-semibold text-gray-700 mb-4">
            {(contract.additionalClients?.length ?? 0) > 0 ? "Clientes" : "Cliente"}
          </h2>
          <div className="space-y-4">
            {[contract.client, ...(contract.additionalClients ?? []).map(ac => ac.client)]
              .filter((c, i, arr) => c && arr.findIndex(x => x?.id === c.id) === i)
              .map((c) => (
              <div key={c.id} className="space-y-1 pb-3 border-b border-gray-50 last:border-0 last:pb-0">
                <p className="text-sm font-bold text-gray-800">{c.name}</p>
                {c.razaoSocial && <p className="text-xs text-gray-500">{c.razaoSocial}</p>}
                {c.cpf && <p className="text-xs text-gray-500">CPF: {c.cpf}</p>}
                {c.cnpj && <p className="text-xs text-gray-500">CNPJ: {c.cnpj}</p>}
                {c.email && <p className="text-xs text-gray-500">{c.email}</p>}
                {c.address && <p className="text-xs text-gray-400">{c.address}</p>}
                {c.phones.length > 0 && (
                  <div className="space-y-0.5 pt-1">
                    {c.phones.map((p, i) => (
                      <a
                        key={i}
                        href={`https://wa.me/${p.number.replace(/\D/g, "")}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-xs text-emerald-600 hover:text-emerald-700"
                      >
                        <PhoneIcon className="w-3 h-3" />
                        {p.number} <span className="text-gray-400">({p.label})</span>
                      </a>
                    ))}
                  </div>
                )}
              </div>
            ))}
            <Link href={`/clientes`}>
              <Button variant="ghost" size="sm">Ver Perfil do Cliente</Button>
            </Link>
          </div>
        </Card>

        {/* Dates */}
        <Card>
          <h2 className="font-semibold text-gray-700 mb-4 flex items-center gap-2">
            <CalendarDaysIcon className="w-5 h-5 text-emerald-500" />
            Datas Reservadas
          </h2>
          <div className="flex flex-wrap gap-2">
            {contract.dates.map((d) => (
              <span
                key={d.id}
                className="bg-emerald-50 text-emerald-700 text-sm px-3 py-1.5 rounded-lg border border-emerald-200 font-medium"
              >
                {format(new Date(d.date.substring(0, 10) + "T12:00:00"), "dd/MM/yyyy")}
              </span>
            ))}
          </div>
        </Card>

        {/* Financial Summary */}
        <Card>
          <h2 className="font-semibold text-gray-700 mb-4 flex items-center gap-2">
            <CurrencyDollarIcon className="w-5 h-5 text-emerald-500" />
            Financeiro
          </h2>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-gray-500">Valor Total</span>
              <span className="font-bold text-gray-800">{formatCurrency(contract.totalAmount)}</span>
            </div>
            {contract.amountInWords && (
              <p className="text-xs text-gray-400 italic">{contract.amountInWords}</p>
            )}
            {contract.paymentMethod && (
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Forma de Pagamento</span>
                <span className="text-sm text-gray-700">{contract.paymentMethod}</span>
              </div>
            )}
            <div className="h-px bg-gray-100" />
            <div className="flex justify-between">
              <span className="text-sm text-gray-500">Pago</span>
              <span className="font-semibold text-emerald-600">{formatCurrency(paidAmount)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-500">Pendente</span>
              <span className="font-semibold text-orange-500">{formatCurrency(pendingAmount)}</span>
            </div>
            <div className="bg-gray-100 rounded-full h-2">
              <div
                className="bg-emerald-500 h-2 rounded-full transition-all"
                style={{ width: `${contract.totalAmount > 0 ? (paidAmount / contract.totalAmount) * 100 : 0}%` }}
              />
            </div>
          </div>
        </Card>
      </div>

      {/* Payments */}
      <Card>
        <h2 className="font-semibold text-gray-700 mb-4">Parcelas</h2>
        {contract.payments.length === 0 ? (
          <p className="text-gray-400 text-sm">Nenhuma parcela cadastrada</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left py-3 px-2 font-semibold text-gray-600">Parcela</th>
                  <th className="text-left py-3 px-2 font-semibold text-gray-600">Vencimento</th>
                  <th className="text-left py-3 px-2 font-semibold text-gray-600">Valor</th>
                  <th className="text-left py-3 px-2 font-semibold text-gray-600">Status</th>
                  <th className="text-left py-3 px-2 font-semibold text-gray-600">Pago em</th>
                  <th className="text-right py-3 px-2 font-semibold text-gray-600">Ação</th>
                </tr>
              </thead>
              <tbody>
                {contract.payments.map((payment, index) => (
                  <tr key={payment.id} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="py-3 px-2 text-gray-500">{index + 1}ª</td>
                    <td className="py-3 px-2 text-gray-700">
                      {format(new Date(payment.dueDate.substring(0, 10) + "T12:00:00"), "dd/MM/yyyy")}
                    </td>
                    <td className="py-3 px-2 font-semibold text-gray-800">
                      {formatCurrency(payment.amount)}
                    </td>
                    <td className="py-3 px-2">
                      <div className="flex items-center gap-1.5">
                        {PAY_STATUS_ICONS[payment.status]}
                        <span className={`text-xs font-medium ${payment.status === "paid" ? "text-emerald-600" : payment.status === "overdue" ? "text-red-600" : "text-yellow-600"}`}>
                          {PAY_STATUS_LABELS[payment.status]}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-2 text-gray-400 text-xs">
                      {payment.paidAt ? format(new Date(payment.paidAt.substring(0, 10) + "T12:00:00"), "dd/MM/yyyy") : "—"}
                    </td>
                    <td className="py-3 px-2 text-right">
                      {payment.status !== "paid" ? (
                        <Button
                          size="sm"
                          variant="outline"
                          loading={updatingPayment === payment.id}
                          onClick={() => markPayment(payment.id, "paid")}
                        >
                          Marcar Pago
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          variant="ghost"
                          loading={updatingPayment === payment.id}
                          onClick={() => markPayment(payment.id, "pending")}
                        >
                          Reverter
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {contract.notes && (
        <Card>
          <h2 className="font-semibold text-gray-700 mb-2">Observações</h2>
          <p className="text-gray-600 text-sm whitespace-pre-wrap">{contract.notes}</p>
        </Card>
      )}

      {/* Email Modal */}
      <Modal isOpen={emailModalOpen} onClose={() => setEmailModalOpen(false)} title="Enviar Contrato por E-mail" size="sm">
        <form onSubmit={handleSendEmail} className="space-y-4">
          <Input
            label="Destinatário *"
            type="email"
            value={emailTo}
            onChange={(e) => setEmailTo(e.target.value)}
            placeholder="email@exemplo.com"
            required
          />
          <p className="text-xs text-gray-500">O texto completo do contrato será enviado para este endereço de e-mail.</p>
          <div className="flex gap-3">
            <Button type="button" variant="secondary" className="flex-1" onClick={() => setEmailModalOpen(false)}>Cancelar</Button>
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
