import { useState, useEffect, useRef } from "react";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  Upload,
  TestTube,
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
  const [testResult, setTestResult] = useState<VoiceAnalysisResult | null>(
    null,
  );
  const [isTesting, setIsTesting] = useState(false);
  const [apiStatus, setApiStatus] = useState<{
    success: boolean;
    message: string;
  } | null>(null);
  const [isLiveTesting, setIsLiveTesting] = useState(false);
  const [liveTestResults, setLiveTestResults] = useState<VoiceAnalysisResult[]>(
    [],
  );
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const handleTestMLModel = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsTesting(true);
    setTestResult(null);

    try {
      const result = await mlVoiceService.analyzeFile(file);
      setTestResult(result);

      if (result) {
        toast({
          title: "🧪 ML Test Complete",
          description: `Result: ${result.isDistress ? "DISTRESS DETECTED" : "No distress"} (${Math.round(result.confidence * 100)}% confidence)`,
          variant: result.isDistress ? "destructive" : "default",
        });
      }
    } catch (error) {
      toast({
        title: "Test Failed",
        description: "Error testing ML model with audio file",
        variant: "destructive",
      });
    } finally {
      setIsTesting(false);
    }
  };

  const testAPIConnection = async () => {
    const result = await mlVoiceService.testAPIConnection();
    setApiStatus(result);

    toast({
      title: result.success ? "✅ API Connected" : "❌ API Connection Failed",
      description: result.message,
      variant: result.success ? "default" : "destructive",
    });
  };

  const startLiveVoiceTesting = async () => {
    try {
      setLiveTestResults([]);
      const success =
        await mlVoiceService.startMonitoring(handleLiveTestResult);

      if (success) {
        setIsLiveTesting(true);
        toast({
          title: "🎤 Live Voice Testing Started",
          description: "Speak into your microphone to test ML detection",
        });
      } else {
        toast({
          title: "Microphone Access Required",
          description: "Please allow microphone access for live testing",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Live Testing Failed",
        description: "Unable to start live voice testing",
        variant: "destructive",
      });
    }
  };

  const stopLiveVoiceTesting = () => {
    mlVoiceService.stopMonitoring();
    setIsLiveTesting(false);
    toast({
      title: "🔇 Live Voice Testing Stopped",
      description: "Voice testing has been disabled",
    });
  };

  const handleLiveTestResult = async (result: VoiceAnalysisResult) => {
    // Add to test results (keep last 5)
    setLiveTestResults((prev) => [result, ...prev.slice(0, 4)]);

    // Don't trigger actual SOS during testing
    console.log("🧪 Live test result:", result);

    if (result.isDistress) {
      toast({
        title: "⚠️ Distress Detected in Test",
        description: `Confidence: ${Math.round(result.confidence * 100)}% (This is just a test - no SOS sent)`,
        variant: "destructive",
      });
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
    console.log("🔴 VOICE DISTRESS HANDLER CALLED:", result);
    setVoiceStatus((prev) => ({ ...prev, lastAnalysis: result }));

    // Log all ML results for debugging
    console.log(
      `📊 ML Analysis: ${result.isDistress ? "DISTRESS" : "NORMAL"} - Confidence: ${Math.round(result.confidence * 100)}%`,
    );

    // Check if we should trigger SOS (configurable threshold)
    const distressThreshold = 0.7; // You can adjust this
    const shouldTriggerSOS =
      result.isDistress && result.confidence > distressThreshold;

    if (shouldTriggerSOS) {
      console.log("🚨 TRIGGERING AUTO SOS ALERT!");

      try {
        // Auto-trigger SOS alert
        const alert = await sosService.sendSOSAlert("auto", result.confidence);

        setRecentAlerts((prev) => [alert, ...prev.slice(0, 2)]);

        toast({
          title: "🚨 DISTRESS DETECTED - SOS SENT!",
          description: `Emergency contacts notified (${Math.round(result.confidence * 100)}% confidence)`,
          variant: "destructive",
        });

        // Visual/audio alert for user
        if ("vibrate" in navigator) {
          navigator.vibrate([500, 200, 500, 200, 500]); // Vibration pattern
        }

        console.log("✅ Auto SOS alert sent successfully:", alert);
      } catch (error) {
        console.error("❌ Failed to send auto SOS alert:", error);

        toast({
          title: "⚠️ SOS Alert Failed",
          description:
            "Distress detected but alert failed to send. Try manual SOS.",
          variant: "destructive",
        });
      }
    } else {
      // Log non-triggering results for debugging
      if (result.isDistress) {
        console.log(
          `⚠️ Distress detected but confidence too low: ${Math.round(result.confidence * 100)}% (threshold: ${Math.round(distressThreshold * 100)}%)`,
        );
      } else {
        console.log(
          `✅ Normal voice detected: ${Math.round(result.confidence * 100)}% confidence`,
        );
      }
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

          {/* ML Model Testing */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TestTube className="h-5 w-5" />
                Test ML Model
              </CardTitle>
              <CardDescription>
                Upload an audio file to test your ML model's distress detection
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* API Connection Test */}
                <div className="bg-muted/50 p-3 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">API Connection</span>
                    <Button
                      onClick={testAPIConnection}
                      variant="outline"
                      size="sm"
                    >
                      Test Connection
                    </Button>
                  </div>
                  {apiStatus && (
                    <div className="text-sm">
                      <Badge
                        variant={apiStatus.success ? "default" : "destructive"}
                      >
                        {apiStatus.success ? "Connected" : "Failed"}
                      </Badge>
                      <p className="mt-1 text-muted-foreground">
                        {apiStatus.message}
                      </p>
                    </div>
                  )}
                  <div className="mt-2 p-2 bg-yellow-50 dark:bg-yellow-950/20 rounded border border-yellow-200 dark:border-yellow-800">
                    <p className="text-xs text-yellow-800 dark:text-yellow-200">
                      💡 <strong>Tip:</strong> If API connection fails, the
                      system will use demo mode for testing the UI. Check
                      browser console (F12) for detailed API debugging
                      information.
                    </p>
                  </div>
                </div>

                <div>
                  <Label htmlFor="audio-test">Upload Audio File</Label>
                  <Input
                    id="audio-test"
                    type="file"
                    accept="audio/*"
                    onChange={handleTestMLModel}
                    disabled={isTesting}
                    ref={fileInputRef}
                    className="mt-2"
                  />
                </div>

                {isTesting && (
                  <div className="flex items-center gap-2 text-blue-600">
                    <Clock className="h-4 w-4 animate-spin" />
                    <span>Testing audio with ML model...</span>
                  </div>
                )}

                {testResult && (
                  <div className="bg-muted p-4 rounded-lg">
                    <h4 className="font-semibold mb-2">Test Result:</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Status:</span>
                        <Badge
                          variant={
                            testResult.isDistress ? "destructive" : "default"
                          }
                        >
                          {testResult.isDistress
                            ? "DISTRESS DETECTED"
                            : "No Distress"}
                        </Badge>
                      </div>
                      <div className="flex justify-between">
                        <span>Confidence:</span>
                        <span>{Math.round(testResult.confidence * 100)}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Timestamp:</span>
                        <span>
                          {new Date(testResult.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                      {testResult.message && (
                        <div className="flex justify-between">
                          <span>Message:</span>
                          <span className="text-right">
                            {testResult.message}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                <Button
                  onClick={() => fileInputRef.current?.click()}
                  variant="outline"
                  className="w-full"
                  disabled={isTesting}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Choose Audio File to Test
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Live Voice Testing */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mic className="h-5 w-5" />
                Live Voice Testing
              </CardTitle>
              <CardDescription>
                Test your ML model with live voice input from your microphone
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <Button
                    onClick={
                      isLiveTesting
                        ? stopLiveVoiceTesting
                        : startLiveVoiceTesting
                    }
                    variant={isLiveTesting ? "destructive" : "default"}
                    disabled={isTesting}
                  >
                    {isLiveTesting ? (
                      <>
                        <MicOff className="h-4 w-4 mr-2" />
                        Stop Live Testing
                      </>
                    ) : (
                      <>
                        <Mic className="h-4 w-4 mr-2" />
                        Start Live Testing
                      </>
                    )}
                  </Button>

                  {isLiveTesting && (
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                      <span className="text-sm font-medium">
                        Recording & Analyzing...
                      </span>
                    </div>
                  )}
                </div>

                {isLiveTesting && (
                  <div className="bg-blue-50 dark:bg-blue-950/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                    <div className="flex items-center gap-2 mb-2">
                      <Activity className="h-4 w-4 text-blue-600" />
                      <span className="font-medium text-blue-900 dark:text-blue-100">
                        Live Testing Active
                      </span>
                    </div>
                    <p className="text-sm text-blue-800 dark:text-blue-200">
                      Speak normally into your microphone. The ML model will
                      analyze your voice every 3 seconds. This is for testing
                      only - no actual SOS alerts will be sent.
                    </p>
                  </div>
                )}

                {liveTestResults.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="font-semibold">Recent Live Test Results:</h4>
                    <div className="max-h-40 overflow-y-auto space-y-2">
                      {liveTestResults.map((result, index) => (
                        <div
                          key={index}
                          className="bg-muted p-3 rounded-lg text-sm"
                        >
                          <div className="flex items-center justify-between mb-1">
                            <Badge
                              variant={
                                result.isDistress ? "destructive" : "default"
                              }
                            >
                              {result.isDistress ? "DISTRESS" : "Normal"}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {new Date(result.timestamp).toLocaleTimeString()}
                            </span>
                          </div>
                          <div className="flex justify-between text-xs">
                            <span>
                              Confidence: {Math.round(result.confidence * 100)}%
                            </span>
                            {result.message && (
                              <span className="text-muted-foreground truncate ml-2">
                                {result.message}
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {!isLiveTesting && liveTestResults.length === 0 && (
                  <div className="text-center py-6 text-muted-foreground">
                    <Mic className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>
                      Click "Start Live Testing" to test voice detection in
                      real-time
                    </p>
                  </div>
                )}
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

        {/* ML-to-SOS Integration Status */}
        <Card className="mt-8 max-w-4xl mx-auto">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              ML-to-SOS Integration Monitor
            </CardTitle>
            <CardDescription>
              Real-time status of how your ML model connects to the emergency
              system
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* ML Model Status */}
              <div className="text-center p-4 bg-muted rounded-lg">
                <div className="flex items-center justify-center mb-2">
                  {voiceStatus.isRecording ? (
                    <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                  ) : (
                    <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
                  )}
                  <span className="ml-2 font-medium">ML Model</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  {voiceStatus.isRecording ? "Active & Analyzing" : "Inactive"}
                </p>
                {voiceStatus.lastAnalysis && (
                  <p className="text-xs mt-1">
                    Last:{" "}
                    {new Date(
                      voiceStatus.lastAnalysis.timestamp,
                    ).toLocaleTimeString()}
                  </p>
                )}
              </div>

              {/* Integration Bridge */}
              <div className="text-center p-4 bg-muted rounded-lg">
                <div className="flex items-center justify-center mb-2">
                  <div
                    className={`w-3 h-3 rounded-full ${
                      isMonitoring ? "bg-blue-500 animate-pulse" : "bg-gray-400"
                    }`}
                  ></div>
                  <span className="ml-2 font-medium">Integration</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  {isMonitoring ? "ML ↔ SOS Connected" : "Not Connected"}
                </p>
                <p className="text-xs mt-1">Threshold: 70% confidence</p>
              </div>

              {/* SOS System Status */}
              <div className="text-center p-4 bg-muted rounded-lg">
                <div className="flex items-center justify-center mb-2">
                  <div
                    className={`w-3 h-3 rounded-full ${
                      sosService.getEmergencyContacts().length > 0
                        ? "bg-green-500"
                        : "bg-red-500"
                    }`}
                  ></div>
                  <span className="ml-2 font-medium">SOS System</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  {sosService.getEmergencyContacts().length} contacts ready
                </p>
                <p className="text-xs mt-1">
                  {sosService.getEmergencyContacts().length === 0
                    ? "Add contacts first"
                    : "Ready to send alerts"}
                </p>
              </div>
            </div>

            {/* Integration Flow Diagram */}
            <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-3">
                How ML-to-SOS Integration Works:
              </h4>
              <div className="flex items-center justify-between text-sm">
                <div className="text-center">
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold mb-1">
                    1
                  </div>
                  <p className="text-blue-800 dark:text-blue-200">
                    Voice Detected
                  </p>
                </div>
                <div className="text-blue-600">→</div>
                <div className="text-center">
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold mb-1">
                    2
                  </div>
                  <p className="text-blue-800 dark:text-blue-200">
                    ML Analysis
                  </p>
                </div>
                <div className="text-blue-600">→</div>
                <div className="text-center">
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold mb-1">
                    3
                  </div>
                  <p className="text-blue-800 dark:text-blue-200">
                    Distress Check
                  </p>
                </div>
                <div className="text-blue-600">→</div>
                <div className="text-center">
                  <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center text-white font-bold mb-1">
                    4
                  </div>
                  <p className="text-blue-800 dark:text-blue-200">Auto SOS</p>
                </div>
              </div>
            </div>

            {/* Last ML Result */}
            {voiceStatus.lastAnalysis && (
              <div className="mt-4 p-3 bg-muted rounded-lg">
                <h4 className="font-medium mb-2">Latest ML Analysis:</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                  <div>
                    <span className="text-muted-foreground">Result:</span>
                    <Badge
                      variant={
                        voiceStatus.lastAnalysis.isDistress
                          ? "destructive"
                          : "default"
                      }
                      className="ml-2"
                    >
                      {voiceStatus.lastAnalysis.isDistress
                        ? "Distress"
                        : "Normal"}
                    </Badge>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Confidence:</span>
                    <span className="ml-2 font-medium">
                      {Math.round(voiceStatus.lastAnalysis.confidence * 100)}%
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">
                      Triggered SOS:
                    </span>
                    <span className="ml-2 font-medium">
                      {voiceStatus.lastAnalysis.isDistress &&
                      voiceStatus.lastAnalysis.confidence > 0.7
                        ? "Yes"
                        : "No"}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Time:</span>
                    <span className="ml-2 font-medium">
                      {new Date(
                        voiceStatus.lastAnalysis.timestamp,
                      ).toLocaleTimeString()}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

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
                ? "⚠️ Add emergency contacts to receive SOS alerts from ML detection"
                : "✅ Emergency contacts will be notified when ML detects distress"}
            </p>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
