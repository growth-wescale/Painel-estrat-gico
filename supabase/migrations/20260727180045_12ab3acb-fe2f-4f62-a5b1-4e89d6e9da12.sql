DROP POLICY "Anyone can view visible brands" ON public.brands;
DROP POLICY "Anyone can view visible categories" ON public.categories;
DROP POLICY "Anyone can view published strategies" ON public.strategies;

CREATE POLICY "Public can view visible brands"
  ON public.brands FOR SELECT TO anon USING (is_visible);
CREATE POLICY "Signed in can view brands"
  ON public.brands FOR SELECT TO authenticated
  USING (is_visible OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Public can view visible categories"
  ON public.categories FOR SELECT TO anon USING (is_visible);
CREATE POLICY "Signed in can view categories"
  ON public.categories FOR SELECT TO authenticated
  USING (is_visible OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Public can view published strategies"
  ON public.strategies FOR SELECT TO anon USING (status = 'published');
CREATE POLICY "Signed in can view strategies"
  ON public.strategies FOR SELECT TO authenticated
  USING (status = 'published' OR public.has_role(auth.uid(), 'admin'));

REVOKE ALL ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated, service_role;

REVOKE ALL ON FUNCTION public.set_updated_at() FROM PUBLIC, anon, authenticated;