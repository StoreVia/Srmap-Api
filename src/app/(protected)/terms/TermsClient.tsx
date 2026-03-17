"use client";
import { useState } from "react";
import { Home } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollText, Shield, Users, AlertTriangle, Clock, Scale, MapPin, RefreshCw, Bot } from "lucide-react";

const TermsAndConditions = () => {
  const [expandedSection, setExpandedSection] = useState<number | null>(null);
  const { isAuthenticated } = useAuth();
  const router = useRouter();

  const termssections = [
    {
      id: 1,
      title: "Acceptance Of Terms",
      icon: ScrollText,
      description: "By Using SRMAPI Portal You Agree To These Terms And Conditions.",
      content: `By accessing or using SRMAPI Portal, you acknowledge that you have read, understood, and agree to be bound by these Terms and Conditions. If you do not agree with any part of these terms, you must discontinue use of our services immediately.`
    },
    {
      id: 2,
      title: "User Accounts & Responsibilities",
      icon: Users,
      description: "Guidelines For User Responsibilities",
      content: `You are solely responsible for maintaining the security and confidentiality of your credentials:

    • We do not store your Student Portal credentials on our servers. All credentials are stored locally in your browser's storage.
    • You are responsible for maintaining the security of your device and browser where credentials are stored.
    • If you believe your credentials have been compromised, reset your password immediately via this portal "Forgot Password" feature. (Login Page -> Forgot Password)
    • You must not share your credentials or access tokens with any third party.
    • Your access token will be stored in our database in encrypted form to enable email delivery. It is not stored in plaintext and can only be decrypted using a secure secret key.`
    },
    {
      id: 3,
      title: "Academic Data & Privacy",
      icon: Shield,
      description: "How We Handle Your Information",
      content: `We implement robust security measures to protect your academic data:

    • Your JSESSIONID token and academic data are stored in your browser's local storage and JSESSIONID is transmitted to our servers when data refreshing, marking attendance etc.
    • Even our developers cannot access your personal academic data as it remains encrypted and stored in database and can only be unlocked using your password.
    • We do not share, sell, or distribute your academic information to any third parties.
    • All API communications between your browser and our servers are processed securely through your device.`
    },
    {
      id: 4,
      title: "Automated Login & Captcha Processing",
      icon: Bot,
      description: "About Our Automated Login System",
      content: `Our service uses automated processes to enhance your experience:

    • We utilize a CRNN model trained on 5000+ captchas to solve SRMAP portal captchas automatically on your behalf.
    • The JSESSIONID token obtained during login is stored locally in your browser and is never retained on our servers.
    • You acknowledge that this automated process interacts with SRMAP's official portal on your behalf.`
    },
    {
      id: 5,
      title: "Data Collection & Empty Classrooms Feature",
      icon: MapPin,
      description: "Anonymous Data Collection for Empty Classrooms",
      content: `We collect anonymous data to enhance campus utilities:

    • For the "Empty Classrooms" feature, we collect completely anonymized data about classroom occupancy.
    • No personally identifiable information is collected or associated with this data.
    • This data helps us determine which classrooms are currently unoccupied across campus blocks.`
    },
    {
      id: 6,
      title: "Session Management & Data Freshness",
      icon: RefreshCw,
      description: "How We Handle Session Tokens and Data Updates",
      content: `Our system manages sessions efficiently to balance performance and data accuracy:

    • Live data is fetched from SRMAP portal for 15 minutes after each login or manual refresh.
    • After 15 minutes, cached data from your local storage is displayed to reduce server load.
    • Use the "Fetch New Data" button in Settings to refresh your session and get live data.
    • Attendance marking requires an active JSESSIONID session and will automatically initiate login if needed.`
    },
    {
      id: 7,
      title: "Service Availability & Limitations",
      icon: Clock,
      description: "Information About SRMAPI Portal Availability",
      content: `While we strive for optimal service, certain limitations apply:

    • We aim for 99.9% uptime but cannot guarantee uninterrupted service due to technical dependencies.
    • Service depends on SRMAP portal availability - we cannot function if their servers are down.
    • Scheduled maintenance will be announced in our Whatsapp channel with advance notice.
    • Performance may vary during peak usage periods or high traffic.
    • Emergency maintenance may occur without prior notice for security updates.`
    },
    {
      id: 8,
      title: "Prohibited Activities",
      icon: AlertTriangle,
      description: "Activities Not Permitted on Our Platform",
      content: `Users are prohibited from:

    • Using the service for any illegal or unauthorized purpose
    • Attempting to reverse engineer, decompile, or hack our systems
    • Using automated scripts or bots beyond our provided functionality
    • Sharing academic data obtained through our service with unauthorized parties
    • Attempting to access other users' accounts or data
    • Violating SRMAP's institutional policies through use of our service`
    },
    {
      id: 9,
      title: "Limitation of Liability",
      icon: Scale,
      description: "Understanding Our Responsibilities and Limitations",
      content: `Important limitations regarding our service:

    • We are not affiliated with SRM University or the official SRMAP portal
    • We provide convenience tools but cannot guarantee 100% accuracy of academic data
    • We are not responsible for any academic consequences resulting from service unavailability
    • We reserve the right to modify or discontinue services at any time
    • In no event shall we be liable for any indirect, incidental, or consequential damages`
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
          <h2 className="text-2xl font-bold">Terms And Conditions</h2>
          <p className="text-muted-foreground">
            Please read the Terms and Conditions before using Srmapi Portal.
          </p>
          <div className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-lg border">
            <p className="font-medium">Last Updated: 10-Oct-2025</p>
          </div>
        </div>
        <div className="grid gap-6">
          {termssections.map((section) => (
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
        <Card className="border-2 border-primary/20 bg-primary/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-primary">
              <AlertTriangle className="h-5 w-5" />
              Important Note
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm">
              <p>
                By Continuing To Use Srmapi Portal, You Acknowledge That You Have Read, Understood And Agree To Be Bound By Terms And Conditions.
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
                  Contact Support
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TermsAndConditions;