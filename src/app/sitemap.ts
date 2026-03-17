import { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://srmapi.in";

  const dashboardRoutes = [
    "attendance",
    "cgpa",
    "feedback",
    "vacant",
    "checkattendance",
    "exams/internals",
    "privacy",
    "resources",
    "subjects",
    "timetable",
    "aboutus",
    "calender",
    "dashboard",
    "forums",
    "markattendance",
    "profile",
    "settings",
    "terms",
  ];

  const staticPages = ["", "login", "forgot"];
  const highPriorityRoutes = ["attendance", "timetable", "feedback", "cgpa"];

  const allRoutes = [...staticPages, ...dashboardRoutes];

  return allRoutes.map((path) => {
    const isHighPriority = highPriorityRoutes.includes(path);
    const isHomeOrLogin = ["", "login"].includes(path);

    return {
      url: `${baseUrl}/${path}`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: isHomeOrLogin
        ? 1.0
        : isHighPriority
        ? 0.9
        : 0.7,
    };
  });
}