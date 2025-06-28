// SOS Service for Emergency Alerts
export interface EmergencyContact {
  id: string;
  name: string;
  phone: string;
  email: string;
  relationship: string;
}

export interface SOSAlert {
  id: string;
  timestamp: string;
  type: "manual" | "auto";
  location?: { lat: number; lng: number; address?: string };
  confidence?: number;
  status: "pending" | "sent" | "failed";
}

export class SOSService {
  private static instance: SOSService;

  public static getInstance(): SOSService {
    if (!SOSService.instance) {
      SOSService.instance = new SOSService();
    }
    return SOSService.instance;
  }

  // Get emergency contacts from localStorage
  getEmergencyContacts(): EmergencyContact[] {
    const contacts = localStorage.getItem("emergencyContacts");
    return contacts ? JSON.parse(contacts) : [];
  }

  // Get current location
  async getCurrentLocation(): Promise<{
    lat: number;
    lng: number;
    address?: string;
  } | null> {
    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        resolve(null);
        return;
      }

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };

          // Try to get address (reverse geocoding)
          try {
            const address = await this.reverseGeocode(
              location.lat,
              location.lng,
            );
            resolve({ ...location, address });
          } catch {
            resolve(location);
          }
        },
        () => resolve(null),
        { timeout: 5000, enableHighAccuracy: true },
      );
    });
  }

  // Reverse geocoding to get address
  private async reverseGeocode(lat: number, lng: number): Promise<string> {
    // Using a free geocoding service (in production, use a proper service)
    const response = await fetch(
      `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=en`,
    );
    const data = await response.json();
    return data.displayName || `${lat}, ${lng}`;
  }

  // Send SOS alert
  async sendSOSAlert(
    type: "manual" | "auto",
    confidence?: number,
  ): Promise<SOSAlert> {
    const contacts = this.getEmergencyContacts();
    const location = await this.getCurrentLocation();

    const alert: SOSAlert = {
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      type,
      location: location || undefined,
      confidence,
      status: "pending",
    };

    try {
      // In a real implementation, this would send actual SMS/emails
      await this.sendNotifications(contacts, alert);
      alert.status = "sent";

      // Store alert in history
      this.storeAlert(alert);

      return alert;
    } catch (error) {
      console.error("Failed to send SOS alert:", error);
      alert.status = "failed";
      return alert;
    }
  }

  // Send notifications to emergency contacts
  private async sendNotifications(
    contacts: EmergencyContact[],
    alert: SOSAlert,
  ): Promise<void> {
    const message = this.createAlertMessage(alert);

    // Simulate sending notifications
    console.log("🚨 SOS ALERT TRIGGERED 🚨");
    console.log("Alert Details:", alert);
    console.log("Message:", message);
    console.log("Contacts to notify:", contacts);

    // In production, integrate with:
    // - Twilio for SMS
    // - SendGrid for emails
    // - Push notification service
    // - Emergency services API

    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }

  // Create alert message
  private createAlertMessage(alert: SOSAlert): string {
    const locationText = alert.location
      ? alert.location.address || `${alert.location.lat}, ${alert.location.lng}`
      : "Location unavailable";

    const typeText =
      alert.type === "auto"
        ? `automatically detected distress (confidence: ${Math.round((alert.confidence || 0) * 100)}%)`
        : "manually triggered emergency";

    return `🚨 EMERGENCY ALERT 🚨

VigilBand has ${typeText}.

Time: ${new Date(alert.timestamp).toLocaleString()}
Location: ${locationText}

Please check on the user immediately or contact emergency services if needed.

- VigilBand Safety System`;
  }

  // Store alert in history
  private storeAlert(alert: SOSAlert): void {
    const history = this.getAlertHistory();
    history.unshift(alert);

    // Keep only last 50 alerts
    const trimmedHistory = history.slice(0, 50);
    localStorage.setItem("sosAlertHistory", JSON.stringify(trimmedHistory));
  }

  // Get alert history
  getAlertHistory(): SOSAlert[] {
    const history = localStorage.getItem("sosAlertHistory");
    return history ? JSON.parse(history) : [];
  }

  // Test alert (for manual testing)
  async sendTestAlert(): Promise<SOSAlert> {
    return this.sendSOSAlert("manual");
  }
}

export const sosService = SOSService.getInstance();
