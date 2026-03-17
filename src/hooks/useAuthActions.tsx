import { jwtDecode } from "jwt-decode";
import { toast } from "@/hooks/useToast";
import { useCallback, useState, useEffect } from "react";
import { isValidRegNumber } from "@/validators/auth/login";
import { useLocalStorageContext } from "@/context/LocalStorageContext";
import { extractErrorMessage } from "@/fullStackUtils/utils/functions";
import API, { setLogoutHandler } from "@/components/client/api/AxiosClient";

export const useAuthActions = () => {
    const { updateProfile, resetProfile, profile } = useLocalStorageContext();

    const [isLoading, setIsLoading] = useState(true);
    const [isLoginLoading, setIsLoginLoading] = useState(false);
    const [isAdmin, setIsAdmin] = useState(false);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    const login = useCallback(async (username: string, password: string) => {
        const [isValid, errorMessage] = isValidRegNumber(username);
        if (!isValid) {
            toast({ title: "Error", description: errorMessage, variant: "destructive" });
            return false;
        }
        try {
            setIsLoginLoading(true);
            const res = await API.post("/auth/login", { username: username.toUpperCase(), password });
            const { accessToken, sessionId, sessionTime } = res.data;
            updateProfile({ accessToken });
            if (sessionId) updateProfile({ sessionId });
            if (sessionTime) updateProfile({ sessionTime });
            setIsAuthenticated(true);
        } catch (error) {
            toast.error(extractErrorMessage(error));
        } finally {
            setIsLoginLoading(false);
        }
    }, [setIsAuthenticated, setIsLoginLoading]);

    const logout = useCallback((message?: string) => {
        setIsAuthenticated(false);
        setIsAdmin(false);
        resetProfile();
    }, [setIsAuthenticated]);

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

    return { login, logout, checkAuthStatus, isLoading, isLoginLoading, isAuthenticated, isAdmin };
};