import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Smart Club",
    short_name: "Smart Club",
    description: "Система за управление на членски внос с NFC профили",
    start_url: "/",
    display: "standalone",
    background_color: "#0a0a0a",
    theme_color: "#32cd32",
    icons: [
      {
        src: "/favicon.ico",
        sizes: "any",
        type: "image/x-icon",
      },
    ],
  };
}
