"use client";
import Link from 'next/link';
import Image from 'next/image';
import { useState } from "react";
import { Sun, Moon } from "lucide-react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import { useLocalStorageContext } from "@/context/LocalStorageContext";
import usePasswordToggle from "@/hooks/utils/usePasswordToggle";
import { toast } from "@/hooks/utils/useToast";
import { CachedDataPrompt } from "@/components/utils/CachedDataPrompt";
import Logo from "../../../../public/icons/round_corner_logo.png";
import Logo_White from "../../../../public/icons/round_corner_logo.png";
import { handleRegNumberChange } from "@/shared/utils/functions";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const passwordToggle = usePasswordToggle();
  const { login, isLoginLoading } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { profile, upsertAccount } = useLocalStorageContext();
  const router = useRouter();

  const [showCachedPrompt, setShowCachedPrompt] = useState(false);
  const [cachedUsername, setCachedUsername] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result: any = await login(username, password);
    if (result && !result.success && result.error?.includes("SRM server is unreachable")) {
      if (result.hasCachedData) {
        const normalizedUsername = username.toUpperCase();
        setCachedUsername(normalizedUsername);
        setShowCachedPrompt(true);
      } else {
        toast.error("College portal was down and since its your first login your data isnt cached.");
      }
    }
  };

  const handleUseCachedData = async () => {
    setShowCachedPrompt(false);
    await login(username, password, true);
  };

  return (
    <div className={`min-h-screen transition-colors duration-500 ${theme === "dark" ? "bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900" : "bg-gradient-to-br from-blue-50 via-white to-blue-100"}`}>
      <nav className="container mx-auto px-6 py-6 flex items-center justify-between">
        <Link href="/" className="flex items-center space-x-2">
          <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-md">
            <Image
              src={Logo_White}
              alt="Profile"
              className="w-8 h-8 object-contain"
            />
          </div>
          <span className={`text-xl font-bold ${theme === "dark" ? "text-white" : "text-gray-900"
            }`}>SRMAP API</span>
        </Link>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => toggleTheme()}
          className={`transition-colors duration-200 ${theme === "dark"
            ? "bg-gray-800 border border-gray-700 text-gray-300 hover:text-white"
            : "bg-white border border-gray-200 text-gray-600 hover:text-gray-900"
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

      <div className="flex items-center justify-center min-h-[calc(100vh-100px)] p-4">
        <Card className={`w-full max-w-md shadow-2xl ${theme === "dark"
          ? "bg-gray-800 border-gray-700"
          : "bg-white border-gray-200"
          }`}>
          <CardHeader className="space-y-1 text-center pb-6">
            <div className="mx-auto mb-4 relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-university-400 to-blue-500 rounded-full blur-lg opacity-30 group-hover:opacity-50 transition-opacity duration-300"></div>
              <div className="relative bg-white dark:bg-gray-800 p-2 rounded-full shadow-lg">
                <Image
                  src={Logo}
                  alt="Profile"
                  onClick={toggleTheme}
                  className="h-16 w-16 cursor-pointer rounded-full object-cover mx-auto transition-transform duration-300 group-hover:scale-110"
                />
              </div>
            </div>
            <CardTitle className={`text-xl font-semibold ${theme === "dark" ? "text-white" : "text-gray-900"
              }`}>Srmap API - Portal</CardTitle>
            <CardDescription className={`text-sm leading-relaxed ${theme === "dark" ? "text-gray-400" : "text-gray-600"
              }`}>
              Enter Your Registration Number And Password, Using Same Credentials As Srmap Student Portal.
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4 px-6">
              <div className="space-y-2">
                <Input
                  id="regNumber"
                  label="Registration Number"
                  placeholder="e.g., AP24110000000"
                  value={username}
                  animated={true}
                  onChange={(e) => setUsername(handleRegNumberChange(e))}
                  required
                  className={`uppercase h-11 focus:ring-blue-500 ${theme === "dark"
                    ? "bg-gray-900/40 border-gray-700 text-white placeholder:text-gray-400 focus:border-blue-500"
                    : "bg-white border-gray-300 text-gray-900 placeholder:text-gray-500 focus:border-blue-500"
                    }`}
                />
                <p className={`text-xs ${theme === "dark" ? "text-gray-400" : "text-gray-500"
                  }`}>Must Start With AP</p>
              </div>
              <div className="space-y-2">
                <div className="relative">
                  <div className="relative">
                    <Input
                      id="password"
                      label="Password"
                      type={passwordToggle.inputType}
                      value={password}
                      placeholder='Student Portal Password'
                      animated={true}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className={`h-11 pr-12 focus:ring-blue-500 ${theme === "dark"
                        ? "bg-gray-900/40 border-gray-700 text-white placeholder:text-gray-400 focus:border-blue-500"
                        : "bg-white border-gray-300 text-gray-900 placeholder:text-gray-500 focus:border-blue-500"
                        }`}
                    />
                    {passwordToggle.toggleButton}
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col gap-3 px-6 pb-6">
              <Button
                type="submit"
                className="w-full h-11 font-medium bg-black text-white hover:bg-gray-900 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-200"
                disabled={isLoginLoading}
              >
                {isLoginLoading ? (
                  <span className="flex items-center gap-2">
                    <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Logging in...
                  </span>
                ) : "Login"}
              </Button>
              <button
                type="button"
                onClick={() => router.push('/forgot')}
                className={`text-sm underline transition-colors ${theme === "dark" ? "text-blue-300 hover:text-blue-200" : "text-blue-600 hover:text-blue-700"}`}
              >
                Forgot Password?
              </button>
            </CardFooter>
          </form>
        </Card>
      </div>

      <CachedDataPrompt
        open={showCachedPrompt}
        onOpenChange={setShowCachedPrompt}
        onConfirm={handleUseCachedData}
        onCancel={() => setShowCachedPrompt(false)}
        description="The college portal is currently down, but you have previously logged in. Would you like to view your last updated data?"
      />
    </div>
  );
};

export default Login;