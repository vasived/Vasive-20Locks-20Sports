import { useState, useEffect } from "react";
import { useUser } from "@clerk/clerk-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import {
  Shield,
  Plus,
  Edit,
  Trash2,
  Search,
  Filter,
  Calendar,
  TrendingUp,
  Star,
  DollarSign,
  CheckCircle,
  X,
  AlertCircle,
  Save,
  BarChart3,
} from "lucide-react";
import { Pick, PremiumPick, CreatePickRequest } from "@shared/api";

// Helper function to check user roles
function hasRole(user: any, role: string): boolean {
  return (
    user?.publicMetadata?.role === role ||
    user?.publicMetadata?.roles?.includes(role) ||
    false
  );
}

interface ExtendedPick extends Pick {
  result?: "Pending" | "Win" | "Loss";
  stakePercent?: number;
  analytics?: string;
}

export default function Admin() {
  const { isSignedIn, user } = useUser();
  const [picks, setPicks] = useState<ExtendedPick[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterTier, setFilterTier] = useState<"all" | "free" | "premium">(
    "all",
  );
  const [filterResult, setFilterResult] = useState<
    "all" | "Pending" | "Win" | "Loss"
  >("all");
  const [editingPick, setEditingPick] = useState<ExtendedPick | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [updatingPicks, setUpdatingPicks] = useState<Set<string>>(new Set());

  // Form state for create/edit
  const [formData, setFormData] = useState<Partial<CreatePickRequest>>({
    sportCode: "NBA",
    tier: "free",
    player: "",
    propType: "",
    propLine: 0,
    side: "Over",
    analysisShort: "",
    analysisLong: "",
    confidencePct: 50,
    stakePct: 0.02,
    odds: "-110",
    sportsbook: "DraftKings",
  });

  const isAdmin = isSignedIn && hasRole(user, "admin");

  useEffect(() => {
    if (isAdmin) {
      fetchPicks();
    }
  }, [isAdmin]);

  const fetchPicks = async () => {
    try {
      setLoading(true);
      const [freeResponse, premiumResponse] = await Promise.all([
        fetch("/api/picks/free"),
        fetch("/api/picks/premium"),
      ]);

      const freeData = freeResponse.ok
        ? await freeResponse.json()
        : { picks: [] };
      const premiumData = premiumResponse.ok
        ? await premiumResponse.json()
        : { picks: [] };

      const allPicks = [
        ...freeData.picks.map((p: Pick) => ({ ...p, tier: "free" })),
        ...premiumData.picks.map((p: PremiumPick) => ({
          ...p,
          tier: "premium",
        })),
      ];

      setPicks(allPicks);
    } catch (error) {
      console.error("Error fetching picks:", error);
      setMessage({ type: "error", text: "Failed to fetch picks" });
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePick = async () => {
    if (!formData.player || !formData.propType || !formData.analysisShort) {
      setMessage({ type: "error", text: "Please fill in all required fields" });
      return;
    }

    try {
      const createData: CreatePickRequest = {
        ...(formData as CreatePickRequest),
        createdByUserId: user!.id,
      };

      const response = await fetch("/api/picks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(createData),
      });

      if (response.ok) {
        setMessage({ type: "success", text: "Pick created successfully!" });
        setIsCreateModalOpen(false);
        resetForm();
        fetchPicks();
      } else {
        throw new Error("Failed to create pick");
      }
    } catch (error) {
      console.error("Error creating pick:", error);
      setMessage({ type: "error", text: "Failed to create pick" });
    }
  };

  const handleUpdatePick = async (
    pickId: string,
    updates: Partial<ExtendedPick>,
  ) => {
    try {
      // Add to updating set
      setUpdatingPicks((prev) => new Set(prev).add(pickId));

      console.log("Updating pick with:", { pickId, updates });
      const response = await fetch(`/api/picks/${pickId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });

      const responseData = await response.json();
      console.log("Update response:", responseData);

      if (response.ok) {
        setMessage({ type: "success", text: "Pick updated successfully!" });
        // Clear message after 3 seconds
        setTimeout(() => setMessage(null), 3000);
        fetchPicks();
      } else {
        throw new Error(responseData.error || "Failed to update pick");
      }
    } catch (error) {
      console.error("Error updating pick:", error);
      setMessage({
        type: "error",
        text: `Failed to update pick: ${error instanceof Error ? error.message : "Unknown error"}`,
      });
      // Clear message after 5 seconds
      setTimeout(() => setMessage(null), 5000);
    } finally {
      // Remove from updating set
      setUpdatingPicks((prev) => {
        const newSet = new Set(prev);
        newSet.delete(pickId);
        return newSet;
      });
    }
  };

  const handleDeletePick = async (pickId: string) => {
    if (!confirm("Are you sure you want to delete this pick?")) return;

    try {
      const response = await fetch(`/api/picks/${pickId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setMessage({ type: "success", text: "Pick deleted successfully!" });
        fetchPicks();
      } else {
        throw new Error("Failed to delete pick");
      }
    } catch (error) {
      console.error("Error deleting pick:", error);
      setMessage({ type: "error", text: "Failed to delete pick" });
    }
  };

  const resetForm = () => {
    setFormData({
      sportCode: "NBA",
      tier: "free",
      player: "",
      propType: "",
      propLine: 0,
      side: "Over",
      analysisShort: "",
      analysisLong: "",
      confidencePct: 50,
      stakePct: 0.02,
      odds: "-110",
      sportsbook: "DraftKings",
    });
  };

  const filteredPicks = picks.filter((pick) => {
    const matchesSearch =
      pick.player.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pick.propType.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTier = filterTier === "all" || pick.tier === filterTier;
    const matchesResult =
      filterResult === "all" || pick.result === filterResult;

    return matchesSearch && matchesTier && matchesResult;
  });

  const getResultBadge = (result?: string) => {
    switch (result) {
      case "Win":
        return (
          <Badge className="bg-green-600 hover:bg-green-700 text-white border-0 font-semibold">
            ✓ WIN
          </Badge>
        );
      case "Loss":
        return (
          <Badge className="bg-red-600 hover:bg-red-700 text-white border-0 font-semibold">
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
  };

  if (!isSignedIn) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto text-center">
          <Card>
            <CardContent className="pt-6">
              <Shield className="h-16 w-16 mx-auto mb-4 text-muted-foreground/50" />
              <h2 className="text-2xl font-bold mb-2">
                Authentication Required
              </h2>
              <p className="text-muted-foreground">
                Please sign in to access the admin dashboard.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto text-center">
          <Card>
            <CardContent className="pt-6">
              <Shield className="h-16 w-16 mx-auto mb-4 text-red-500/50" />
              <h2 className="text-2xl font-bold mb-2">Admin Access Required</h2>
              <p className="text-muted-foreground">
                You don't have permission to access the admin dashboard.
              </p>
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
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Shield className="h-8 w-8 text-red-500" />
            <h1 className="text-3xl font-bold">Admin Dashboard</h1>
            <Badge className="bg-gradient-to-r from-red-500 to-red-600">
              <Shield className="h-3 w-3 mr-1" />
              Admin
            </Badge>
          </div>

          <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-brand-blue to-brand-purple hover:from-brand-blue/90 hover:to-brand-purple/90">
                <Plus className="h-4 w-4 mr-2" />
                Create Pick
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create New Pick</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Sport</Label>
                    <Select
                      value={formData.sportCode}
                      onValueChange={(value) =>
                        setFormData({ ...formData, sportCode: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="NBA">NBA</SelectItem>
                        <SelectItem value="MLB">MLB</SelectItem>
                        <SelectItem value="NFL">NFL</SelectItem>
                        <SelectItem value="NHL">NHL</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Tier</Label>
                    <Select
                      value={formData.tier}
                      onValueChange={(value: "free" | "premium") =>
                        setFormData({ ...formData, tier: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="free">Free</SelectItem>
                        <SelectItem value="premium">Premium</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label>Player Name *</Label>
                  <Input
                    value={formData.player}
                    onChange={(e) =>
                      setFormData({ ...formData, player: e.target.value })
                    }
                    placeholder="e.g., Stephen Curry"
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label>Prop Type *</Label>
                    <Input
                      value={formData.propType}
                      onChange={(e) =>
                        setFormData({ ...formData, propType: e.target.value })
                      }
                      placeholder="e.g., Points"
                    />
                  </div>
                  <div>
                    <Label>Line *</Label>
                    <Input
                      type="number"
                      step="0.5"
                      value={formData.propLine}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          propLine: parseFloat(e.target.value),
                        })
                      }
                    />
                  </div>
                  <div>
                    <Label>Side</Label>
                    <Select
                      value={formData.side}
                      onValueChange={(value: "Over" | "Under") =>
                        setFormData({ ...formData, side: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Over">Over</SelectItem>
                        <SelectItem value="Under">Under</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label>Short Analysis *</Label>
                  <Textarea
                    value={formData.analysisShort}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        analysisShort: e.target.value,
                      })
                    }
                    placeholder="Brief analysis for all users"
                    rows={3}
                  />
                </div>

                {formData.tier === "premium" && (
                  <>
                    <div>
                      <Label>Long Analysis (Premium)</Label>
                      <Textarea
                        value={formData.analysisLong || ""}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            analysisLong: e.target.value,
                          })
                        }
                        placeholder="Detailed analysis for premium users"
                        rows={4}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Confidence %</Label>
                        <Input
                          type="number"
                          min="0"
                          max="100"
                          value={formData.confidencePct}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              confidencePct: parseInt(e.target.value),
                            })
                          }
                        />
                      </div>
                      <div>
                        <Label>Stake % (0.01 = 1%)</Label>
                        <Input
                          type="number"
                          step="0.01"
                          min="0"
                          max="1"
                          value={formData.stakePct}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              stakePct: parseFloat(e.target.value),
                            })
                          }
                        />
                      </div>
                    </div>
                  </>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Odds</Label>
                    <Input
                      value={formData.odds}
                      onChange={(e) =>
                        setFormData({ ...formData, odds: e.target.value })
                      }
                      placeholder="-110"
                    />
                  </div>
                  <div>
                    <Label>Sportsbook</Label>
                    <Input
                      value={formData.sportsbook}
                      onChange={(e) =>
                        setFormData({ ...formData, sportsbook: e.target.value })
                      }
                      placeholder="DraftKings"
                    />
                  </div>
                </div>

                <div className="flex justify-end space-x-2 pt-4">
                  <Button
                    variant="outline"
                    onClick={() => setIsCreateModalOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button onClick={handleCreatePick}>
                    <Save className="h-4 w-4 mr-2" />
                    Create Pick
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {message && (
          <Alert
            className={`mt-4 ${message.type === "success" ? "border-green-500" : "border-red-500"}`}
          >
            {message.type === "success" ? (
              <CheckCircle className="h-4 w-4 text-green-500" />
            ) : (
              <AlertCircle className="h-4 w-4 text-red-500" />
            )}
            <AlertDescription
              className={
                message.type === "success" ? "text-green-700" : "text-red-700"
              }
            >
              {message.text}
            </AlertDescription>
          </Alert>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <TrendingUp className="h-8 w-8 text-brand-blue mr-3" />
              <div>
                <p className="text-sm text-muted-foreground">Total Picks</p>
                <p className="text-2xl font-bold">{picks.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <Star className="h-8 w-8 text-yellow-500 mr-3" />
              <div>
                <p className="text-sm text-muted-foreground">Free Picks</p>
                <p className="text-2xl font-bold">
                  {picks.filter((p) => p.tier === "free").length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <BarChart3 className="h-8 w-8 text-brand-purple mr-3" />
              <div>
                <p className="text-sm text-muted-foreground">Premium Picks</p>
                <p className="text-2xl font-bold">
                  {picks.filter((p) => p.tier === "premium").length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <CheckCircle className="h-8 w-8 text-green-500 mr-3" />
              <div>
                <p className="text-sm text-muted-foreground">Won Picks</p>
                <p className="text-2xl font-bold">
                  {picks.filter((p) => p.result === "Win").length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search by player or prop type..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <Select
              value={filterTier}
              onValueChange={(value: "all" | "free" | "premium") =>
                setFilterTier(value)
              }
            >
              <SelectTrigger className="w-[140px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Tiers</SelectItem>
                <SelectItem value="free">Free Only</SelectItem>
                <SelectItem value="premium">Premium Only</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={filterResult}
              onValueChange={(value: "all" | "Pending" | "Win" | "Loss") =>
                setFilterResult(value)
              }
            >
              <SelectTrigger className="w-[140px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Results</SelectItem>
                <SelectItem value="Pending">Pending</SelectItem>
                <SelectItem value="Win">Won</SelectItem>
                <SelectItem value="Loss">Lost</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Picks List */}
      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-4">
                <div className="h-6 bg-muted rounded w-1/3 mb-2"></div>
                <div className="h-4 bg-muted rounded w-2/3"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredPicks.map((pick) => (
            <Card key={pick.id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold">{pick.player}</h3>
                      <Badge
                        variant={
                          pick.tier === "premium" ? "default" : "outline"
                        }
                      >
                        {pick.tier}
                      </Badge>
                      {getResultBadge(pick.result)}
                      <Badge variant="outline">{pick.sport || "NBA"}</Badge>
                    </div>

                    <div className="text-sm text-muted-foreground mb-2">
                      <span className="font-medium">
                        {pick.propType} {pick.side} {pick.line}
                      </span>
                      {pick.game && (
                        <span className="ml-3">
                          <Calendar className="inline h-3 w-3 mr-1" />
                          {pick.game} • {pick.tipoff}
                        </span>
                      )}
                    </div>

                    <p className="text-sm text-muted-foreground">
                      {pick.analysis}
                    </p>

                    {pick.tier === "premium" && (
                      <div className="mt-2 flex items-center gap-4 text-xs text-muted-foreground">
                        <span>Confidence: {pick.confidence}%</span>
                        {pick.stakePercent && (
                          <span>
                            Stake: {(pick.stakePercent * 100).toFixed(1)}%
                          </span>
                        )}
                        {pick.odds && <span>Odds: {pick.odds}</span>}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2 ml-4">
                    <Select
                      value={pick.result || "Pending"}
                      onValueChange={(value: "Pending" | "Win" | "Loss") =>
                        handleUpdatePick(pick.id, { result: value })
                      }
                      disabled={updatingPicks.has(pick.id)}
                    >
                      <SelectTrigger
                        className={`w-[120px] ${updatingPicks.has(pick.id) ? "opacity-50" : ""}`}
                      >
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Pending">Pending</SelectItem>
                        <SelectItem value="Win">Win</SelectItem>
                        <SelectItem value="Loss">Loss</SelectItem>
                      </SelectContent>
                    </Select>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setEditingPick(pick)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeletePick(pick.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {filteredPicks.length === 0 && !loading && (
            <Card>
              <CardContent className="p-12 text-center">
                <TrendingUp className="h-16 w-16 mx-auto mb-4 text-muted-foreground/50" />
                <h3 className="text-lg font-semibold mb-2">No picks found</h3>
                <p className="text-muted-foreground">
                  {picks.length === 0
                    ? "Create your first pick to get started."
                    : "Try adjusting your filters."}
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
