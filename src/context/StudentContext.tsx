"use client";
import { useCallback } from "react";
import { toast } from "@/hooks/utils/useToast";
import { useAuth } from "@/context/AuthContext";
import API from "@/lib/api/axiosClient";
import { extractErrorMessage, isSessionValid, needsRefresh } from "@/shared/utils/functions";
import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { Profile, CGPA, Subject, Attendance, TimetableEntry, StudentDataContextType } from "@/types/context/studentContext";
import { useLocalStorageContext } from "@/context/LocalStorageContext";

const StudentDataContext = createContext<StudentDataContextType | undefined>(undefined);
export const StudentDataProvider = ({ children }: { children: ReactNode }) => {
  const { logout, isAuthenticated } = useAuth();
  const { updateActiveAccount, profile: lProfile } = useLocalStorageContext();

  const [profile, setProfile] = useState<Profile | null>(null);
  const [cgpa, setCgpa] = useState<CGPA | null>(null);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [attendance, setAttendance] = useState<Attendance[]>([]);
  const [timetable, setTimetable] = useState<TimetableEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [initialized, setInitialized] = useState(false);
  const [error, setError] = useState<any>(null);
  const [loadCachedDataPrompt, setLoadCachedDataPrompt] = useState(false);

  const loadDataToState = async (data: any) => {
    if (!data) return;
    const parsed = typeof data === "string" ? JSON.parse(data) : data;
    setProfile(parsed.profile || null);
    setCgpa(parsed.cgpa?.cgpa || null);
    setSubjects(parsed.subjects || []);
    setAttendance(parsed.attendance || []);
    setTimetable(parsed.timetable || []);
    setInitialized(true);
  };

  const fetchFreshData = useCallback(async (override?: { sessionId?: string; sessionTime?: string }) => {
    setLoading(true);
    setError(null);
    try {
      let payload: { sessionId?: string, sent?: string } = {};

      const sid = override?.sessionId ?? lProfile.sessionId;
      const stime = override?.sessionTime ?? lProfile.sessionTime;

      if (isSessionValid(stime) && !lProfile.hasCachedData) {
        payload.sessionId = sid;
      }

      const res = await API.post('/srmapi/fetch', payload);
      const { data } = res.data;
      updateActiveAccount({ data });
      loadDataToState(data);
    } catch (err) {
      const errMsg = extractErrorMessage(err);
      if (errMsg.includes("SRM server is unreachable")) {
        setLoadCachedDataPrompt(true);
      } else {
        toast.error(errMsg);
      }
    } finally {
      setLoading(false);
    }
  }, [lProfile.sessionTime, lProfile.sessionId]);

  const useCachedData = useCallback(async () => {
    updateActiveAccount({ hasCachedData: true });
    setLoadCachedDataPrompt(false);
    if (lProfile.data) {
      loadDataToState(lProfile.data);
    } else {
      await fetchFreshData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lProfile.data, fetchFreshData, updateActiveAccount]);

  const initiateSession = useCallback(async (): Promise<{ sessionId?: string; sessionTime?: string; } | null> => {
    try {
      const res = await API.get('/srmapi/initiate/session');
      const { sessionId: newSessionId, sessionTime: newSessionTime } = res.data;

      updateActiveAccount({ sessionId: newSessionId, sessionTime: newSessionTime, hasCachedData: false });
      await fetchFreshData({ sessionId: newSessionId, sessionTime: newSessionTime });
      return { sessionId: newSessionId, sessionTime: newSessionTime };
    } catch (err) {
      const errMsg = extractErrorMessage(err);
      if (errMsg.includes("SRM server is unreachable")) {
        setLoadCachedDataPrompt(true);
      }
      console.error("Session initiation failed:", err);
      return null;
    }
  }, [lProfile.sessionId, lProfile.sessionTime, updateActiveAccount, fetchFreshData, lProfile.data]);

  const initializeStudentData = useCallback(async () => {
    try {
      const data = lProfile.data;
      const sessionId = lProfile.sessionId;
      const sessionTime = lProfile.sessionTime;
      const accessToken = lProfile.accessToken;

      if (!sessionTime) return;
      if (accessToken && !sessionTime) return logout();

      const shouldRefresh = needsRefresh(sessionTime);

      if (shouldRefresh && !lProfile.hasCachedData) {
        return await initiateSession();
      }
      
      if (lProfile.hasCachedData) {
        if (data) {
          loadDataToState(data);
          setLoadCachedDataPrompt(false);
        } else {
          return await fetchFreshData();
        }
      } else if (isSessionValid(sessionTime) && sessionId) {
        return await fetchFreshData();
      } else {
        if (data) loadDataToState(data);
      }
    } catch (error) {
      console.error("Initialization error:", error);
      setError(error);
    }
  }, [logout, lProfile.data, lProfile.sessionId, lProfile.sessionTime, lProfile.accessToken, lProfile.hasCachedData, fetchFreshData, initiateSession]);

  useEffect(() => {
    if (!isAuthenticated) return;
    setInitialized(false);
    initializeStudentData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, lProfile.activeAccountId]);

  return (
    <StudentDataContext.Provider
      value={{
        profile,
        cgpa,
        subjects,
        attendance,
        timetable,
        loading,
        initialized,
        error,
        fetchFreshData,
        initializeStudentData,
        initiateSession,
        loadCachedDataPrompt,
        useCachedData
      }}
    >
      {children}
    </StudentDataContext.Provider>
  );
};

export const useStudentData = () => {
  const context = useContext(StudentDataContext);
  if (!context) {
    throw new Error("useStudentData must be used within a StudentDataProvider");
  }
  return context;
};