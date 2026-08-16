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
• Academic Information: Attendance, timetable, subjects, profile data, and related SRMAP records needed for the app to work.
• Session Data: Local session tokens and login metadata required to keep your SRMAP session active on your device.
• App Usage Data: Basic usage and reliability information used to improve stability and prevent abuse.`
    },
    {
      id: 2,
      title: "How We Use Your Information",
      icon: Activity,
      description: "Purpose of data collection and processing",
      content: `We use your information solely to:
• automate the SRMAP login workflow when needed
• fetch and display academic data from the SRMAP portal
• maintain your session securely on your device
• provide app features such as attendance, timetable, marks, CGPA, and profile views
• improve app reliability and user experience`
    },
    {
      id: 3,
      title: "Data Storage & Security",
      icon: Shield,
      description: "How we protect your information",
      content: `We implement reasonable technical safeguards to protect your data:
• session data and login-related information are stored locally on your device
• the app does not store your SRMAP credentials on a public server
• data is used only for app functionality and service reliability
• access is limited to what is required for the app to operate`
    },
    {
      id: 4,
      title: "Third-Party Data Sharing",
      icon: Users,
      description: "When and how we share your information",
      content: `We are committed to protecting your privacy:
• we do not sell, trade, or rent your personal data to third parties
• we do not share your academic information for advertising purposes
• app usage and reliability data may be processed by supporting services only when required for app operations`
    },
    {
      id: 5,
      title: "Cookies & Local Storage",
      icon: Cookie,
      description: "How we use browser/device storage",
      content: `We use local device storage for essential functionality:
• session and preference data may be stored locally on your device
• browser or device storage is used to keep your app session active
• no advertising or tracking cookies are used for profiling or marketing`
    },
    {
      id: 6,
      title: "Automated Processing",
      icon: Bot,
      description: "About our AI and automation features",
      content: `Our service uses automation to enhance your experience:
• captcha handling may be automated during login
• login and data fetch flows may interact with the official SRMAP portal
• all processing is done to provide the requested academic information and app functionality`
    },
    {
      id: 7,
      title: "Your Rights & Controls",
      icon: Key,
      description: "Your privacy rights and how to exercise them",
      content: `You have control over your data:
• you can log out at any time
• you can clear app data from your device settings
• you should keep your SRMAP account credentials private and secure`
    },
    {
      id: 8,
      title: "Data Retention",
      icon: Clock,
      description: "How long we keep your information",
      content: `We retain only what is necessary:
• session data is kept only as needed for app functionality
• app data is removed when you log out or clear app data
• local device data may remain until you choose to remove it`
    },
    {
      id: 9,
      title: "Changes & Updates",
      icon: RefreshCw,
      description: "How we handle policy changes",
      content: `We may update this Privacy Policy from time to time:
• updates will be dated clearly
• continued use of the app after changes means you accept the updated policy
• users will be notified where required by the platform or app experience`
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
            Learn how we collect, use, and protect your personal information when using Srmapi App.
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