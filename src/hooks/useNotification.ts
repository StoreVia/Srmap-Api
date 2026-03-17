"use client";
import API from "@/components/client/api/AxiosClient";
import { useState, useEffect, useCallback } from "react";

interface Notification {
    _id: string;
    notification: string;
    createdAt: string;
}

export const useNotifications = () => {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    const fetchNotifications = useCallback(async () => {
        if (isLoading) return;

        setIsLoading(true);
        try {
            const response = await API.get(`/tools/notifications`);
            const data = response.data;

            if (data.success) {
                setNotifications(data.notifications || []);
            }
        } catch (error) {
            console.error("Error fetching notifications:", error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchNotifications();
    }, [fetchNotifications]);

    return { notifications, isLoading, refresh: fetchNotifications };
};