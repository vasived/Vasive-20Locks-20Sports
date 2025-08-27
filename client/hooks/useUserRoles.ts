import { useUser } from "@clerk/clerk-react";
import { useMemo } from "react";

// Helper function to check user roles
function hasRole(user: any, role: string): boolean {
  return (
    user?.publicMetadata?.role === role ||
    user?.publicMetadata?.roles?.includes(role) ||
    false
  );
}

export function useUserRoles() {
  const { isSignedIn, user } = useUser();

  const roles = useMemo(() => {
    if (!isSignedIn || !user) {
      return {
        isSignedIn: false,
        isAdmin: false,
        isPremium: false,
        hasRole: () => false,
        bankroll: 0,
      };
    }

    const isAdmin = hasRole(user, "admin");
    const isPremium = hasRole(user, "premium") || isAdmin;

    // Get bankroll from private metadata
    const bankroll = (user.privateMetadata?.bankroll as number) || 0;

    return {
      isSignedIn: true,
      isAdmin,
      isPremium,
      hasRole: (role: string) => hasRole(user, role),
      bankroll,
      user,
    };
  }, [isSignedIn, user]);

  return roles;
}

export function useStakeCalculation() {
  const { bankroll } = useUserRoles();

  const calculateStake = (stakePercentage: number): number => {
    return bankroll * (stakePercentage / 100);
  };

  const formatStake = (stakePercentage: number): string => {
    const stake = calculateStake(stakePercentage);
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(stake);
  };

  return {
    bankroll,
    calculateStake,
    formatStake,
  };
}
