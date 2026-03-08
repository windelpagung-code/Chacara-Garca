"use client";

import { useEffect, useState, useRef } from "react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Modal from "@/components/ui/Modal";
import RichTextEditor, { RichTextEditorRef } from "@/components/modules/RichTextEditor";
import toast from "react-hot-toast";
import { PlusIcon, PencilIcon, TrashIcon, DocumentTextIcon } from "@heroicons/react/24/outline";

interface Template {
  id: number;
  name: string;
  content: string;
  createdAt: string;
}

const VARIAVEIS = [
  { var: "{{cliente_nome}}", desc: "Nome do cliente" },
  { var: "{{cliente_cpf}}", desc: "CPF (Pessoa Física)" },
  { var: "{{cnpj}}", desc: "CNPJ (Pessoa Jurídica)" },
  { var: "{{razao_social}}", desc: "Razão Social (PJ)" },
  { var: "{{cliente_telefones}}", desc: "Telefone(s) do cliente" },
  { var: "{{data_evento}}", desc: "Data(s) do evento" },
  { var: "{{data_atual}}", desc: "Data atual (por extenso)" },
  { var: "{{valor}}", desc: "Valor total (R$)" },
  { var: "{{valor_extenso}}", desc: "Valor por extenso" },
  { var: "{{forma_pagamento}}", desc: "Forma de pagamento" },
  { var: "{{observacoes}}", desc: "Observações" },
  { var: "{{chacara_nome}}", desc: "Nome da chácara" },
  { var: "{{chacara_endereco}}", desc: "Endereço da chácara" },
];

export default function ModelosPage() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editing, setEditing] = useState<Template | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<number | null>(null);
  const [form, setForm] = useState({ name: "", content: "" });
  const editorRef = useRef<RichTextEditorRef>(null);

  async function fetchTemplates() {
    setLoading(true);
    try {
      const res = await fetch("/api/modelos");
      const data = await res.json();
      setTemplates(data);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { fetchTemplates(); }, []);

  function openNew() {
    setEditing(null);
    setForm({ name: "", content: "" });
    setIsModalOpen(true);
  }

  function openEdit(t: Template) {
    setEditing(t);
    setForm({ name: t.name, content: t.content });
    setIsModalOpen(true);
  }

  function insertVar(v: string) {
    editorRef.current?.insertText(v + " ");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim() || !form.content.trim()) {
      toast.error("Preencha o nome e o conteúdo do modelo");
      return;
    }
    setSaving(true);
    try {
      const url = editing ? `/api/modelos/${editing.id}` : "/api/modelos";
      const method = editing ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error();
      toast.success(editing ? "Modelo atualizado!" : "Modelo criado!");
      setIsModalOpen(false);
      fetchTemplates();
    } catch {
      toast.error("Erro ao salvar modelo");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: number) {
    if (!confirm("Excluir este modelo de contrato?")) return;
    setDeleting(id);
    try {
      const res = await fetch(`/api/modelos/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      toast.success("Modelo excluído");
      fetchTemplates();
    } catch {
      toast.error("Erro ao excluir modelo");
    } finally {
      setDeleting(null);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Modelos de Contrato</h1>
          <p className="text-gray-500 text-sm mt-1">Crie e gerencie os textos dos contratos de locação</p>
        </div>
        <Button onClick={openNew}>
          <PlusIcon className="w-4 h-4" />
          Novo Modelo
        </Button>
      </div>

      {/* Variables help card */}
      <Card>
        <h2 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
          <DocumentTextIcon className="w-4 h-4 text-emerald-500" />
          Variáveis disponíveis
        </h2>
        <p className="text-sm text-gray-500 mb-3">
          Use estas variáveis no texto do modelo. Elas serão substituídas automaticamente ao gerar o contrato.
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {VARIAVEIS.map(({ var: v, desc }) => (
            <div key={v} className="bg-emerald-50 border border-emerald-100 rounded-lg px-3 py-2">
              <code className="text-xs font-mono text-emerald-700 block">{v}</code>
              <span className="text-xs text-gray-500">{desc}</span>
            </div>
          ))}
        </div>
      </Card>

      {/* Templates list */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2].map((i) => <div key={i} className="skeleton h-24 rounded-lg" />)}
        </div>
      ) : templates.length === 0 ? (
        <Card>
          <div className="text-center py-12 text-gray-400">
            <DocumentTextIcon className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p className="font-medium text-gray-500">Nenhum modelo cadastrado</p>
            <p className="text-sm mt-1">Clique em "Novo Modelo" para criar seu primeiro modelo de contrato</p>
          </div>
        </Card>
      ) : (
        <div className="space-y-4">
          {templates.map((t) => (
            <Card key={t.id}>
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-800 text-lg">{t.name}</h3>
                  <div
                    className="text-sm text-gray-500 mt-1 line-clamp-3 prose prose-sm max-w-none"
                    dangerouslySetInnerHTML={{ __html: t.content }}
                  />
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <button
                    onClick={() => openEdit(t)}
                    className="p-2 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                    title="Editar"
                  >
                    <PencilIcon className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(t.id)}
                    disabled={deleting === t.id}
                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Excluir"
                  >
                    <TrashIcon className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Create/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editing ? "Editar Modelo" : "Novo Modelo de Contrato"}
        size="xl"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Nome do Modelo *"
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            placeholder="Ex: Contrato Padrão, Contrato Fim de Semana..."
            required
          />

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-sm font-semibold text-gray-700">Texto do Contrato *</label>
              <span className="text-xs text-gray-400">Clique nas variáveis para inserir na posição do cursor</span>
            </div>
            <div className="flex flex-wrap gap-1 mb-2">
              {VARIAVEIS.map(({ var: v }) => (
                <button
                  key={v}
                  type="button"
                  onClick={() => insertVar(v)}
                  className="text-xs bg-emerald-50 border border-emerald-200 text-emerald-700 px-2 py-1 rounded hover:bg-emerald-100 font-mono transition-colors"
                >
                  {v}
                </button>
              ))}
            </div>
            <RichTextEditor
              ref={editorRef}
              value={form.content}
              onChange={(val) => setForm((f) => ({ ...f, content: val }))}
              placeholder="Digite o texto do contrato aqui..."
            />
          </div>

          <div className="flex gap-3">
            <Button type="button" variant="secondary" className="flex-1" onClick={() => setIsModalOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" loading={saving} className="flex-1">
              {editing ? "Salvar Alterações" : "Criar Modelo"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
