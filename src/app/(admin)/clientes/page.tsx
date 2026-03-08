"use client";

import { useEffect, useState, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Modal from "@/components/ui/Modal";
import Textarea from "@/components/ui/Textarea";
import toast from "react-hot-toast";
import { MagnifyingGlassIcon, PlusIcon, PencilIcon, TrashIcon, PhoneIcon, BuildingOfficeIcon, UserIcon } from "@heroicons/react/24/outline";
import { Suspense } from "react";

interface Phone {
  id?: number;
  number: string;
  label: string;
}

interface Client {
  id: number;
  type: string;
  name: string;
  cpf?: string;
  cnpj?: string;
  razaoSocial?: string;
  email?: string;
  address?: string;
  notes?: string;
  phones: Phone[];
  createdAt: string;
}

const emptyForm = {
  type: "fisica",
  name: "",
  cpf: "",
  cnpj: "",
  razaoSocial: "",
  email: "",
  address: "",
  notes: "",
  phones: [{ number: "", label: "principal" }] as Phone[],
};

function ClientsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [clients, setClients] = useState<Client[]>([]);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ ...emptyForm });

  const fetchClients = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/clientes?search=${encodeURIComponent(search)}&limit=50`);
      const data = await res.json();
      setClients(data.clients);
      setTotal(data.total);
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => { fetchClients(); }, [fetchClients]);

  useEffect(() => {
    if (searchParams.get("new") === "1") {
      openCreateModal();
      router.replace("/clientes");
    }
  }, [searchParams, router]);

  function openCreateModal() {
    setEditingClient(null);
    setForm({ ...emptyForm, phones: [{ number: "", label: "principal" }] });
    setIsModalOpen(true);
  }

  function openEditModal(client: Client) {
    setEditingClient(client);
    setForm({
      type: client.type || "fisica",
      name: client.name,
      cpf: client.cpf ?? "",
      cnpj: client.cnpj ?? "",
      razaoSocial: client.razaoSocial ?? "",
      email: client.email ?? "",
      address: client.address ?? "",
      notes: client.notes ?? "",
      phones: client.phones.length > 0 ? client.phones : [{ number: "", label: "principal" }],
    });
    setIsModalOpen(true);
  }

  function addPhone() {
    setForm((f) => ({ ...f, phones: [...f.phones, { number: "", label: "celular" }] }));
  }

  function removePhone(index: number) {
    setForm((f) => ({ ...f, phones: f.phones.filter((_, i) => i !== index) }));
  }

  function updatePhone(index: number, field: keyof Phone, value: string) {
    setForm((f) => {
      const phones = [...f.phones];
      phones[index] = { ...phones[index], [field]: value };
      return { ...f, phones };
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const phones = form.phones.filter((p) => p.number.trim());
      const payload = { ...form, phones };
      const url = editingClient ? `/api/clientes/${editingClient.id}` : "/api/clientes";
      const method = editingClient ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error ?? "Erro ao salvar");
      }
      toast.success(editingClient ? "Cliente atualizado!" : "Cliente criado!");
      setIsModalOpen(false);
      fetchClients();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao salvar");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(client: Client) {
    if (!confirm(`Excluir o cliente "${client.name}"? Esta ação não pode ser desfeita.`)) return;
    try {
      const res = await fetch(`/api/clientes/${client.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Erro ao excluir");
      toast.success("Cliente excluído!");
      fetchClients();
    } catch {
      toast.error("Erro ao excluir cliente");
    }
  }

  const isPJ = form.type === "juridica";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Clientes</h1>
          <p className="text-gray-500 text-sm mt-1">{total} clientes cadastrados</p>
        </div>
        <Button onClick={openCreateModal}>
          <PlusIcon className="w-4 h-4" />
          Novo Cliente
        </Button>
      </div>

      <Card>
        <div className="mb-4">
          <Input
            placeholder="Buscar por nome, e-mail, CPF ou CNPJ..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            icon={<MagnifyingGlassIcon className="w-4 h-4" />}
          />
        </div>

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => <div key={i} className="skeleton h-16 rounded-lg" />)}
          </div>
        ) : clients.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <p className="text-lg font-medium">Nenhum cliente encontrado</p>
            <p className="text-sm mt-1">Tente ajustar a busca ou cadastre um novo cliente</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left py-3 px-2 font-semibold text-gray-600">Tipo</th>
                  <th className="text-left py-3 px-2 font-semibold text-gray-600">Nome / Razão Social</th>
                  <th className="text-left py-3 px-2 font-semibold text-gray-600">CPF / CNPJ</th>
                  <th className="text-left py-3 px-2 font-semibold text-gray-600">E-mail</th>
                  <th className="text-left py-3 px-2 font-semibold text-gray-600">Telefones</th>
                  <th className="text-right py-3 px-2 font-semibold text-gray-600">Ações</th>
                </tr>
              </thead>
              <tbody>
                {clients.map((client) => (
                  <tr key={client.id} className="border-b border-gray-50 hover:bg-emerald-50/50 transition-colors">
                    <td className="py-3 px-2">
                      <span className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full font-medium border ${
                        client.type === "juridica"
                          ? "bg-blue-50 text-blue-700 border-blue-200"
                          : "bg-emerald-50 text-emerald-700 border-emerald-200"
                      }`}>
                        {client.type === "juridica"
                          ? <><BuildingOfficeIcon className="w-3 h-3" /> PJ</>
                          : <><UserIcon className="w-3 h-3" /> PF</>}
                      </span>
                    </td>
                    <td className="py-3 px-2">
                      <p className="font-medium text-gray-800">{client.name}</p>
                      {client.razaoSocial && (
                        <p className="text-xs text-gray-400">{client.razaoSocial}</p>
                      )}
                    </td>
                    <td className="py-3 px-2 text-gray-500 font-mono text-xs">
                      {client.type === "juridica" ? (client.cnpj ?? "—") : (client.cpf ?? "—")}
                    </td>
                    <td className="py-3 px-2 text-gray-500">{client.email ?? "—"}</td>
                    <td className="py-3 px-2">
                      <div className="flex flex-wrap gap-1">
                        {client.phones.map((p, i) => (
                          <span key={i} className="inline-flex items-center gap-1 text-xs bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full border border-emerald-200">
                            <PhoneIcon className="w-3 h-3" />
                            {p.number}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="py-3 px-2">
                      <div className="flex justify-end gap-2">
                        <button onClick={() => openEditModal(client)} className="p-1.5 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors">
                          <PencilIcon className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDelete(client)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
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

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingClient ? "Editar Cliente" : "Novo Cliente"} size="lg">
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Tipo PF / PJ */}
          <div>
            <label className="text-sm font-semibold text-gray-700 block mb-2">Tipo de Pessoa *</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setForm((f) => ({ ...f, type: "fisica", cnpj: "", razaoSocial: "" }))}
                className={`flex items-center justify-center gap-2 py-2.5 rounded-lg border text-sm font-medium transition-all ${
                  form.type === "fisica"
                    ? "bg-emerald-50 border-emerald-400 text-emerald-700"
                    : "border-gray-200 text-gray-500 hover:border-emerald-200"
                }`}
              >
                <UserIcon className="w-4 h-4" />
                Pessoa Física
              </button>
              <button
                type="button"
                onClick={() => setForm((f) => ({ ...f, type: "juridica", cpf: "" }))}
                className={`flex items-center justify-center gap-2 py-2.5 rounded-lg border text-sm font-medium transition-all ${
                  form.type === "juridica"
                    ? "bg-blue-50 border-blue-400 text-blue-700"
                    : "border-gray-200 text-gray-500 hover:border-blue-200"
                }`}
              >
                <BuildingOfficeIcon className="w-4 h-4" />
                Pessoa Jurídica
              </button>
            </div>
          </div>

          {isPJ ? (
            <>
              <Input
                label="Razão Social *"
                value={form.razaoSocial}
                onChange={(e) => setForm((f) => ({ ...f, razaoSocial: e.target.value }))}
                placeholder="Nome empresarial completo"
              />
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Nome Fantasia"
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  placeholder="Nome fantasia (opcional)"
                />
                <Input
                  label="CNPJ"
                  value={form.cnpj}
                  onChange={(e) => setForm((f) => ({ ...f, cnpj: e.target.value }))}
                  placeholder="00.000.000/0000-00"
                />
              </div>
            </>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Nome Completo *"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                placeholder="Nome completo"
                required
              />
              <Input
                label="CPF"
                value={form.cpf}
                onChange={(e) => setForm((f) => ({ ...f, cpf: e.target.value }))}
                placeholder="000.000.000-00"
              />
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="E-mail"
              type="email"
              value={form.email}
              onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              placeholder="email@exemplo.com"
            />
            <Input
              label="Endereço"
              value={form.address}
              onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))}
              placeholder="Rua, número, bairro, cidade"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-semibold text-gray-700">Telefones</label>
              <button type="button" onClick={addPhone} className="text-xs text-emerald-600 hover:text-emerald-700 font-medium">
                + Adicionar
              </button>
            </div>
            <div className="space-y-2">
              {form.phones.map((phone, index) => (
                <div key={index} className="flex gap-2">
                  <input
                    className="flex-1 rounded-lg border border-emerald-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
                    placeholder="(00) 00000-0000"
                    value={phone.number}
                    onChange={(e) => updatePhone(index, "number", e.target.value)}
                  />
                  <select
                    className="rounded-lg border border-emerald-200 bg-white px-2 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
                    value={phone.label}
                    onChange={(e) => updatePhone(index, "label", e.target.value)}
                  >
                    <option value="principal">Principal</option>
                    <option value="celular">Celular</option>
                    <option value="fixo">Fixo</option>
                    <option value="whatsapp">WhatsApp</option>
                  </select>
                  {form.phones.length > 1 && (
                    <button type="button" onClick={() => removePhone(index)} className="px-2 text-red-400 hover:text-red-600">✕</button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <Textarea
            label="Observações"
            value={form.notes}
            onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
            placeholder="Informações adicionais sobre o cliente..."
            rows={3}
          />

          <div className="flex gap-3 pt-2">
            <Button type="button" variant="secondary" className="flex-1" onClick={() => setIsModalOpen(false)}>Cancelar</Button>
            <Button type="submit" loading={saving} className="flex-1">{editingClient ? "Salvar Alterações" : "Criar Cliente"}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

export default function ClientesPage() {
  return (
    <Suspense>
      <ClientsContent />
    </Suspense>
  );
}
