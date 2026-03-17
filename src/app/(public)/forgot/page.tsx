"use client";
import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { Sun, Moon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/useToast";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/context/ThemeContext";
import API from "@/components/client/api/AxiosClient";
import usePasswordToggle from "@/hooks/usePasswordToggle";
import Logo from "../../../../public/icons/round_corner_logo.png";
import Logo_White from "../../../../public/icons/round_corner_logo.png";
import { handleRegNumberChange } from "@/fullStackUtils/utils/functions";
import { isValidPassword, getPasswordValidation } from "@/validators/auth/forgot";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { isValidRegNumber } from "@/validators/auth/login";

const ForgotPassword = () => {
  const [username, setUsername] = useState("");
  const [otp, setOtp] = useState("");
  const passwordToggle = usePasswordToggle();
  const { toast } = useToast();
  const [newPassword, setNewPassword] = useState("");
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { theme, setTheme } = useTheme();

  const handleSendOtp = async () => {
    if (!username.trim()) {
      toast({
        title: "Error",
        description: "Please Enter Registration Number.",
        variant: "destructive",
      });
      return;
    }
    const [isValid, errorMessage] = isValidRegNumber(username);
    if (!isValid) {
      toast({ title: "Error", description: errorMessage, variant: "destructive" });
      return false;
    }
    setLoading(true);
    try {
      const response = await API.post("/auth/forgot", { username, type: "initiate" });
      await response.data;
      if (response.data?.success) {
        toast({ title: "Success", description: "Otp Sent!" });
        setIsOtpSent(true);
      } else {
        toast({
          title: "Error",
          description: "Otp Limit Exceeded, Try Again Tomorrow!",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Error Sending Otp, Please Try Again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async () => {
    if (!otp.trim() || !newPassword.trim()) {
      toast({
        title: "Error",
        description: "Fill Otp And New Password.",
        variant: "destructive",
      });
      return;
    }

    const [isValid, message] = isValidPassword(newPassword);
    if (!isValid) {
      return toast({
        title: "Invalid Password",
        description: message || "Password Must Meet All Requirements Listed.",
        variant: "destructive",
      });
    }

    setLoading(true);
    try {
      const response = await API.post("/auth/forgot", { type: "change", username, newpass: newPassword, otp });
      await response.data;
      if (response.data?.success) {
        toast({
          title: "Success",
          description: "Password Changed!",
        });
        router.push("/login");
      } else {
        toast({
          title: "Error",
          description: "Can't Change Password, Check Otp Again!",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Error Changing Password, Please Try Again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!isOtpSent) {
      await handleSendOtp();
    } else {
      await handleChangePassword();
    }
  };

  return (
    <div className={`min-h-screen relative ${theme === "dark"
      ? "bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800"
      : "bg-gradient-to-br from-blue-50 via-white to-blue-100"
      }`}>
      {/* Navigation */}
      <nav className="flex items-center justify-between p-6">
        <Link href="/" className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-gradient-to-r from-blue-400 to-purple-500 rounded-lg flex items-center justify-center">
            <Image
              src={Logo_White}
              alt="Profile"
            />
          </div>
          <span className={`text-xl font-bold ${theme === "dark" ? "text-white" : "text-slate-800"
            }`}>SRMAP API</span>
        </Link>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setTheme(theme === "light" ? "dark" : "light")}
          className={`transition-colors duration-200 ${theme === "dark"
            ? "text-white hover:bg-white/10"
            : "text-slate-800 hover:bg-slate-200"
            }`}
          aria-label={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
        >
          <div className="relative w-4 h-4">
            <Sun
              className={`absolute inset-0 h-4 w-4 transition-all duration-300 ${theme === "light"
                ? "rotate-0 scale-100 opacity-100"
                : "rotate-90 scale-0 opacity-0"
                }`}
            />
            <Moon
              className={`absolute inset-0 h-4 w-4 transition-all duration-300 ${theme === "dark"
                ? "rotate-0 scale-100 opacity-100"
                : "-rotate-90 scale-0 opacity-0"
                }`}
            />
          </div>
        </Button>
      </nav>

      {/* Forgot Password Form */}
      <div className="flex items-center justify-center min-h-[calc(100vh-100px)] p-4">
        <Card className={`w-full max-w-md shadow-2xl ${theme === "dark"
          ? "bg-slate-800/90 border-slate-700"
          : "bg-white/90 border-slate-200"
          }`}>
          <CardHeader className="space-y-1 text-center pb-6">
            <div className="mx-auto mb-4 relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-university-400 to-blue-500 rounded-full blur-lg opacity-30 group-hover:opacity-50 transition-opacity duration-300"></div>
              <div className="relative bg-white dark:bg-gray-800 p-2 rounded-full shadow-lg">
                <Image
                  src={Logo}
                  alt="Profile"
                  className="h-16 w-16 rounded-full object-cover mx-auto transition-transform duration-300 group-hover:scale-110"
                />
              </div>
            </div>
            <CardTitle className={`text-xl font-semibold ${theme === "dark" ? "text-white" : "text-slate-800"
              }`}>Forgot Password</CardTitle>
            <CardDescription className={`text-sm leading-relaxed ${theme === "dark" ? "text-slate-400" : "text-slate-600"
              }`}>
              {!isOtpSent
                ? "Enter Your Registration Number To Receive Otp."
                : "Enter Otp And New Password To Change Password."}
            </CardDescription>
          </CardHeader>

          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4 px-6">
              <div className="space-y-2">
                <Label htmlFor="regNumber" className={`text-sm ${theme === "dark" ? "text-white" : "text-slate-700"
                  }`}>Registration Number</Label>
                <Input
                  id="regNumber"
                  placeholder="e.g., AP24110000000"
                  value={username}
                  onChange={(e) => setUsername(handleRegNumberChange(e))}
                  required
                  disabled={isOtpSent}
                  className={`uppercase h-11 focus:ring-blue-500 ${theme === "dark"
                    ? "bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400 focus:border-blue-500"
                    : "bg-white border-slate-300 text-slate-900 placeholder:text-slate-500 focus:border-blue-500"
                    }`}
                />
                <p className={`text-xs ${theme === "dark" ? "text-slate-400" : "text-slate-500"
                  }`}>Must Start With AP2</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="otp" className={`text-sm ${theme === "dark" ? "text-white" : "text-slate-700"
                  }`}>OTP</Label>
                <Input
                  id="otp"
                  placeholder="Enter 6-digit OTP"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  disabled={!isOtpSent}
                  maxLength={8}
                  className={`h-11 focus:ring-blue-500 ${theme === "dark"
                    ? "bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400 focus:border-blue-500"
                    : "bg-white border-slate-300 text-slate-900 placeholder:text-slate-500 focus:border-blue-500"
                    }`}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="newPassword" className={`text-sm ${theme === "dark" ? "text-white" : "text-slate-700"
                  }`}>New Password</Label>
                <div className="relative">
                  <Input
                    id="newPassword"
                    type={passwordToggle.inputType}
                    placeholder="Enter new password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    disabled={!isOtpSent}
                    className={`h-11 pr-12 focus:ring-blue-500 ${theme === "dark"
                      ? "bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400 focus:border-blue-500"
                      : "bg-white border-slate-300 text-slate-900 placeholder:text-slate-500 focus:border-blue-500"
                      }`}
                  />
                  {passwordToggle.toggleButton}
                </div>
                {isOtpSent && newPassword && (
                  <ul className={`text-xs pl-4 list-disc space-y-1 mt-2 ${theme === "dark" ? "text-slate-400" : "text-slate-600"
                    }`}>
                    {getPasswordValidation(newPassword).map((rule, index) => (
                      <li
                        key={index}
                        className={
                          rule.isValid
                            ? "text-green-500"
                            : theme === "dark"
                              ? "text-red-400"
                              : "text-red-500"
                        }
                      >
                        {rule.message}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </CardContent>

            <CardFooter className="flex flex-col gap-3 px-6 pb-6">
              <Button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white border-none h-11 font-medium"
                disabled={loading || (isOtpSent && !isValidPassword)}
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    {!isOtpSent ? "Sending OTP..." : "Changing Password..."}
                  </span>
                ) : !isOtpSent ? (
                  "Send OTP"
                ) : (
                  "Change Password"
                )}
              </Button>
              <button
                type="button"
                onClick={() => router.push("/login")}
                className="text-sm text-blue-400 hover:text-blue-300 underline transition-colors"
              >
                Back to Login
              </button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default ForgotPassword;