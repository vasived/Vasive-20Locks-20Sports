import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Lock,
  TrendingUp,
  Calendar,
  Settings,
  Shield,
  Menu,
  X,
  Home,
} from "lucide-react";
import { useState } from "react";
import {
  useUser,
  SignInButton,
  SignUpButton,
  UserButton,
  SignOutButton,
  useClerk,
} from "@clerk/clerk-react";

interface LayoutProps {
  children: React.ReactNode;
}

// Helper function to check user roles
function hasRole(user: any, role: string): boolean {
  return (
    user?.publicMetadata?.role === role ||
    user?.publicMetadata?.roles?.includes(role) ||
    false
  );
}

function isPremiumUser(user: any): boolean {
  return hasRole(user, "premium") || hasRole(user, "admin");
}

export default function Layout({ children }: LayoutProps) {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { isSignedIn, user } = useUser();
  const { signOut } = useClerk();

  // Derive user status from Clerk
  const isAdmin = isSignedIn && hasRole(user, "admin");
  const isPremium = isSignedIn && isPremiumUser(user);

  const navigation = [
    { name: "Home", href: "/", icon: Home, alwaysVisible: true },
    {
      name: "Free Picks",
      href: "/free-picks",
      icon: TrendingUp,
      alwaysVisible: true,
    },
    {
      name: "Premium Picks",
      href: "/premium-picks",
      icon: Lock,
      alwaysVisible: true,
      isPremiumTab: true,
    },
    {
      name: "Settings",
      href: "/settings",
      icon: Settings,
      alwaysVisible: true,
    },
    // Admin tab only for actual admins
    { name: "Admin", href: "/admin", icon: Shield, admin: true },
  ];

  const filteredNavigation = navigation.filter((item) => {
    // Show main navigation tabs to everyone
    if (item.alwaysVisible) return true;
    // Only show admin tab to actual admins
    if (item.admin && isSignedIn && isAdmin) return true;
    return false;
  });

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="relative">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-brand-blue to-brand-purple flex items-center justify-center">
                <Lock className="h-4 w-4 text-white" />
              </div>
              <div className="absolute -inset-1 bg-gradient-to-br from-brand-blue to-brand-purple rounded-lg opacity-0 group-hover:opacity-20 transition-opacity blur" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-bold tracking-tight">
                Vasive Locks
              </span>
              <span className="text-xs text-muted-foreground -mt-1">
                Premium Picks
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            {filteredNavigation.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground hover:bg-accent"
                  }`}
                >
                  <item.icon className="h-4 w-4" />
                  <span>{item.name}</span>
                  {item.isPremiumTab && isPremium && (
                    <Badge variant="secondary" className="text-xs">
                      Premium
                    </Badge>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Auth Buttons */}
          <div className="hidden md:flex items-center space-x-3">
            {isSignedIn ? (
              <div className="flex items-center space-x-3">
                {isPremium && (
                  <Badge className="bg-gradient-to-r from-brand-purple to-brand-blue text-white border-0">
                    {isAdmin ? "Admin" : "Premium"}
                  </Badge>
                )}
                <UserButton
                  appearance={{
                    elements: {
                      avatarBox: "h-8 w-8",
                      userButtonPopoverCard: "bg-card border border-border",
                      userButtonPopoverActionButton:
                        "text-foreground hover:bg-accent",
                    },
                  }}
                />
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <SignInButton mode="modal">
                  <Button variant="ghost" size="sm">
                    Sign In
                  </Button>
                </SignInButton>
                <SignUpButton mode="modal">
                  <Button
                    size="sm"
                    className="bg-gradient-to-r from-brand-blue to-brand-purple hover:from-brand-blue/90 hover:to-brand-purple/90"
                  >
                    Go Premium
                  </Button>
                </SignUpButton>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="sm"
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </Button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-border">
            <div className="px-4 py-2 space-y-2">
              {filteredNavigation.map((item) => {
                const isActive = location.pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      isActive
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:text-foreground hover:bg-accent"
                    }`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <item.icon className="h-4 w-4" />
                    <span>{item.name}</span>
                    {item.isPremiumTab && isPremium && (
                      <Badge variant="secondary" className="text-xs">
                        Premium
                      </Badge>
                    )}
                  </Link>
                );
              })}

              {/* Mobile Auth Buttons */}
              <div className="pt-2 border-t border-border">
                {isSignedIn ? (
                  <div className="space-y-2">
                    {isPremium && (
                      <div className="px-3 py-2">
                        <Badge className="bg-gradient-to-r from-brand-purple to-brand-blue text-white border-0">
                          {isAdmin ? "Admin" : "Premium"} Member
                        </Badge>
                      </div>
                    )}
                    <div className="px-3 py-2">
                      <div className="text-sm text-muted-foreground mb-2">
                        {user?.firstName} {user?.lastName}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {user?.primaryEmailAddress?.emailAddress}
                      </div>
                    </div>
                    <SignOutButton>
                      <Button variant="outline" size="sm" className="w-full">
                        Sign Out
                      </Button>
                    </SignOutButton>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <SignInButton mode="modal">
                      <Button variant="ghost" size="sm" className="w-full">
                        Sign In
                      </Button>
                    </SignInButton>
                    <SignUpButton mode="modal">
                      <Button
                        size="sm"
                        className="w-full bg-gradient-to-r from-brand-blue to-brand-purple hover:from-brand-blue/90 hover:to-brand-purple/90"
                      >
                        Go Premium
                      </Button>
                    </SignUpButton>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-1">{children}</main>

      {/* Footer */}
      <footer className="border-t border-border bg-muted/20">
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-3">
              <h3 className="text-sm font-semibold">Platform</h3>
              <div className="space-y-2 text-sm text-muted-foreground">
                <Link to="/free-picks" className="block hover:text-foreground">
                  Free Picks
                </Link>
                <Link
                  to="/premium-picks"
                  className="block hover:text-foreground"
                >
                  Premium Picks
                </Link>
              </div>
            </div>
            <div className="space-y-3">
              <h3 className="text-sm font-semibold">Vasive Locks</h3>
              <p className="text-sm text-muted-foreground">
                Premium sports betting analytics and picks platform.
              </p>
              <div className="text-xs text-muted-foreground">
                © 2024 Vasive Locks. All rights reserved.
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
