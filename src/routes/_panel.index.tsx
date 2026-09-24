import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_panel/")({
  head: () => ({
    meta: [
      { title: "WeScale · Painel de Estratégias por Marca" },
      {
        name: "description",
        content:
          "Brand Strategy Hub organizes brand strategies into interactive dashboards, accessible by brand.",
      },
      { property: "og:title", content: "WeScale · Painel de Estratégias por Marca" },
      {
        property: "og:description",
        content:
          "Brand Strategy Hub organizes brand strategies into interactive dashboards, accessible by brand.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: () => null,
});