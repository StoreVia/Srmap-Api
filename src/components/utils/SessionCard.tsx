"use client";
import { useState } from "react";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/useToast";
import { Button } from "@/components/ui/button";
import API from "@/components/client/api/AxiosClient";
import { useStudentData } from "@/context/StudentContext";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useSessionValidator } from "@/hooks/useSessionValidator";
import { useLocalStorageContext } from "@/context/LocalStorageContext";
import { extractErrorMessage } from "@/fullStackUtils/utils/functions";

const SessionCard = () => {
  const { toast } = useToast();
  const { fetchFreshData } = useStudentData();
  const { updateProfile } = useLocalStorageContext();
  const { sessionValid } = useSessionValidator();
  const [loadingFetch, setLoadingFetch] = useState(false);

  const handleFetchData = async () => {
    setLoadingFetch(true);
    try {
      const limitRes = await API.get(`/srmapi/limit`);
      if (limitRes.data.limit <= 0) {
        toast({
          title: "Error",
          description: "Daily Limit Exceeded, Try Again Tomorrow!",
          variant: "destructive",
        });
        return;
      }
      const newData = await API.get("/srmapi/initiate/session");
      const { sessionId, sessionTime } = newData.data;
      updateProfile({ sessionId, sessionTime });
      fetchFreshData({ sessionId, sessionTime });
    } catch (err) {
      toast.error(extractErrorMessage(err));
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