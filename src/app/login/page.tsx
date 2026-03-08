"use client";

import { useState, useEffect } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import { EnvelopeIcon, LockClosedIcon } from "@heroicons/react/24/outline";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [siteName, setSiteName] = useState("Chácara Garça");
  const [siteDescription, setSiteDescription] = useState("Área Administrativa");

  useEffect(() => {
    fetch("/api/public/info")
      .then((r) => r.json())
      .then((d) => {
        if (d.name) setSiteName(d.name);
        if (d.description) setSiteDescription(d.description);
      })
      .catch(() => {});
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        toast.error("E-mail ou senha incorretos.");
      } else {
        toast.success("Login realizado com sucesso!");
        router.push("/dashboard");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 to-green-100 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-emerald-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <span className="text-white text-2xl font-bold">CG</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-800">{siteName}</h1>
          <p className="text-gray-500 text-sm mt-1">Área Administrativa</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl border border-emerald-100 p-8">
          <h2 className="text-xl font-semibold text-gray-700 mb-6">Entrar no sistema</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="E-mail"
              type="email"
              placeholder="seu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              icon={<EnvelopeIcon className="w-4 h-4" />}
              required
            />
            <Input
              label="Senha"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              icon={<LockClosedIcon className="w-4 h-4" />}
              required
            />

            <Button type="submit" loading={loading} className="w-full mt-2" size="lg">
              Entrar
            </Button>
          </form>
        </div>

        <p className="text-center text-xs text-gray-400 mt-6">
          © {new Date().getFullYear()} {siteName}. Todos os direitos reservados.
        </p>
      </div>
    </div>
  );
}
