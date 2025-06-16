import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export function JobDisclaimer() {
  return (
    <Alert className="bg-background border border-muted mt-8">
      <AlertCircle className="h-5 w-5 text-muted-foreground" />
      <AlertTitle className="font-semibold text-lg">Disclaimer</AlertTitle>
      <AlertDescription className="text-sm text-muted-foreground">
        RemoteChakri.com is not affiliated with any employer and does not process job applications. 
        All job listings on this platform link directly to the official websites of employers or their 
        authorized recruitment agencies. Our goal is to aggregate job opportunities from around the world, 
        making it easier for job seekers to discover and access them in one convenient place.
      </AlertDescription>
    </Alert>
  );
}
