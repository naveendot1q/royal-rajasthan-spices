"use client";
import { useState } from "react";
import { createSupabaseClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { Shield, Key, Mail, AlertTriangle, Eye, EyeOff } from "lucide-react";

interface SecuritySettingsProps { email: string; }

export function SecuritySettings({ email }: SecuritySettingsProps) {
  const [changingPassword, setChangingPassword] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [saving, setSaving] = useState(false);
  const [sendingReset, setSendingReset] = useState(false);

  const handlePasswordChange = async () => {
    if (newPassword.length < 8) { toast.error("Password must be at least 8 characters"); return; }
    if (newPassword !== confirmPassword) { toast.error("Passwords do not match"); return; }
    setSaving(true);
    const supabase = createSupabaseClient();
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    setSaving(false);
    if (error) toast.error(error.message);
    else {
      toast.success("Password updated successfully!");
      setChangingPassword(false);
      setNewPassword("");
      setConfirmPassword("");
    }
  };

  const handlePasswordReset = async () => {
    setSendingReset(true);
    const supabase = createSupabaseClient();
    await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/update-password`,
    });
    setSendingReset(false);
    toast.success("Password reset email sent! Check your inbox.");
  };

  return (
    <div className="space-y-4">
      {/* Password section */}
      <div className="bg-white rounded-2xl border border-royal-gold-100 p-6">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl bg-royal-gold-50 flex items-center justify-center">
            <Key size={18} className="text-royal-gold-600" />
          </div>
          <div>
            <h2 className="font-semibold text-gray-900">Password</h2>
            <p className="text-sm text-gray-500">Keep your account secure with a strong password</p>
          </div>
        </div>

        {!changingPassword ? (
          <div className="flex gap-3">
            <button onClick={() => setChangingPassword(true)} className="btn-secondary text-sm">
              Change Password
            </button>
            <button onClick={handlePasswordReset} disabled={sendingReset} className="text-sm text-royal-gold-600 hover:underline disabled:opacity-50">
              {sendingReset ? "Sending…" : "Send reset email"}
            </button>
          </div>
        ) : (
          <div className="space-y-3 max-w-sm">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">New Password</label>
              <div className="relative">
                <input
                  type={showPwd ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="input-royal pr-10"
                  placeholder="Min. 8 characters"
                  minLength={8}
                />
                <button type="button" onClick={() => setShowPwd(!showPwd)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                  {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">Confirm New Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="input-royal"
                placeholder="Repeat password"
              />
            </div>
            <div className="flex gap-3 pt-1">
              <button onClick={handlePasswordChange} disabled={saving} className="btn-primary text-sm disabled:opacity-50">
                {saving ? "Updating…" : "Update Password"}
              </button>
              <button onClick={() => { setChangingPassword(false); setNewPassword(""); setConfirmPassword(""); }} className="btn-secondary text-sm">
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Email section */}
      <div className="bg-white rounded-2xl border border-royal-gold-100 p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
            <Mail size={18} className="text-blue-600" />
          </div>
          <div>
            <h2 className="font-semibold text-gray-900">Email Address</h2>
            <p className="text-sm text-gray-500">Your login email</p>
          </div>
        </div>
        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
          <span className="text-gray-700 text-sm font-medium">{email}</span>
          <span className="ml-auto text-xs text-emerald-600 font-medium flex items-center gap-1">
            <Shield size={12} /> Verified
          </span>
        </div>
        <p className="text-xs text-gray-400 mt-2">Contact support to change your email address.</p>
      </div>

      {/* Account actions */}
      <div className="bg-white rounded-2xl border border-red-100 p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center">
            <AlertTriangle size={18} className="text-red-600" />
          </div>
          <div>
            <h2 className="font-semibold text-gray-900">Danger Zone</h2>
            <p className="text-sm text-gray-500">Irreversible account actions</p>
          </div>
        </div>
        <button
          onClick={() => toast.error("To delete your account, contact support@royalrajasthanspices.com")}
          className="text-sm text-red-600 border border-red-200 px-4 py-2 rounded-lg hover:bg-red-50 transition-colors"
        >
          Delete Account
        </button>
        <p className="text-xs text-gray-400 mt-2">Account deletion is permanent and cannot be undone.</p>
      </div>
    </div>
  );
}
