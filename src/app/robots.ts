import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = "https://srmapi.in";

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin/", "/api/", "/profile/", "/settings/"],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}