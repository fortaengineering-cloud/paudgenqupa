import { supabase } from "@/integrations/supabase/client";

/**
 * Generate dummy email from parent name for Supabase Auth
 * Format: nama_parent@paud.genqupa.co.id
 */
export function generateDummyEmail(name: string, phone: string): string {
  const sanitized = name
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "_")
    .replace(/_+/g, "_")
    .replace(/^_|_$/g, "");
  const phoneClean = phone.replace(/[^0-9]/g, "").slice(-4);
  return `${sanitized}_${phoneClean}@paud.genqupa.co.id`;
}

export async function registerParent(name: string, phone: string, password: string) {
  const email = generateDummyEmail(name, phone);

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        name,
        phone,
      },
      emailRedirectTo: window.location.origin,
    },
  });

  if (error) throw error;
  return data;
}

export async function loginWithPhone(phone: string, password: string) {
  // Lookup the real email for this phone via secure RPC
  const { data: rows, error: rpcError } = await supabase.rpc("get_profile_by_phone", {
    p_phone: phone,
  });

  if (rpcError) throw rpcError;
  if (!rows || rows.length === 0 || !rows[0]?.email) {
    throw new Error("Nomor HP tidak ditemukan. Silakan daftar terlebih dahulu.");
  }

  const email = rows[0].email;

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) throw error;
  return data;
}

export async function loginAdmin(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) throw error;

  // Verify admin role via SECURITY DEFINER RPC (avoids RLS race conditions)
  const { data: isAdminRole, error: roleError } = await supabase.rpc("has_role", {
    _user_id: data.user.id,
    _role: "admin",
  });

  if (roleError || !isAdminRole) {
    await supabase.auth.signOut();
    throw new Error("Anda tidak memiliki akses admin.");
  }

  return data;
}

export async function logout() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export async function getCurrentProfile() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();

  return profile;
}

export async function isAdmin(userId: string): Promise<boolean> {
  const { data } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", userId)
    .eq("role", "admin");

  return (data && data.length > 0) || false;
}
