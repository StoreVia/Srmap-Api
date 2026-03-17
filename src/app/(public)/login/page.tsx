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
import usePasswordToggle from "@/hooks/usePasswordToggle";
import Logo from "../../../../public/icons/round_corner_logo.png";
import Logo_White from "../../../../public/icons/round_corner_logo.png";
import { handleRegNumberChange } from "@/fullStackUtils/utils/functions";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const passwordToggle = usePasswordToggle();
  const { login, isLoginLoading } = useAuth();
  const { theme, setTheme } = useTheme();
  const router = useRouter();

  const toggleTheme = () => setTheme(theme === "light" ? "dark" : "light");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await login(username, password);
  };

  return (
    <div className={`min-h-screen relative ${theme === "dark" ? "bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800" : "bg-gradient-to-br from-blue-50 via-white to-blue-100"}`}>
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
          onClick={() => toggleTheme()}
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
                  onClick={toggleTheme}
                  className="h-16 w-16 cursor-pointer rounded-full object-cover mx-auto transition-transform duration-300 group-hover:scale-110"
                />
              </div>
            </div>
            <CardTitle className={`text-xl font-semibold ${theme === "dark" ? "text-white" : "text-slate-800"
              }`}>Srmap API - Portal</CardTitle>
            <CardDescription className={`text-sm leading-relaxed ${theme === "dark" ? "text-slate-400" : "text-slate-600"
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
                    ? "bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400 focus:border-blue-500"
                    : "bg-white border-slate-300 text-slate-900 placeholder:text-slate-500 focus:border-blue-500"
                    }`}
                />
                <p className={`text-xs ${theme === "dark" ? "text-slate-400" : "text-slate-500"
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
                        ? "bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400 focus:border-blue-500"
                        : "bg-white border-slate-300 text-slate-900 placeholder:text-slate-500 focus:border-blue-500"
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
                className="w-full bg-blue-600 hover:bg-blue-700 text-white border-none h-11 font-medium"
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
                className="text-sm text-blue-400 hover:text-blue-300 underline transition-colors"
              >
                Forgot Password?
              </button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default Login;