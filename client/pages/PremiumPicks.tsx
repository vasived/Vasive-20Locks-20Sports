import PlaceholderPage from "@/components/PlaceholderPage";

export default function PremiumPicks() {
  return (
    <PlaceholderPage
      title="Premium Picks"
      description="Advanced analytics and exclusive picks for premium subscribers."
      authRequired
      premiumRequired
      features={[
        "Advanced analytics and player trends",
        "Confidence percentages with AI-powered insights",
        "Bankroll management and stake calculations",
        "Alternative lines and betting options",
        "Real-time result tracking and performance metrics",
        "Detailed game research and matchup analysis",
        "Expert commentary and reasoning",
        "Premium Discord community access"
      ]}
    />
  );
}
