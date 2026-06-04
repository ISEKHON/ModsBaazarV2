import { useSettings } from "@/context/SettingsContext";
import { useAuth } from "@/context/AuthContext";
import { Settings, Shield } from "lucide-react";

export default function MaintenanceMode() {
  const { settings, loading } = useSettings();
  const { user } = useAuth();

  // Don't show anything while loading or if maintenance is off
  if (loading || !settings?.maintenanceMode) return null;

  // Allow admins and owners to bypass maintenance mode
  const isAdmin = user?.role === "admin" || user?.role === "owner";
  if (isAdmin) {
    // Show a small indicator to admins that maintenance mode is active
    return (
      <div className="fixed bottom-4 right-4 z-50 bg-yellow-500 text-black px-4 py-2 flex items-center gap-2 shadow-lg">
        <Settings className="w-4 h-4 animate-spin" />
        <span className="mono text-xs font-bold">MAINTENANCE MODE ACTIVE</span>
        <Shield className="w-4 h-4" />
      </div>
    );
  }

  // Block non-admin users
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[var(--color-background)]">
      <div className="max-w-md text-center px-6">
        <div className="mb-6 flex justify-center">
          <div className="p-6 border-2 border-[var(--color-border)]">
            <Settings className="w-16 h-16 text-[var(--color-primary)] animate-spin" style={{ animationDuration: '3s' }} />
          </div>
        </div>
        <h1 className="heading text-3xl mb-4">UNDER MAINTENANCE</h1>
        <p className="text-[var(--color-muted-foreground)] mb-6">
          We're currently performing scheduled maintenance to improve your experience. 
          Please check back soon.
        </p>
        <div className="mono text-xs text-[var(--color-muted-foreground)]">
          Thank you for your patience
        </div>
      </div>
    </div>
  );
}
