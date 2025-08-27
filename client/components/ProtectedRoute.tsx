import { useUser } from "@clerk/clerk-react";
import { Navigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Lock, Shield, Crown } from "lucide-react";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  requirePremium?: boolean;
  requireAdmin?: boolean;
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

export default function ProtectedRoute({
  children,
  requireAuth = false,
  requirePremium = false,
  requireAdmin = false,
}: ProtectedRouteProps) {
  const { isSignedIn, user, isLoaded } = useUser();
  const location = useLocation();

  // Show loading state while Clerk loads
  if (!isLoaded) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-md mx-auto text-center space-y-4">
          <div className="w-16 h-16 mx-auto bg-gradient-to-br from-brand-blue to-brand-purple rounded-full flex items-center justify-center animate-pulse">
            <Lock className="h-8 w-8 text-white" />
          </div>
          <h2 className="text-xl font-semibold">Loading...</h2>
          <p className="text-muted-foreground">
            Checking your access permissions
          </p>
        </div>
      </div>
    );
  }

  // Check authentication requirements
  if (requireAuth && !isSignedIn) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  // Check premium requirements
  if (requirePremium && (!isSignedIn || !isPremiumUser(user))) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-md mx-auto text-center space-y-6">
          <div className="w-16 h-16 mx-auto bg-gradient-to-br from-brand-purple to-brand-blue rounded-full flex items-center justify-center">
            <Crown className="h-8 w-8 text-white" />
          </div>

          <Card className="border-brand-purple/20 bg-brand-purple/5">
            <CardHeader>
              <CardTitle className="flex items-center justify-center space-x-2">
                <Lock className="h-5 w-5" />
                <span>Premium Access Required</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                This content is exclusive to our Premium subscribers. Upgrade
                now to access advanced analytics and expert picks.
              </p>

              <div className="space-y-2">
                <Button
                  className="w-full bg-gradient-to-r from-brand-blue to-brand-purple hover:from-brand-blue/90 hover:to-brand-purple/90"
                  onClick={() => (window.location.href = "/")}
                >
                  Upgrade to Premium
                </Button>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => (window.location.href = "/free-picks")}
                >
                  View Free Picks Instead
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Check admin requirements
  if (requireAdmin && (!isSignedIn || !hasRole(user, "admin"))) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-md mx-auto text-center space-y-6">
          <div className="w-16 h-16 mx-auto bg-gradient-to-br from-red-500 to-orange-500 rounded-full flex items-center justify-center">
            <Shield className="h-8 w-8 text-white" />
          </div>

          <Card className="border-red-500/20 bg-red-500/5">
            <CardHeader>
              <CardTitle className="flex items-center justify-center space-x-2 text-red-600">
                <Shield className="h-5 w-5" />
                <span>Admin Access Required</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                This area is restricted to administrators only. Please contact
                support if you believe this is an error.
              </p>

              <Button
                variant="outline"
                className="w-full"
                onClick={() => (window.location.href = "/")}
              >
                Return to Home
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // If all checks pass, render the protected content
  return <>{children}</>;
}

// Convenience components for specific protection levels
export function RequireAuth({ children }: { children: React.ReactNode }) {
  return <ProtectedRoute requireAuth>{children}</ProtectedRoute>;
}

export function RequirePremium({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute requireAuth requirePremium>
      {children}
    </ProtectedRoute>
  );
}

export function RequireAdmin({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute requireAuth requireAdmin>
      {children}
    </ProtectedRoute>
  );
}
