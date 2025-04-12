import "./globals.css";
import { ThemeProviders } from "../provider/ThemeProviders";

export const metadata = {
  title: "Theme Toggle Test",
  description: "Simple Next.js theme toggle example",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProviders>
          {children}
        </ThemeProviders>
      </body>
    </html>
  );
}
