import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Entrar · Painel de Estratégias WeScale" },
      {
        name: "description",
        content: "Acesse a área administrativa do painel de estratégias WeScale por marca.",
      },
      { property: "og:title", content: "Entrar · Painel de Estratégias WeScale" },
      {
        property: "og:description",
        content: "Acesse a área administrativa do painel de estratégias WeScale por marca.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: "/", replace: true });
    });
  }, [navigate]);

  const ALLOWED = ["@oralunic.com.br", "@wescale.com.br", "@lisolaser.com.br"];
  const isAllowed = (v: string) => ALLOWED.some((d) => v.toLowerCase().endsWith(d));

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    try {
      if (!isAllowed(email)) {
        throw new Error("Acesso restrito aos domínios @oralunic.com.br, @wescale.com.br e @lisolaser.com.br.");
      }
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: `${window.location.origin}/` },
        });
        if (error) throw error;
        setMessage("Conta criada. Se a confirmação por e-mail estiver ativa, confirme antes de entrar.");
        const { data } = await supabase.auth.getSession();
        if (data.session) navigate({ to: "/", replace: true });
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        navigate({ to: "/", replace: true });
      }
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Não foi possível concluir.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm rounded-xl border border-border bg-card p-6 shadow-sm">
        <h1 className="text-xl font-semibold text-foreground">
          {mode === "signin" ? "Entrar no painel" : "Criar conta"}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Acesso restrito a e-mails @oralunic.com.br, @wescale.com.br e @lisolaser.com.br.
        </p>

        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">E-mail</Label>
            <Input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Senha</Label>
            <Input
              id="password"
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete={mode === "signin" ? "current-password" : "new-password"}
            />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Aguarde..." : mode === "signin" ? "Entrar" : "Criar conta"}
          </Button>
        </form>

        {message && <p className="mt-4 text-sm text-muted-foreground">{message}</p>}

        <button
          type="button"
          className="mt-4 text-sm text-muted-foreground underline"
          onClick={() => {
            setMode(mode === "signin" ? "signup" : "signin");
            setMessage(null);
          }}
        >
          {mode === "signin" ? "Não tenho conta" : "Já tenho conta"}
        </button>

        <div className="mt-6 border-t border-border pt-4">
          <a href="/" className="text-sm text-muted-foreground underline">
            Voltar ao painel
          </a>
        </div>
      </div>
    </main>
  );
}