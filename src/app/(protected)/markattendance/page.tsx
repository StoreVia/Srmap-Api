"use client";
import { useState } from "react";
import { useToast } from "@/hooks/useToast";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Check, X, Loader2 } from "lucide-react";
import API from "@/components/client/api/AxiosClient";
import SessionCard from "@/components/utils/SessionCard";
import { useSessionValidator } from "@/hooks/useSessionValidator";
import { extractErrorMessage } from "@/fullStackUtils/utils/functions";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const AttendanceCode = () => {
  const { toast } = useToast();
  const { sessionValid, sessionId } = useSessionValidator();

  const [attendanceCode, setAttendanceCode] = useState("");
  const [codeSubmitted, setCodeSubmitted] = useState(false);
  const [submissionResult, setSubmissionResult] = useState<boolean | null>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const isValidCodeFormat = (code: string) => /^[A-Z]\d{6}$/.test(code);

  const handleSubmitCode = async () => {
    if (!attendanceCode.trim()) {
      toast({
        title: "Error",
        description: "Please Enter Attendance Code.",
        variant: "destructive",
      });
      return;
    }

    if (!isValidCodeFormat(attendanceCode)) {
      toast({
        title: "Invalid Format",
        description: "Code Must Start With Capital Alphabet And Followed By 6 Digit Number.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsLoading(true);
      setErrorMessage("");

      const response = await API.post(`/srmapi/attendance/mark`, {
        code: attendanceCode,
        sessionid: sessionId,
      });

      setCodeSubmitted(true);

      if (response.data.success) {
        setSubmissionResult(true);
        toast({ title: "Success", description: response.data.message });
      } else {
        setSubmissionResult(false);
        const msg = response.data.message || "Incorrect Attendance Code!";
        setErrorMessage(msg);
        toast({ title: "Error", description: msg, variant: "destructive" });
      }
    } catch (err: any) {
      const msg = extractErrorMessage(err);
      setCodeSubmitted(true);
      setSubmissionResult(false);
      setErrorMessage(msg);
      toast.error(msg);
    } finally {
      setIsLoading(false);
      setAttendanceCode("");
    }
  };

  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Attendance Code</CardTitle>
          <CardDescription>
            {sessionValid ? "Enter Your Attendance Code" : "Initiate A Session And Mark Attendance"}
          </CardDescription>
        </CardHeader>

        <CardContent>
          {sessionValid ? (
            <form
              className="space-y-6"
              onSubmit={(e) => {
                e.preventDefault();
                handleSubmitCode();
              }}
            >
              <div className="space-y-2">
                <Label htmlFor="attendance-code">Attendance Code</Label>

                <div className="flex space-x-2">
                  <Input
                    id="attendance-code"
                    placeholder="Enter code (e.g. A123456)"
                    value={attendanceCode}
                    onChange={(e) => {
                      let value = e.target.value.toUpperCase();
                      let firstChar = value.charAt(0).replace(/[^A-Z]/g, "");
                      let digits = value.slice(1).replace(/[^0-9]/g, "").slice(0, 6);
                      setAttendanceCode(firstChar + digits);
                    }}
                    disabled={isLoading}
                  />

                  <Button type="submit" disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Processing
                      </>
                    ) : (
                      "Submit"
                    )}
                  </Button>
                </div>

                <p className="text-xs text-muted-foreground">
                  Code Format: Capital Letter Followed By 6 Digits (e.g. A123456)
                </p>
              </div>

              {codeSubmitted && (
                <div className={`p-4 rounded-md ${submissionResult ? "bg-green-100" : "bg-red-100"}`}>
                  <div className="flex items-center gap-2">
                    {submissionResult ? (
                      <Check className="h-5 w-5 text-green-600" />
                    ) : (
                      <X className="h-5 w-5 text-red-600" />
                    )}
                    <p className={`font-medium ${submissionResult ? "text-green-600" : "text-red-600"}`}>
                      {submissionResult ? "Attendance Marked!" : errorMessage}
                    </p>
                  </div>
                </div>
              )}
            </form>
          ) : (
            <SessionCard />
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AttendanceCode;