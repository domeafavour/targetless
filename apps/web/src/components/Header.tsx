import type { User } from "@supabase/supabase-js";
import { Link, useNavigate } from "@tanstack/react-router";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@targetless/ui/components/dropdown-menu";
import { CalendarCheck2, ChevronDown, LogOut, Menu, X } from "lucide-react";
import { useEffect, useState } from "react";
import { authApi } from "../lib/auth";
import { supabase } from "../lib/env";

const navLinks = [
  { to: "/", label: "Events", exact: true },
  { to: "/events/new", label: "Create Event", exact: false },
];

export default function Header() {
  const [user, setUser] = useState<User | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  const signOutMutation = authApi.signOut.useMutation({
    onSuccess: () => {
      setUser(null);
      navigate({ to: "/", reloadDocument: true });
    },
  });

  useEffect(() => {
    // Get initial user
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const handleLogout = () => {
    signOutMutation.mutate();
    setMobileMenuOpen(false);
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-slate-950/80 backdrop-blur">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4 text-white">
        <Link to="/" className="flex items-center gap-3 text-lg font-semibold">
          <CalendarCheck2 className="h-6 w-6 text-cyan-400" />
          Event Tracker
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.25em]">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className="rounded-full px-4 py-2 text-slate-300 transition-colors hover:text-white"
              activeProps={{
                className: "rounded-full bg-cyan-500 px-4 py-2 text-slate-900",
              }}
              activeOptions={{ exact: link.exact }}
            >
              {link.label}
            </Link>
          ))}
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center gap-1 rounded-full px-4 py-2 text-slate-300 transition-colors hover:text-white outline-none">
                <span className="max-w-37.5 truncate">{user.email}</span>
                <ChevronDown className="h-4 w-4" />
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="bg-slate-900 border-slate-700"
              >
                <DropdownMenuItem
                  onClick={handleLogout}
                  className="flex items-center gap-2 text-slate-300 cursor-pointer hover:text-white focus:text-white focus:bg-slate-800"
                >
                  <LogOut className="h-4 w-4" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Link
              to="/login"
              className="rounded-full px-4 py-2 text-slate-300 transition-colors hover:text-white"
              activeProps={{
                className: "rounded-full bg-cyan-500 px-4 py-2 text-slate-900",
              }}
            >
              Login
            </Link>
          )}
        </nav>

        {/* Mobile Menu Button */}
        <button
          type="button"
          className="md:hidden p-2 text-slate-300 hover:text-white transition-colors"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
        >
          {mobileMenuOpen ? (
            <X className="h-6 w-6" />
          ) : (
            <Menu className="h-6 w-6" />
          )}
        </button>
      </div>

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <nav className="md:hidden border-t border-white/10 bg-slate-950/95 backdrop-blur">
          <div className="mx-auto max-w-5xl px-4 py-4 flex flex-col gap-2">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className="rounded-lg px-4 py-3 text-sm font-semibold uppercase tracking-[0.15em] text-slate-300 transition-colors hover:text-white hover:bg-slate-800"
                activeProps={{
                  className:
                    "rounded-lg bg-cyan-500 px-4 py-3 text-sm font-semibold uppercase tracking-[0.15em] text-slate-900",
                }}
                activeOptions={{ exact: link.exact }}
                onClick={closeMobileMenu}
              >
                {link.label}
              </Link>
            ))}
            <div className="border-t border-white/10 pt-2 mt-2">
              {user ? (
                <>
                  <div className="px-4 py-2 text-xs text-slate-500 truncate">
                    {user.email}
                  </div>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="flex w-full items-center gap-2 rounded-lg px-4 py-3 text-sm font-semibold uppercase tracking-[0.15em] text-slate-300 transition-colors hover:text-white hover:bg-slate-800"
                  >
                    <LogOut className="h-4 w-4" />
                    Logout
                  </button>
                </>
              ) : (
                <Link
                  to="/login"
                  className="block rounded-lg px-4 py-3 text-sm font-semibold uppercase tracking-[0.15em] text-slate-300 transition-colors hover:text-white hover:bg-slate-800"
                  activeProps={{
                    className:
                      "block rounded-lg bg-cyan-500 px-4 py-3 text-sm font-semibold uppercase tracking-[0.15em] text-slate-900",
                  }}
                  onClick={closeMobileMenu}
                >
                  Login
                </Link>
              )}
            </div>
          </div>
        </nav>
      )}
    </header>
  );
}
