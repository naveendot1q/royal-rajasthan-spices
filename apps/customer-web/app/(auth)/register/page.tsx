"use client";
import { useState } from "react";
import Link from "next/link";
import { signUp } from "@/lib/actions/auth";
import { Eye, EyeOff, Loader2, CheckCircle } from "lucide-react";
import { toast } from "sonner";

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const fd = new FormData(e.currentTarget);
    const result = await signUp(fd);
    setLoading(false);
    if (result?.error) toast.error(result.error);
    else if (result?.success) setSuccess(true);
  };

  if (success) {
    return (
      <div className="min-h-screen bg-palace-ivory flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <CheckCircle size={64} className="text-emerald-spice-500 mx-auto mb-4" />
          <h2 className="font-display text-2xl font-bold text-maroon-700 mb-2">Check Your Email</h2>
          <p className="text-gray-600">We've sent a confirmation link to your email. Click it to activate your account.</p>
          <Link href="/login" className="btn-primary inline-flex mt-6">Back to Login</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-palace-ivory flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-royal-gold-500 to-maroon-600 flex items-center justify-center text-3xl mx-auto mb-4 shadow-gold">🌶</div>
          <h1 className="font-display text-3xl font-bold text-maroon-700">Create Account</h1>
          <p className="text-gray-500 text-sm mt-1">Join thousands of spice lovers</p>
        </div>

        <div className="bg-white rounded-2xl border border-royal-gold-100 p-8 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Full Name</label>
              <input name="full_name" type="text" required className="input-royal" placeholder="Priya Sharma" autoComplete="name" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Email Address</label>
              <input name="email" type="email" required className="input-royal" placeholder="your@email.com" autoComplete="email" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Phone (optional)</label>
              <div className="flex">
                <span className="px-3 py-3 border border-r-0 border-royal-gold-200 bg-desert-sand text-gray-600 text-sm rounded-l-lg">+91</span>
                <input name="phone" type="tel" pattern="[6-9][0-9]{9}" className="flex-1 px-4 py-3 border border-royal-gold-200 rounded-r-lg bg-white focus:outline-none focus:ring-2 focus:ring-royal-gold-400 text-sm" placeholder="9876543210" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
              <div className="relative">
                <input name="password" type={showPassword ? "text" : "password"} required minLength={8} className="input-royal pr-11" placeholder="Min. 8 characters" autoComplete="new-password" />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
            <p className="text-xs text-gray-500">By creating an account, you agree to our <Link href="/terms" className="text-royal-gold-600 hover:underline">Terms</Link> and <Link href="/privacy" className="text-royal-gold-600 hover:underline">Privacy Policy</Link>.</p>
            <button type="submit" disabled={loading} className="btn-primary w-full py-3.5 flex items-center justify-center gap-2 disabled:opacity-60">
              {loading ? <><Loader2 size={16} className="animate-spin" /> Creating account…</> : "Create Account"}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-gray-100 text-center">
            <p className="text-sm text-gray-600">Already have an account?{" "}
              <Link href="/login" className="text-royal-gold-600 font-semibold hover:underline">Sign In</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
