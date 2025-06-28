import { Link } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Users,
  MapPin,
  AlertTriangle,
  Info,
  Shield,
  Zap,
  Heart,
  Clock,
} from "lucide-react";
import Navbar from "@/components/Navbar";

export default function Home() {
  const quickActions = [
    {
      title: "Emergency Contact",
      description: "Manage your emergency contacts",
      icon: Users,
      path: "/emergency-contact",
      color: "bg-blue-500",
    },
    {
      title: "Your Location",
      description: "View and update your location settings",
      icon: MapPin,
      path: "/location",
      color: "bg-green-500",
    },
    {
      title: "SOS Alert",
      description: "Manual emergency alert system",
      icon: AlertTriangle,
      path: "/sos",
      color: "bg-red-500",
    },
    {
      title: "About VigilBand",
      description: "Learn more about your safety device",
      icon: Info,
      path: "/about",
      color: "bg-purple-500",
    },
  ];

  const features = [
    {
      title: "AI-Powered Detection",
      description:
        "Advanced ML algorithms detect distress in your voice patterns",
      icon: Zap,
    },
    {
      title: "Instant Alerts",
      description: "Automatic SOS messages sent to your emergency contacts",
      icon: Heart,
    },
    {
      title: "24/7 Monitoring",
      description: "Continuous protection wherever you go",
      icon: Clock,
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <div className="bg-primary rounded-full p-4">
              <Shield className="h-12 w-12 text-primary-foreground" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-foreground mb-4">
            Welcome to VigilBand
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Your personal safety companion that uses advanced AI to detect
            distress and automatically alert your emergency contacts when you
            need help most.
          </p>
        </div>

        {/* Quick Actions */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-foreground mb-6">
            Quick Actions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {quickActions.map((action) => {
              const Icon = action.icon;
              return (
                <Card
                  key={action.path}
                  className="hover:shadow-lg transition-shadow"
                >
                  <CardHeader className="pb-4">
                    <div
                      className={`w-12 h-12 rounded-lg ${action.color} flex items-center justify-center mb-3`}
                    >
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                    <CardTitle className="text-lg">{action.title}</CardTitle>
                    <CardDescription>{action.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <Button asChild className="w-full">
                      <Link to={action.path}>Access</Link>
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Features Section */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-foreground mb-6">
            Key Features
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Card key={index}>
                  <CardHeader>
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-3">
                      <Icon className="h-6 w-6 text-primary" />
                    </div>
                    <CardTitle className="text-lg">{feature.title}</CardTitle>
                    <CardDescription>{feature.description}</CardDescription>
                  </CardHeader>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Status Section */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              Device Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <p className="text-sm text-muted-foreground">Connection</p>
                <p className="text-lg font-semibold text-green-600">
                  Connected
                </p>
              </div>
              <div className="text-center">
                <p className="text-sm text-muted-foreground">Battery</p>
                <p className="text-lg font-semibold">85%</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-muted-foreground">Last Check</p>
                <p className="text-lg font-semibold">2 min ago</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
