import { WifiOff } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function OfflinePage() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-muted">
      <Card className="w-full max-w-sm text-center">
        <CardHeader>
          <CardTitle className="flex flex-col items-center gap-4">
            <WifiOff className="h-16 w-16 text-destructive" />
            You Are Offline
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Please check your internet connection. This app requires a network
            connection to function.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
