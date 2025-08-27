import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  Filter,
  Search,
  Calendar,
  Star,
  TrendingUp,
  Clock,
  ChevronDown,
  Eye
} from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// Mock data - replace with actual API calls
const mockFreePicks = [
  {
    id: "1",
    player: "Stephen Curry",
    propType: "Points",
    line: 27.5,
    side: "Over",
    game: "Golden State Warriors @ Los Angeles Lakers",
    gameShort: "GSW @ LAL",
    tipoff: "2024-01-15T22:30:00-05:00",
    sport: "NBA",
    analysis: "Curry has hit the over in 7 of his last 10 games against the Lakers. He's averaging 31.2 points in this matchup this season with a usage rate of 34.8% when Draymond is out.",
    confidence: 75,
    venue: "Crypto.com Arena",
    created: "2024-01-15T10:00:00-05:00",
  },
  {
    id: "2",
    player: "Giannis Antetokounmpo",
    propType: "Rebounds",
    line: 11.5,
    side: "Over",
    game: "Milwaukee Bucks @ Boston Celtics",
    gameShort: "MIL @ BOS",
    tipoff: "2024-01-15T20:00:00-05:00",
    sport: "NBA",
    analysis: "Giannis has been dominant on the boards lately, recording 12+ rebounds in 6 straight games. Boston allows the 8th most rebounds to PFs this season, and Giannis has averaged 13.2 rebounds in 4 games vs BOS.",
    confidence: 82,
    venue: "TD Garden",
    created: "2024-01-15T09:30:00-05:00",
  },
  {
    id: "3",
    player: "Ronald Acuña Jr.",
    propType: "Hits",
    line: 1.5,
    side: "Over",
    game: "Atlanta Braves vs New York Mets",
    gameShort: "ATL vs NYM",
    tipoff: "2024-01-15T19:15:00-05:00",
    sport: "MLB",
    analysis: "Acuña is hitting .347 over his last 15 games and has excellent numbers against tonight's starting pitcher historically. He's 8-for-18 (.444) lifetime vs Quintana with 2 HRs.",
    confidence: 68,
    venue: "Truist Park",
    created: "2024-01-15T08:45:00-05:00",
  },
  {
    id: "4",
    player: "Connor McDavid",
    propType: "Assists",
    line: 1.5,
    side: "Over",
    game: "Edmonton Oilers @ Calgary Flames",
    gameShort: "EDM @ CGY",
    tipoff: "2024-01-15T21:00:00-05:00",
    sport: "NHL",
    analysis: "McDavid has recorded 2+ assists in 8 of his last 10 games and historically performs well in rivalry games against Calgary. The Flames allow the 3rd most assists to centers.",
    confidence: 71,
    venue: "Scotiabank Saddledome",
    created: "2024-01-15T11:15:00-05:00",
  },
  {
    id: "5",
    player: "Jayson Tatum",
    propType: "PRA",
    line: 42.5,
    side: "Over",
    game: "Boston Celtics vs Milwaukee Bucks",
    gameShort: "BOS vs MIL",
    tipoff: "2024-01-15T20:00:00-05:00",
    sport: "NBA",
    analysis: "Tatum has averaged 44.8 PRA in his last 8 games, with the Bucks allowing high-scoring games. Milwaukee ranks 18th in defensive efficiency, and Tatum thrives in nationally televised games.",
    confidence: 79,
    venue: "TD Garden",
    created: "2024-01-15T12:00:00-05:00",
  },
  {
    id: "6",
    player: "Mike Trout",
    propType: "Total Bases",
    line: 1.5,
    side: "Over",
    game: "Los Angeles Angels @ Seattle Mariners",
    gameShort: "LAA @ SEA",
    tipoff: "2024-01-15T22:10:00-05:00",
    sport: "MLB",
    analysis: "Trout has recorded 2+ total bases in 12 of his last 16 games. He has a strong track record against tonight's starter with a .385 avg and .892 OPS in 26 career at-bats.",
    confidence: 74,
    venue: "T-Mobile Park",
    created: "2024-01-15T10:30:00-05:00",
  },
];

const sports = ["All Sports", "NBA", "MLB", "NHL"];
const sortOptions = [
  { value: "confidence", label: "Confidence (High to Low)" },
  { value: "tipoff", label: "Game Time (Earliest)" },
  { value: "created", label: "Recently Added" },
  { value: "player", label: "Player Name (A-Z)" },
];

function formatGameTime(tipoffTime: string) {
  const date = new Date(tipoffTime);
  const now = new Date();
  const isToday = date.toDateString() === now.toDateString();
  
  if (isToday) {
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      timeZone: 'America/New_York' 
    }) + ' EST';
  }
  
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    timeZone: 'America/New_York'
  }) + ' EST';
}

function getTimeUntilGame(tipoffTime: string) {
  const now = new Date();
  const gameTime = new Date(tipoffTime);
  const diffMs = gameTime.getTime() - now.getTime();
  
  if (diffMs <= 0) return "Live";
  
  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
  
  if (hours > 24) {
    const days = Math.floor(hours / 24);
    return `${days}d ${hours % 24}h`;
  }
  
  return `${hours}h ${minutes}m`;
}

