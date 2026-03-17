"use client";
import Image from "next/image";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import Logo from "../../public/icons/round_corner_logo.png";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Home, ArrowLeft, Search, AlertTriangle, Sparkles } from "lucide-react";

const NotFound = () => {
    const [isAnimating, setIsAnimating] = useState(false);

    const handleGoBack = () => {
        setIsAnimating(true);
        setTimeout(() => {
            window.history.go(-1);
        }, 300);
    };

    const handleGoHome = () => {
        window.location.href = "/dashboard";
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-university-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-university-900 dark:to-blue-950 p-4 relative overflow-hidden">
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-20 left-20 w-64 h-64 bg-blue-200/20 dark:bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute bottom-20 right-20 w-96 h-96 bg-university-200/20 dark:bg-university-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
                <div className="absolute top-1/2 left-1/4 w-32 h-32 bg-indigo-200/30 dark:bg-indigo-500/20 rounded-full blur-2xl animate-bounce delay-500"></div>
                <div className="absolute top-1/3 right-1/3 w-20 h-20 bg-red-200/30 dark:bg-red-500/20 rounded-full blur-xl animate-pulse delay-2000"></div>
                <div className="absolute bottom-1/3 left-1/2 w-40 h-40 bg-purple-200/20 dark:bg-purple-500/10 rounded-full blur-2xl animate-bounce delay-1500"></div>
            </div>

            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-1/4 left-1/6 animate-float">
                    <Search className="h-8 w-8 text-university-300/50 dark:text-university-600/30" />
                </div>
                <div className="absolute top-3/4 right-1/4 animate-float-delayed">
                    <AlertTriangle className="h-6 w-6 text-red-300/50 dark:text-red-600/30" />
                </div>
                <div className="absolute top-1/2 right-1/6 animate-float-slow">
                    <Sparkles className="h-10 w-10 text-yellow-300/40 dark:text-yellow-600/30" />
                </div>
            </div>

            <Card className="w-full max-w-lg shadow-2xl border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl relative z-10 transition-all duration-300 hover:shadow-3xl">
                <div className="absolute inset-0 bg-gradient-to-r from-university-500/5 to-blue-500/5 dark:from-university-400/5 dark:to-blue-400/5 rounded-lg"></div>
                <CardHeader className="space-y-6 text-center relative z-10">
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
                    <div className="relative">
                        <h1 className="text-8xl font-bold bg-gradient-to-r from-red-500 via-university-600 to-blue-600 dark:from-red-400 dark:via-university-400 dark:to-blue-400 bg-clip-text text-transparent animate-pulse">
                            404
                        </h1>
                    </div>
                    <div className="space-y-3">
                        <CardTitle className="text-2xl font-bold bg-gradient-to-r from-university-700 to-blue-600 dark:from-university-400 dark:to-blue-400 bg-clip-text text-transparent">
                            Page Not Found
                        </CardTitle>
                        <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                            <AlertTriangle className="h-4 w-4 text-red-500" />
                            <span>The page you are looking not found!</span>
                            <Sparkles className="h-4 w-4 text-yellow-500" />
                        </div>
                    </div>
                </CardHeader>

                <CardContent className="space-y-6 relative z-10 text-center">
                    <div className="flex flex-col sm:flex-row gap-4 pt-4">
                        <Button
                            onClick={handleGoBack}
                            className={`flex-1 h-12 bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 dark:from-gray-500 dark:to-gray-600 dark:hover:from-gray-400 dark:hover:to-gray-500 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] ${isAnimating ? 'animate-pulse' : ''
                                }`}
                        >
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Go Back
                        </Button>
                        <Button
                            onClick={handleGoHome}
                            className="w-full h-12 bg-gradient-to-r from-university-600 to-university-700 hover:from-university-700 hover:to-university-800 dark:from-university-500 dark:to-university-600 dark:hover:from-university-400 dark:hover:to-university-500 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02]">
                            <Home className="h-4 w-4 mr-2" />
                            Go Home
                        </Button>
                    </div>
                    <div className="pt-4 border-t border-gray-200/50 dark:border-gray-700/50">
                        <p className="text-xs text-muted-foreground">
                            If you believe this is an error, please contact support or try refreshing the page.
                        </p>
                    </div>
                </CardContent>
            </Card>
            <style dangerouslySetInnerHTML={{
                __html: `
                    @keyframes float {
                        0%, 100% { transform: translateY(0px); }
                        50% { transform: translateY(-20px); }
                    }
                    
                    @keyframes float-delayed {
                        0%, 100% { transform: translateY(0px) rotate(0deg); }
                        50% { transform: translateY(-15px) rotate(5deg); }
                    }
                    
                    @keyframes float-slow {
                        0%, 100% { transform: translateY(0px) scale(1); }
                        50% { transform: translateY(-10px) scale(1.1); }
                    }
                    
                    .animate-float {
                        animation: float 3s ease-in-out infinite;
                    }
                    
                    .animate-float-delayed {
                        animation: float-delayed 4s ease-in-out infinite 1s;
                    }
                    
                    .animate-float-slow {
                        animation: float-slow 5s ease-in-out infinite 2s;
                    }
                `
            }}/>
        </div>
    );
};

export default NotFound;