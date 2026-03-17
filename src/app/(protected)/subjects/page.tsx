"use client";
import React from "react";
import { Badge } from "@/components/ui/badge";
import { useStudentData } from "@/context/StudentContext";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  BookOpen,
  User,
  MapPin,
  Layers,
  Hash,
  GraduationCap,
  ExternalLink
} from "lucide-react";

const Subjects = () => {
  const { subjects } = useStudentData();

  return (
    <div className="h-full flex flex-col space-y-4">

      <Card className="border-green-300 bg-green-50/60 dark:bg-green-900/20">
        <CardContent className="py-3 text-sm text-green-800 dark:text-green-300">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <span>
              Help others by contributing faculty cabin details using your college mail ID.
            </span>
            <a
              href="https://docs.google.com/spreadsheets/u/1/d/1uaYRuUk1_XzHebkjX8gmJ-qbnhDnIK0F/edit?gid=1061184240#gid=1061184240"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 font-medium underline"
            >
              Contribute here
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {subjects.length > 0 ? (
          subjects.map(subj => (
            <Card
              key={subj.code}
              className="border-blue-200 bg-blue-50/40 dark:bg-blue-900/20 shadow-sm hover:shadow-md transition-all"
            >
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <BookOpen className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  {subj.name}
                </CardTitle>
              </CardHeader>

              <CardContent className="space-y-2 text-sm text-muted-foreground dark:text-gray-300">
                <div className="flex items-center gap-2">
                  <Hash className="w-4 h-4 text-blue-500" />
                  <span className="font-mono font-medium">{subj.code}</span>
                </div>

                <div className="flex items-center gap-2">
                  <Layers className="w-4 h-4 text-green-500" />
                  <span>LTP: {subj.ltp} | Credit: {subj.credit}</span>
                </div>

                <div className="flex items-center gap-2">
                  <GraduationCap className="w-4 h-4 text-purple-500" />
                  <span>Semester: {subj.semester}</span>
                </div>

                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-orange-500" />
                  <span>{subj.faculty}</span>
                </div>

                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-red-500" />
                  <span>{subj.classrooms}</span>
                </div>

                {subj.facultyCabins && subj.facultyCabins.length > 0 && (
                  <div className="mt-3 rounded-md border bg-white/70 dark:bg-black/20 p-2 space-y-2">
                    <div className="text-xs font-semibold text-muted-foreground">
                      Faculty Cabin Details
                    </div>
                    {subj.facultyCabins.map((f, i) => (
                      <div key={i} className="text-xs">
                        <div className="font-medium text-foreground">
                          {f.name}
                        </div>
                        <div className="text-muted-foreground">
                          {f.location}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <div className="pt-2">
                  <Badge variant="secondary" className="text-xs px-2 py-0.5">
                    {subj.code} - {subj.credit} Credits
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card className="col-span-full border-gray-200 dark:border-gray-700">
            <CardContent className="text-center text-muted-foreground py-6">
              No subjects available.
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Subjects;
