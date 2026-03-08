import { getServerSession } from "next-auth";
import { authOptions } from "./auth";
import { NextResponse } from "next/server";

export async function requireAuth() {
  const session = await getServerSession(authOptions);
  if (!session) {
    return { error: NextResponse.json({ error: "Não autorizado" }, { status: 401 }), session: null };
  }
  return { error: null, session };
}

export async function requireMaster() {
  const { error, session } = await requireAuth();
  if (error) return { error, session: null };
  const role = (session?.user as { role?: string })?.role;
  if (role !== "master") {
    return { error: NextResponse.json({ error: "Acesso negado" }, { status: 403 }), session: null };
  }
  return { error: null, session };
}
