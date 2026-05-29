"use client";

import { useSession } from "@/lib/auth-client";
import { Settings } from "lucide-react";

export default function SettingsPage() {
  const { data: session } = useSession();
  const user = session?.user;

  return (
    <div className="flex-1 overflow-auto p-6 max-w-2xl">
      <h1 className="text-xl font-semibold text-zinc-900 mb-6">Settings</h1>

      {/* Account section */}
      <section className="border border-zinc-200 rounded-xl p-5 mb-4">
        <h2 className="text-sm font-medium text-zinc-700 mb-4">Account</h2>
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center text-white text-lg font-medium shrink-0">
            {user?.name?.[0]?.toUpperCase() ?? "U"}
          </div>
          <div>
            <p className="text-sm font-medium text-zinc-900">
              {user?.name ?? "—"}
            </p>
            <p className="text-sm text-zinc-500">{user?.email ?? "—"}</p>
          </div>
        </div>
      </section>

      {/* Placeholder for future settings */}
      <section className="border border-zinc-200 rounded-xl p-5">
        <div className="flex items-center gap-3 text-zinc-400">
          <Settings size={20} />
          <p className="text-sm">
            Additional settings (theme, notifications, integrations) are coming
            in a future update.
          </p>
        </div>
      </section>
    </div>
  );
}
