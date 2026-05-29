import { Camera } from "lucide-react";

export default function SnapshotsPage() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center py-24 text-center">
      <div className="w-20 h-20 rounded-2xl bg-zinc-100 flex items-center justify-center mb-4">
        <Camera size={32} className="text-zinc-400" />
      </div>
      <h2 className="text-lg font-medium text-zinc-900 mb-1">Snapshots</h2>
      <p className="text-sm text-zinc-500 max-w-xs">
        Version snapshots of your boards will appear here. Manual and
        auto-snapshots are coming in Phase 5.
      </p>
    </div>
  );
}
