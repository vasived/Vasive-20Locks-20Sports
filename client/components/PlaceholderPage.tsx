import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Construction, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

interface PlaceholderPageProps {
  title: string;
  description: string;
  features?: string[];
  authRequired?: boolean;
  premiumRequired?: boolean;
  adminRequired?: boolean;
}

export default function PlaceholderPage({
  title,
  description,
  features = [],
  authRequired = false,
  premiumRequired = false,
  adminRequired = false,
}: PlaceholderPageProps) {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-2xl mx-auto text-center space-y-8">
        {/* Header */}
        <div className="space-y-4">
          <div className="w-16 h-16 mx-auto bg-gradient-to-br from-brand-blue to-brand-purple rounded-full flex items-center justify-center">
            <Construction className="h-8 w-8 text-white" />
          </div>

          <h1 className="text-3xl font-bold">{title}</h1>
          <p className="text-lg text-muted-foreground">{description}</p>
        </div>

        {/* Access Requirements */}
        {(authRequired || premiumRequired || adminRequired) && (
          <Card className="border-brand-blue/20 bg-brand-blue/5">
            <CardHeader>
              <CardTitle className="text-lg">Access Requirements</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {authRequired && (
                <div className="flex items-center space-x-2 text-sm">
                  <div className="w-2 h-2 bg-brand-blue rounded-full" />
                  <span>User authentication required</span>
                </div>
              )}
              {premiumRequired && (
                <div className="flex items-center space-x-2 text-sm">
                  <div className="w-2 h-2 bg-brand-purple rounded-full" />
                  <span>Premium subscription required</span>
                </div>
              )}
              {adminRequired && (
                <div className="flex items-center space-x-2 text-sm">
                  <div className="w-2 h-2 bg-brand-cyan rounded-full" />
                  <span>Admin role required</span>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Planned Features */}
        {features.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Planned Features</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-left">
                {features.map((feature, index) => (
                  <li
                    key={index}
                    className="flex items-center space-x-2 text-sm"
                  >
                    <div className="w-2 h-2 bg-accent rounded-full" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}

        {/* Development Status */}
        <Card className="bg-muted/30">
          <CardContent className="pt-6">
            <h3 className="font-semibold mb-2">🚧 Page Under Development</h3>
            <p className="text-sm text-muted-foreground mb-4">
              This page is currently being built. Continue prompting to help
              prioritize and implement the features you need most.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button variant="outline" asChild>
                <Link to="/">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Home
                </Link>
              </Button>

              <Button className="bg-gradient-to-r from-brand-blue to-brand-purple hover:from-brand-blue/90 hover:to-brand-purple/90 text-white">
                Request Implementation
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
