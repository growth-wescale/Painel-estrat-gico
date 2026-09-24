import { createFileRoute } from "@tanstack/react-router";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

type Cat = {
  id?: string;
  nome: string;
  descricao: string;
  iframe_url: string | null;
  blocks: unknown[];
  html: string;
};

export const Route = createFileRoute("/api/public/panel")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = process.env.SUPABASE_URL;
        const key = process.env.SUPABASE_PUBLISHABLE_KEY;
        if (!url || !key) {
          return Response.json({ brands: [] }, { status: 200 });
        }

        const supabase = createClient<Database>(url, key, {
          auth: { storage: undefined, persistSession: false, autoRefreshToken: false },
          global: {
            fetch: (input, init) => {
              const headers = new Headers(init?.headers);
              if (headers.get("Authorization") === `Bearer ${key}`) headers.delete("Authorization");
              headers.set("apikey", key);
              return fetch(input, { ...init, headers });
            },
          },
        });

        // ---- Server-side access control for restricted brands (B2B / B2C) ----
        const RESTRICTED = new Set(["b2b", "b2c"]);
        const PAUTA_MANAGER = "growth@wescale.com.br";
        let callerEmail = "";
        const authHeader = request.headers.get("authorization") || request.headers.get("Authorization");
        const token = authHeader?.toLowerCase().startsWith("bearer ")
          ? authHeader.slice(7).trim()
          : "";
        if (token) {
          const { data: userRes } = await supabase.auth.getUser(token);
          callerEmail = (userRes?.user?.email || "").toLowerCase();
        }
        let canSeeRestricted = false;
        if (callerEmail) {
          if (callerEmail === PAUTA_MANAGER) {
            canSeeRestricted = true;
          } else {
            const { data: allow } = await supabase
              .from("panel_access")
              .select("email, role")
              .ilike("email", callerEmail)
              .eq("role", "admin")
              .limit(1);
            canSeeRestricted = !!(allow && allow.length);
          }
        }

        const [brandsRes, catsRes, stratsRes] = await Promise.all([
          supabase
            .from("brands")
            .select(
              "id, slug, nome, seg, prot, theme, maturidade, oneliner, sub, facts, blocks, iframe_url, position",
            )
            .eq("is_visible", true)
            .order("position", { ascending: true }),
          supabase
            .from("categories")
            .select("id, brand_id, slug, nome, descricao, iframe_url, position")
            .eq("is_visible", true)
            .order("position", { ascending: true }),
          supabase
            .from("strategies")
            .select("category_id, html, position")
            .eq("status", "published")
            .order("position", { ascending: true }),
        ]);

        if (brandsRes.error) {
          console.error("[panel] brands", brandsRes.error);
          return Response.json({ brands: [] }, { status: 200 });
        }

        const htmlByCat = new Map<string, string[]>();
        for (const s of stratsRes.data ?? []) {
          const list = htmlByCat.get(s.category_id) ?? [];
          list.push(s.html);
          htmlByCat.set(s.category_id, list);
        }

        const brands = (brandsRes.data ?? []).map((b) => {
          const blocks = (b.blocks ?? {}) as Record<string, unknown[]>;
          let catlist: Cat[];

          if (b.iframe_url) {
            catlist = [
              { nome: "Pauta semanal", descricao: "", iframe_url: b.iframe_url, blocks: [], html: "" },
            ];
          } else {
            catlist = (catsRes.data ?? [])
              .filter((c) => c.brand_id === b.id)
              .map((c) => {
                const legacyIndex = /^cat-(\d+)$/.exec(c.slug)?.[1];
                return {
                  id: c.id,
                  nome: c.nome,
                  descricao: c.descricao,
                  iframe_url: c.iframe_url,
                  blocks: legacyIndex != null ? (blocks[legacyIndex] ?? []) : [],
                  html: (htmlByCat.get(c.id) ?? []).join("\n"),
                };
              });
          }

          return {
            id: b.slug,
            db_id: b.id,
            nome: b.nome,
            seg: b.seg,
            prot: b.prot,
            theme: b.theme,
            maturidade: b.maturidade,
            oneliner: b.oneliner,
            sub: b.sub,
            facts: b.facts,
            catlist,
          };
        }).map((b) => {
          if (RESTRICTED.has(b.id) && !canSeeRestricted) {
            return { ...b, catlist: [], restricted: true };
          }
          return b;
        });

        return new Response(JSON.stringify({ brands }), {
          headers: { "content-type": "application/json", "cache-control": "no-store" },
        });
      },
    },
  },
});