import { jwtDecode } from "jwt-decode";
import { toast } from "@/hooks/utils/useToast";
import { useCallback, useState, useEffect } from "react";
import { isValidRegNumber } from "@/validators/auth/login";
import { useLocalStorageContext } from "@/context/LocalStorageContext";
import { extractErrorMessage } from "@/shared/utils/functions";
import API, { setLogoutHandler } from "@/lib/api/axiosClient";

export const useAuthActions = () => {
    const { profile, upsertAccount, setActiveAccount, removeAccount } = useLocalStorageContext();

    const [isLoading, setIsLoading] = useState(true);
    const [isLoginLoading, setIsLoginLoading] = useState(false);
    const [isAdmin, setIsAdmin] = useState(false);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    const login = useCallback(async (username: string, password: string, wantCachedData?: boolean) => {
        const normalizedUsername = username.toUpperCase();
        const exists = profile.accounts?.some((a: any) => a.id === normalizedUsername);
        if (!exists && (profile.accounts?.length || 0) >= 5) {
            toast({ title: "Limit reached", description: "You can add up to 5 accounts only.", variant: "destructive" });
            return { success: false, error: "Limit reached" };
        }
        const [isValid, errorMessage] = isValidRegNumber(username);
        if (!isValid) {
            toast({ title: "Error", description: errorMessage, variant: "destructive" });
            return { success: false, error: errorMessage };
        }
        try {
            setIsLoginLoading(true);
            const res = await API.post("/auth/login", { username: normalizedUsername, password, wantCachedData });
            const { accessToken, sessionId, sessionTime, hasCachedData } = res.data;
            const save = upsertAccount({
                id: normalizedUsername,
                username: normalizedUsername,
                accessToken: accessToken || "",
                sessionId: sessionId || "",
                sessionTime: sessionTime || "",
                hasCachedData: hasCachedData || false,
                data: profile.accounts?.find((a: any) => a.id === normalizedUsername)?.data,
            }, true);
            if (!save.ok) {
                toast({ title: "Limit reached", description: save.message, variant: "destructive" });
                return { success: false, error: save.message };
            }
            setIsAuthenticated(true);
            return { success: true };
        } catch (error: any) {
            const errMsg = extractErrorMessage(error);
            const data = error.response?.data;
            if (!errMsg.includes("SRM server is unreachable")) {
                toast.error(errMsg);
            }
            if (data?.hasCachedData) {
                upsertAccount({
                    id: normalizedUsername,
                    username: normalizedUsername,
                    accessToken: data.accessToken,
                    sessionId: data.sessionId,
                    sessionTime: data.sessionTime,
                    hasCachedData: true,
                    data: profile.accounts?.find((a: any) => a.id === normalizedUsername)?.data,
                }, false);
                return {
                    success: false,
                    error: errMsg,
                    hasCachedData: true,
                    accessToken: data.accessToken,
                    sessionId: data.sessionId,
                    sessionTime: data.sessionTime
                };
            }
            return { success: false, error: errMsg };
        } finally {
            setIsLoginLoading(false);
        }
    }, [setIsAuthenticated, setIsLoginLoading, profile.accounts]);

    const logout = useCallback((message?: string) => {
        const activeId = profile.activeAccountId;
        if (activeId) {
            removeAccount(activeId);
        }
        setIsAuthenticated(false);
        setIsAdmin(false);
    }, [setIsAuthenticated, profile.activeAccountId]);

    const switchAccount = useCallback((accountId: string) => {
        setActiveAccount(accountId);
        setIsAuthenticated(true);
        setIsAdmin(false);
    }, []);

    const checkAuthStatus = useCallback(() => {
        const token = profile.accessToken;
        setIsLoading(true);
        if (!token) {
            setIsLoading(false);
            setIsAuthenticated(false);
            setIsAdmin(false);
            return;
        }
        try {
            if (token) {
                const decoded: any = jwtDecode(token);
                if (decoded?.admin === true) setIsAdmin(true);
                if (decoded.username && decoded.password) setIsAuthenticated(true);
            }
        } finally {
            setIsLoading(false);
        }
    }, [profile.accessToken]);

    useEffect(() => {
        setLogoutHandler(logout);
    }, [logout]);

    return { login, logout, switchAccount, checkAuthStatus, isLoading, isLoginLoading, isAuthenticated, isAdmin };
};