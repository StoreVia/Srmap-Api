"use client";
import Image from "next/image";
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/context/ThemeContext";
import Logo from "../../public/icons/round_corner_logo.png";
import ReportIssue from "@/components/page/settings/ReportIssue";
import { ErrorFallbackProps } from "@/components/utils/ErrorBoundary";
import { Sun, Moon, Home, AlertCircle, Bug } from "lucide-react";
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
        <div className="min-h-screen flex items-center justify-center bg-background p-4">
            {showReportModal && (
                <ReportIssue onClose={() => setShowReportModal(false)} issueTypes={["Error"]} />
            )}

            <div className="fixed top-4 right-4 z-50">
                <Button
                    onClick={() => setTheme(theme === "light" ? "dark" : "light")}
                    aria-label={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
                    variant="outline"
                    size="icon"
                    className="h-10 w-10 rounded-full"
                >
                    {theme === "dark" ? (
                        <Sun className="h-4 w-4" />
                    ) : (
                        <Moon className="h-4 w-4" />
                    )}
                </Button>
            </div>

            <Card className="w-full max-w-md shadow-lg">
                <CardHeader className="text-center space-y-4 pb-4">
                    <div className="mx-auto">
                        <Image
                            src={Logo}
                            alt="Logo"
                            className="h-12 w-12 rounded-full object-cover mx-auto"
                        />
                    </div>

                    <div className="space-y-2">
                        <div className="flex justify-center">
                            <div className="h-14 w-14 rounded-full bg-destructive/10 flex items-center justify-center">
                                <AlertCircle className="h-7 w-7 text-destructive" />
                            </div>
                        </div>
                        <p className="text-xs font-mono text-muted-foreground tracking-widest uppercase">
                            Application Error
                        </p>
                        <CardTitle className="text-2xl font-semibold text-foreground">
                            Something went wrong
                        </CardTitle>
                    </div>
                </CardHeader>

                <CardContent className="space-y-5 text-center">
                    <p className="text-sm text-muted-foreground leading-relaxed">
                        An unexpected error occurred. Please try going back to the home page.
                        If the issue persists, report it so we can resolve it promptly.
                    </p>

                    {error?.message && (
                        <div className="text-left p-3 rounded-md bg-muted border border-border">
                            <p className="text-xs font-mono text-muted-foreground break-all">
                                {error.message}
                            </p>
                        </div>
                    )}

                    <div className="flex flex-col sm:flex-row gap-3 pt-2">
                        <Button
                            onClick={handleGoHome}
                            className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
                        >
                            <Home className="h-4 w-4 mr-2" />
                            Go Home
                        </Button>
                    </div>

                    <Button
                        onClick={handleReportBug}
                        disabled={showReportModal}
                        variant="outline"
                        className="w-full text-destructive border-destructive/30 hover:bg-destructive/5 hover:border-destructive/50"
                    >
                        <Bug className="h-4 w-4 mr-2" />
                        {showReportModal ? "Reporting..." : "Report This Issue"}
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
};

export default function ErrorFallBack({ error, resetError }: any) {
    return <Error error={error} resetError={resetError} />;
}