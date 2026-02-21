import type { Metadata } from "next";
import { Fira_Code, Fira_Sans } from "next/font/google";
import { ThemeProvider } from "@/components/ui/ThemeProvider";
import { ToastProvider, ToastContainer } from "@/components/ui/Toast";
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

// Inline script to set theme before React loads - prevents hydration mismatch
const themeScript = `
(function() {
  var theme = localStorage.getItem('plan-todos-theme');
  if (!theme) {
    theme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  if (theme === 'light' || theme === 'dark' || theme === 'dracula' || theme === 'nord' || theme === 'monokai' || theme === 'glass') {
    document.documentElement.setAttribute('data-theme', theme);
  } else {
    document.documentElement.setAttribute('data-theme', 'light');
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
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body
        className={`${firaCode.variable} ${firaSans.variable} antialiased min-h-screen`}
      >
        <ThemeProvider>
          <ToastProvider>
            {children}
            <ToastContainer />
          </ToastProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
