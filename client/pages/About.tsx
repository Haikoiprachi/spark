import Navbar from "@/components/Navbar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Shield, Zap, Heart, Users, MapPin, Phone } from "lucide-react";

export default function About() {
  const features = [
    {
      icon: Zap,
      title: "AI-Powered Detection",
      description:
        "Advanced machine learning algorithms analyze voice patterns to detect distress signals automatically.",
    },
    {
      icon: Heart,
      title: "Instant Response",
      description:
        "When danger is detected, instant SOS alerts are sent to your emergency contacts with your location.",
    },
    {
      icon: Users,
      title: "Emergency Network",
      description:
        "Connect with family, friends, and emergency services through your personal safety network.",
    },
    {
      icon: MapPin,
      title: "Location Tracking",
      description:
        "Precise GPS location sharing ensures help can find you quickly when it matters most.",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <div className="bg-primary rounded-full p-4">
              <Shield className="h-12 w-12 text-primary-foreground" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-foreground mb-4">
            About VigilBand
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            VigilBand is an innovative personal safety device that combines
            advanced AI technology with intuitive software to provide 24/7
            protection for you and your loved ones.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          <Card>
            <CardHeader>
              <CardTitle>How It Works</CardTitle>
              <CardDescription>
                Understanding the technology behind your safety
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="bg-primary/10 rounded-full p-2 mt-1">
                  <span className="text-primary font-bold text-sm">1</span>
                </div>
                <div>
                  <h4 className="font-semibold">Continuous Monitoring</h4>
                  <p className="text-sm text-muted-foreground">
                    Your VigilBand device continuously monitors voice patterns
                    using advanced ML algorithms.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="bg-primary/10 rounded-full p-2 mt-1">
                  <span className="text-primary font-bold text-sm">2</span>
                </div>
                <div>
                  <h4 className="font-semibold">Distress Detection</h4>
                  <p className="text-sm text-muted-foreground">
                    When unusual spikes or distress signals are detected, the
                    system activates automatically.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="bg-primary/10 rounded-full p-2 mt-1">
                  <span className="text-primary font-bold text-sm">3</span>
                </div>
                <div>
                  <h4 className="font-semibold">Instant Alert</h4>
                  <p className="text-sm text-muted-foreground">
                    SOS messages with your location are immediately sent to your
                    emergency contacts.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Safety Features</CardTitle>
              <CardDescription>
                Comprehensive protection designed for peace of mind
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="bg-green-100 dark:bg-green-900/20 rounded-full p-2">
                  <Zap className="h-4 w-4 text-green-600" />
                </div>
                <span className="text-sm">Real-time voice analysis</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="bg-blue-100 dark:bg-blue-900/20 rounded-full p-2">
                  <MapPin className="h-4 w-4 text-blue-600" />
                </div>
                <span className="text-sm">GPS location sharing</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="bg-red-100 dark:bg-red-900/20 rounded-full p-2">
                  <Phone className="h-4 w-4 text-red-600" />
                </div>
                <span className="text-sm">Manual SOS button</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="bg-purple-100 dark:bg-purple-900/20 rounded-full p-2">
                  <Users className="h-4 w-4 text-purple-600" />
                </div>
                <span className="text-sm">Multiple emergency contacts</span>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Card key={index}>
                <CardHeader className="text-center">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-3">
                    <Icon className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="text-lg">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-center">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <Card>
          <CardHeader className="text-center">
            <CardTitle>Contact & Support</CardTitle>
            <CardDescription>
              Need help? We're here to ensure your safety and peace of mind.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-muted-foreground">
              For technical support or questions about your VigilBand device,
              please contact our 24/7 support team.
            </p>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
