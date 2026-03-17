"use client";
import { useEffect, useState } from "react";
import { useToast } from "@/hooks/useToast";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import API from "@/components/client/api/AxiosClient";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";

const ReportIssue = ({ onClose, issueTypes }: { onClose: () => void; issueTypes: string[]; }) => {
  const [issueType, setIssueType] = useState("Bug");
  const [description, setDescription] = useState("");
  const [email, setEmail] = useState("");
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!description.trim()) {
      toast({
        title: "Error",
        description: "Enter A Description!",
        variant: "destructive",
      });
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (issueType === "Contact" && !email.trim()) {
      toast({
        title: "Error",
        description: "Email Is Required For Contact!",
        variant: "destructive",
      });
      return;
    }

    if (email.trim() && !emailRegex.test(email)) {
      toast({
        title: "Error",
        description: "Invalid Email Format!",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const now = new Date().toLocaleString();
      const res = await API.post("/tools/report",
        {
          title: issueType,
          reason: description,
          time: now,
          id: email,
        },
      );

      if (res.data.success) {
        toast({
          title: "Success",
          description: res.data.message || "Issue Reported Successfully!",
        });
        onClose();
      } else {
        toast({
          title: "Error",
          description: res.data.message || "Failed To Report Issue!",
          variant: "destructive",
        });
      }
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.res.data.message || "Failed To Report Issue!",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (issueTypes.length === 1) {
      setIssueType(issueTypes[0]);
    }
  }, [issueTypes]);

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Report an Issue</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label>Issue Type</Label>
            <Select
              value={issueType}
              onValueChange={setIssueType}
              disabled={issueTypes.length === 1}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select Issue Type" />
              </SelectTrigger>
              <SelectContent>
                {issueTypes.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>          </div>

          <div>
            <Label>Description</Label>
            <Textarea
              placeholder="Describe the issue..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div>
            <Label>
              Email {issueType === "Contact" ? <span className="text-red-500">*</span> : "(optional)"}
            </Label>
            <Input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={loading}>
              {loading ? (
                <span className="flex items-center gap-2">
                  <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Submitting...
                </span>
              ) : (
                "Submit"
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ReportIssue;