"use client";
import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

type Platform = "android" | "ios";

const AndroidLogo = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M17.523 15.3414C17.0509 15.3414 16.6633 14.9538 16.6633 14.4817C16.6633 14.0096 17.0509 13.6221 17.523 13.6221C17.995 13.6221 18.3826 14.0096 18.3826 14.4817C18.3826 14.9538 17.995 15.3414 17.523 15.3414ZM6.47703 15.3414C6.00498 15.3414 5.61737 14.9538 5.61737 14.4817C5.61737 14.0096 6.00498 13.6221 6.47703 13.6221C6.94908 13.6221 7.33669 14.0096 7.33669 14.4817C7.33669 14.9538 6.94908 15.3414 6.47703 15.3414ZM17.9855 10.6053L19.914 7.26526C20.0463 7.03554 19.9678 6.74154 19.7381 6.60918C19.5084 6.47683 19.2144 6.5553 19.082 6.78502L17.1309 10.165C15.6598 9.49209 13.9108 9.1084 12 9.1084C10.0892 9.1084 8.34021 9.49209 6.86913 10.165L4.91799 6.78502C4.78564 6.5553 4.49164 6.47683 4.26192 6.60918C4.0322 6.74154 3.95373 7.03554 4.08608 7.26526L6.01452 10.6053C3.06459 12.2355 1.07147 15.3197 1.07147 18.8916H22.9285C22.9285 15.3197 20.9354 12.2355 17.9855 10.6053Z" />
  </svg>
);

const AppleLogo = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M17.066 22.225c-1.12 0-2.32-.693-3.414-.693-1.07 0-2.074.665-3.155.665-1.926 0-5.115-3.197-5.115-7.31 0-4.027 2.508-6.142 4.885-6.142 1.255 0 2.373.81 3.208.81.77 0 2.05-.85 3.44-.85 1.556 0 2.822.756 3.63 1.93-3.165 1.49-2.65 5.513.193 6.765-1.14 2.164-2.583 4.825-3.687 4.825zm-2.906-14.773c-.023-3.003 2.49-5.463 5.426-5.452.023 3.002-2.49 5.463-5.426 5.452z" />
  </svg>
);

const DownloadCard = () => {
  const handleDownload = (platform: Platform) => {
    const links: Record<Platform, string> = {
      android: "https://drive.google.com/file/d/11G7NcKHEutqSEpJ-C6TSBxSVbl8c9vub/view?usp=sharing",
      ios: "https://drive.google.com/file/d/1nKMxPNaCt2YgmirqoAMo_9QAdtPVH8Wm/view?usp=sharing",
    };
    window.open(links[platform], "_blank");
  };

  return (
    <div className="w-full">
      <Card className="w-full overflow-hidden border-2 bg-white dark:bg-gray-900 shadow-xl">
        <CardContent className="p-6 md:p-12">
          <div className="text-center mb-10">
            <h1 className="text-3xl md:text-5xl font-black tracking-tighter uppercase mb-2">
              Mobile Apps
            </h1>
            <p className="text-muted-foreground text-sm font-medium uppercase tracking-widest">
              Direct download & Installation
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2">
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-foreground text-background rounded-lg">
                  <AndroidLogo className="w-6 h-6" />
                </div>
                <h2 className="text-xl font-bold uppercase tracking-tight">Android</h2>
              </div>

              <div className="space-y-3">
                <p className="text-[10px] font-black uppercase text-muted-foreground">Installation Steps</p>
                <ul className="text-xs font-medium space-y-2 border-l-2 border-primary/20 pl-4">
                  <li>1. Download APK from Drive</li>
                  <li>2. Open and tap Install</li>
                  <li>3. Choose "Install without scanning"</li>
                </ul>
              </div>

              <Button
                className="w-full h-12 font-bold uppercase tracking-tight"
                onClick={() => handleDownload("android")}
              >
                Download APK
              </Button>
            </div>

            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-foreground text-background rounded-lg">
                  <AppleLogo className="w-6 h-6" />
                </div>
                <h2 className="text-xl font-bold uppercase tracking-tight">iOS / iPhone</h2>
              </div>
              <Button
                variant="outline"
                className="w-full h-12 border-2 font-bold uppercase tracking-tight"
                onClick={() => handleDownload("ios")}
              >
                Download IPA
              </Button>
              <div className="space-y-3">
                <p className="text-[10px] font-black uppercase text-muted-foreground">
                  Sideloadly Installation (Detailed)
                </p>
                <ul className="text-xs font-medium space-y-2 border-l-2 border-primary/20 pl-4">
                  <li>1. Download the IPA file to your computer (Windows or Mac).</li>
                  <li>
                    2. Install{" "}
                    <a
                      href="https://sideloadly.io"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline hover:text-primary"
                    >
                      Sideloadly
                    </a>
                  </li>
                  <li>
                    3. Windows users: Install{" "}
                    <a
                      href="https://support.apple.com/en-us/106372"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline hover:text-primary"
                    >
                      iTunes (Official Apple Installer)
                    </a>
                  </li>
                  <li>4. Connect your iPhone to your computer using a USB cable.</li>
                  <li>5. Unlock your iPhone and tap "Trust This Computer" if prompted.</li>
                  <li>6. Open Sideloadly and make sure your device appears.</li>
                  <li>7. Unzip ios file, Drag and drop the IPA file into Sideloadly.</li>
                  <li>8. Enter your Apple ID email (use a secondary Apple ID if preferred).</li>
                  <li>9. Click "Start" and wait for installation to complete.</li>
                  <li>10. On your iPhone, go to Settings → General → VPN & Device Management.</li>
                  <li>11. Under Developer App, tap your Apple ID and press "Trust".</li>
                  <li>12. Open the app — installation complete.</li>
                  <li>12. You need to do this for every 7 days.</li>
                </ul>
              </div>
            </div>
          </div>
        </CardContent>

        <footer className="border-t bg-muted/30 p-4 text-center">
          <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
            Support: <a href="mailto:srmap.api@gmail.com" className="text-foreground hover:underline">srmap.api@gmail.com</a>
          </p>
        </footer>
      </Card>
    </div>
  );
};

export default DownloadCard;