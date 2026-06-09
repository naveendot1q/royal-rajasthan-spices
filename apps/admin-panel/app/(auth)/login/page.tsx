"use client";
import { useState } from "react";
import { createSupabaseClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Loader2, Shield } from "lucide-react";
import { toast } from "sonner";
import { Toaster } from "sonner";

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const supabase = createSupabaseClient();
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error || !data.user) {
      toast.error("Invalid credentials");
      setLoading(false);
      return;
    }

    // Check staff role — fetch all roles and find an admin-level one
    const { data: rawRoleData } = await supabase
      .from("user_roles")
      .select("roles(name)")
      .eq("user_id", data.user.id);

    type RoleData = { roles: { name: string } | null };
    const allRoles = (rawRoleData as unknown as RoleData[] | null) ?? [];
    const adminRoles = ["super_admin", "admin", "staff"];
    const roleName = allRoles
      .map(r => r.roles?.name)
      .find(name => name && adminRoles.includes(name));
    if (!roleName || !["super_admin", "admin", "staff"].includes(roleName)) {
      await supabase.auth.signOut();
      toast.error("You don't have access to the admin panel");
      setLoading(false);
      return;
    }

    toast.success("Welcome back!");
    router.push("/");
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <Toaster />
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-royal-gold-500 to-maroon-700 flex items-center justify-center text-3xl mx-auto mb-4 shadow-lg">🌶</div>
          <h1 className="text-white font-display text-2xl font-bold">Admin Panel</h1>
          <p className="text-slate-400 text-sm mt-1">Royal Rajasthan Spice Market</p>
        </div>

        <div className="bg-slate-800 border border-slate-700 rounded-2xl p-7">
          <div className="flex items-center gap-2 px-3 py-2 bg-slate-700/50 border border-slate-600 rounded-lg mb-5">
            <Shield size={14} className="text-royal-gold-400" />
            <p className="text-xs text-slate-400">Restricted access — staff only</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Email Address</label>
              <input
                type="email" value={email} onChange={(e) => setEmail(e.target.value)} required
                className="w-full px-3 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-500 text-sm focus:outline-none focus:border-royal-gold-500 focus:ring-1 focus:ring-royal-gold-500"
                placeholder="admin@royalrajasthanspices.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Password</label>
              <div className="relative">
                <input
                  type={showPwd ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} required
                  className="w-full px-3 py-2.5 pr-10 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-500 text-sm focus:outline-none focus:border-royal-gold-500 focus:ring-1 focus:ring-royal-gold-500"
                  placeholder="••••••••"
                />
                <button type="button" onClick={() => setShowPwd(!showPwd)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                  {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            <button type="submit" disabled={loading}
              className="w-full py-3 bg-royal-gold-600 hover:bg-royal-gold-500 text-white font-semibold rounded-lg transition-colors text-sm flex items-center justify-center gap-2 disabled:opacity-60">
              {loading ? <><Loader2 size={15} className="animate-spin" /> Signing in…</> : "Sign In to Admin"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
