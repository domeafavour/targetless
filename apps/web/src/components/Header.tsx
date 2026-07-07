import type { User } from "@supabase/supabase-js";
import { Link, useNavigate } from "@tanstack/react-router";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@targetless/ui/components/dropdown-menu";
import { ChevronDown, LogOut, Menu, X } from "lucide-react";
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
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
    });

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
    <header className="sticky top-0 z-50 border-b border bg-background/80 backdrop-blur-sm">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
        <Link to="/" className="flex items-center gap-2.5">
          <span className="flex h-7 w-7 items-center justify-center rounded-md bg-primary text-xs font-bold text-primary-foreground">
            T
          </span>
          <span className="text-sm font-medium text-foreground">Targetless</span>
        </Link>

        {/* Desktop navigation */}
        <nav className="hidden md:flex items-center gap-1 text-sm">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className="rounded-md px-3 py-1.5 text-muted-foreground transition-colors hover:text-foreground"
              activeProps={{
                className: "rounded-md px-3 py-1.5 bg-primary/10 text-primary font-medium",
              }}
              activeOptions={{ exact: link.exact }}
            >
              {link.label}
            </Link>
          ))}
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger className="ml-2 flex items-center gap-1 rounded-md px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground outline-none">
                <span className="max-w-30 truncate">{user.email}</span>
                <ChevronDown className="h-3 w-3" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-card border text-foreground">
                <DropdownMenuItem
                  onClick={handleLogout}
                  className="flex items-center gap-2 text-xs text-muted-foreground cursor-pointer hover:text-foreground focus:text-foreground focus:bg-secondary"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Link
              to="/login"
              className="ml-2 rounded-md px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground"
              activeProps={{
                className: "ml-2 rounded-md px-3 py-1.5 bg-primary/10 text-primary font-medium",
              }}
            >
              Login
            </Link>
          )}
        </nav>

        {/* Mobile menu button */}
        <button
          type="button"
          className="md:hidden p-1.5 text-muted-foreground hover:text-foreground transition-colors"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
        >
          {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile navigation */}
      {mobileMenuOpen && (
        <nav className="md:hidden border-t border bg-background/95 backdrop-blur-sm">
          <div className="mx-auto max-w-5xl px-4 py-3 flex flex-col gap-0.5">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className="rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:text-foreground hover:bg-secondary"
                activeProps={{
                  className: "rounded-md px-3 py-2 text-sm bg-primary/10 text-primary font-medium",
                }}
                activeOptions={{ exact: link.exact }}
                onClick={closeMobileMenu}
              >
                {link.label}
              </Link>
            ))}
            <div className="mt-2 pt-2 border-t border">
              {user ? (
                <>
                  <div className="px-3 py-1.5 text-xs text-muted-foreground truncate">
                    {user.email}
                  </div>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:text-foreground hover:bg-secondary"
                  >
                    <LogOut className="h-3.5 w-3.5" />
                    Logout
                  </button>
                </>
              ) : (
                <Link
                  to="/login"
                  className="block rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:text-foreground hover:bg-secondary"
                  activeProps={{
                    className:
                      "block rounded-md px-3 py-2 text-sm bg-primary/10 text-primary font-medium",
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
