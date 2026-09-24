"""E2E: verifica que Eventos e Programa de Iscas B2B renderizam com
formatação e sem overflow em todas as marcas.

Uso: `python3 tests/e2e/eventos_iscas.py`
Sai com código != 0 em caso de falha (pronto para CI).
"""
import asyncio, os, sys, urllib.request, json
from playwright.async_api import async_playwright

BASE = os.environ.get("BASE_URL", "http://localhost:8080")
CAT_RE = ("eventos", "programa de iscas b2b")


async def main():
    with urllib.request.urlopen(f"{BASE}/api/public/panel", timeout=15) as r:
        data = json.loads(r.read())
    targets = []
    for b in data.get("brands", []):
        for i, c in enumerate(b.get("catlist", [])):
            if (c.get("nome") or "").strip().lower() in CAT_RE:
                targets.append({"brand": b["id"], "idx": i, "cat": c["nome"]})
    if not targets:
        print("Nenhuma categoria alvo encontrada.", file=sys.stderr)
        sys.exit(1)
    print(f"→ {len(targets)} categorias-alvo\n")

    failures = []
    async with async_playwright() as pw:
        browser = await pw.chromium.launch(headless=True)
        ctx = await browser.new_context(viewport={"width": 1280, "height": 1800})
        # Sessão stub em localStorage: o painel redireciona para /auth quando
        # `sb.auth.getSession()` retorna vazio. Aqui injetamos um objeto de
        # sessão com e-mail permitido para que o painel apenas renderize.
        # A API `/api/public/panel` responde ok mesmo se o token não for
        # verificável — apenas restringe blocos B2B/B2C, que não são o alvo
        # deste teste (Eventos/Iscas).
        stub_session = {
            "access_token": "e2e-stub",
            "token_type": "bearer",
            "refresh_token": "e2e-stub",
            "expires_in": 3600,
            "expires_at": 4102444800,  # ano 2100
            "user": {"id": "e2e-user", "email": "e2e@wescale.com.br"},
        }
        supa_key = os.environ.get(
            "SUPABASE_STORAGE_KEY", "sb-vlbrdtnohqphhhpfntad-auth-token"
        )
        await ctx.add_init_script(
            f"try {{ window.localStorage.setItem({json.dumps(supa_key)}, {json.dumps(json.dumps(stub_session))}); }} catch (_) {{}}"
        )
        page = await ctx.new_page()
        await page.goto(f"{BASE}/painel.html", wait_until="domcontentloaded")
        await page.wait_for_function(
            "typeof window.openBrand==='function' && typeof window.showCat==='function'",
            timeout=20000,
        )
        # Força carga via API (o loader inicial pode ter parado no redirect).
        await page.evaluate("() => (typeof loadPanelData==='function') && loadPanelData()")
        await page.wait_for_function(
            "document.querySelectorAll('#hub .bcard').length > 0",
            timeout=15000,
        )

        for t in targets:
            scope = f"{t['brand']} · {t['cat']}"
            try:
                # Reset total: fecha estado anterior, limpa #catmain para não
                # herdar painéis cacheados de outra marca, e reabre a marca.
                await page.evaluate(
                    """({b,i}) => {
                        const m = document.getElementById('catmain');
                        if (m) m.innerHTML = '';
                        if (window.current) { window.current._panels = {}; window.current.activeCat = null; }
                        window.openBrand(b);
                        window.showCat(i);
                    }""",
                    {"b": t["brand"], "i": t["idx"]},
                )
                await page.wait_for_function(
                    """() => {
                        const p = document.querySelector("#catmain .catpanel:not([style*='display: none'])");
                        if (!p) return false;
                        const f = p.querySelector('iframe');
                        if (f) { try { const d=f.contentDocument; return !!d && !!d.body && d.body.children.length>0 && parseInt(f.style.height||'0',10)>100 && (d.body.innerText||'').trim().length>40; } catch { return false; } }
                        const host = p.querySelector('.pagehost');
                        if (host && host.shadowRoot) {
                            const body = host.shadowRoot.querySelector('.__pagebody, body');
                            return !!body && body.textContent.trim().length > 40;
                        }
                        return !!p.querySelector('.legacy-inline, .card, table, .stg');
                    }""",
                    timeout=10000,
                )
                # Aguarda o autosize do iframe convergir antes de medir overflow.
                await page.wait_for_timeout(600)
                m = await page.evaluate(
                    """() => {
                        const p = document.querySelector("#catmain .catpanel:not([style*='display: none'])");
                        const out = {mode:'unknown',overflowX:false,overflowY:false,styled:false,textLen:0,height:0};
                        if(!p) return out;
                        const f = p.querySelector('iframe');
                        if(f){
                            out.mode='iframe';
                            out.height = parseInt(f.style.height||'0',10);
                            try{
                                const d=f.contentDocument, de=d.documentElement;
                                // tolerância maior: o autosize converge dentro
                                // de ~30px; abaixo disso não gera scrollbar real.
                                out.overflowX = de.scrollWidth > f.clientWidth + 8;
                                out.overflowY = de.scrollHeight > f.clientHeight + 32;
                                out.textLen = (d.body.innerText||'').trim().length;
                                const pr = d.querySelector('h1,h2,.card,.tab,table,nav.tabs');
                                if(pr){ const cs = d.defaultView.getComputedStyle(pr); out.styled = cs.fontFamily.length>0 && cs.fontFamily !== 'serif'; }
                            }catch(_){ }
                            return out;
                        }
                        const host = p.querySelector('.pagehost');
                        if(host && host.shadowRoot){
                            out.mode='shadow';
                            const sr = host.shadowRoot;
                            const body = sr.querySelector('.__pagebody, body') || sr;
                            out.textLen = (body.textContent||'').trim().length;
                            for(const el of sr.querySelectorAll('*')){
                                const cs = getComputedStyle(el);
                                if((cs.overflowY==='scroll'||cs.overflowY==='auto') && el.scrollHeight > el.clientHeight + 2) out.overflowY = true;
                                if((cs.overflowX==='scroll'||cs.overflowX==='auto') && el.scrollWidth > el.clientWidth + 2) out.overflowX = true;
                            }
                            const pr = sr.querySelector('h1,h2,.card,table,.stg,.tab');
                            out.styled = !!pr;
                            out.height = host.getBoundingClientRect().height;
                            return out;
                        }
                        out.mode='legacy';
                        out.textLen = (p.innerText||'').trim().length;
                        out.styled = !!p.querySelector('.legacy-inline,.card,table');
                        out.height = p.getBoundingClientRect().height;
                        return out;
                    }"""
                )
                probs = []
                if m["textLen"] < 40: probs.append(f"sem conteúdo (textLen={m['textLen']})")
                if m["overflowX"]: probs.append("overflow-x interno")
                if m["overflowY"]: probs.append("overflow-y interno")
                if m["mode"] == "iframe" and m["height"] < 200: probs.append(f"altura suspeita {m['height']}")
                if not m["styled"]: probs.append("formatação ausente")
                if probs:
                    failures.append((scope, probs))
                    print(f"✗ {scope} — {', '.join(probs)} (mode={m['mode']}, h={int(m['height'])})")
                else:
                    print(f"✓ {scope} — mode={m['mode']} textLen={m['textLen']} h={int(m['height'])}px")
            except Exception as e:
                failures.append((scope, [f"exception: {e}"]))
                print(f"✗ {scope} — exception: {e}")
        await browser.close()

    print(f"\n{'FALHAS' if failures else 'OK'}: {len(failures)}/{len(targets)}")
    if failures:
        sys.exit(1)


if __name__ == "__main__":
    asyncio.run(main())