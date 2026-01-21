"use client";

import { ReactNode } from "react";
import { ThemeProvider } from "@/lib/ThemeContext";

export default function ClientProviders({ children }: { children: ReactNode }) {
  return <ThemeProvider>{children}</ThemeProvider>;
}
