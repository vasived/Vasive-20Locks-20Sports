import PlaceholderPage from "@/components/PlaceholderPage";

export default function Admin() {
  return (
    <PlaceholderPage
      title="Admin Dashboard"
      description="Manage picks, games, and platform content with live-synced data."
      authRequired
      adminRequired
      features={[
        "Create and edit picks (free and premium)",
        "Manage sports and games schedule",
        "Set pick results (Win/Loss/Pending)",
        "Live data synchronization across all admins",
        "Filter and search picks by sport, date, and result",
        "Preview how picks appear to users",
        "User role management and permissions",
        "Analytics dashboard and performance metrics",
        "Bulk import/export tools",
        "Audit logs and change tracking",
      ]}
    />
  );
}
