
INSERT INTO public.strategies (category_id, titulo, html, position, status)
SELECT c.id,
       'Agenda Estratégica de Eventos',
       '<iframe src="/eventos-' || b.slug || '.html" title="Agenda de Eventos · ' || b.nome || '" style="width:100%;height:calc(100vh - 200px);border:0"></iframe>',
       5,
       'published'
FROM public.brands b
JOIN public.categories c ON c.brand_id = b.id AND c.slug = 'cat-4'
WHERE b.slug IN ('wescale','oralunic','liso','viva','b2case','inpot','eletrovias')
  AND NOT EXISTS (
    SELECT 1 FROM public.strategies s WHERE s.category_id = c.id AND s.titulo = 'Agenda Estratégica de Eventos'
  );
