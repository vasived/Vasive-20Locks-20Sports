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
  Clock,
  Calendar,
  Star,
  Zap,
} from "lucide-react";
import { Pick, PremiumPick } from "@shared/api";

interface Stats {
  todayGames: number;
  activePremiumPicks: number;
}

interface GameData {
  sport: string;
  count: number;
  nextGameTime?: string;
}

export default function Index() {
  const [selectedSport, setSelectedSport] = useState("nba");
  const [timeUntilTonightGames, setTimeUntilTonightGames] = useState("");
  const [freePicks, setFreePicks] = useState<Pick[]>([]);
  const [stats, setStats] = useState<Stats>({ todayGames: 0, activePremiumPicks: 0 });
  const [loading, setLoading] = useState(true);
  const [gamesData, setGamesData] = useState<GameData[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch both free and premium picks
        const [freeResponse, premiumResponse] = await Promise.all([
          fetch('/api/picks/free'),
          fetch('/api/picks/premium')
        ]);

        let freePicks: Pick[] = [];
        let premiumPicks: PremiumPick[] = [];

        if (freeResponse.ok) {
          const freeData = await freeResponse.json();
          freePicks = freeData.picks || [];
          setFreePicks(freePicks);
        }

        if (premiumResponse.ok) {
          const premiumData = await premiumResponse.json();
          premiumPicks = premiumData.picks || [];
        }

        // Create mock games data based on current time
        const today = new Date();
        const mockGamesData: GameData[] = [
          { sport: "NBA", count: 6, nextGameTime: new Date(today.getTime() + 2 * 60 * 60 * 1000).toISOString() },
          { sport: "MLB", count: 4, nextGameTime: new Date(today.getTime() + 3 * 60 * 60 * 1000).toISOString() },
          { sport: "NHL", count: 2, nextGameTime: new Date(today.getTime() + 4 * 60 * 60 * 1000).toISOString() },
        ];

        setGamesData(mockGamesData);

        // Calculate real stats
        const totalGames = mockGamesData.reduce((sum, game) => sum + game.count, 0);
        setStats({
          todayGames: totalGames,
          activePremiumPicks: premiumPicks.length,
        });

      } catch (error) {
        console.error('Error fetching data:', error);
        // Set fallback stats
        setStats({
          todayGames: 0,
          activePremiumPicks: 0,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    // Real countdown to next game
    const updateCountdown = () => {
      if (gamesData.length === 0) {
        setTimeUntilTonightGames("TBD");
        return;
      }

      const now = new Date();
      let nextGameTime: Date | null = null;

      // Find the earliest upcoming game
      for (const game of gamesData) {
        if (game.nextGameTime) {
          const gameTime = new Date(game.nextGameTime);
          if (gameTime > now && (!nextGameTime || gameTime < nextGameTime)) {
            nextGameTime = gameTime;
          }
        }
      }

      if (!nextGameTime) {
        // If no upcoming games today, set to 7 PM tomorrow
        const tomorrow = new Date(now);
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(19, 0, 0, 0);
        nextGameTime = tomorrow;
      }

      const diff = nextGameTime.getTime() - now.getTime();
      if (diff <= 0) {
        setTimeUntilTonightGames("Live");
        return;
      }

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

      if (hours > 24) {
        const days = Math.floor(hours / 24);
        setTimeUntilTonightGames(`${days}d ${hours % 24}h`);
      } else {
        setTimeUntilTonightGames(`${hours}h ${minutes}m`);
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 60000);

    return () => clearInterval(interval);
  }, [gamesData.length]);

  const activeSports = [
    { code: "nba", name: "NBA", active: true },
    { code: "mlb", name: "MLB", active: true },
    { code: "nhl", name: "NHL", active: true },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-background via-background to-muted/20">
        <div className="absolute inset-0 bg-[url('/api/placeholder/1920/1080')] bg-cover bg-center opacity-5" />
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/90 to-transparent" />

        <div className="relative container mx-auto px-4 py-16 lg:py-24">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Hero Content */}
            <div className="space-y-8 animate-fade-in">
              <div className="space-y-4">
                <Badge className="bg-gradient-to-r from-brand-blue to-brand-purple text-white">
                  <Zap className="w-3 h-3 mr-1" />
                  {stats.activePremiumPicks} Active PREMIUM Picks Today
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

              {/* Stats */}
              <div className="grid grid-cols-2 gap-6 pt-8 border-t border-border">
                <div className="text-center">
                  <div className="text-2xl font-bold text-brand-blue">
                    {stats.todayGames}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Games Today
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-brand-cyan">
                    {timeUntilTonightGames}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Until Games
                  </div>
                </div>
              </div>
            </div>

            {/* Hero Visual */}
            <div className="relative animate-slide-up">
              <div className="relative bg-gradient-to-br from-card to-muted/10 rounded-2xl p-8 border border-border/50 backdrop-blur-sm">
                <div className="absolute -inset-1 bg-gradient-to-br from-brand-blue/20 to-brand-purple/20 rounded-2xl blur opacity-60" />
                <div className="relative space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">Tonight's Slate</h3>
                    <Badge variant="secondary">
                      <Clock className="w-3 h-3 mr-1" />
                      Live
                    </Badge>
                  </div>

                  <div className="space-y-4">
                    {gamesData.length > 0 ? gamesData.map((sport) => (
                      <div
                        key={sport.sport.toLowerCase()}
                        className="flex items-center justify-between p-3 rounded-lg bg-muted/30"
                      >
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-blue to-brand-purple flex items-center justify-center text-white text-sm font-semibold">
                            {sport.sport.slice(0, 2)}
                          </div>
                          <span className="font-medium">{sport.sport}</span>
                        </div>
                        <Badge variant="outline">{sport.count} games</Badge>
                      </div>
                    )) : (
                      // Loading or fallback
                      [
                        { sport: "NBA", count: 0 },
                        { sport: "MLB", count: 0 },
                        { sport: "NHL", count: 0 },
                      ].map((sport) => (
                        <div
                          key={sport.sport.toLowerCase()}
                          className="flex items-center justify-between p-3 rounded-lg bg-muted/30"
                        >
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-blue to-brand-purple flex items-center justify-center text-white text-sm font-semibold">
                              {sport.sport.slice(0, 2)}
                            </div>
                            <span className="font-medium">{sport.sport}</span>
                          </div>
                          <Badge variant="outline">{sport.count} games</Badge>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Sport Switcher */}
      <section className="container mx-auto px-4 py-12">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8">
          <h2 className="text-2xl font-bold">Today's Free Picks</h2>

          {/* Sport Tabs */}
          <div className="flex items-center space-x-1 bg-muted rounded-lg p-1">
            {activeSports.map((sport) => (
              <button
                key={sport.code}
                onClick={() => setSelectedSport(sport.code)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                  selectedSport === sport.code
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {sport.name}
              </button>
            ))}
          </div>
        </div>

        {/* Free Picks Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {loading ? (
            // Loading skeleton
            Array.from({ length: 3 }).map((_, index) => (
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
            freePicks.slice(0, 3).map((pick, index) => (
              <Card
                key={pick.id}
                className="group hover:shadow-lg transition-all duration-200 animate-slide-up"
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
                        {pick.side} {pick.line} {pick.propType}
                      </div>
                    </div>
                  </div>

                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {pick.analysis}
                  </p>

                  <div className="flex items-center justify-between pt-2 border-t border-border">
                    <Badge variant="outline" className="text-xs">
                      Free Pick
                    </Badge>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-brand-blue hover:text-brand-blue/80"
                    >
                      View Details
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="col-span-3 text-center py-12">
              <p className="text-muted-foreground">No free picks available today.</p>
            </div>
          )}
        </div>

        {/* View All Free Picks */}
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
      </section>

      {/* Premium CTA Section */}
      <section className="bg-gradient-to-br from-muted/30 to-muted/10">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <div className="space-y-4">
              <h2 className="text-3xl lg:text-4xl font-bold">
                Ready for
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-brand-blue to-brand-purple">
                  Premium Analytics?
                </span>
              </h2>

              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Get advanced analytics, confidence ratings, bankroll management,
                and exclusive picks from our expert analysts.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-3xl mx-auto">
              <div className="text-center space-y-3">
                <div className="w-12 h-12 mx-auto bg-gradient-to-br from-brand-blue to-brand-purple rounded-lg flex items-center justify-center">
                  <Target className="h-6 w-6 text-white" />
                </div>
                <h3 className="font-semibold">Advanced Analytics</h3>
                <p className="text-sm text-muted-foreground">
                  In-depth player trends, matchup analysis, and predictive
                  modeling
                </p>
              </div>

              <div className="text-center space-y-3">
                <div className="w-12 h-12 mx-auto bg-gradient-to-br from-brand-purple to-brand-cyan rounded-lg flex items-center justify-center">
                  <TrendingUp className="h-6 w-6 text-white" />
                </div>
                <h3 className="font-semibold">Confidence Ratings</h3>
                <p className="text-sm text-muted-foreground">
                  AI-powered confidence percentages and optimal stake sizing
                </p>
              </div>

              <div className="text-center space-y-3">
                <div className="w-12 h-12 mx-auto bg-gradient-to-br from-brand-cyan to-brand-blue rounded-lg flex items-center justify-center">
                  <Users className="h-6 w-6 text-white" />
                </div>
                <h3 className="font-semibold">Expert Community</h3>
                <p className="text-sm text-muted-foreground">
                  Access to premium Discord and expert analyst insights
                </p>
              </div>
            </div>

            <Button
              size="lg"
              className="bg-gradient-to-r from-brand-blue to-brand-purple hover:from-brand-blue/90 hover:to-brand-purple/90 text-white shadow-lg"
            >
              Upgrade to Premium
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
