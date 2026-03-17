"use client";
import { toast } from "@/hooks/useToast";
import { useAuth } from "@/context/AuthContext";
import API from "@/components/client/api/AxiosClient";
import React, { createContext, useContext, useState, useEffect } from "react";
import { extractErrorMessage } from "@/fullStackUtils/utils/functions";

interface AdminContextType {
    isAdmin: boolean;
    loading: boolean;
    checkAdminStatus: () => Promise<void>;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export const AdminProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { isAuthenticated } = useAuth();
    const [isAdmin, setIsAdmin] = useState(false);
    const [loading, setLoading] = useState(true);

    const checkAdminStatus = async () => {
        if (!isAuthenticated) {
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            const response = await API.get('/admin/check');

            if (response.data.success && response.data.admin) {
                setIsAdmin(true);
            } else {
                setIsAdmin(false);
                toast({
                    title: "Access Denied",
                    description: "You don't have admin privileges.",
                    variant: "destructive"
                });
            }
        } catch (error) {
            setIsAdmin(false);
            toast.error(extractErrorMessage(error));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (isAuthenticated) {
            checkAdminStatus();
        } else {
            setLoading(false);
        }
    }, [isAuthenticated]);

    return (
        <AdminContext.Provider value={{
            isAdmin,
            loading,
            checkAdminStatus,
        }}>
            {children}
        </AdminContext.Provider>
    );
};

export const useAdmin = () => {
    const context = useContext(AdminContext);
    if (context === undefined) {
        throw new Error("useAdmin must be used within an AdminProvider");
    }
    return context;
};