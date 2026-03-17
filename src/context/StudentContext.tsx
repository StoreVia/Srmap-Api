"use client";
import { useCallback } from "react";
import { toast } from "@/hooks/useToast";
import { useAuth } from "@/context/AuthContext";
import API from "@/components/client/api/AxiosClient";
import { extractErrorMessage, isSessionValid, needsRefresh } from "@/fullStackUtils/utils/functions";
import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { Profile, CGPA, Subject, Attendance, TimetableEntry, StudentDataContextType } from "@/types/context/studentContext";
import { useLocalStorageContext } from "./LocalStorageContext";

const StudentDataContext = createContext<StudentDataContextType | undefined>(undefined);
export const StudentDataProvider = ({ children }: { children: ReactNode }) => {
  const { logout, isAuthenticated } = useAuth();
  const { updateProfile, updateSettings, profile: lProfile } = useLocalStorageContext();

  const [profile, setProfile] = useState<Profile | null>(null);
  const [cgpa, setCgpa] = useState<CGPA | null>(null);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [attendance, setAttendance] = useState<Attendance[]>([]);
  const [timetable, setTimetable] = useState<TimetableEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [initialized, setInitialized] = useState(false);
  const [error, setError] = useState<any>(null);

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

      if (isSessionValid(stime)) {
        payload.sessionId = sid;
      }

      const res = await API.post('/srmapi/fetch', payload);
      const { data } = res.data;
      updateProfile({ data });
      loadDataToState(data);
    } catch (err) {
      toast.error(extractErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [lProfile.sessionTime, lProfile.sessionId]);

  useEffect(() => {
    if (!isAuthenticated) return;
    const init = async () => {
      try {
        const data = lProfile.data;
        const sessionId = lProfile.sessionId;
        const sessionTime = lProfile.sessionTime;
        const accessToken = lProfile.accessToken;
        if (!sessionTime) return;
        if (accessToken && !sessionTime) return logout();

        const shouldRefresh = needsRefresh(sessionTime);
        if (shouldRefresh) {
          const res = await API.get('/srmapi/refresh');
          const { sessionId: newSessionId, sessionTime: newSessionTime } = res.data;

          updateProfile({ sessionId: newSessionId, sessionTime: newSessionTime });
          return await fetchFreshData({ sessionId: newSessionId, sessionTime: newSessionTime });
        }

        if((isSessionValid(sessionTime) && sessionId) || !data) await fetchFreshData();
        if(data) loadDataToState(data);
        return;
      } catch (error) {
        console.error("Initialization error:", error);
        setError(error);
      }
    };
    init();
  }, [isAuthenticated]);

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
        fetchFreshData
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