import Link from "next/link";
import { useRouter } from "next/router";
import { useTheme } from "@/context/ThemeContext";
import { useAuth } from "@/context/AuthContext";
import { useEffect, useState } from "react";
import { Moon, Sun, Tractor, Search, User, Shield, LogOut, LayoutDashboard, Menu, X } from "lucide-react";

export default function Header() {
  const { theme, toggle } = useTheme();
  const { user, logout } = useAuth();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);



  useEffect(() => {
    setMobileOpen(false);
    setDropdownOpen(false);
  }, [router.pathname]);

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/browse", label: "Browse" },
    { href: "/browse?game=fs22", label: "FS22" },
    { href: "/browse?game=fs25", label: "FS25" },
    { href: "/stats", label: "Stats" },
  ];

  const isActive = (href: string) => {
    if (href === "/") return router.pathname === "/";
    return router.asPath.startsWith(href);
  };

  return (
      <header className="sticky top-0 z-50 w-full border-b border-[var(--color-border)] bg-[var(--color-background)]/85 backdrop-blur" data-testid="site-header">
        <div className="mx-auto max-w-7xl px-4 sm:px-8 flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2 group" data-testid="logo-link">
            <div className="p-1.5 bg-[var(--color-primary)] text-[var(--color-primary-foreground)]">
              <Tractor className="w-5 h-5" />
            </div>
            <div className="flex flex-col leading-none">
              <span className="heading text-lg">FS MODS HUB</span>
              <span className="mono text-[10px] text-[var(--color-muted-foreground)] tracking-widest">FS22 / FS25</span>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                data-testid={`nav-${l.label.toLowerCase()}`}
                className={`heading text-sm px-3 py-2 border-b-2 transition-colors ${
                  isActive(l.href)
                    ? "border-[var(--color-primary)] text-[var(--color-foreground)]"
                    : "border-transparent text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)] hover:border-[var(--color-primary)]/60"
                }`}
              >
                {l.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <button
              onClick={() => router.push("/browse")}
              data-testid="header-search-btn"
              className="hidden sm:flex items-center gap-2 border border-[var(--color-border)] px-3 py-2 text-xs text-[var(--color-muted-foreground)] hover:border-[var(--color-primary)]/60 transition-colors"
            >
              <Search className="w-3.5 h-3.5" />
              <span className="mono">Search mods...</span>
            </button>

            <button
              onClick={toggle}
              aria-label="Toggle theme"
              data-testid="theme-toggle"
              className="p-2 border border-transparent hover:border-[var(--color-border)] transition-colors"
            >
              {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            {user && user !== false ? (
              <div className="relative">
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-2 border border-[var(--color-border)] px-3 py-2 heading text-xs hover:border-[var(--color-primary)]/60 transition-colors"
                  data-testid="user-menu-btn"
                >
                  <User className="w-4 h-4" /> {user.name}
                </button>
                {dropdownOpen && (
                  <div className="absolute right-0 top-full mt-1 w-48 border border-[var(--color-border)] bg-[var(--color-card)] shadow-lg z-50">
                    <div className="px-3 py-2 mono text-xs text-[var(--color-muted-foreground)] border-b border-[var(--color-border)]">
                      {user.email}
                    </div>
                    <button
                      onClick={() => { router.push("/dashboard"); setDropdownOpen(false); }}
                      className="w-full text-left px-3 py-2 text-sm flex items-center gap-2 hover:bg-[var(--color-muted)] transition-colors"
                      data-testid="menu-dashboard"
                    >
                      <LayoutDashboard className="w-4 h-4" /> Dashboard
                    </button>
                    {user.role === "admin" && (
                      <button
                        onClick={() => { router.push("/admin"); setDropdownOpen(false); }}
                        className="w-full text-left px-3 py-2 text-sm flex items-center gap-2 hover:bg-[var(--color-muted)] transition-colors"
                        data-testid="menu-admin"
                      >
                        <Shield className="w-4 h-4" /> Admin Panel
                      </button>
                    )}
                    <div className="border-t border-[var(--color-border)]" />
                    <button
                      onClick={async () => { await logout(); setDropdownOpen(false); router.push("/"); }}
                      className="w-full text-left px-3 py-2 text-sm flex items-center gap-2 hover:bg-[var(--color-muted)] transition-colors text-[var(--color-destructive)]"
                      data-testid="menu-logout"
                    >
                      <LogOut className="w-4 h-4" /> Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="hidden sm:flex items-center gap-2">
                <button onClick={() => router.push("/login")} className="heading text-xs px-3 py-2 hover:text-[var(--color-primary)] transition-colors" data-testid="login-btn">Login</button>
                <button onClick={() => router.push("/register")} className="heading text-xs px-4 py-2 bg-[var(--color-primary)] text-[var(--color-primary-foreground)] hover:opacity-90 transition-opacity" data-testid="register-btn">Sign up</button>
              </div>
            )}

            <button
              className="md:hidden p-2"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="md:hidden border-t border-[var(--color-border)] bg-[var(--color-background)] px-4 py-4 space-y-2">
            {navLinks.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className={`block heading text-sm py-2 px-3 ${isActive(l.href) ? "text-[var(--color-primary)]" : "text-[var(--color-muted-foreground)]"}`}
              >
                {l.label}
              </Link>
            ))}
            {!user || user === false ? (
              <div className="flex gap-2 pt-2 border-t border-[var(--color-border)]">
                <button onClick={() => router.push("/login")} className="flex-1 heading text-xs py-2 border border-[var(--color-border)]">Login</button>
                <button onClick={() => router.push("/register")} className="flex-1 heading text-xs py-2 bg-[var(--color-primary)] text-[var(--color-primary-foreground)]">Sign up</button>
              </div>
            ) : null}
          </div>
        )}
      </header>
  );
}
