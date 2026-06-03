import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/router";
import { useAuth } from "@/context/AuthContext";
import { api, formatApiError, resolveAssetUrl } from "@/lib/api";
import { toast } from "sonner";
import { Camera, Save, Users } from "lucide-react";
import Head from "next/head";

export default function Settings() {
  const { user, loading: authLoading, refresh } = useAuth();
  const router = useRouter();
  const fileInput = useRef<HTMLInputElement>(null);
  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) router.push("/login");
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user) {
      setDisplayName(user.displayName);
      setBio(user.bio || "");
      setAvatarPreview(user.avatarUrl);
    }
  }, [user]);

  const uploadAvatar = async (file: File) => {
    setUploadingAvatar(true);
    const formData = new FormData();
    formData.append("avatar", file);
    try {
      const { data } = await api.post("/users/me/avatar", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setAvatarPreview(data.avatarUrl);
      toast.success("Avatar updated");
      refresh();
    } catch (err) {
      toast.error(formatApiError(err));
    }
    setUploadingAvatar(false);
  };

  const saveProfile = async () => {
    setSaving(true);
    try {
      const body: any = { displayName, bio };
      if (newPassword) {
        if (newPassword !== confirmPassword) {
          toast.error("Passwords don't match");
          setSaving(false);
          return;
        }
        if (!currentPassword) {
          toast.error("Current password required");
          setSaving(false);
          return;
        }
        body.currentPassword = currentPassword;
        body.newPassword = newPassword;
      }
      await api.put("/users/me", body);
      toast.success("Profile updated");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      refresh();
    } catch (err) {
      toast.error(formatApiError(err));
    }
    setSaving(false);
  };

  if (!user) return null;

  return (
    <>
      <Head><title>Settings — FS Mods Hub</title></Head>
      <div className="mx-auto max-w-2xl px-4 sm:px-8 py-10" data-testid="settings-page">
        <div className="mono text-xs tracking-widest text-[var(--color-muted-foreground)]">ACCOUNT</div>
        <h1 className="heading text-3xl mt-1">SETTINGS</h1>

        {/* Avatar */}
        <div className="mt-8">
          <div className="heading text-[11px] tracking-widest mb-3">AVATAR</div>
          <div className="flex items-center gap-4">
            <div className="relative w-20 h-20 border-2 border-[var(--color-border)] bg-[var(--color-muted)] overflow-hidden group cursor-pointer" onClick={() => fileInput.current?.click()}>
              {avatarPreview ? (
                <img src={resolveAssetUrl(avatarPreview)} alt="" className="w-full h-full object-cover" />
              ) : (
                <Users className="w-10 h-10 m-5 text-[var(--color-muted-foreground)]" />
              )}
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <Camera className="w-5 h-5 text-white" />
              </div>
            </div>
            <div>
              <button onClick={() => fileInput.current?.click()} disabled={uploadingAvatar}
                className="heading text-xs px-3 py-2 border border-[var(--color-border)] hover:border-[var(--color-primary)] transition-colors disabled:opacity-50" data-testid="upload-avatar-btn">
                {uploadingAvatar ? "UPLOADING..." : "CHANGE AVATAR"}
              </button>
              <p className="mono text-[10px] text-[var(--color-muted-foreground)] mt-1">JPEG, PNG, GIF, WebP. Max 5MB.</p>
            </div>
            <input type="file" ref={fileInput} className="hidden" accept="image/jpeg,image/png,image/gif,image/webp"
              onChange={(e) => { if (e.target.files?.[0]) uploadAvatar(e.target.files[0]); e.target.value = ""; }} />
          </div>
        </div>

        <div className="ridge my-8" />

        {/* Profile Info */}
        <div className="space-y-4">
          <div className="heading text-[11px] tracking-widest">PROFILE</div>
          <div>
            <label className="heading text-[11px] tracking-widest block mb-1">DISPLAY NAME</label>
            <input value={displayName} onChange={(e) => setDisplayName(e.target.value)} maxLength={30}
              className="w-full mono h-11 px-3 border border-[var(--color-border)] bg-transparent focus:border-[var(--color-primary)] outline-none transition-colors" data-testid="display-name-input" />
          </div>
          <div>
            <label className="heading text-[11px] tracking-widest block mb-1">BIO</label>
            <textarea value={bio} onChange={(e) => setBio(e.target.value)} maxLength={300} rows={3}
              className="w-full mono px-3 py-2 border border-[var(--color-border)] bg-transparent focus:border-[var(--color-primary)] outline-none transition-colors resize-none" data-testid="bio-input" />
            <span className="mono text-[10px] text-[var(--color-muted-foreground)]">{bio.length}/300</span>
          </div>
        </div>

        <div className="ridge my-8" />

        {/* Password */}
        <div className="space-y-4">
          <div className="heading text-[11px] tracking-widest">CHANGE PASSWORD</div>
          <div>
            <label className="heading text-[11px] tracking-widest block mb-1">CURRENT PASSWORD</label>
            <input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full mono h-11 px-3 border border-[var(--color-border)] bg-transparent focus:border-[var(--color-primary)] outline-none transition-colors" data-testid="current-password-input" />
          </div>
          <div>
            <label className="heading text-[11px] tracking-widest block mb-1">NEW PASSWORD</label>
            <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} minLength={6}
              className="w-full mono h-11 px-3 border border-[var(--color-border)] bg-transparent focus:border-[var(--color-primary)] outline-none transition-colors" data-testid="new-password-input" />
          </div>
          <div>
            <label className="heading text-[11px] tracking-widest block mb-1">CONFIRM PASSWORD</label>
            <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full mono h-11 px-3 border border-[var(--color-border)] bg-transparent focus:border-[var(--color-primary)] outline-none transition-colors" data-testid="confirm-password-input" />
          </div>
        </div>

        <div className="mt-8">
          <button onClick={saveProfile} disabled={saving}
            className="heading px-6 py-3 bg-[var(--color-primary)] text-[var(--color-primary-foreground)] hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center gap-2" data-testid="save-settings">
            <Save className="w-4 h-4" /> {saving ? "SAVING..." : "SAVE CHANGES"}
          </button>
        </div>
      </div>
    </>
  );
}
