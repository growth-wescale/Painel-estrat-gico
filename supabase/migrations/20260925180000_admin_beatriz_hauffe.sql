INSERT INTO public.panel_access (email, role, brand_slug)
VALUES ('beatriz.hauffe@oralunic.com.br', 'admin', NULL)
ON CONFLICT (email) DO UPDATE SET role = 'admin', brand_slug = NULL, updated_at = now();
