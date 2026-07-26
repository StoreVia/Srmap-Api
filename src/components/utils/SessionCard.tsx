"use client";
import axios from "axios";
import { useState } from "react";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/utils/useToast";
import { Button } from "@/components/ui/button";
import { useStudentData } from "@/context/StudentContext";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useSessionValidator } from "@/hooks/auth/useSessionValidator";

const SessionCard = () => {
  const { toast } = useToast();
  const { initiateSession } = useStudentData();
  const { sessionValid } = useSessionValidator();
  const [loadingFetch, setLoadingFetch] = useState(false);

  const handleFetchData = async () => {
    setLoadingFetch(true);
    try {
      const res = await initiateSession();
      if (res) {
        toast({ title: "Success", description: `Session successfully initiated. New time: ${res.sessionTime}` });
      } else {
        toast({ variant: "destructive", title: "Error", description: "Failed to initiate session. SRM server might be unreachable." });
      }
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const message = err.response?.data?.message || "Error Fetching Data!";
        toast({ variant: "destructive", title: "Error", description: message });
      } else {
        toast({ variant: "destructive", title: "Error", description: "Unexpected Error!" });
      }
    } finally {
      setLoadingFetch(false);
    }
  };

  if (sessionValid) return null;

  return (
    <div className="flex flex-col items-center justify-center space-y-4 py-8">
      <Button onClick={handleFetchData} disabled={loadingFetch}>
        {loadingFetch ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Initiating
          </>
        ) : (
          "Initiate Session"
        )}
      </Button>

      <Alert>
        <AlertDescription className="text-red-500 animate-bounce">
          To Use This Feature Click Above Button.
        </AlertDescription>
      </Alert>
    </div>
  );
};

export default SessionCard;