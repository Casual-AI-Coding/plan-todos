import type { Metadata } from "next";
import { Fira_Code, Fira_Sans } from "next/font/google";
import { ThemeProvider } from "@/components/ui/ThemeProvider";
import { QueryProvider } from "@/components/ui/QueryProvider";
import { ToastProvider, ToastContainer } from "@/components/ui/Toast";
import { ErrorBoundary } from "@/components/ui/ErrorBoundary";
import "./globals.css";

const firaCode = Fira_Code({
  variable: "--font-fira-code",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const firaSans = Fira_Sans({
  variable: "--font-fira-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Plan Todos",
  description: "A todo + plan management application",
  icons: {
    icon: "/favicon.ico",
  },
};

export const viewport = {
  width: "device-width",
  height: "device-height",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  viewportFit: "cover",
};

// Inline script to set theme and font size before React loads - prevents hydration mismatch
const initScript = `
(function() {
  // Set theme
  var theme = localStorage.getItem('plan-todos-theme');
  if (!theme) {
    theme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  if (theme === 'light' || theme === 'dark' || theme === 'dracula' || theme === 'nord' || theme === 'monokai' || theme === 'glass' || theme === 'spring' || theme === 'catppuccin' || theme === 'tokyoNight' || theme === 'oneDark' || theme === 'system') {
    document.documentElement.setAttribute('data-theme', theme);
  } else {
    document.documentElement.setAttribute('data-theme', 'light');
  }
  
  // Set font size
  var fontSize = localStorage.getItem('plan-todos-font-size');
  if (fontSize) {
    var parsed = parseInt(fontSize, 10);
    if (!isNaN(parsed) && parsed >= 12 && parsed <= 24) {
      document.documentElement.style.setProperty('--font-size-base', parsed + 'px');
    }
  }
})();
`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: initScript }} />
      </head>
      <body
        className={`${firaCode.variable} ${firaSans.variable} antialiased min-h-screen`}
      >
        <ThemeProvider>
          <QueryProvider>
            <ToastProvider>
              <ErrorBoundary>{children}</ErrorBoundary>
              <ToastContainer />
            </ToastProvider>
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
