import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_panel/$brand")({
  head: ({ params }) => {
    const title = `WeScale · ${params.brand}`;
    return {
      meta: [
        { title },
        { name: "description", content: `Estratégias da marca ${params.brand} no painel WeScale.` },
        { property: "og:title", content: title },
        { property: "og:description", content: `Estratégias da marca ${params.brand} no painel WeScale.` },
        { property: "og:type", content: "website" },
        { name: "twitter:card", content: "summary_large_image" },
      ],
    };
  },
  component: () => null,
});