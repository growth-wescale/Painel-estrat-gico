import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_panel/$brand/$cat")({
  head: ({ params }) => {
    const title = `WeScale · ${params.brand} · ${params.cat}`;
    return {
      meta: [
        { title },
        { name: "description", content: `Estratégia ${params.cat} da marca ${params.brand}.` },
        { property: "og:title", content: title },
        { property: "og:description", content: `Estratégia ${params.cat} da marca ${params.brand}.` },
        { property: "og:type", content: "article" },
        { name: "twitter:card", content: "summary_large_image" },
      ],
    };
  },
  component: () => null,
});