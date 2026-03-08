"use client";

import { useEffect, useState } from "react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Modal from "@/components/ui/Modal";
import Badge from "@/components/ui/Badge";
import toast from "react-hot-toast";
import { PlusIcon, PencilIcon, TrashIcon } from "@heroicons/react/24/outline";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface User {
  id: number;
  name: string;
  email: string;
  role: "master" | "attendant";
  createdAt: string;
}

export default function UsuariosPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "attendant",
  });

  async function fetchUsers() {
    setLoading(true);
    try {
      const res = await fetch("/api/usuarios");
      const data = await res.json();
      setUsers(data);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { fetchUsers(); }, []);

  function openCreate() {
    setEditingUser(null);
    setForm({ name: "", email: "", password: "", role: "attendant" });
    setIsModalOpen(true);
  }

  function openEdit(user: User) {
    setEditingUser(user);
    setForm({ name: user.name, email: user.email, password: "", role: user.role });
    setIsModalOpen(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const url = editingUser ? `/api/usuarios/${editingUser.id}` : "/api/usuarios";
      const method = editingUser ? "PUT" : "POST";
      const payload = { ...form };
      if (editingUser && !form.password) delete (payload as { password?: string }).password;

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error ?? "Erro");
      }

      toast.success(editingUser ? "Usuário atualizado!" : "Usuário criado!");
      setIsModalOpen(false);
      fetchUsers();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(user: User) {
    if (!confirm(`Excluir o usuário "${user.name}"?`)) return;
    const res = await fetch(`/api/usuarios/${user.id}`, { method: "DELETE" });
    if (res.ok) { toast.success("Usuário excluído"); fetchUsers(); }
    else toast.error("Erro ao excluir");
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Usuários</h1>
          <p className="text-gray-500 text-sm mt-1">Gerenciar usuários do sistema</p>
        </div>
        <Button onClick={openCreate}>
          <PlusIcon className="w-4 h-4" />
          Novo Usuário
        </Button>
      </div>

      <Card>
        {loading ? (
          <div className="space-y-3">
            {[1, 2].map((i) => <div key={i} className="skeleton h-14 rounded-lg" />)}
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left py-3 px-2 font-semibold text-gray-600">Nome</th>
                <th className="text-left py-3 px-2 font-semibold text-gray-600">E-mail</th>
                <th className="text-left py-3 px-2 font-semibold text-gray-600">Perfil</th>
                <th className="text-left py-3 px-2 font-semibold text-gray-600">Cadastrado em</th>
                <th className="text-right py-3 px-2 font-semibold text-gray-600">Ações</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="border-b border-gray-50 hover:bg-emerald-50/50 transition-colors">
                  <td className="py-3 px-2 font-medium text-gray-800">{user.name}</td>
                  <td className="py-3 px-2 text-gray-500">{user.email}</td>
                  <td className="py-3 px-2">
                    <Badge variant={user.role === "master" ? "success" : "default"}>
                      {user.role === "master" ? "Master" : "Atendente"}
                    </Badge>
                  </td>
                  <td className="py-3 px-2 text-gray-400 text-xs">
                    {format(new Date(user.createdAt), "dd/MM/yyyy", { locale: ptBR })}
                  </td>
                  <td className="py-3 px-2">
                    <div className="flex justify-end gap-2">
                      <button onClick={() => openEdit(user)} className="p-1.5 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg">
                        <PencilIcon className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDelete(user)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg">
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingUser ? "Editar Usuário" : "Novo Usuário"}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label="Nome *" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} required />
          <Input label="E-mail *" type="email" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} required />
          <Input
            label={editingUser ? "Nova Senha (deixe em branco para manter)" : "Senha *"}
            type="password"
            value={form.password}
            onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
            required={!editingUser}
            placeholder="Mínimo 6 caracteres"
          />
          <div>
            <label className="text-sm font-semibold text-gray-700 block mb-1">Perfil</label>
            <select
              className="w-full rounded-lg border border-emerald-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
              value={form.role}
              onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))}
            >
              <option value="attendant">Atendente</option>
              <option value="master">Master</option>
            </select>
          </div>
          <div className="flex gap-3 pt-2">
            <Button type="button" variant="secondary" className="flex-1" onClick={() => setIsModalOpen(false)}>Cancelar</Button>
            <Button type="submit" loading={saving} className="flex-1">{editingUser ? "Salvar" : "Criar"}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
