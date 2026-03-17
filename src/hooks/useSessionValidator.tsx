"use client"
import { useEffect } from "react"
import { useState } from "react"
import { isSessionValid } from "@/fullStackUtils/utils/functions"
import { useLocalStorageContext } from "@/context/LocalStorageContext"

export const useSessionValidator = () => {
    const { profile } = useLocalStorageContext();

    const sessionId = profile?.sessionId || "";
    const sessionTime = profile?.sessionTime;

    const [sessionValid, setSessionValid] = useState(false);

    useEffect(() => {
        if (!sessionId || !sessionTime) {
            setSessionValid(false);
            return;
        }
        const check = () => setSessionValid(isSessionValid(sessionTime));
        check()
        const id = setInterval(check, 30_000);
        return () => clearInterval(id);
    }, [sessionId, sessionTime]);

    return { sessionValid, sessionId }
}