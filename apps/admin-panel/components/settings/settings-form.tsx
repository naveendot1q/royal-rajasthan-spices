"use client";
import { useState } from "react";
import { createSupabaseClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Save } from "lucide-react";

interface SettingsFormProps {
  settings: Record<string, unknown>;
}

export function SettingsForm({ settings }: SettingsFormProps) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [values, setValues] = useState({
    store_name: String(settings.store_name || "Royal Rajasthan Spice Market"),
    store_currency: String(settings.store_currency || "INR"),
    gst_rate: String(settings.gst_rate || "5"),
    free_shipping_above: String(settings.free_shipping_above || "499"),
    max_cart_quantity: String(settings.max_cart_quantity || "50"),
    reviews_require_purchase: settings.reviews_require_purchase === true || settings.reviews_require_purchase === "true",
  });

  const handleSave = async () => {
    setSaving(true);
    const supabase = createSupabaseClient();
    const updates = Object.entries(values).map(([key, value]) => ({
      key,
      value: typeof value === "boolean" ? value : isNaN(Number(value)) ? JSON.stringify(value) : value,
    }));

    for (const update of updates) {
      await supabase
        .from("system_settings")
        .upsert({ key: update.key, value: update.value }, { onConflict: "key" });
    }

    setSaving(false);
    toast.success("Settings saved successfully!");
    router.refresh();
  };

  const SECTIONS = [
    {
      title: "Store Information",
      fields: [
        { key: "store_name", label: "Store Name", type: "text" },
        { key: "store_currency", label: "Currency Code", type: "text" },
      ],
    },
    {
      title: "Tax & Pricing",
      fields: [
        { key: "gst_rate", label: "GST Rate (%)", type: "number", hint: "5% for food spices (HSN 0910)" },
        { key: "free_shipping_above", label: "Free Shipping Above (₹)", type: "number" },
      ],
    },
    {
      title: "Store Policies",
      fields: [
        { key: "max_cart_quantity", label: "Max Cart Quantity per Item", type: "number" },
        { key: "reviews_require_purchase", label: "Require Verified Purchase for Reviews", type: "boolean" },
      ],
    },
  ];

  return (
    <div className="space-y-6">
      {SECTIONS.map((section) => (
        <div key={section.title} className="card-admin p-6">
          <h2 className="font-semibold text-gray-900 mb-5">{section.title}</h2>
          <div className="space-y-4">
            {section.fields.map((field) => (
              <div key={field.key}>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">{field.label}</label>
                {field.type === "boolean" ? (
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      id={field.key}
                      checked={!!values[field.key as keyof typeof values]}
                      onChange={(e) => setValues({ ...values, [field.key]: e.target.checked })}
                      className="w-4 h-4 rounded border-gray-300 text-royal-gold-600"
                    />
                    <label htmlFor={field.key} className="text-sm text-gray-600">Enabled</label>
                  </div>
                ) : (
                  <>
                    <input
                      type={field.type}
                      value={String(values[field.key as keyof typeof values])}
                      onChange={(e) => setValues({ ...values, [field.key]: e.target.value })}
                      className="input-admin max-w-sm"
                    />
                    {field.hint && <p className="text-xs text-gray-400 mt-1">{field.hint}</p>}
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}

      <div className="card-admin p-6">
        <h2 className="font-semibold text-gray-900 mb-5">Environment Info</h2>
        <div className="space-y-2 text-sm">
          {[
            { label: "Payment Provider", value: process.env.PAYMENT_PROVIDER || "cod", code: true },
            { label: "Shipping Provider", value: process.env.SHIPPING_PROVIDER || "manual", code: true },
            { label: "SMS Enabled", value: process.env.SMS_ENABLED || "false", code: true },
            { label: "Meilisearch", value: process.env.MEILISEARCH_HOST || "not configured", code: true },
          ].map((row) => (
            <div key={row.label} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
              <span className="text-gray-600">{row.label}</span>
              <span className="font-mono text-xs bg-gray-100 px-2 py-0.5 rounded text-gray-700">{row.value}</span>
            </div>
          ))}
        </div>
      </div>

      <button onClick={handleSave} disabled={saving} className="btn-primary flex items-center gap-2 px-6 py-2.5">
        <Save size={15} />
        {saving ? "Saving…" : "Save Settings"}
      </button>
    </div>
  );
}
