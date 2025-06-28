import { useState } from "react";
import Navbar from "@/components/Navbar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Shield, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

export default function SOS() {
  const [isActivating, setIsActivating] = useState(false);

  const handleSOSPress = () => {
    setIsActivating(true);
    // TODO: Implement SOS logic
    setTimeout(() => {
      setIsActivating(false);
      // Simulate alert sent
      alert("SOS alert sent to emergency contacts!");
    }, 3000);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="bg-red-500 rounded-full p-3">
              <AlertTriangle className="h-8 w-8 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-foreground">SOS Emergency</h1>
          <p className="text-muted-foreground mt-2">
            Manual emergency alert system
          </p>
        </div>

        <div className="max-w-md mx-auto">
          <Card className="mb-6">
            <CardHeader className="text-center">
              <CardTitle>Emergency Alert</CardTitle>
              <CardDescription>
                Press and hold the button below to send an SOS alert to your
                emergency contacts
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <div className="mb-6">
                <Button
                  size="lg"
                  className={cn(
                    "w-32 h-32 rounded-full text-xl font-bold transition-all duration-300",
                    isActivating
                      ? "bg-yellow-500 hover:bg-yellow-600 animate-pulse"
                      : "bg-emergency hover:bg-emergency/90",
                  )}
                  onClick={handleSOSPress}
                  disabled={isActivating}
                >
                  {isActivating ? (
                    <div className="flex flex-col items-center">
                      <Clock className="h-8 w-8 mb-1" />
                      <span className="text-sm">Sending...</span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center">
                      <AlertTriangle className="h-8 w-8 mb-1" />
                      <span>SOS</span>
                    </div>
                  )}
                </Button>
              </div>
              {isActivating && (
                <p className="text-yellow-600 font-semibold">
                  Sending alert to emergency contacts...
                </p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Auto-Detection Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <span>Voice distress detection</span>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm text-green-600">Active</span>
                </div>
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                Your VigilBand device is monitoring for distress signals and
                will automatically trigger an SOS if danger is detected.
              </p>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
