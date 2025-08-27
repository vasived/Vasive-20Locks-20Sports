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

// Helper function to format game time
function formatGameTime(tipoffTime: string) {
  if (!tipoffTime || tipoffTime === "TBD") return "TBD";
  try {
    const date = new Date(tipoffTime);
    return (
      date.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        timeZone: "America/New_York",
      }) + " EST"
    );
  } catch {
    return tipoffTime;
  }
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

export default function PremiumPicks() {
  const { isSignedIn, user } = useUser();
  const [expandedPick, setExpandedPick] = useState<string | null>(null);
  const [premiumPicks, setPremiumPicks] = useState<PremiumPick[]>([]);
  const [loading, setLoading] = useState(true);

  const isPremium = isSignedIn && isPremiumUser(user);
  const bankroll = parseFloat(
    (user?.privateMetadata?.bankroll || user?.unsafeMetadata?.bankroll) as string
  ) || 0;

  useEffect(() => {
    const fetchPremiumPicks = async () => {
      if (!isPremium) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await fetch("/api/picks/premium");
        if (response.ok) {
          const data = await response.json();
          setPremiumPicks(data.picks || []);
        }
      } catch (error) {
        console.error("Error fetching premium picks:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPremiumPicks();
  }, [isPremium]);

  function formatStake(stakePercent: number): string {
    if (bankroll <= 0) return `${stakePercent}%`;
    const amount = (bankroll * stakePercent) / 100;
    return `$${amount.toFixed(2)}`;
  }

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
        return (
          <Badge className="bg-gradient-to-r from-green-500 to-green-600 text-white border-0 font-semibold shadow-lg">
            ✓ WIN
          </Badge>
        );
      case "Loss":
        return (
          <Badge className="bg-gradient-to-r from-red-500 to-red-600 text-white border-0 font-semibold">
            ✗ LOSS
          </Badge>
        );
      default:
        return (
          <Badge
            variant="outline"
            className="border-yellow-500 text-yellow-600 bg-yellow-50"
          >
            ⏳ PENDING
          </Badge>
        );
    }
  }

  // If user is not premium, show Discord invitation
  if (!isPremium) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto text-center">
          {/* Premium Locked Header */}
          <div className="mb-8">
            <div className="flex items-center justify-center space-x-3 mb-4">
              <Lock className="h-12 w-12 text-brand-purple" />
              <Crown className="h-12 w-12 text-brand-blue" />
            </div>
            <h1 className="text-4xl font-bold mb-2">Premium Picks</h1>
            <Badge className="bg-gradient-to-r from-brand-purple to-brand-blue text-lg px-4 py-2">
              <Lock className="h-4 w-4 mr-2" />
              Premium Access Required
            </Badge>
          </div>

          {/* Discord Invitation Card */}
          <Card className="border-2 border-brand-purple/20 bg-gradient-to-br from-brand-purple/5 to-brand-blue/5 shadow-2xl">
            <CardHeader className="pb-6">
              <div className="flex items-center justify-center mb-4">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-brand-purple to-brand-blue flex items-center justify-center">
                  <Users className="h-8 w-8 text-white" />
                </div>
              </div>
              <CardTitle className="text-2xl">
                Join Our Premium Discord Community
              </CardTitle>
              <p className="text-muted-foreground text-lg">
                Get exclusive access to premium picks, advanced analytics, and
                real-time discussions with our expert analysts.
              </p>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Premium Features Preview */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="text-center p-4 bg-background/50 rounded-lg">
                  <BarChart3 className="h-8 w-8 mx-auto mb-2 text-brand-purple" />
                  <h3 className="font-semibold">Advanced Analytics</h3>
                  <p className="text-sm text-muted-foreground">
                    Detailed trends, matchup data, and predictive modeling
                  </p>
                </div>
                <div className="text-center p-4 bg-background/50 rounded-lg">
                  <Target className="h-8 w-8 mx-auto mb-2 text-brand-blue" />
                  <h3 className="font-semibold">Confidence Ratings</h3>
                  <p className="text-sm text-muted-foreground">
                    AI-powered confidence percentages for every pick
                  </p>
                </div>
                <div className="text-center p-4 bg-background/50 rounded-lg">
                  <DollarSign className="h-8 w-8 mx-auto mb-2 text-brand-cyan" />
                  <h3 className="font-semibold">Bankroll Management</h3>
                  <p className="text-sm text-muted-foreground">
                    Optimal stake sizing and risk management
                  </p>
                </div>
                <div className="text-center p-4 bg-background/50 rounded-lg">
                  <Zap className="h-8 w-8 mx-auto mb-2 text-green-500" />
                  <h3 className="font-semibold">Real-time Updates</h3>
                  <p className="text-sm text-muted-foreground">
                    Live picks, line movements, and injury reports
                  </p>
                </div>
              </div>

              {/* Discord CTA */}
              <div className="space-y-4">
                <h3 className="text-xl font-semibold">
                  Ready to become premium?
                </h3>
                <p className="text-muted-foreground">
                  Join our Discord community to unlock premium picks and connect
                  with fellow bettors and analysts.
                </p>
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-brand-purple to-brand-blue hover:from-brand-purple/90 hover:to-brand-blue/90 text-white shadow-lg w-full sm:w-auto"
                  asChild
                >
                  <a
                    href="https://discord.gg/V7Yg3BhrFU"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center"
                  >
                    <Users className="mr-2 h-5 w-5" />
                    Join the Discord to Become Premium
                    <ExternalLink className="ml-2 h-4 w-4" />
                  </a>
                </Button>
              </div>

              {/* Additional Info */}
              <div className="pt-4 border-t border-border">
                <p className="text-sm text-muted-foreground">
                  Already have premium access?{" "}
                  {!isSignedIn ? (
                    <span>Sign in to view your premium picks.</span>
                  ) : (
                    <span>
                      Contact support if you believe this is an error.
                    </span>
                  )}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
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
        {loading ? (
          // Loading skeleton
          Array.from({ length: 4 }).map((_, index) => (
            <Card key={index} className="animate-pulse border-brand-purple/20 backdrop-blur-sm">
              <CardHeader className="pb-3">
                <div className="h-6 animate-shimmer rounded w-3/4"></div>
                <div className="h-4 animate-shimmer rounded w-1/2 mt-2"></div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="h-16 animate-shimmer rounded"></div>
                <div className="h-8 animate-shimmer rounded"></div>
                <div className="h-12 animate-shimmer rounded"></div>
              </CardContent>
            </Card>
          ))
        ) : premiumPicks.length > 0 ? (
          premiumPicks.map((pick, index) => (
            <Card
              key={pick.id}
              className="group hover:shadow-xl transition-all duration-300 hover:scale-[1.01] cursor-pointer border-brand-purple/20 hover:border-brand-purple/40 backdrop-blur-sm"
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
                        {pick.sport || "NBA"}
                      </Badge>
                      {getResultBadge(pick.result)}
                    </CardTitle>
                    <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      <span>{pick.game}</span>
                    </div>
                  </div>

                  <div className="text-right space-y-1">
                    <div className="flex items-center space-x-1">
                      <Star className="h-4 w-4 text-yellow-500 fill-current" />
                      <span className="text-sm font-medium">
                        {pick.confidence}%
                      </span>
                    </div>
                    <Badge className="bg-gradient-to-r from-brand-purple to-brand-blue text-white border-0 text-xs">
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
                      {pick.odds || "-110"} • {pick.sportsbook || "Various"}
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
                      {formatStake(pick.stakePercent * 100)}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {(pick.stakePercent * 100).toFixed(1)}% of bankroll
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
                {expandedPick === pick.id && pick.analytics && (
                  <div className="space-y-4 border-t border-border pt-4">
                    <h4 className="font-semibold flex items-center gap-2">
                      <BarChart3 className="h-4 w-4" />
                      Advanced Analytics
                    </h4>
                    <div className="text-sm text-muted-foreground leading-relaxed">
                      {pick.analytics}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="col-span-2 text-center py-12">
            <Crown className="h-16 w-16 mx-auto mb-4 text-muted-foreground/50" />
            <h3 className="text-lg font-semibold mb-2">
              No Premium Picks Available
            </h3>
            <p className="text-muted-foreground">
              Check back soon for new premium picks from our analysts.
            </p>
          </div>
        )}
      </div>

    </div>
  );
}
