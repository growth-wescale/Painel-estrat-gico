INSERT INTO public.brands (slug, nome, seg, prot, theme, maturidade, oneliner, sub, facts, blocks, iframe_url, position, is_visible)
VALUES ('wescale','We Scale','Estratégia · Growth House','Time WeScale','wescale',7,
'Casa de estratégia e growth por trás do portfólio — playbooks, rituais e memória viva.',
'Painel institucional da We Scale: método, rituais e memória estratégica compartilhada entre as marcas.',
'[["Escopo","Growth House"],["Portfólio","B2B + B2C"]]'::jsonb, '[]'::jsonb, NULL, 99, true)
ON CONFLICT (slug) DO UPDATE SET nome=EXCLUDED.nome, seg=EXCLUDED.seg, prot=EXCLUDED.prot, theme=EXCLUDED.theme, maturidade=EXCLUDED.maturidade, oneliner=EXCLUDED.oneliner, sub=EXCLUDED.sub, facts=EXCLUDED.facts, is_visible=true;