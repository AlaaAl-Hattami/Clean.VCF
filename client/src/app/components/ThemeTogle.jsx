'use client'
import { useTheme } from 'next-themes'; // تأكد من استيراد useTheme
import { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react"; // استيراد الأيقونات

const ThemeToggle = () => {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  return (
    <button
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className="p-4 rounded-full bg-purple-600 text-white hover:bg-purple-700 transition"
    >
      {theme === "dark" ? <Moon className="w-6 h-6" /> : <Sun className="w-6 h-6" />}
    </button>
  );
};

export default ThemeToggle;
