import { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://srmapi.in";

  const mainPages = [
    { path: "", priority: 1.0, changeFrequency: "daily" as const },
    { path: "login", priority: 1.0, changeFrequency: "monthly" as const },
    { path: "aboutus", priority: 0.8, changeFrequency: "monthly" as const },
    { path: "privacy", priority: 0.6, changeFrequency: "yearly" as const },
    { path: "privacy/mobile", priority: 0.5, changeFrequency: "yearly" as const },
    { path: "terms", priority: 0.6, changeFrequency: "yearly" as const },
  ];

  const featureRoutes = [
    { path: "cgpa", priority: 0.9, changeFrequency: "weekly" as const },
    { path: "attendance", priority: 0.9, changeFrequency: "daily" as const },
    { path: "timetable", priority: 0.9, changeFrequency: "weekly" as const },
    { path: "exams", priority: 0.9, changeFrequency: "weekly" as const },
    { path: "exams/internals", priority: 0.8, changeFrequency: "weekly" as const },
    { path: "exams/past-internals", priority: 0.7, changeFrequency: "monthly" as const },
    { path: "exams/semester-results", priority: 0.8, changeFrequency: "weekly" as const },
    { path: "resources", priority: 0.85, changeFrequency: "weekly" as const },
    { path: "subjects", priority: 0.8, changeFrequency: "weekly" as const },
    { path: "calender", priority: 0.8, changeFrequency: "monthly" as const },
    // { path: "forums", priority: 0.8, changeFrequency: "daily" as const },
    { path: "vacant", priority: 0.75, changeFrequency: "weekly" as const },
    { path: "apps", priority: 0.75, changeFrequency: "monthly" as const },
    { path: "markattendance", priority: 0.85, changeFrequency: "weekly" as const },
    { path: "dashboard", priority: 0.8, changeFrequency: "daily" as const },
    { path: "feedback", priority: 0.7, changeFrequency: "monthly" as const },
  ];

  const allRoutes = [...mainPages, ...featureRoutes];
  const lastModified = new Date();

  return allRoutes.map((route) => ({
    url: route.path ? `${baseUrl}/${route.path}` : baseUrl,
    lastModified,
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));
}