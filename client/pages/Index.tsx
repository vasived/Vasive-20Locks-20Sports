import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  TrendingUp,
  Users,
  Target,
  ArrowRight,
  Star,
  Zap,
  Lock,
  Shield,
  Calendar,
  Crown,
  ExternalLink,
  BarChart3,
  DollarSign,
} from "lucide-react";
import { Pick, PremiumPick } from "@shared/api";

export default function Index() {
  const [freePicks, setFreePicks] = useState<Pick[]>([]);
  const [premiumPicks, setPremiumPicks] = useState<PremiumPick[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch both free and premium picks for preview
        const [freeResponse, premiumResponse] = await Promise.all([
          fetch("/api/picks/free"),
          fetch("/api/picks/premium"),
        ]);

        if (freeResponse.ok) {
          const freeData = await freeResponse.json();
          setFreePicks(freeData.picks || []);
        }

        if (premiumResponse.ok) {
          const premiumData = await premiumResponse.json();
          setPremiumPicks(premiumData.picks || []);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const activePremiumPicks = premiumPicks.filter(
    (pick) => pick.result === "Pending",
  ).length;

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-background via-background to-muted/20">
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/90 to-transparent" />

        <div className="relative container mx-auto px-4 py-16 lg:py-24">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Hero Content */}
            <div className="space-y-8 animate-fade-in">
              <div className="space-y-4">
                <Badge className="bg-gradient-to-r from-brand-blue to-brand-purple text-white">
                  <Zap className="w-3 h-3 mr-1" />
                  {activePremiumPicks} Active Premium Picks
                </Badge>

                <h1 className="text-4xl lg:text-6xl font-bold tracking-tight">
                  Premium Sports
                  <span className="block text-transparent bg-clip-text bg-gradient-to-r from-brand-blue to-brand-purple">
                    Betting Picks
                  </span>
                </h1>

                <p className="text-xl text-muted-foreground max-w-md">
                  Get expert sports betting picks with advanced analytics and
                  confidence ratings from our professional analysts.
                </p>
              </div>

              {/* CTAs */}
              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-brand-blue to-brand-purple hover:from-brand-blue/90 hover:to-brand-purple/90 text-white shadow-lg"
                  asChild
                >
                  <Link to="/premium-picks">
                    Get Premium Access
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>

                <Button
                  size="lg"
                  variant="outline"
                  className="border-brand-blue text-brand-blue hover:bg-brand-blue hover:text-white"
                  asChild
                >
                  <Link to="/free-picks">View Free Picks</Link>
                </Button>
              </div>
            </div>

            {/* Hero Visual - How It Works Preview */}
            <div className="relative animate-slide-up">
              <div className="relative bg-gradient-to-br from-card to-muted/10 rounded-2xl p-8 border border-border/50 backdrop-blur-sm">
                <div className="absolute -inset-1 bg-gradient-to-br from-brand-blue/20 to-brand-purple/20 rounded-2xl blur opacity-60" />
                <div className="relative space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">How It Works</h3>
                    <Badge variant="secondary">
                      <Star className="w-3 h-3 mr-1" />
                      Expert Picks
                    </Badge>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center text-white text-sm font-semibold">
                          1
                        </div>
                        <span className="font-medium">Free Picks</span>
                      </div>
                      <Badge variant="outline">No Cost</Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-blue to-brand-purple flex items-center justify-center text-white text-sm font-semibold">
                          2
                        </div>
                        <span className="font-medium">Premium Analytics</span>
                      </div>
                      <Badge className="bg-gradient-to-r from-brand-purple to-brand-blue">
                        Premium
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center text-white text-sm font-semibold">
                          3
                        </div>
                        <span className="font-medium">Real-Time Updates</span>
                      </div>
                      <Badge variant="outline" className="bg-cyan-50 text-cyan-700 border-cyan-200">Live</Badge>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Free Picks Spotlight */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Free Picks Spotlight</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Get a taste of our expert analysis with these complimentary picks.
            No signup required.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {loading ? (
            // Loading skeleton
            Array.from({ length: 6 }).map((_, index) => (
              <Card key={index} className="animate-pulse">
                <CardHeader className="pb-3">
                  <div className="h-6 bg-muted rounded w-3/4"></div>
                  <div className="h-4 bg-muted rounded w-1/2"></div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="h-16 bg-muted rounded"></div>
                  <div className="h-12 bg-muted rounded"></div>
                </CardContent>
              </Card>
            ))
          ) : freePicks.length > 0 ? (
            freePicks.slice(0, 6).map((pick, index) => (
              <Card
              key={pick.id}
              className="group hover:shadow-xl transition-all duration-300 hover:scale-[1.02] animate-slide-up backdrop-blur-sm border-border/50"
              style={{ animationDelay: `${index * 100}ms` }}
            >
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{pick.player}</CardTitle>
                    <div className="flex items-center space-x-1">
                      <Star className="h-4 w-4 text-yellow-500 fill-current" />
                      <span className="text-sm font-medium">
                        {pick.confidence}%
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>{pick.game}</span>
                    <span>•</span>
                    <span>{pick.tipoff}</span>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  <div className="flex items-center justify-center p-4 bg-muted/30 rounded-lg">
                    <div className="text-center">
                      <div className="text-lg font-semibold">
                        {pick.propType} {pick.side} {pick.line}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {pick.odds || "-110"} • {pick.sportsbook || "Various"}
                      </div>
                    </div>
                  </div>

                  <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">
                    {pick.analysis}
                  </p>

                  <div className="flex items-center justify-between pt-2 border-t border-border">
                    <Badge variant="outline" className="text-xs">
                      Free Pick
                    </Badge>
                    <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                      <span>Confidence:</span>
                      <div className="w-16 bg-muted rounded-full h-1.5">
                        <div
                          className="bg-gradient-to-r from-green-500 to-green-600 h-1.5 rounded-full"
                          style={{ width: `${pick.confidence}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="col-span-3 text-center py-12">
              <TrendingUp className="h-16 w-16 mx-auto mb-4 text-muted-foreground/50" />
              <h3 className="text-lg font-semibold mb-2">
                No Free Picks Available
              </h3>
              <p className="text-muted-foreground">
                Check back soon for new free picks from our analysts.
              </p>
            </div>
          )}
        </div>

        {freePicks.length > 0 && (
          <div className="text-center">
            <Button
              variant="outline"
              size="lg"
              className="border-brand-blue text-brand-blue hover:bg-brand-blue hover:text-white"
              asChild
            >
              <Link to="/free-picks">
                View All Free Picks
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        )}
      </section>

      {/* Premium Teaser */}
      <section className="bg-gradient-to-br from-muted/30 to-muted/10">
        <div className="container mx-auto px-4 py-16">
          <div className="text-center mb-12">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <Crown className="h-8 w-8 text-brand-purple" />
              <h2 className="text-3xl font-bold">Premium Experience</h2>
            </div>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Unlock advanced analytics, confidence ratings, and expert insights
              with our premium picks.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Premium Picks Preview */}
            <div className="space-y-4">
              {premiumPicks.slice(0, 2).map((pick, index) => (
                <Card
                  key={pick.id}
                  className="relative overflow-hidden border-brand-purple/20"
                >
                  {/* Blur overlay */}
                  <div className="absolute inset-0 backdrop-blur-sm bg-background/30 z-10 flex items-center justify-center">
                    <div className="text-center space-y-3">
                      <Lock className="h-8 w-8 mx-auto text-brand-purple" />
                      <div className="space-y-1">
                        <p className="font-semibold">Premium Pick</p>
                        <p className="text-sm text-muted-foreground">
                          {pick.confidence}% Confidence
                        </p>
                      </div>
                    </div>
                  </div>

                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{pick.player}</CardTitle>
                      <Badge className="bg-gradient-to-r from-brand-purple to-brand-blue">
                        Premium
                      </Badge>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    <div className="p-4 bg-gradient-to-r from-brand-purple/10 to-brand-blue/10 rounded-lg">
                      <div className="text-center">
                        <div className="text-lg font-semibold">
                          {pick.propType} {pick.side} {pick.line}
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Advanced Analytics</span>
                        <span>Available</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Stake Calculation</span>
                        <span>{(pick.stakePercent * 100).toFixed(1)}%</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Premium Features */}
            <div className="space-y-6">
              <Card className="border-brand-purple/20 bg-gradient-to-br from-brand-purple/5 to-brand-blue/5">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-brand-purple" />
                    Advanced Analytics
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    In-depth player trends, matchup analysis, and predictive
                    modeling for every premium pick.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-brand-blue/20 bg-gradient-to-br from-brand-blue/5 to-brand-cyan/5">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5 text-brand-blue" />
                    Confidence Ratings
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    AI-powered confidence percentages and optimal stake sizing
                    for bankroll management.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-green-500/20 bg-gradient-to-br from-green-500/5 to-green-600/5">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5 text-green-500" />
                    Bankroll Management
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Automatic stake calculations based on your bankroll and our
                    confidence ratings.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>

          <div className="text-center mt-12">
            <Button
              size="lg"
              className="bg-gradient-to-r from-brand-purple to-brand-blue hover:from-brand-purple/90 hover:to-brand-blue/90 text-white shadow-lg"
              asChild
            >
              <Link to="/premium-picks">
                Unlock Premium Picks
                <Crown className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">How Vasive Locks Works</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Our three-tier system ensures you get reliable picks backed by data
            and expert analysis.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Card className="text-center hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="w-16 h-16 mx-auto bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center mb-4">
                <TrendingUp className="h-8 w-8 text-white" />
              </div>
              <CardTitle>Free Picks</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Access quality picks with basic analysis at no cost. Perfect for
                getting started with our platform.
              </p>
            </CardContent>
          </Card>

          <Card className="text-center hover:shadow-lg transition-shadow border-brand-purple/20">
            <CardHeader>
              <div className="w-16 h-16 mx-auto bg-gradient-to-br from-brand-purple to-brand-blue rounded-full flex items-center justify-center mb-4">
                <Crown className="h-8 w-8 text-white" />
              </div>
              <CardTitle className="flex items-center justify-center gap-2">
                Premium Picks
                <Badge className="bg-gradient-to-r from-brand-purple to-brand-blue text-xs">
                  Popular
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Advanced analytics, confidence ratings, and bankroll management
                tools for serious bettors.
              </p>
            </CardContent>
          </Card>

          <Card className="text-center hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="w-16 h-16 mx-auto bg-gradient-to-br from-orange-500 to-red-500 rounded-full flex items-center justify-center mb-4">
                <Shield className="h-8 w-8 text-white" />
              </div>
              <CardTitle>Admin-Backed Data</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                All picks are verified and managed by our expert analysts,
                ensuring quality and consistency.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Discord Invite */}
      <section className="bg-gradient-to-r from-brand-purple/10 to-brand-blue/10 border-y border-brand-purple/20">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-3xl mx-auto text-center">
            <div className="space-y-6">
              <div className="flex items-center justify-center space-x-3">
                <Users className="h-12 w-12 text-brand-purple" />
                <h2 className="text-3xl font-bold">Join Our Community</h2>
              </div>

              <p className="text-xl text-muted-foreground">
                Connect with fellow bettors and get premium access by joining
                our Discord community.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 my-8">
                <div className="text-center space-y-2">
                  <div className="text-2xl font-bold text-brand-blue">500+</div>
                  <div className="text-sm text-muted-foreground">
                    Community Members
                  </div>
                </div>
                <div className="text-center space-y-2">
                  <div className="text-2xl font-bold text-brand-purple">24/7</div>
                  <div className="text-sm text-muted-foreground">
                    Expert Support
                  </div>
                </div>
                <div className="text-center space-y-2">
                  <div className="text-2xl font-bold text-brand-cyan">Live</div>
                  <div className="text-sm text-muted-foreground">
                    Real-time Updates
                  </div>
                </div>
              </div>

              <Button
                size="lg"
                className="bg-gradient-to-r from-brand-purple to-brand-blue hover:from-brand-purple/90 hover:to-brand-blue/90 text-white shadow-lg"
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

              <p className="text-sm text-muted-foreground">
                Free to join • Premium roles available • Expert analysts active daily
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
