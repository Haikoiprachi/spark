// ML Service for Voice Distress Detection
const ML_API_URL = "https://mourakshi123-voicing-api.hf.space";
const ACCESS_TOKEN = "hf_NDwsTizlYbJcNbBtqBoTMoOCmFJLdhZpj";

export interface VoiceAnalysisResult {
  isDistress: boolean;
  confidence: number;
  timestamp: string;
  message?: string;
}

export interface AudioRecorderState {
  isRecording: boolean;
  isProcessing: boolean;
  mediaRecorder: MediaRecorder | null;
  stream: MediaStream | null;
}

export class MLVoiceService {
  private static instance: MLVoiceService;
  private audioRecorder: AudioRecorderState = {
    isRecording: false,
    isProcessing: false,
    mediaRecorder: null,
    stream: null,
  };

  public static getInstance(): MLVoiceService {
    if (!MLVoiceService.instance) {
      MLVoiceService.instance = new MLVoiceService();
    }
    return MLVoiceService.instance;
  }

  // Initialize audio recording
  async initializeAudio(): Promise<boolean> {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          sampleRate: 16000,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
        },
      });

      this.audioRecorder.stream = stream;
      return true;
    } catch (error) {
      console.error("Error accessing microphone:", error);
      return false;
    }
  }

  // Start continuous monitoring
  async startMonitoring(
    onDistressDetected: (result: VoiceAnalysisResult) => void,
  ): Promise<boolean> {
    if (!this.audioRecorder.stream) {
      const initialized = await this.initializeAudio();
      if (!initialized) return false;
    }

    try {
      const mediaRecorder = new MediaRecorder(this.audioRecorder.stream!, {
        mimeType: "audio/webm;codecs=opus",
      });

      let audioChunks: Blob[] = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunks.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        if (audioChunks.length > 0) {
          const audioBlob = new Blob(audioChunks, { type: "audio/webm" });
          audioChunks = [];

          // Process the audio chunk
          const result = await this.analyzeAudio(audioBlob);
          if (result) {
            onDistressDetected(result);
          }
        }
      };

      this.audioRecorder.mediaRecorder = mediaRecorder;
      this.audioRecorder.isRecording = true;

      // Record in 3-second chunks for real-time analysis
      mediaRecorder.start();
      this.scheduleNextRecording();

      return true;
    } catch (error) {
      console.error("Error starting voice monitoring:", error);
      return false;
    }
  }

  // Schedule continuous recording in chunks
  private scheduleNextRecording(): void {
    if (!this.audioRecorder.isRecording || !this.audioRecorder.mediaRecorder)
      return;

    setTimeout(() => {
      if (this.audioRecorder.mediaRecorder && this.audioRecorder.isRecording) {
        this.audioRecorder.mediaRecorder.stop();

        // Start next recording chunk
        setTimeout(() => {
          if (
            this.audioRecorder.mediaRecorder &&
            this.audioRecorder.isRecording
          ) {
            this.audioRecorder.mediaRecorder.start();
            this.scheduleNextRecording();
          }
        }, 100);
      }
    }, 3000); // 3-second chunks
  }

  // Stop monitoring
  stopMonitoring(): void {
    this.audioRecorder.isRecording = false;

    if (this.audioRecorder.mediaRecorder) {
      this.audioRecorder.mediaRecorder.stop();
      this.audioRecorder.mediaRecorder = null;
    }

    if (this.audioRecorder.stream) {
      this.audioRecorder.stream.getTracks().forEach((track) => track.stop());
      this.audioRecorder.stream = null;
    }
  }

  // Analyze audio using the ML model
  private async analyzeAudio(
    audioBlob: Blob,
  ): Promise<VoiceAnalysisResult | null> {
    if (this.audioRecorder.isProcessing) return null;

    this.audioRecorder.isProcessing = true;

    try {
      console.log("🎤 Sending audio to ML model for analysis...");

      // Convert audio blob to format expected by the ML model
      const formData = new FormData();
      formData.append("audio", audioBlob, "audio.webm");

      // Try different HuggingFace Spaces endpoints
      const endpoints = [
        `${ML_API_URL}/api/predict`,
        `${ML_API_URL}/predict`,
        `${ML_API_URL}/gradio_api/call/predict`,
        `${ML_API_URL}/run/predict`,
        `${ML_API_URL}/call/predict`,
        `${ML_API_URL}`,
      ];

      let response: Response | null = null;
      let lastError = "";

      // First try Gradio API format (most common for HF Spaces)
      try {
        console.log("🔗 Trying Gradio API format...");

        // Convert audio to base64 for Gradio API
        const arrayBuffer = await audioBlob.arrayBuffer();
        const base64Audio = btoa(
          String.fromCharCode(...new Uint8Array(arrayBuffer)),
        );

        const gradioPayload = {
          data: [base64Audio],
          fn_index: 0,
        };

        response = await fetch(`${ML_API_URL}/api/predict`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${ACCESS_TOKEN}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(gradioPayload),
        });

        if (response.ok) {
          console.log("✅ Gradio API format successful");
        } else {
          const errorText = await response.text();
          console.log("❌ Gradio API failed:", response.status, errorText);
          response = null;
        }
      } catch (error) {
        console.log("❌ Gradio API error:", error);
        response = null;
      }

      // If Gradio failed, try other endpoints with FormData
      if (!response) {
        for (const endpoint of endpoints) {
          try {
            console.log(`🔗 Trying endpoint: ${endpoint}`);

            response = await fetch(endpoint, {
              method: "POST",
              headers: {
                Authorization: `Bearer ${ACCESS_TOKEN}`,
              },
              body: formData,
            });

            console.log(`📡 Response from ${endpoint}:`, response.status);

            if (response.ok) {
              break; // Success, stop trying other endpoints
            } else {
              const errorText = await response.text();
              lastError = `${response.status} - ${errorText}`;
              console.log(`❌ Failed ${endpoint}:`, lastError);
              response = null; // Reset for next attempt
            }
          } catch (error) {
            console.log(`❌ Network error for ${endpoint}:`, error);
            lastError = String(error);
            response = null;
          }
        }
      }

      if (!response || !response.ok) {
        throw new Error(
          `All ML API endpoints failed. Last error: ${lastError}`,
        );
      }

      const result = await response.json();
      console.log("🤖 ML Model Result:", result);

      // Process the ML model response
      const isDistress = this.interpretMLResult(result);
      const confidence = result.confidence || 0;

      return {
        isDistress,
        confidence,
        timestamp: new Date().toISOString(),
        message: result.message || "Voice analysis completed",
      };
    } catch (error) {
      console.error("Error analyzing audio:", error);
      return null;
    } finally {
      this.audioRecorder.isProcessing = false;
    }
  }

  // Interpret ML model result
  private interpretMLResult(result: any): boolean {
    console.log("🔍 Interpreting ML result:", result);

    // Check various possible response formats from HuggingFace models
    if (result.prediction !== undefined) {
      const prediction = String(result.prediction).toLowerCase();
      const isDistress =
        prediction.includes("distress") ||
        prediction.includes("danger") ||
        prediction.includes("help") ||
        prediction.includes("emergency") ||
        prediction.includes("panic");
      console.log("📊 Prediction-based result:", isDistress);
      return isDistress;
    }

    if (result.label !== undefined) {
      const label = String(result.label).toLowerCase();
      const isDistress =
        label.includes("distress") ||
        label.includes("danger") ||
        label.includes("emergency");
      console.log("🏷️ Label-based result:", isDistress);
      return isDistress;
    }

    if (result.confidence !== undefined) {
      const isDistress = result.confidence > 0.7; // Threshold for distress detection
      console.log(
        "📈 Confidence-based result:",
        isDistress,
        "confidence:",
        result.confidence,
      );
      return isDistress;
    }

    // Check if it's an array of predictions (common in HuggingFace)
    if (Array.isArray(result) && result.length > 0) {
      const topResult = result[0];
      if (topResult.label && topResult.score) {
        const label = String(topResult.label).toLowerCase();
        const isDistress =
          (label.includes("distress") ||
            label.includes("danger") ||
            label.includes("emergency")) &&
          topResult.score > 0.7;
        console.log(
          "📋 Array-based result:",
          isDistress,
          "top result:",
          topResult,
        );
        return isDistress;
      }
    }

    console.log("❓ Unknown result format, defaulting to false");
    return false;
  }

  // Manual analysis for testing
  async analyzeFile(file: File): Promise<VoiceAnalysisResult | null> {
    return this.analyzeAudio(file);
  }

  // Get current monitoring status
  getStatus(): { isRecording: boolean; isProcessing: boolean } {
    return {
      isRecording: this.audioRecorder.isRecording,
      isProcessing: this.audioRecorder.isProcessing,
    };
  }

  // Test API connectivity
  async testAPIConnection(): Promise<{ success: boolean; message: string }> {
    try {
      console.log("🔌 Testing API connectivity...");

      // Simple GET request to check if the space is alive
      const response = await fetch(ML_API_URL, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${ACCESS_TOKEN}`,
        },
      });

      console.log("📡 API connectivity test:", response.status);

      if (response.status === 200 || response.status === 405) {
        // 405 Method Not Allowed is okay - means the endpoint exists
        return {
          success: true,
          message: `API is reachable (status: ${response.status})`,
        };
      } else {
        return {
          success: false,
          message: `API returned status: ${response.status}`,
        };
      }
    } catch (error) {
      return {
        success: false,
        message: `Connection failed: ${error}`,
      };
    }
  }
}

export const mlVoiceService = MLVoiceService.getInstance();
