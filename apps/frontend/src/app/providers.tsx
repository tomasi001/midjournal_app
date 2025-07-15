"use client";

import { AuthProvider } from "@/context/auth-context";
import { JournalEntriesProvider } from "@/context/journal-entries-context";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import React from "react";

export function Providers({ children }: { children: React.ReactNode }) {
  const [isDesktop, setIsDesktop] = React.useState(true);

  React.useEffect(() => {
    const mediaQuery = window.matchMedia("(min-width: 640px)");
    setIsDesktop(mediaQuery.matches);

    const handler = (e: MediaQueryListEvent) => setIsDesktop(e.matches);
    mediaQuery.addEventListener("change", handler);
    return () => mediaQuery.removeEventListener("change", handler);
  }, []);

  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <AuthProvider>
        <JournalEntriesProvider>
          {children}
          <Toaster position={isDesktop ? "bottom-right" : "top-center"} />
        </JournalEntriesProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
