import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useUser } from "@clerk/clerk-react";
import {
  TrendingUp,
  Star,
  Calendar,
  Target,
  BarChart3,
  Clock,
  DollarSign,
  Crown,
  Lock,
  Users,
  ExternalLink,
  Zap,
} from "lucide-react";
import { PremiumPick } from "@shared/api";

// Mock premium picks data
const mockPremiumPicks = [
  {
    id: "premium-1",
    player: "Luka Dončić",
    propType: "Points + Assists",
    line: 45.5,
    side: "Over",
    game: "Dallas Mavericks @ Phoenix Suns",
    gameShort: "DAL @ PHX",
    tipoff: "2024-01-15T22:00:00-05:00",
    sport: "NBA",
    confidence: 89,
    stakePercentage: 3.5,
    analysis:
      "Luka has been exceptional in his last 10 games, averaging 32.8 points and 9.2 assists. Phoenix allows the 5th most points to PGs this season.",
    advancedAnalytics: {
      last10Trend: "+12.3 vs line average",
      matchupRank: "Top 3 opponent for PG scoring",
      pace: "102.4 (Above average)",
      minutes: "36.2 projected",
      defenseRank: "22nd vs Guards",
    },
    alternateLines: [
      { line: 44.5, odds: "+105" },
      { line: 46.5, odds: "-125" },
      { line: 47.5, odds: "-145" },
    ],
    odds: "-110",
    sportsbook: "DraftKings",
    result: "Pending",
  },
  {
    id: "premium-2",
    player: "Shohei Ohtani",
    propType: "Strikeouts",
    line: 8.5,
    side: "Over",
    game: "Los Angeles Angels @ Seattle Mariners",
    gameShort: "LAA @ SEA",
    tipoff: "2024-01-15T22:10:00-05:00",
    sport: "MLB",
    confidence: 76,
    stakePercentage: 2.0,
    analysis:
      "Ohtani has recorded 9+ strikeouts in 7 of his last 10 starts. Seattle ranks 28th in contact rate vs righties.",
    advancedAnalytics: {
      last10Trend: "+1.8 strikeouts vs average",
      matchupRank: "Favorable - SEA strikes out 24.8% vs RHP",
      pace: "N/A",
      minutes: "~95 pitches projected",
      defenseRank: "Bottom 5 contact rate",
    },
    alternateLines: [
      { line: 7.5, odds: "-165" },
      { line: 9.5, odds: "+140" },
      { line: 10.5, odds: "+220" },
    ],
    odds: "-115",
    sportsbook: "FanDuel",
    result: "Win",
  },
];

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