export default function FreePicks() {
  const [selectedSport, setSelectedSport] = useState("All Sports");
  const [sortBy, setSortBy] = useState("confidence");
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedPick, setExpandedPick] = useState<string | null>(null);

  const filteredAndSortedPicks = useMemo(() => {
    let filtered = mockFreePicks;

    // Filter by sport
    if (selectedSport !== "All Sports") {
      filtered = filtered.filter(pick => pick.sport === selectedSport);
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(pick => 
        pick.player.toLowerCase().includes(query) ||
        pick.game.toLowerCase().includes(query) ||
        pick.propType.toLowerCase().includes(query)
      );
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "confidence":
          return b.confidence - a.confidence;
        case "tipoff":
          return new Date(a.tipoff).getTime() - new Date(b.tipoff).getTime();
        case "created":
          return new Date(b.created).getTime() - new Date(a.created).getTime();
        case "player":
          return a.player.localeCompare(b.player);
        default:
          return 0;
      }
    });

    return filtered;
  }, [selectedSport, sortBy, searchQuery]);

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Free Picks</h1>
        <p className="text-muted-foreground">
          Discover winning opportunities with our expert free picks. 
          Upgrade to Premium for advanced analytics and exclusive content.
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col lg:flex-row gap-4 mb-8 p-4 bg-card rounded-lg border">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by player, game, or prop type..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Sport Filter */}
        <Select value={selectedSport} onValueChange={setSelectedSport}>
          <SelectTrigger className="w-full lg:w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {sports.map((sport) => (
              <SelectItem key={sport} value={sport}>
                {sport}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Sort */}
        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-full lg:w-52">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {sortOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Results Count */}
      <div className="flex items-center justify-between mb-6">
        <p className="text-sm text-muted-foreground">
          Showing {filteredAndSortedPicks.length} free pick{filteredAndSortedPicks.length !== 1 ? 's' : ''}
        </p>
        
        <Button variant="outline" size="sm" className="hidden lg:flex">
          <Filter className="h-4 w-4 mr-2" />
          More Filters
        </Button>
      </div>

      {/* Picks Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {filteredAndSortedPicks.map((pick, index) => (
          <Card 
            key={pick.id} 
            className="group hover:shadow-lg transition-all duration-200 animate-slide-up cursor-pointer" 
            style={{ animationDelay: `${index * 50}ms` }}
            onClick={() => setExpandedPick(expandedPick === pick.id ? null : pick.id)}
          >
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <CardTitle className="text-lg flex items-center gap-2">
                    {pick.player}
                    <Badge variant="outline" className="text-xs">
                      {pick.sport}
                    </Badge>
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
                    <span className="text-sm font-medium">{pick.confidence}%</span>
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    <Clock className="h-3 w-3 mr-1" />
                    {getTimeUntilGame(pick.tipoff)}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              {/* Pick Details */}
              <div className="flex items-center justify-center p-4 bg-gradient-to-r from-brand-blue/10 to-brand-purple/10 rounded-lg border border-brand-blue/20">
                <div className="text-center">
                  <div className="text-lg font-semibold">
                    {pick.propType} {pick.side} {pick.line}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {pick.side} {pick.line} {pick.propType}
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
                    className="bg-gradient-to-r from-brand-blue to-brand-purple h-2 rounded-full transition-all duration-1000 ease-out"
                    style={{ 
                      width: `${pick.confidence}%`,
                      '--confidence-width': `${pick.confidence}%`
                    } as React.CSSProperties}
                  />
                </div>
              </div>
              
              {/* Analysis */}
              <div className={`space-y-2 transition-all duration-200 ${
                expandedPick === pick.id ? 'block' : 'hidden lg:block'
              }`}>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {pick.analysis}
                </p>
                
                {expandedPick === pick.id && (
                  <div className="pt-2 border-t border-border">
                    <div className="text-xs text-muted-foreground space-y-1">
                      <div>Venue: {pick.venue}</div>
                      <div>Added: {new Date(pick.created).toLocaleDateString()}</div>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="flex items-center justify-between pt-2 border-t border-border">
                <Badge variant="outline" className="text-xs bg-gradient-to-r from-green-500/10 to-green-600/10 border-green-500/20">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  Free Pick
                </Badge>
                
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-brand-blue hover:text-brand-blue/80 lg:hidden"
                >
                  <Eye className="h-4 w-4 mr-1" />
                  {expandedPick === pick.id ? 'Less' : 'More'}
                  <ChevronDown className={`h-3 w-3 ml-1 transition-transform ${
                    expandedPick === pick.id ? 'rotate-180' : ''
                  }`} />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* No Results */}
      {filteredAndSortedPicks.length === 0 && (
        <div className="text-center py-12">
          <div className="w-16 h-16 mx-auto mb-4 bg-muted rounded-full flex items-center justify-center">
            <Search className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold mb-2">No picks found</h3>
          <p className="text-muted-foreground mb-4">
            Try adjusting your filters or search terms.
          </p>
          <Button 
            variant="outline" 
            onClick={() => {
              setSearchQuery("");
              setSelectedSport("All Sports");
            }}
          >
            Clear Filters
          </Button>
        </div>
      )}

      {/* Premium CTA */}
      <div className="bg-gradient-to-br from-card to-muted/10 rounded-lg p-8 border border-border/50">
        <div className="text-center space-y-4">
          <h3 className="text-xl font-semibold">Want More Winning Picks?</h3>
          <p className="text-muted-foreground">
            Upgrade to Premium for advanced analytics, higher confidence picks, 
            bankroll management, and exclusive expert insights.
          </p>
          <Button 
            size="lg"
            className="bg-gradient-to-r from-brand-blue to-brand-purple hover:from-brand-blue/90 hover:to-brand-purple/90 text-white"
          >
            Upgrade to Premium
          </Button>
        </div>
      </div>
    </div>
  );
}
