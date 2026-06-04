import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { api } from "@/lib/api";

interface SiteSettings {
  maintenanceMode: boolean;
  registrationOpen: boolean;
  modApprovalRequired: boolean;
  announcement: string;
  announcementActive: boolean;
}

interface SettingsContextType {
  settings: SiteSettings | null;
  loading: boolean;
  refreshSettings: () => Promise<void>;
}

const SettingsContext = createContext<SettingsContextType>({
  settings: null,
  loading: true,
  refreshSettings: async () => {},
});

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchSettings = async () => {
    try {
      const { data } = await api.get("/settings/public");
      setSettings(data);
    } catch (error) {
      // If endpoint fails, use defaults
      setSettings({
        maintenanceMode: false,
        registrationOpen: true,
        modApprovalRequired: false,
        announcement: "",
        announcementActive: false,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  return (
    <SettingsContext.Provider value={{ settings, loading, refreshSettings: fetchSettings }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  return useContext(SettingsContext);
}
