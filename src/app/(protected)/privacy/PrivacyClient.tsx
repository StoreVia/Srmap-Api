"use client";
import { useState } from "react";
import { Home } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, ScrollText, Users, Lock, Key, RefreshCw, Activity, Cookie, Bot, Clock } from "lucide-react";

const PrivacyPolicy = () => {
    const [expandedSection, setExpandedSection] = useState<number | null>(null);
    const { isAuthenticated } = useAuth();
    const router = useRouter();

    const privacySections = [
        {
            id: 1,
            title: "Information We Collect",
            icon: ScrollText,
            description: "We collect minimal data to provide and improve our services.",
            content: `The information we collect includes:
        • Academic Information: Attendance, timetable, subjects, and profile data encrypted using cryptographer package - only decryptable with your password
        • Session Data: JSESSIONID token stored locally in your browser for SRMAP portal authentication
        • Empty Classrooms Data: Completely anonymized classroom occupancy information (no personal identifiers)`
        },
        {
            id: 2,
            title: "How We Use Your Information",
            icon: Activity,
            description: "Purpose of data collection and processing",
            content: `We use your information solely to:

        • Automate the SRMAP portal login process (captcha solving and credential submission)
        • Fetch and display your academic data from SRMAP portal
        • Maintain your session with SRMAP portal using JSESSIONID tokens
        • Provide the Empty Classrooms feature using anonymized timetable data
        • Improve our services and user experience
        • Ensure platform security and prevent abuse`
        },
        {
            id: 3,
            title: "Data Storage & Security",
            icon: Shield,
            description: "How we protect your information",
            content: `We implement robust security measures to safeguard your data:

        • All academic data in database is encrypted using advanced cryptography and can only be decrypted with your password
        • Your SRMAP credentials are never stored on our servers - they remain in your browser's local storage
        • JSESSIONID tokens are stored locally and automatically managed by your browser
        • Even our developers cannot access your encrypted academic data
        • We employ industry-standard security practices to prevent unauthorized access
        • Regular security audits and updates are performed to maintain protection`
        },
        {
            id: 4,
            title: "Third-Party Data Sharing",
            icon: Users,
            description: "When and how we share your information",
            content: `We are committed to protecting your privacy:

        • We do not sell, trade, or rent your personal data to third parties
        • We do not share your academic information with any external services
        • Anonymous Empty Classrooms data is aggregated and contains no personal identifiers`
        },
        {
            id: 5,
            title: "Cookies & Local Storage",
            icon: Cookie,
            description: "How we use browser storage",
            content: `We use browser storage for essential functionality:

        • Local Storage: Stores your encrypted academic data, preferences, and JSESSIONID tokens
        • No Tracking Cookies: We don't use cookies for advertising or cross-site tracking`
        },
        {
            id: 6,
            title: "Automated Processing",
            icon: Bot,
            description: "About our AI and automation features",
            content: `Our service uses automation to enhance your experience:

        • Captcha Solving: We use a CRNN model trained on 5000+ captchas to automatically solve SRMAP captchas
        • Login Automation: We automate the login process to SRMAP portal on your behalf
        • Data Fetching: We automatically retrieve and update your academic data from SRMAP portal
        • All automated processes only occur with your explicit login and consent`
        },
        {
            id: 7,
            title: "Your Rights & Controls",
            icon: Key,
            description: "Your privacy rights and how to exercise them",
            content: `You have full control over your data:

        • Right to Access: View all data we have about you through your account dashboard
        • Right to Delete: Permanently delete your account and all associated data`
        },
        {
            id: 8,
            title: "Data Retention",
            icon: Clock,
            description: "How long we keep your information",
            content: `We follow strict data retention policies:

        • Active Accounts: Data is retained as long as your account remains active
        • Account Deletion: All data is permanently deleted immediately upon account deletion
        • Local Storage: Data in your browser persists until you clear browser storage
        • JSESSIONID Tokens: Automatically expire based on SRMAP portal's session policies
        • Anonymous Data: Empty Classrooms data is aggregated and anonymized immediately`
        },
        {
            id: 9,
            title: "Changes & Updates",
            icon: RefreshCw,
            description: "How we handle policy changes",
            content: `We keep you informed about privacy practices:

        • Notification: We will notify users of any significant privacy policy changes with prior notice in whatsapp (or) notification in website
        • Transparency: All policy updates will be clearly documented and dated
        • Consent: Continued use after changes constitutes acceptance of updated policies`
        }
    ];

    const toggleSection = (sectionId: number) => {
        setExpandedSection(expandedSection === sectionId ? null : sectionId);
    };
    
    return (
        <div className={`${isAuthenticated ? "w-full" : "container mx-auto px-4 py-8"}`}>
            <div className="grid gap-6">
                {!isAuthenticated && (
                    <Button
                        variant="outline"
                        size="sm"
                        className="w-full sm:w-max flex items-center gap-2"
                        onClick={() => router.push("/")}
                    >
                        <Home className="h-4 w-4" />
                        Home
                    </Button>
                )}
                <div className="space-y-2">
                    <h2 className="text-3xl font-bold">Privacy Policy</h2>
                    <p className="text-muted-foreground">
                        Learn how we collect, use, and protect your personal information when using Srmapi Portal.
                    </p>
                    <div className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-lg border">
                        <p className="font-medium">Last Updated: 10-Oct-2025</p>
                    </div>
                </div>

                <div className="grid gap-4">
                    {privacySections.map((section) => (
                        <Card
                            key={section.id}
                            className="transition-all duration-300 hover:shadow-md"
                        >
                            <CardHeader
                                className="cursor-pointer hover:bg-muted/50 transition-colors"
                                onClick={() => toggleSection(section.id)}
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-3">
                                        <div className="p-2 bg-primary/10 rounded-lg">
                                            <section.icon className="h-5 w-5 text-primary" />
                                        </div>
                                        <div>
                                            <CardTitle className="text-lg">{section.title}</CardTitle>
                                            <CardDescription className="text-sm">
                                                {section.description}
                                            </CardDescription>
                                        </div>
                                    </div>
                                    <Button variant="ghost" size="sm">
                                        {expandedSection === section.id ? "Collapse" : "Expand"}
                                    </Button>
                                </div>
                            </CardHeader>
                            {expandedSection === section.id && (
                                <CardContent className="pt-0">
                                    <div className="prose prose-sm max-w-none dark:prose-invert">
                                        <div className="whitespace-pre-line text-muted-foreground leading-relaxed">
                                            {section.content}
                                        </div>
                                    </div>
                                </CardContent>
                            )}
                        </Card>
                    ))}
                </div>

                <Card className="border-2 border-green-200 bg-green-50/50 dark:border-green-700 dark:bg-green-900/50">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-green-700 dark:text-green-400">
                            <Lock className="h-5 w-5" />
                            Data Security & Privacy Commitment
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3 text-sm text-green-900 dark:text-green-200">
                            <p>
                                <strong>Your privacy is important to us.</strong> We store your data in an encrypted format and can only be decrypted with your password. Even our developers cannot see your data.
                            </p>
                            <p>
                                <strong>We do not share your data with any third parties</strong> for marketing purposes.
                            </p>
                            <p>
                                If You Have Any Queries Contact Us By Clicking Below Button Or Report Issue Button In Settings.
                            </p>
                            <div className="flex gap-2 pt-2">
                                <Button
                                    size="sm"
                                    className="text-xs"
                                    onClick={() => window.location.href = 'mailto:srmap.api@gmail.com'}
                                >
                                    Contact for Privacy Questions
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default PrivacyPolicy;