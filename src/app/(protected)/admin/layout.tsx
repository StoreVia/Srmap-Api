"use client";
import { toast } from "@/hooks/useToast";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useAdmin } from "@/context/AdminContext";
import { AdminProvider } from "@/context/AdminContext";
import { useStudentData } from "@/context/StudentContext";
import PageLoadingClient from "@/components/client/loading/PageLoading";

function AdminLayoutContent({ children }: { children: React.ReactNode }) {
    const { isAuthenticated } = useAuth();
    const { initialized } = useStudentData();
    const { isAdmin, loading: adminLoading } = useAdmin();
    const router = useRouter();
    const [checked, setChecked] = useState(false);

    useEffect(() => {
        if (initialized && !adminLoading) { 
            if (!isAdmin) {
                toast({
                    title: "Access Denied",
                    description: "You don't have admin privileges.",
                    variant: "destructive"
                });
                router.replace("/dashboard");
                return;
            }
            setChecked(true);
        }
    }, [isAuthenticated, initialized, isAdmin, adminLoading, router]);

    if (!isAuthenticated || !checked || adminLoading) {
        return <PageLoadingClient />;
    }

    if (!isAdmin) {
        return null;
    }

    return <>{children}</>;
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    return (
        <AdminProvider>
            <AdminLayoutContent>{children}</AdminLayoutContent>
        </AdminProvider>
    );
}