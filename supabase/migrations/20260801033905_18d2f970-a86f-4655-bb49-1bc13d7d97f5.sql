REVOKE ALL ON FUNCTION public.owns_parent_ref(uuid) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.is_guardian_of(uuid) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC, anon;