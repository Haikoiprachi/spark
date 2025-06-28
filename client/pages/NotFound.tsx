import { Link } from "react-router-dom";
import { Shield, Home } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center p-4">
      <div className="max-w-md mx-auto text-center">
        {/* Logo */}
        <div className="flex items-center justify-center mb-8">
          <div className="bg-primary rounded-full p-3">
            <Shield className="h-8 w-8 text-primary-foreground" />
          </div>
        </div>

        <div className="mb-8">
          <h1 className="text-6xl font-bold text-foreground mb-4">404</h1>
          <h2 className="text-2xl font-semibold text-foreground mb-2">
            Page not found
          </h2>
          <p className="text-muted-foreground">
            Sorry, we couldn't find the page you're looking for. Let's get you
            back to safety.
          </p>
        </div>

        <Button asChild size="lg">
          <Link to="/">
            <Home className="h-4 w-4 mr-2" />
            Return to VigilBand
          </Link>
        </Button>
      </div>
    </div>
  );
}