export default function PremiumPicks() {
  const { isSignedIn, user } = useUser();
  const [expandedPick, setExpandedPick] = useState<string | null>(null);
  const [premiumPicks, setPremiumPicks] = useState<PremiumPick[]>([]);
  const [loading, setLoading] = useState(true);

  const isPremium = isSignedIn && isPremiumUser(user);
  const bankroll = parseFloat(user?.privateMetadata?.bankroll as string) || 0;

  function formatGameTime(tipoffTime: string) {
    const date = new Date(tipoffTime);
    return (
      date.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        timeZone: "America/New_York",
      }) + " EST"
    );
  }

  function getResultBadge(result: string) {
    switch (result) {
      case "Win":
        return <Badge className="bg-green-600 hover:bg-green-700">W</Badge>;
      case "Loss":
        return <Badge className="bg-red-600 hover:bg-red-700">L</Badge>;
      default:
        return (
          <Badge
            variant="outline"
            className="border-yellow-500 text-yellow-600"
          >
            Pending
          </Badge>
        );
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center space-x-3 mb-2">
          <Crown className="h-8 w-8 text-brand-purple" />
          <h1 className="text-3xl font-bold">Premium Picks</h1>
          <Badge className="bg-gradient-to-r from-brand-purple to-brand-blue">
            Premium
          </Badge>
        </div>
        <p className="text-muted-foreground">
          Advanced analytics, confidence ratings, and expert insights for our
          premium subscribers.
          {bankroll > 0 && (
            <span className="block mt-1">
              Current bankroll:{" "}
              <span className="font-semibold text-brand-blue">
                ${bankroll.toLocaleString()}
              </span>
            </span>
          )}
        </p>
      </div>

      {/* Premium Features Banner */}
      <Card className="mb-8 border-brand-purple/20 bg-gradient-to-r from-brand-purple/5 to-brand-blue/5">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <BarChart3 className="h-8 w-8 mx-auto mb-2 text-brand-purple" />
              <h3 className="font-semibold">Advanced Analytics</h3>
              <p className="text-sm text-muted-foreground">
                Detailed trends & insights
              </p>
            </div>
            <div className="text-center">
              <Target className="h-8 w-8 mx-auto mb-2 text-brand-blue" />
              <h3 className="font-semibold">Confidence Ratings</h3>
              <p className="text-sm text-muted-foreground">
                AI-powered percentages
              </p>
            </div>
            <div className="text-center">
              <DollarSign className="h-8 w-8 mx-auto mb-2 text-brand-cyan" />
              <h3 className="font-semibold">Stake Calculations</h3>
              <p className="text-sm text-muted-foreground">
                Bankroll management
              </p>
            </div>
            <div className="text-center">
              <TrendingUp className="h-8 w-8 mx-auto mb-2 text-green-500" />
              <h3 className="font-semibold">Alternative Lines</h3>
              <p className="text-sm text-muted-foreground">
                Multiple betting options
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Premium Picks Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {mockPremiumPicks.map((pick, index) => (
          <Card
            key={pick.id}
            className="group hover:shadow-lg transition-all duration-200 cursor-pointer border-brand-purple/20"
            onClick={() =>
              setExpandedPick(expandedPick === pick.id ? null : pick.id)
            }
          >
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <CardTitle className="text-lg flex items-center gap-3">
                    {pick.player}
                    <Badge variant="outline" className="text-xs">
                      {pick.sport}
                    </Badge>
                    {getResultBadge(pick.result)}
                  </CardTitle>
                  <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>{pick.gameShort}</span>
                    <span>•</span>
                    <span>{formatGameTime(pick.tipoff)}</span>
                  </div>
                </div>

                <div className="text-right space-y-1">
                  <div className="flex items-center space-x-1">
                    <Star className="h-4 w-4 text-yellow-500 fill-current" />
                    <span className="text-sm font-medium">
                      {pick.confidence}%
                    </span>
                  </div>
                  <Badge className="bg-gradient-to-r from-brand-purple to-brand-blue text-xs">
                    Premium
                  </Badge>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Pick Details */}
              <div className="flex items-center justify-center p-4 bg-gradient-to-r from-brand-purple/10 to-brand-blue/10 rounded-lg border border-brand-purple/20">
                <div className="text-center">
                  <div className="text-lg font-semibold">
                    {pick.propType} {pick.side} {pick.line}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {pick.odds} • {pick.sportsbook}
                  </div>
                </div>
              </div>

              {/* Confidence Bar */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Confidence</span>
                  <span className="font-medium">{pick.confidence}%</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-brand-purple to-brand-blue h-2 rounded-full transition-all duration-1000 ease-out"
                    style={{ width: `${pick.confidence}%` }}
                  />
                </div>
              </div>

              {/* Stake Calculation */}
              <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                <span className="text-sm font-medium">Recommended Stake</span>
                <div className="text-right">
                  <div className="font-semibold text-brand-blue">
                    {formatStake(pick.stakePercentage)}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {pick.stakePercentage}% of bankroll
                  </div>
                </div>
              </div>

              {/* Analysis */}
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {pick.analysis}
                </p>
              </div>

              {/* Advanced Analytics - Expandable */}
              {expandedPick === pick.id && (
                <div className="space-y-4 border-t border-border pt-4">
                  <h4 className="font-semibold flex items-center gap-2">
                    <BarChart3 className="h-4 w-4" />
                    Advanced Analytics
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                    <div>
                      <span className="text-muted-foreground">
                        Last 10 Trend:
                      </span>
                      <div className="font-medium">
                        {pick.advancedAnalytics.last10Trend}
                      </div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Matchup:</span>
                      <div className="font-medium">
                        {pick.advancedAnalytics.matchupRank}
                      </div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">
                        Pace/Minutes:
                      </span>
                      <div className="font-medium">
                        {pick.advancedAnalytics.pace}
                      </div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">
                        Defense Rank:
                      </span>
                      <div className="font-medium">
                        {pick.advancedAnalytics.defenseRank}
                      </div>
                    </div>
                  </div>

                  {/* Alternative Lines */}
                  <div>
                    <h5 className="font-medium mb-2">Alternative Lines</h5>
                    <div className="grid grid-cols-3 gap-2">
                      {pick.alternateLines.map((alt, idx) => (
                        <div
                          key={idx}
                          className="text-center p-2 bg-muted/30 rounded text-xs"
                        >
                          <div className="font-medium">
                            {pick.side} {alt.line}
                          </div>
                          <div className="text-muted-foreground">
                            {alt.odds}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Action Buttons */}
      <div className="mt-8 text-center space-y-4">
        <p className="text-muted-foreground">
          This is a preview of premium features. Full functionality requires
          authentication setup.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button variant="outline">Set Bankroll in Settings</Button>
          <Button className="bg-gradient-to-r from-brand-purple to-brand-blue hover:from-brand-purple/90 hover:to-brand-blue/90">
            View More Premium Picks
          </Button>
        </div>
      </div>
    </div>
  );
}
