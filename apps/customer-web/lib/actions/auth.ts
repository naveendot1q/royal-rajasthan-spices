"use server";
import { createSupabaseServer } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { z } from "zod";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

const registerSchema = loginSchema.extend({
  full_name: z.string().min(2),
  phone: z.string().regex(/^[6-9]\d{9}$/).optional(),
});

export async function signIn(formData: FormData) {
  const supabase = await createSupabaseServer();
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) return { error: "Invalid email or password" };

  const { error } = await supabase.auth.signInWithPassword(parsed.data);
  if (error) return { error: "Invalid credentials" };

  const redirectTo = formData.get("redirect") as string || "/";
  redirect(redirectTo);
}

export async function signUp(formData: FormData) {
  const supabase = await createSupabaseServer();
  const parsed = registerSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
    full_name: formData.get("full_name"),
    phone: formData.get("phone") || undefined,
  });
  if (!parsed.success) return { error: parsed.error.errors[0].message };

  const { error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      data: { full_name: parsed.data.full_name, phone: parsed.data.phone },
      emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`,
    },
  });

  if (error) return { error: error.message };
  return { success: true, message: "Check your email to confirm your account" };
}

export async function signOut() {
  const supabase = await createSupabaseServer();
  await supabase.auth.signOut();
  redirect("/");
}

export async function resetPassword(formData: FormData) {
  const supabase = await createSupabaseServer();
  const email = formData.get("email") as string;
  if (!email) return { error: "Email required" };

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/update-password`,
  });

  if (error) return { error: "Could not send reset email" };
  return { success: true };
}
