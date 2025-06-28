import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  AlertTriangle,
  Shield,
  Clock,
  Mic,
  MicOff,
  Activity,
  Phone,
  MapPin,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { mlVoiceService, VoiceAnalysisResult } from "@/services/mlService";
import { sosService, SOSAlert } from "@/services/sosService";
import { toast } from "@/hooks/use-toast";

export default function SOS() {
  const [isActivating, setIsActivating] = useState(false);
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [voiceStatus, setVoiceStatus] = useState<{
    isRecording: boolean;
    isProcessing: boolean;
    lastAnalysis?: VoiceAnalysisResult;
  }>({
    isRecording: false,
    isProcessing: false,
  });
  const [recentAlerts, setRecentAlerts] = useState<SOSAlert[]>([]);

  useEffect(() => {
    // Load recent alerts on mount
    const alerts = sosService.getAlertHistory().slice(0, 3);
    setRecentAlerts(alerts);

    // Check if monitoring was previously active
    const wasMonitoring = localStorage.getItem("voiceMonitoring") === "true";
    if (wasMonitoring) {
      startVoiceMonitoring();
    }

    return () => {
      // Cleanup on unmount
      if (isMonitoring) {
        stopVoiceMonitoring();
      }
    };
  }, []);

  useEffect(() => {
    // Update voice status every second
    const interval = setInterval(() => {
      const status = mlVoiceService.getStatus();
      setVoiceStatus((prev) => ({
        ...prev,
        isRecording: status.isRecording,
        isProcessing: status.isProcessing,
      }));
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const handleManualSOS = async () => {
    setIsActivating(true);

    try {
      const alert = await sosService.sendSOSAlert("manual");

      toast({
        title: "🚨 SOS Alert Sent",
        description: "Emergency contacts have been notified",
        variant: "destructive",
      });

      // Update recent alerts
      setRecentAlerts((prev) => [alert, ...prev.slice(0, 2)]);
    } catch (error) {
      toast({
        title: "Failed to Send Alert",
        description: "Please try again or contact emergency services directly",
        variant: "destructive",
      });
    } finally {
      setTimeout(() => setIsActivating(false), 2000);
    }
  };

  const startVoiceMonitoring = async () => {
    try {
      const success = await mlVoiceService.startMonitoring(handleVoiceDistress);

      if (success) {
        setIsMonitoring(true);
        localStorage.setItem("voiceMonitoring", "true");

        toast({
          title: "Voice Monitoring Started",
          description: "AI is now monitoring for distress signals",
        });
      } else {
        toast({
          title: "Microphone Access Required",
          description:
            "Please allow microphone access to enable voice monitoring",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Monitoring Failed",
        description: "Unable to start voice monitoring",
        variant: "destructive",
      });
    }
  };

  const stopVoiceMonitoring = () => {
    mlVoiceService.stopMonitoring();
    setIsMonitoring(false);
    localStorage.setItem("voiceMonitoring", "false");

    toast({
      title: "Voice Monitoring Stopped",
      description: "AI monitoring has been disabled",
    });
  };

  const handleVoiceDistress = async (result: VoiceAnalysisResult) => {
    setVoiceStatus((prev) => ({ ...prev, lastAnalysis: result }));

    if (result.isDistress && result.confidence > 0.7) {
      // Auto-trigger SOS alert
      const alert = await sosService.sendSOSAlert("auto", result.confidence);

      setRecentAlerts((prev) => [alert, ...prev.slice(0, 2)]);

      toast({
        title: "🚨 Distress Detected!",
        description: `Auto SOS triggered (${Math.round(result.confidence * 100)}% confidence)`,
        variant: "destructive",
      });
    }
  };

  const toggleVoiceMonitoring = () => {
    if (isMonitoring) {
      stopVoiceMonitoring();
    } else {
      startVoiceMonitoring();
    }
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
            Manual and AI-powered emergency alert system
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {/* Manual SOS */}
          <Card>
            <CardHeader className="text-center">
              <CardTitle>Manual Emergency Alert</CardTitle>
              <CardDescription>
                Press the button below to immediately send an SOS alert
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
                  onClick={handleManualSOS}
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

          {/* AI Voice Monitoring */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                AI Voice Monitoring
              </CardTitle>
              <CardDescription>
                Automatic distress detection using your ML model
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {isMonitoring ? (
                      <Mic className="h-5 w-5 text-green-600" />
                    ) : (
                      <MicOff className="h-5 w-5 text-gray-400" />
                    )}
                    <span className="font-medium">Status</span>
                  </div>
                  <Badge variant={isMonitoring ? "default" : "secondary"}>
                    {isMonitoring ? "Active" : "Inactive"}
                  </Badge>
                </div>

                {isMonitoring && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span>Recording</span>
                      <div className="flex items-center gap-1">
                        {voiceStatus.isRecording && (
                          <Activity className="h-3 w-3 text-green-500 animate-pulse" />
                        )}
                        <span
                          className={
                            voiceStatus.isRecording
                              ? "text-green-600"
                              : "text-gray-400"
                          }
                        >
                          {voiceStatus.isRecording ? "Active" : "Idle"}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-sm">
                      <span>Processing</span>
                      <span
                        className={
                          voiceStatus.isProcessing
                            ? "text-blue-600"
                            : "text-gray-400"
                        }
                      >
                        {voiceStatus.isProcessing ? "Analyzing..." : "Ready"}
                      </span>
                    </div>

                    {voiceStatus.lastAnalysis && (
                      <div className="text-xs text-muted-foreground">
                        Last check:{" "}
                        {new Date(
                          voiceStatus.lastAnalysis.timestamp,
                        ).toLocaleTimeString()}
                      </div>
                    )}
                  </div>
                )}

                <Button
                  onClick={toggleVoiceMonitoring}
                  variant={isMonitoring ? "destructive" : "default"}
                  className="w-full"
                >
                  {isMonitoring ? "Stop Monitoring" : "Start Monitoring"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Alerts */}
        {recentAlerts.length > 0 && (
          <Card className="mt-8 max-w-4xl mx-auto">
            <CardHeader>
              <CardTitle>Recent Alerts</CardTitle>
              <CardDescription>
                Your latest SOS alerts and their status
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentAlerts.map((alert) => (
                  <div
                    key={alert.id}
                    className="flex items-center justify-between p-3 bg-muted rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={cn(
                          "w-2 h-2 rounded-full",
                          alert.status === "sent"
                            ? "bg-green-500"
                            : alert.status === "pending"
                              ? "bg-yellow-500"
                              : "bg-red-500",
                        )}
                      />
                      <div>
                        <p className="font-medium">
                          {alert.type === "auto"
                            ? "🤖 AI Detected"
                            : "👤 Manual"}{" "}
                          Alert
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(alert.timestamp).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {alert.location && (
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                      )}
                      <Badge
                        variant={
                          alert.status === "sent"
                            ? "default"
                            : alert.status === "pending"
                              ? "secondary"
                              : "destructive"
                        }
                      >
                        {alert.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Emergency Contacts Status */}
        <Card className="mt-8 max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Phone className="h-5 w-5" />
              Emergency Contacts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <span>Configured contacts</span>
              <Badge variant="outline">
                {sosService.getEmergencyContacts().length} contacts
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              {sosService.getEmergencyContacts().length === 0
                ? "Add emergency contacts to receive SOS alerts"
                : "Emergency contacts will be notified when SOS is triggered"}
            </p>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
