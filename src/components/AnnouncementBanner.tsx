import { useState } from "react";
import { useSettings } from "@/context/SettingsContext";
import { Megaphone, X } from "lucide-react";

export default function AnnouncementBanner() {
  const { settings, loading } = useSettings();
  const [dismissed, setDismissed] = useState(false);

  // Don't show if loading, no announcement, not active, or dismissed
  if (loading || !settings?.announcementActive || !settings?.announcement || dismissed) {
    return null;
  }

  return (
    <div className="bg-[var(--color-primary)] text-[var(--color-primary-foreground)] py-3 px-4 relative z-50">
      <div className="mx-auto max-w-7xl flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 flex-1">
          <Megaphone className="w-5 h-5 shrink-0" />
          <p className="text-sm font-medium">{settings.announcement}</p>
        </div>
        <button
          onClick={() => setDismissed(true)}
          className="p-1 hover:opacity-70 transition-opacity shrink-0"
          aria-label="Dismiss announcement"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
