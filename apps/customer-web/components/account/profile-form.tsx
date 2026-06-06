"use client";
import { useState } from "react";
import { createSupabaseClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { User, Mail, Phone, Save } from "lucide-react";

interface ProfileFormProps {
  profile: {
    full_name: string | null;
    phone: string | null;
    date_of_birth: string | null;
    gender: string | null;
    avatar_url: string | null;
  } | null;
  email: string;
}

export function ProfileForm({ profile, email }: ProfileFormProps) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [values, setValues] = useState({
    full_name: profile?.full_name || "",
    phone: profile?.phone || "",
    date_of_birth: profile?.date_of_birth || "",
    gender: profile?.gender || "",
  });

  const handleSave = async () => {
    setSaving(true);
    const supabase = createSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase.from("profiles").update({
      full_name: values.full_name || null,
      phone: values.phone || null,
      date_of_birth: values.date_of_birth || null,
      gender: values.gender || null,
    }).eq("id", user.id);

    setSaving(false);
    if (error) toast.error("Could not update profile");
    else { toast.success("Profile updated!"); router.refresh(); }
  };

  return (
    <div className="bg-white rounded-2xl border border-royal-gold-100 p-6 space-y-5">
      {/* Avatar */}
      <div className="flex items-center gap-4 pb-5 border-b border-gray-100">
        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-royal-gold-400 to-maroon-600 flex items-center justify-center text-white text-2xl font-bold flex-shrink-0">
          {values.full_name?.[0]?.toUpperCase() || <User size={24} />}
        </div>
        <div>
          <p className="font-semibold text-gray-800">{values.full_name || "Your Name"}</p>
          <p className="text-sm text-gray-500 flex items-center gap-1.5"><Mail size={12} />{email}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Full Name</label>
          <input
            value={values.full_name}
            onChange={(e) => setValues({ ...values, full_name: e.target.value })}
            className="input-royal"
            placeholder="Priya Sharma"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Phone Number</label>
          <div className="flex">
            <span className="px-3 py-3 border border-r-0 border-royal-gold-200 bg-desert-sand text-gray-600 text-sm rounded-l-lg">+91</span>
            <input
              value={values.phone}
              onChange={(e) => setValues({ ...values, phone: e.target.value })}
              className="flex-1 px-4 py-3 border border-royal-gold-200 rounded-r-lg bg-white text-sm focus:outline-none focus:ring-2 focus:ring-royal-gold-400"
              placeholder="9876543210"
              maxLength={10}
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Date of Birth</label>
          <input
            type="date"
            value={values.date_of_birth}
            onChange={(e) => setValues({ ...values, date_of_birth: e.target.value })}
            className="input-royal"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Gender</label>
          <select value={values.gender} onChange={(e) => setValues({ ...values, gender: e.target.value })} className="input-royal">
            <option value="">Prefer not to say</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </select>
        </div>
      </div>

      <div className="pt-2">
        <label className="block text-sm font-medium text-gray-700 mb-1.5">Email Address</label>
        <div className="flex items-center gap-3">
          <input value={email} disabled className="input-royal opacity-60 flex-1" />
          <span className="text-xs text-gray-500 whitespace-nowrap">Cannot change</span>
        </div>
      </div>

      <button onClick={handleSave} disabled={saving} className="btn-primary flex items-center gap-2 disabled:opacity-50">
        <Save size={15} />
        {saving ? "Saving…" : "Save Changes"}
      </button>
    </div>
  );
}
