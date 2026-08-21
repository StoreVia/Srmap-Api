"use client";
import { useLocalStorageContext } from "@/context/LocalStorageContext";

interface Notification {
    _id: string;
    notification: string;
    createdAt: string;
}

export const useNotifications = () => {
    const { notifications, fetchSyncData } = useLocalStorageContext();
    return {
        notifications: (notifications || []) as Notification[],
        isLoading: false,
        refresh: fetchSyncData,
    };
};