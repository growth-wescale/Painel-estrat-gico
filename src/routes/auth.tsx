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

const TITLES = {
  signin: "Entrar no painel",
  signup: "Criar conta",
  forgot: "Redefinir senha",
  reset: "Definir nova senha",
} as const;

const SUBMIT_LABELS = {
  signin: "Entrar",
  signup: "Criar conta",
  forgot: "Enviar link de redefinição",
  reset: "Salvar nova senha",
} as const;

function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup" | "forgot" | "reset">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    // O link de redefinição de senha abre /auth?mode=reset já com sessão de recuperação.
    const isReset = new URLSearchParams(window.location.search).get("mode") === "reset";
    if (isReset) setMode("reset");
    const { data: sub } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") setMode("reset");
    });
    supabase.auth.getSession().then(({ data }) => {
      if (data.session && !isReset) navigate({ to: "/", replace: true });
    });
    return () => sub.subscription.unsubscribe();
  }, [navigate]);

  const ALLOWED = ["@oralunic.com.br", "@wescale.com.br", "@lisolaser.com.br"];
  const isAllowed = (v: string) => ALLOWED.some((d) => v.toLowerCase().endsWith(d));

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    try {
      if (mode === "reset") {
        const { error } = await supabase.auth.updateUser({ password });
        if (error) throw error;
        navigate({ to: "/", replace: true });
        return;
      }
      if (!isAllowed(email)) {
        throw new Error("Acesso restrito aos domínios @oralunic.com.br, @wescale.com.br e @lisolaser.com.br.");
      }
      if (mode === "forgot") {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/auth?mode=reset`,
        });
        if (error) throw error;
        setMessage("Se o e-mail tiver conta, você vai receber um link para definir uma nova senha.");
        return;
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
          {TITLES[mode]}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Acesso restrito a e-mails @oralunic.com.br, @wescale.com.br e @lisolaser.com.br.
        </p>

        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          {mode !== "reset" && (
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
          )}
          {mode !== "forgot" && (
          <div className="space-y-2">
            <Label htmlFor="password">{mode === "reset" ? "Nova senha" : "Senha"}</Label>
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
          )}
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Aguarde..." : SUBMIT_LABELS[mode]}
          </Button>
        </form>

        {message && <p className="mt-4 text-sm text-muted-foreground">{message}</p>}

        {mode !== "reset" && (
          <div className="mt-4 flex flex-col items-start gap-2">
            <button
              type="button"
              className="text-sm text-muted-foreground underline"
              onClick={() => {
                setMode(mode === "signin" ? "signup" : "signin");
                setMessage(null);
              }}
            >
              {mode === "signin" ? "Não tenho conta" : "Já tenho conta"}
            </button>
            {mode === "signin" && (
              <button
                type="button"
                className="text-sm text-muted-foreground underline"
                onClick={() => {
                  setMode("forgot");
                  setMessage(null);
                }}
              >
                Esqueci minha senha
              </button>
            )}
          </div>
        )}

        <div className="mt-6 border-t border-border pt-4">
          <a href="/" className="text-sm text-muted-foreground underline">
            Voltar ao painel
          </a>
        </div>
      </div>
    </main>
  );
}