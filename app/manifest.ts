import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Casper Draw",
    short_name: "CasperDraw",
    start_url: "/",
    display: "standalone",
    background_color: "#0a0a0a",
    theme_color: "#e91e63",
    icons: [
      {
        src: "/favicon.ico",
        sizes: "any",
        type: "image/x-icon",
        purpose: "any",
      },
    ],
  };
}

