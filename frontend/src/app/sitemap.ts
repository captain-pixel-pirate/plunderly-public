import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: "https://plunderly.app",
      lastModified: new Date("2025-07-31"),
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: "https://plunderly.app/greedy-counter",
      lastModified: new Date("2025-07-31"),
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: "https://plunderly.app/shoppe-recipes",
      lastModified: new Date("2025-07-31"),
      changeFrequency: "weekly",
      priority: 0.5,
    },
    {
      url: "https://plunderly.app/labor-management",
      lastModified: new Date("2025-07-31"),
      changeFrequency: "weekly",
      priority: 0.5,
    },
    {
      url: "https://plunderly.app/first-mate",
      lastModified: new Date("2025-07-31"),
      changeFrequency: "weekly",
      priority: 0.5,
    },
    {
      url: "https://plunderly.app/commodity-markets",
      lastModified: new Date("2025-07-31"),
      changeFrequency: "weekly",
      priority: 0.5,
    },
  ];
}
