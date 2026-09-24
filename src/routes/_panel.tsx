import { createFileRoute, Outlet, useNavigate, useParams } from "@tanstack/react-router";
import { useEffect, useRef } from "react";

export const Route = createFileRoute("/_panel")({
  component: PanelLayout,
});

function PanelLayout() {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const params = useParams({ strict: false }) as { brand?: string; cat?: string };
  const navigate = useNavigate();
  const brand = params.brand ?? null;
  const cat = params.cat ?? null;

  // Send current route into the iframe whenever it changes.
  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;
    const send = () => {
      try {
        iframe.contentWindow?.postMessage(
          { type: "panel:route", brand, cat },
          window.location.origin,
        );
      } catch {}
    };
    send();
  }, [brand, cat]);

  // Handle nav requests from painel.html and its "ready" ping.
  useEffect(() => {
    const onMsg = (e: MessageEvent) => {
      if (e.origin !== window.location.origin) return;
      const d = e.data;
      if (!d || typeof d !== "object") return;
      if (d.type === "panel:ready") {
        try {
          iframeRef.current?.contentWindow?.postMessage(
            { type: "panel:route", brand, cat },
            window.location.origin,
          );
        } catch {}
        return;
      }
      if (d.type === "panel:nav") {
        const b = typeof d.brand === "string" && d.brand ? d.brand : null;
        const c = typeof d.cat === "string" && d.cat ? d.cat : null;
        if (b && c) {
          navigate({ to: "/$brand/$cat", params: { brand: b, cat: c }, replace: !!d.replace });
        } else if (b) {
          navigate({ to: "/$brand", params: { brand: b }, replace: !!d.replace });
        } else {
          navigate({ to: "/", replace: !!d.replace });
        }
      }
    };
    window.addEventListener("message", onMsg);
    return () => window.removeEventListener("message", onMsg);
  }, [brand, cat, navigate]);

  return (
    <>
      <iframe
        ref={iframeRef}
        src="/painel.html"
        title="WeScale · Painel de Estratégias"
        style={{ position: "fixed", inset: 0, width: "100%", height: "100%", border: "none" }}
      />
      <div style={{ display: "none" }}>
        <Outlet />
      </div>
    </>
  );
}