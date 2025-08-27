import PlaceholderPage from "@/components/PlaceholderPage";

export default function Settings() {
  return (
    <PlaceholderPage
      title="Account Settings"
      description="Manage your profile, subscription, and betting preferences."
      authRequired
      features={[
        "Set and manage your bankroll for stake calculations",
        "View and manage your subscription status",
        "Update payment methods and billing information",
        "Configure notification preferences",
        "Set timezone and display preferences",
        "View pick history and performance tracking",
        "Export betting data and reports",
        "Account security and privacy settings",
        "Connect external sportsbook accounts",
        "Custom alerts and pick notifications",
      ]}
    />
  );
}
