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
    <div className="bg-[var(--color-primary)] text-[var(--color-primary-foreground)] py-2 sm:py-3 px-3 sm:px-4 relative z-50">
      <div className="mx-auto max-w-7xl flex items-start sm:items-center justify-between gap-2 sm:gap-4">
        <div className="flex items-start sm:items-center gap-2 sm:gap-3 flex-1 min-w-0">
          <Megaphone className="w-4 h-4 sm:w-5 sm:h-5 shrink-0 mt-0.5 sm:mt-0" />
          <p className="text-xs sm:text-sm font-medium leading-relaxed break-words">{settings.announcement}</p>
        </div>
        <button
          onClick={() => setDismissed(true)}
          className="p-1 hover:opacity-70 transition-opacity shrink-0 -mt-1 sm:mt-0"
          aria-label="Dismiss announcement"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
