"use client";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useStudentData } from "@/context/StudentContext";
import { useLocalStorageContext } from "@/context/LocalStorageContext";
import { toast } from "@/hooks/utils/useToast";

export const CachedDataBanner: React.FC = () => {
  const { initiateSession } = useStudentData();
  const { profile: lProfile } = useLocalStorageContext();
  const [isFetchingNewData, setIsFetchingNewData] = useState(false);

  if (!lProfile?.hasCachedData) return null;

  const handleFetchNewData = async () => {
    setIsFetchingNewData(true);
    try {
      const res = await initiateSession();
      if (res) {
        toast({
          title: "Success",
          description: `New data fetched for session: ${res.sessionTime}`,
        });
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: "SRM portal is still unreachable.",
        });
      }
    } finally {
      setIsFetchingNewData(false);
    }
  };

  return (
    <div className="w-full bg-red-500 text-white text-center text-xs sm:text-sm py-2 px-4 font-medium z-30 flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4">
      <span>
        Showing cached data from {lProfile.sessionTime} since college portal is down. Click below button if portal was up again!
      </span>
      <Button
        size="sm"
        variant="outline"
        className="h-7 text-xs bg-transparent border-white text-white hover:bg-white hover:text-red-500"
        disabled={isFetchingNewData}
        onClick={handleFetchNewData}
      >
        {isFetchingNewData && <Loader2 className="mr-2 h-3 w-3 animate-spin" />}
        {isFetchingNewData ? "Fetching..." : "Fetch new data"}
      </Button>
    </div>
  );
};