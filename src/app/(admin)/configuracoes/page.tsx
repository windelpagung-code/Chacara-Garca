"use client";

import { useEffect, useState } from "react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Textarea from "@/components/ui/Textarea";
import toast from "react-hot-toast";

interface Settings {
  whatsapp_number: string;
  chacara_name: string;
  chacara_description: string;
  chacara_address: string;
  maps_embed_url: string;
  instagram_url: string;
  facebook_url: string;
}

export default function ConfiguracoesPage() {
  const [settings, setSettings] = useState<Settings>({
    whatsapp_number: "",
    chacara_name: "",
    chacara_description: "",
    chacara_address: "",
    maps_embed_url: "",
    instagram_url: "",
    facebook_url: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/configuracoes")
      .then((r) => r.json())
      .then(setSettings)
      .finally(() => setLoading(false));
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/configuracoes", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      if (!res.ok) throw new Error();
      toast.success("Configurações salvas com sucesso!");
    } catch {
      toast.error("Erro ao salvar configurações");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="skeleton h-8 w-48 rounded" />
        <div className="skeleton h-64 w-full rounded-lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Configurações</h1>
        <p className="text-gray-500 text-sm mt-1">Gerencie as configurações do sistema e da página pública</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <h2 className="font-semibold text-gray-700 mb-4">Informações da Chácara</h2>
          <div className="space-y-4">
            <Input
              label="Nome da Chácara"
              value={settings.chacara_name}
              onChange={(e) => setSettings((s) => ({ ...s, chacara_name: e.target.value }))}
              placeholder="Ex: Chácara Garcia"
            />
            <Textarea
              label="Descrição"
              value={settings.chacara_description}
              onChange={(e) => setSettings((s) => ({ ...s, chacara_description: e.target.value }))}
              placeholder="Descreva os diferenciais e comodidades da chácara..."
              rows={4}
            />
            <Input
              label="Endereço"
              value={settings.chacara_address}
              onChange={(e) => setSettings((s) => ({ ...s, chacara_address: e.target.value }))}
              placeholder="Rua, número, bairro, cidade - Estado"
            />
          </div>
        </Card>

        <Card>
          <h2 className="font-semibold text-gray-700 mb-4">Contato e Redes Sociais</h2>
          <div className="space-y-4">
            <Input
              label="Número WhatsApp"
              value={settings.whatsapp_number}
              onChange={(e) => setSettings((s) => ({ ...s, whatsapp_number: e.target.value }))}
              placeholder="5500000000000 (com código do país)"
            />
            <p className="text-xs text-gray-400">
              Formato: 55 (Brasil) + DDD + número. Ex: 5511999990000
            </p>
            <Input
              label="URL do Instagram"
              value={settings.instagram_url}
              onChange={(e) => setSettings((s) => ({ ...s, instagram_url: e.target.value }))}
              placeholder="https://instagram.com/suachacara"
            />
            <Input
              label="URL do Facebook"
              value={settings.facebook_url}
              onChange={(e) => setSettings((s) => ({ ...s, facebook_url: e.target.value }))}
              placeholder="https://facebook.com/suachacara"
            />
          </div>
        </Card>

        <Card>
          <h2 className="font-semibold text-gray-700 mb-4">Google Maps</h2>
          <div className="space-y-4">
            <Textarea
              label="URL de Embed do Google Maps"
              value={settings.maps_embed_url}
              onChange={(e) => {
                let val = e.target.value.trim();
                // Auto-extract src from <iframe> tag if user pasted the full tag
                const match = val.match(/src="([^"]+)"/);
                if (match) val = match[1];
                setSettings((s) => ({ ...s, maps_embed_url: val }));
              }}
              placeholder="Cole aqui a URL ou o código <iframe> do Google Maps"
              rows={3}
            />
            <p className="text-xs text-gray-400">
              No Google Maps: Compartilhar → Incorporar um mapa → copie o <strong>src</strong> do iframe (ou cole o código completo — extraímos automaticamente).
            </p>
          </div>
        </Card>

        <div className="flex justify-end">
          <Button type="submit" loading={saving} size="lg">
            Salvar Configurações
          </Button>
        </div>
      </form>
    </div>
  );
}
