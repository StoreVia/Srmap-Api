"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useStudentData } from "@/context/StudentContext";
import { useTheme } from "@/context/ThemeContext";
import { useLocalStorageContext } from "@/context/LocalStorageContext";
import { whatsapp, toTitleCase } from "@/shared/utils/functions";
import { Button } from "@/components/ui/button";
import { SidebarTrigger } from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  User,
  Check,
  MoreVertical,
  Home,
  RotateCcw,
  Sun,
  Moon,
  LogOut,
} from "lucide-react";

interface DashboardHeaderProps {
  isMobile: boolean;
  currentTitle: string;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  isMobile,
  currentTitle,
}) => {
  const router = useRouter();
  const { logout, accounts, activeAccountId, switchAccount } = useAuth();
  const { profile, fetchFreshData } = useStudentData();
  const { theme, setTheme } = useTheme();
  const { settings, updateSettings } = useLocalStorageContext();
  const [showTutorial, setShowTutorial] = useState(false);

  useEffect(() => {
    setShowTutorial(!settings.sidebarTutorialDone);
  }, [settings.sidebarTutorialDone]);

  const handleSidebarClick = () => {
    updateSettings({ sidebarTutorialDone: true });
    setShowTutorial(false);
  };

  const handleHomeNavigation = () => router.push("/dashboard");
  const handleRefresh = () => fetchFreshData();
  const handleAccountSwitch = (accountId: string) => {
    switchAccount(accountId);
  };

  const studentDisplayName = profile?.studentName
    ? toTitleCase(profile.studentName)
    : "";
  const registerNo = profile?.registerNo || "";

  return (
    <header className="relative z-20 h-14 sm:h-16 w-full border-b border-border/60 bg-background/80 backdrop-blur-md">
      <div className="flex items-center justify-between px-3 sm:px-6 h-full gap-2 sm:gap-4">
        <div className="flex items-center min-w-0 gap-2 sm:gap-3 flex-1">
          {!isMobile && (
            <div className="relative shrink-0">
              <SidebarTrigger
                className="hover:bg-accent hover:text-accent-foreground"
                onClick={handleSidebarClick}
              />
              {showTutorial && (
                <div className="absolute left-full ml-2 top-1/2 -translate-y-1/2 bg-primary text-primary-foreground text-xs px-3 py-1 rounded-lg shadow-lg whitespace-nowrap flex items-center z-50 animate-pulse">
                  👈 Click here to open the menu
                  <div className="absolute -left-1 top-1/2 -translate-y-1/2 w-2 h-2 bg-primary rotate-45" />
                </div>
              )}
            </div>
          )}

          <div className="min-w-0 flex-1 flex flex-col justify-center">
            <h1 className="text-base sm:text-lg font-bold tracking-tight text-foreground truncate leading-tight">
              {currentTitle}
            </h1>
            {(studentDisplayName || registerNo) && (
              <p className="text-[11px] sm:text-xs text-muted-foreground truncate leading-tight mt-0.5">
                {studentDisplayName}
                {studentDisplayName && registerNo ? " • " : ""}
                {registerNo && (
                  <span className="font-mono font-medium">{registerNo}</span>
                )}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center space-x-1.5 sm:space-x-2 shrink-0">
          <Button
            type="button"
            onClick={whatsapp}
            className="h-8 sm:h-9 shrink-0 gap-1.5 bg-green-600 px-2 sm:px-3 text-xs text-white hover:bg-green-700 rounded-md font-medium shadow-xs"
            aria-label="Join the Srmapi WhatsApp channel"
          >
            <svg
              className="h-3.5 w-3.5 sm:h-4 sm:w-4"
              viewBox="0 0 24 24"
              fill="currentColor"
              aria-hidden="true"
            >
              <path d="M20.52 3.48A11.91 11.91 0 0 0 12 0C5.37 0 0 5.37 0 12c0 2.11.55 4.17 1.6 5.98L0 24l6.21-1.62A11.92 11.92 0 0 0 12 24c6.63 0 12-5.37 12-12 0-3.19-1.24-6.21-3.48-8.52ZM12 21.48c-1.8 0-3.55-.48-5.08-1.39l-.36-.21-3.69.96.99-3.6-.24-.37A9.96 9.96 0 0 1 2 12c0-5.52 4.48-10 10-10 2.67 0 5.18 1.04 7.07 2.93A9.96 9.96 0 0 1 22 12c0 5.52-4.48 10-10 10Zm5.44-7.54c-.3-.15-1.77-.87-2.05-.97-.28-.1-.48-.15-.68.15-.2.3-.78.97-.95 1.17-.17.2-.35.22-.65.07-.3-.15-1.26-.46-2.4-1.47-.89-.79-1.49-1.77-1.66-2.07-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.07-.15-.68-1.65-.93-2.27-.24-.58-.49-.5-.68-.51h-.58c-.2 0-.52.07-.8.37-.28.3-1.05 1.02-1.05 2.47s1.08 2.86 1.23 3.05c.15.2 2.12 3.24 5.15 4.54.72.31 1.28.5 1.72.64.72.23 1.38.2 1.9.12.58-.09 1.77-.72 2.02-1.42.25-.7.25-1.3.17-1.42-.07-.12-.27-.2-.57-.35Z" />
            </svg>
            <span className="hidden sm:inline">Join</span>
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 sm:h-9 sm:w-9 rounded-full overflow-hidden p-0 border border-border/40 hover:border-primary/50 transition-colors"
                aria-label="Switch account"
              >
                {profile?.picture ? (
                  <Image
                    src={profile.picture}
                    alt="Profile"
                    width={36}
                    height={36}
                    unoptimized
                    className="h-full w-full rounded-full object-cover"
                  />
                ) : (
                  <User className="h-4 w-4" />
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64">
              <DropdownMenuLabel className="font-semibold text-xs text-muted-foreground uppercase tracking-wider">
                Switch Account
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              {(accounts?.length || 0) > 0 ? (
                accounts.map((account) => {
                  const isActiveAccount = account.id === activeAccountId;
                  return (
                    <DropdownMenuItem
                      key={account.id}
                      onClick={() => {
                        if (!isActiveAccount) {
                          handleAccountSwitch(account.id);
                        }
                      }}
                      className="cursor-pointer flex items-center justify-between py-2"
                    >
                      <span className="font-mono text-sm">{account.username}</span>
                      {isActiveAccount && <Check className="h-4 w-4 text-primary" />}
                    </DropdownMenuItem>
                  );
                })
              ) : (
                <DropdownMenuItem
                  className="cursor-pointer"
                  onClick={() => router.push("/settings")}
                >
                  No accounts found
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="cursor-pointer"
                onClick={() => router.push("/settings")}
              >
                Manage accounts
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 sm:h-9 sm:w-9 hover:bg-accent hover:text-accent-foreground rounded-lg transition-colors"
                aria-label="Open actions menu"
              >
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-52">
              <DropdownMenuItem
                onClick={handleHomeNavigation}
                className="cursor-pointer"
              >
                <Home className="mr-2 h-4 w-4" />
                Dashboard
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={handleRefresh}
                className="cursor-pointer"
              >
                <RotateCcw className="mr-2 h-4 w-4" />
                Reload
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setTheme(theme === "light" ? "dark" : "light")}
                className="cursor-pointer"
              >
                {theme === "light" ? (
                  <Moon className="mr-2 h-4 w-4" />
                ) : (
                  <Sun className="mr-2 h-4 w-4" />
                )}
                Theme Change
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => logout()}
                className="cursor-pointer text-destructive focus:text-destructive"
              >
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};