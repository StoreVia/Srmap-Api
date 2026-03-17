"use client";
import Image from "next/image";
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/context/ThemeContext";
import Logo from "../../public/icons/round_corner_logo.png";
import ReportIssue from "@/components/page/settings/ReportIssue";
import { ErrorFallbackProps } from "@/components/utils/ErrorBoundary";
import { Sun, Moon, Home, AlertCircle, Zap, Bug, Cpu } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const Error = ({ error, resetError }: ErrorFallbackProps) => {
    const { theme, setTheme } = useTheme();
    const { isAuthenticated } = useAuth();
    const [showReportModal, setShowReportModal] = useState(false);

    const handleGoHome = () => {
        return window.location.href = "/dashboard";
    };

    const reportMail = (errorData: { message?: string; stack?: string; url: string; timestamp: string }) => {
        const body = encodeURIComponent(
            `Application Crash Report:\n\n` +
            `Message: ${errorData.message ?? "N/A"}\n` +
            `Stack: ${errorData.stack ?? "N/A"}\n` +
            `URL: ${errorData.url}\n` +
            `Timestamp: ${errorData.timestamp}`
        );
        window.open(`mailto:srmapi.dev@gmail.com?subject=Application Crash Report&body=${body}`, "_blank");
    };

    const handleReportBug = async () => {
        const errorData = {
            message: error?.message,
            url: window.location.href,
            timestamp: new Date().toISOString(),
        };

        if (!isAuthenticated) {
            return reportMail(errorData);
        }

        try {
            setShowReportModal(true);
        } catch (e) {
        } finally {
            resetError();
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 via-orange-50 to-yellow-100 dark:from-gray-900 dark:via-red-900 dark:to-orange-950 p-4 relative overflow-hidden">
            {showReportModal && (
                <ReportIssue onClose={() => setShowReportModal(false)} issueTypes={["Error"]}/>
            )}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-20 left-20 w-64 h-64 bg-red-200/20 dark:bg-red-500/10 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute bottom-20 right-20 w-96 h-96 bg-orange-200/20 dark:bg-orange-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
                <div className="absolute top-1/2 left-1/4 w-32 h-32 bg-yellow-200/30 dark:bg-yellow-500/20 rounded-full blur-2xl animate-bounce delay-500"></div>
                <div className="absolute top-1/3 right-1/3 w-20 h-20 bg-red-200/30 dark:bg-red-500/20 rounded-full blur-xl animate-pulse delay-2000"></div>
                <div className="absolute bottom-1/3 left-1/2 w-40 h-40 bg-orange-200/20 dark:bg-orange-500/10 rounded-full blur-2xl animate-bounce delay-1500"></div>
            </div>
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-1/4 left-1/6 animate-glitch">
                    <Bug className="h-8 w-8 text-red-400/60 dark:text-red-500/40" />
                </div>
                <div className="absolute top-3/4 right-1/4 animate-shake">
                    <AlertCircle className="h-6 w-6 text-orange-400/60 dark:text-orange-500/40" />
                </div>
                <div className="absolute top-1/2 right-1/6 animate-spark">
                    <Zap className="h-10 w-10 text-yellow-400/50 dark:text-yellow-500/30" />
                </div>
                <div className="absolute bottom-1/4 left-1/3 animate-wobble">
                    <Cpu className="h-7 w-7 text-red-300/50 dark:text-red-600/30" />
                </div>
            </div>
            <div className="fixed top-4 right-4 z-50">
                <Button
                    onClick={() => setTheme(theme === "light" ? "dark" : "light")}
                    aria-label={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
                    className={`h-12 w-12 flex items-center justify-center rounded-full transition-all duration-300 hover:scale-110 ${theme === "dark"
                        ? "bg-white border border-black hover:bg-gray-200"
                        : "bg-white border border-red-500 hover:bg-neutral-800"
                        }`}
                >
                    {theme === "dark" ? (
                        <Moon className="h-5 w-5 text-red-500 transition-transform duration-300" />
                    ) : (
                        <Sun className="h-5 w-5 text-orange-500 transition-transform duration-300" />
                    )}
                </Button>
            </div>
            <Card className="w-full max-w-lg shadow-2xl border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl relative z-10 transition-all duration-300 hover:shadow-3xl">
                <div className="absolute inset-0 bg-gradient-to-r from-red-500/5 to-orange-500/5 dark:from-red-400/5 dark:to-orange-400/5 rounded-lg"></div>
                <CardHeader className="space-y-6 text-center relative z-10">
                    <div className="mx-auto mb-4 relative group">
                        <div className="absolute inset-0 bg-gradient-to-r from-red-400 to-orange-500 rounded-full blur-lg opacity-30 group-hover:opacity-50 transition-opacity duration-300"></div>
                        <div className="relative bg-white dark:bg-gray-800 p-2 rounded-full shadow-lg">
                            <Image
                                src={Logo}
                                alt="Profile"
                                className="h-16 w-16 rounded-full object-cover mx-auto transition-transform duration-300 group-hover:scale-110"
                            />
                        </div>
                    </div>
                    <div className="relative">
                        <div className="text-6xl mb-4 flex justify-center">
                            <AlertCircle className="h-20 w-20 text-red-500 dark:text-red-400" />
                        </div>
                        <h1 className="text-6xl font-bold bg-gradient-to-r from-red-500 via-orange-600 to-yellow-600 dark:from-red-400 dark:via-orange-400 dark:to-yellow-400 bg-clip-text text-transparent">
                            CRASH
                        </h1>
                    </div>
                    <div className="space-y-3">
                        <CardTitle className="text-2xl font-bold bg-gradient-to-r from-red-700 to-orange-600 dark:from-red-400 dark:to-orange-400 bg-clip-text text-transparent">
                            Something Went Wrong!
                        </CardTitle>
                        <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                            <Bug className="h-4 w-4 text-red-500" />
                            <span>The Application Had A Unexpected Error!</span>
                            <Zap className="h-4 w-4 text-yellow-500" />
                        </div>
                    </div>
                </CardHeader>

                <CardContent className="space-y-6 relative z-10 text-center">
                    <div className="space-y-4">
                        <div className="p-4 rounded-lg bg-red-50/50 dark:bg-red-900/20 border border-red-200/50 dark:border-red-800/30 backdrop-blur-sm">
                            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                                Oops! Sry For The Inconvenience Caused, Could You Please Report It So That We
                                Can Solve This Error.
                            </p>
                        </div>

                    </div>
                    <div className="flex flex-col sm:flex-row gap-4 pt-4">
                        <Button
                            onClick={handleGoHome}
                            className="flex-1 h-12 bg-gradient-to-r from-university-600 to-university-700 hover:from-university-700 hover:to-university-800 dark:from-university-500 dark:to-university-600 dark:hover:from-university-400 dark:hover:to-university-500 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02]">
                            <Home className="h-4 w-4 mr-2" />
                            Go Home
                        </Button>
                    </div>
                    <Button
                        onClick={handleReportBug}
                        disabled={showReportModal}
                        variant="outline"
                        className="w-full h-10 border-red-300 dark:border-red-600 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-300"
                    >
                        <Bug className="h-4 w-4 mr-2" />
                        {showReportModal ? "Reporting..." : "Report This Issue"}
                    </Button>
                </CardContent>
            </Card>
            <style dangerouslySetInnerHTML={{
                __html: `
                    @keyframes glitch {
                        0%, 100% { transform: translateX(0); }
                        20% { transform: translateX(-2px); }
                        40% { transform: translateX(2px); }
                        60% { transform: translateX(-1px); }
                        80% { transform: translateX(1px); }
                    }
                    @keyframes shake {
                        0%, 100% { transform: translateX(0); }
                        25% { transform: translateX(-3px) rotate(-1deg); }
                        75% { transform: translateX(3px) rotate(1deg); }
                    }
                    @keyframes spark {
                        0%, 100% { transform: translateY(0px) rotate(0deg); opacity: 1; }
                        50% { transform: translateY(-15px) rotate(180deg); opacity: 0.7; }
                    }
                    @keyframes wobble {
                        0%, 100% { transform: rotate(0deg); }
                        25% { transform: rotate(-5deg); }
                        75% { transform: rotate(5deg); }
                    }
                    .animate-glitch {
                        animation: glitch 2s ease-in-out infinite;
                    }
                    .animate-shake {
                        animation: shake 3s ease-in-out infinite 0.5s;
                    }
                    .animate-spark {
                        animation: spark 4s ease-in-out infinite 1s;
                    }
                    .animate-wobble {
                        animation: wobble 3s ease-in-out infinite 1.5s;
                    }
                `
            }} />
        </div>
    );
};

export default function ErrorFallBack({ error, resetError }: any) {
    return <Error error={error} resetError={resetError} />;
}