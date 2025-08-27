import { useState, useEffect } from "react";
import { useUser, SignInButton } from "@clerk/clerk-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Settings as SettingsIcon,
  DollarSign,
  User,
  Shield,
  Crown,
  AlertCircle,
  CheckCircle,
  Save,
  Lock,
  Users,
  ExternalLink,
} from "lucide-react";

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

export default function Settings() {
  const { isSignedIn, user } = useUser();
  const [bankroll, setBankroll] = useState("");
  const [originalBankroll, setOriginalBankroll] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const isPremium = isSignedIn && isPremiumUser(user);
  const isAdmin = isSignedIn && hasRole(user, "admin");

  useEffect(() => {
    if (user?.privateMetadata?.bankroll) {
      const currentBankroll = user.privateMetadata.bankroll.toString();
      setBankroll(currentBankroll);
      setOriginalBankroll(currentBankroll);
    }
  }, [user]);

  const handleSaveBankroll = async () => {
    if (!user || saving) return; // Prevent multiple concurrent requests

    const bankrollValue = parseFloat(bankroll);
    if (isNaN(bankrollValue) || bankrollValue < 0) {
      setSaveMessage({
        type: "error",
        message: "Please enter a valid bankroll amount",
      });
      return;
    }

    setSaving(true);
    setSaveMessage(null);

    const attemptUpdate = async (retryCount = 0): Promise<void> => {
      try {
        // Reload user object to ensure fresh state
        await user.reload();

        // Wait a bit longer to ensure the reload completes
        await new Promise(resolve => setTimeout(resolve, 200));

        // Use a completely fresh object without spreading existing metadata
        const updateData = {
          privateMetadata: {
            bankroll: bankrollValue,
          },
        };

        await user.update(updateData);

        setOriginalBankroll(bankroll);
        setSaveMessage({
          type: "success",
          message: "Bankroll updated successfully!",
        });

        // Clear success message after 3 seconds
        setTimeout(() => setSaveMessage(null), 3000);

      } catch (error) {
        console.error(`Error updating bankroll (attempt ${retryCount + 1}):`, error);

        // Check if it's a stream error and we can retry
        const isStreamError = error instanceof Error &&
          (error.message.includes("stream") || error.message.includes("body"));

        if (isStreamError && retryCount < 2) {
          // Wait longer and retry
          await new Promise(resolve => setTimeout(resolve, 1000));
          return attemptUpdate(retryCount + 1);
        }

        // If all retries failed or it's a different error
        const errorMessage = isStreamError
          ? "Unable to save due to a connection issue. Please refresh the page and try again."
          : error instanceof Error
            ? error.message
            : "Failed to update bankroll. Please try again.";

        setSaveMessage({
          type: "error",
          message: errorMessage,
        });
      }
    };

    try {
      await attemptUpdate();
    } finally {
      setSaving(false);
    }
  };

  const hasChanges = bankroll !== originalBankroll;
  const currentBankrollValue = parseFloat(originalBankroll) || 0;

  if (!isSignedIn) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto text-center">
          <Card className="shadow-lg">
            <CardHeader>
              <div className="flex items-center justify-center mb-4">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-brand-blue to-brand-purple flex items-center justify-center">
                  <SettingsIcon className="h-8 w-8 text-white" />
                </div>
              </div>
              <CardTitle className="text-2xl">Access Your Settings</CardTitle>
              <p className="text-muted-foreground">
                Sign in to manage your account, bankroll, and betting preferences.
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="text-center p-4 bg-background/50 rounded-lg">
                  <User className="h-8 w-8 mx-auto mb-2 text-brand-blue" />
                  <h3 className="font-semibold">Account Info</h3>
                  <p className="text-sm text-muted-foreground">
                    Manage your profile and preferences
                  </p>
                </div>
                <div className="text-center p-4 bg-background/50 rounded-lg">
                  <DollarSign className="h-8 w-8 mx-auto mb-2 text-green-500" />
                  <h3 className="font-semibold">Bankroll Management</h3>
                  <p className="text-sm text-muted-foreground">
                    Track and manage your betting bankroll
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <SignInButton mode="modal">
                  <Button
                    size="lg"
                    className="w-full bg-gradient-to-r from-brand-blue to-brand-purple hover:from-brand-blue/90 hover:to-brand-purple/90"
                  >
                    Sign In to Access Settings
                  </Button>
                </SignInButton>
                <p className="text-sm text-muted-foreground">
                  Don't have an account? Sign up to get started with premium features.
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
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-2">
            <SettingsIcon className="h-8 w-8 text-brand-blue" />
            <h1 className="text-3xl font-bold">Account Settings</h1>
          </div>
          <p className="text-muted-foreground">
            Manage your profile, bankroll, and betting preferences.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Information */}
          <div className="lg:col-span-2 space-y-6">
            {/* Account Info Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Account Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm text-muted-foreground">
                      Name
                    </Label>
                    <div className="font-medium">
                      {user.firstName} {user.lastName}
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm text-muted-foreground">
                      Email
                    </Label>
                    <div className="font-medium">
                      {user.primaryEmailAddress?.emailAddress}
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm text-muted-foreground">
                      Account Type
                    </Label>
                    <div className="flex items-center gap-2">
                      {isAdmin ? (
                        <Badge className="bg-gradient-to-r from-red-500 to-red-600">
                          <Shield className="h-3 w-3 mr-1" />
                          Admin
                        </Badge>
                      ) : isPremium ? (
                        <Badge className="bg-gradient-to-r from-brand-purple to-brand-blue">
                          <Crown className="h-3 w-3 mr-1" />
                          Premium
                        </Badge>
                      ) : (
                        <Badge variant="outline">Free</Badge>
                      )}
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm text-muted-foreground">
                      Member Since
                    </Label>
                    <div className="font-medium">
                      {new Date(user.createdAt!).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Bankroll Management Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-green-500" />
                  Bankroll Management
                  {!isPremium && (
                    <Badge variant="outline" className="border-brand-purple text-brand-purple">
                      <Lock className="h-3 w-3 mr-1" />
                      Premium Feature
                    </Badge>
                  )}
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  {isPremium
                    ? "Set your bankroll to automatically calculate stake amounts for premium picks."
                    : "Join our Discord community to unlock bankroll management and premium features."}
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                {isPremium ? (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="bankroll">Bankroll Amount (USD)</Label>
                      <div className="flex items-center gap-3">
                        <div className="relative flex-1">
                          <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
                            $
                          </span>
                          <Input
                            id="bankroll"
                            type="number"
                            min="0"
                            step="0.01"
                            placeholder="0.00"
                            value={bankroll}
                            onChange={(e) => setBankroll(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                e.preventDefault();
                                if (!saving && hasChanges) {
                                  handleSaveBankroll();
                                }
                              }
                            }}
                            className="pl-8"
                            disabled={saving}
                          />
                        </div>
                        <Button
                      onClick={handleSaveBankroll}
                      disabled={!hasChanges || saving}
                      className="flex items-center gap-2"
                      type="button"
                    >
                      {saving ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="h-4 w-4" />
                          Save
                        </>
                      )}
                    </Button>
                      </div>
                    </div>

                    {saveMessage && (
                      <Alert
                        className={
                          saveMessage.type === "success"
                            ? "border-green-500"
                            : "border-red-500"
                        }
                      >
                        {saveMessage.type === "success" ? (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        ) : (
                          <AlertCircle className="h-4 w-4 text-red-500" />
                        )}
                        <AlertDescription
                          className={
                            saveMessage.type === "success"
                              ? "text-green-700"
                              : "text-red-700"
                          }
                        >
                          {saveMessage.message}
                        </AlertDescription>
                      </Alert>
                    )}

                    <div className="p-4 bg-muted/30 rounded-lg">
                      <h4 className="font-medium mb-2">How it works:</h4>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        <li>• Set your total betting bankroll amount</li>
                        <li>• Premium picks will show recommended stake amounts</li>
                        <li>
                          • Stakes are calculated as a percentage of your bankroll
                        </li>
                        <li>• This helps with proper bankroll management</li>
                      </ul>
                    </div>
                  </>
                ) : (
                  <div className="p-6 bg-gradient-to-r from-brand-purple/5 to-brand-blue/5 rounded-lg border border-brand-purple/20">
                    <div className="text-center space-y-4">
                      <div className="flex items-center justify-center">
                        <Lock className="h-12 w-12 text-brand-purple" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg mb-2">Premium Feature Locked</h3>
                        <p className="text-muted-foreground mb-4">
                          Bankroll management is available to premium members. Join our Discord community to unlock this feature and get access to advanced stake calculations.
                        </p>
                      </div>
                      <Button
                        className="bg-gradient-to-r from-brand-purple to-brand-blue hover:from-brand-purple/90 hover:to-brand-blue/90"
                        asChild
                      >
                        <a
                          href="https://discord.gg/V7Yg3BhrFU"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center"
                        >
                          <Users className="mr-2 h-4 w-4" />
                          Join the Discord to Become Premium
                          <ExternalLink className="ml-2 h-4 w-4" />
                        </a>
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Premium Features Info */}
            {!isPremium && (
              <Card className="border-brand-purple/20 bg-gradient-to-r from-brand-purple/5 to-brand-blue/5">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Crown className="h-5 w-5 text-brand-purple" />
                    Unlock Premium Features
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">
                    Join our Discord community to become a premium member and
                    unlock:
                  </p>
                  <ul className="text-sm space-y-1 mb-4">
                    <li>• Advanced analytics and insights</li>
                    <li>• Confidence ratings for all picks</li>
                    <li>• Automatic stake calculations</li>
                    <li>• Premium Discord access</li>
                  </ul>
                  <Button
                    className="bg-gradient-to-r from-brand-purple to-brand-blue hover:from-brand-purple/90 hover:to-brand-blue/90"
                    asChild
                  >
                    <a
                      href="https://discord.gg/V7Yg3BhrFU"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Join Discord to Become Premium
                    </a>
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Current Bankroll Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Bankroll Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center space-y-2">
                  <div className="text-3xl font-bold text-brand-blue">
                    ${currentBankrollValue.toLocaleString()}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Current Bankroll
                  </p>
                </div>

                {currentBankrollValue > 0 && (
                  <>
                    <Separator className="my-4" />
                    <div className="space-y-3">
                      <h4 className="font-medium text-sm">Sample Stakes:</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">
                            1% stake:
                          </span>
                          <span className="font-medium">
                            ${(currentBankrollValue * 0.01).toFixed(2)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">
                            2% stake:
                          </span>
                          <span className="font-medium">
                            ${(currentBankrollValue * 0.02).toFixed(2)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">
                            5% stake:
                          </span>
                          <span className="font-medium">
                            ${(currentBankrollValue * 0.05).toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Quick Stats */}
            {isPremium && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Account Stats</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Account Type:</span>
                    <Badge className="bg-gradient-to-r from-brand-purple to-brand-blue">
                      {isAdmin ? "Admin" : "Premium"}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Member Since:</span>
                    <span className="font-medium">
                      {new Date(user.createdAt!).toLocaleDateString()}
                    </span>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
