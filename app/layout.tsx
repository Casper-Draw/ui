import type { Metadata } from "next";
import "@fontsource/poppins/400.css";
import "@fontsource/poppins/500.css";
import "@fontsource/poppins/600.css";
import "@fontsource/poppins/700.css";
import "@fontsource/poppins/800.css";
import "@fontsource/poppins/900.css";
import "@fontsource/montserrat/400.css";
import "@fontsource/montserrat/500.css";
import "@fontsource/montserrat/600.css";
import "@fontsource/montserrat/700.css";
import "./globals.css";
import { Toaster } from "sonner";
import CasperProvider from "@/context/CasperProvider";

export const metadata: Metadata = {
  title: "Casper Draw - Instant Lottery on Casper Network",
  description: "Instant lottery with Autonom RNG powered by Casper Network",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <div id="root" />
        <CasperProvider>
          {children}
          <Toaster
            position="top-right"
            toastOptions={{
              style: {
                background: "#1a0f2e",
                color: "#00ffff",
                border: "2px solid rgba(0, 255, 255, 0.5)",
              },
            }}
          />
        </CasperProvider>
      </body>
    </html>
  );
}
