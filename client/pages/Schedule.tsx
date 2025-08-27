import PlaceholderPage from "@/components/PlaceholderPage";

export default function Schedule() {
  return (
    <PlaceholderPage
      title="Games Schedule"
      description="View upcoming games with live countdowns and tip-off times in your timezone."
      features={[
        "All games with tip-off times converted to your local timezone",
        "Live countdowns to game start times",
        "Filter by sport and date range",
        "Game status tracking (scheduled, live, final)",
        "Team matchup information and venue details",
        "Link to research pages for each game",
        "Integration with available picks for each game",
        "Calendar view and list view options",
        "Favorite teams and personalized filters",
        "Push notifications for game start times",
      ]}
    />
  );
}
