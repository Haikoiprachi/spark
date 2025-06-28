import Navbar from "@/components/Navbar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, Plus } from "lucide-react";

export default function EmergencyContact() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="bg-blue-500 rounded-full p-3">
              <Users className="h-8 w-8 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-foreground">
            Emergency Contacts
          </h1>
          <p className="text-muted-foreground mt-2">
            Manage your emergency contacts who will be notified during an alert
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Your Emergency Contacts</CardTitle>
            <CardDescription>
              Add trusted contacts who will receive SOS alerts
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-12">
              <div className="bg-muted rounded-full p-6 w-24 h-24 mx-auto mb-4 flex items-center justify-center">
                <Plus className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">
                No contacts added yet
              </h3>
              <p className="text-muted-foreground mb-4">
                Add your first emergency contact to get started
              </p>
              <Button>Add Emergency Contact</Button>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
