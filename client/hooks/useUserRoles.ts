import { useUser } from "@clerk/clerk-react";
import { UserPublicMetadata, UserPrivateMetadata } from "@/lib/clerk";
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
  const typedUser = user as unknown as {
    publicMetadata?: UserPublicMetadata;
    privateMetadata?: UserPrivateMetadata;
  };

  const roles = useMemo(() => {
    if (!isSignedIn || !typedUser) {
      return {
        isSignedIn: false,
        isAdmin: false,
        isPremium: false,
        hasRole: () => false,
        bankroll: 0,
      };
    }

    const isAdmin = hasRole(typedUser, "admin");
    const isPremium = hasRole(typedUser, "premium") || isAdmin;

    // Get bankroll from private metadata
    const bankroll = (typedUser.privateMetadata?.bankroll as number) || 0;

    return {
      isSignedIn: true,
      isAdmin,
      isPremium,
      hasRole: (role: string) => hasRole(typedUser, role),
      bankroll,
      user: typedUser as any,
    };
  }, [isSignedIn, typedUser]);

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
