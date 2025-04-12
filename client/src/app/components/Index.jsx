"use client";
import { useState, useEffect } from "react";
import { UploadCloud, Loader2, CheckCircle2 } from "lucide-react";
import { useTheme } from 'next-themes';
import ThemeToggle from "./ThemeTogle";

const Index = () => {
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [contacts, setContacts] = useState([]);
  const [errorMessage, setErrorMessage] = useState("");
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const handleFile = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setLoading(true);
    setDone(false);
    setErrorMessage("");

    const formData = new FormData();
    formData.append("vcf", file);

    try {
      const response = await fetch("http://localhost:5000/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "فشل في رفع الملف");
      }

      const data = await response.json();
      setLoading(false);
      setDone(true);
      setContacts(data.contacts);
    } catch (error) {
      setLoading(false);
      setErrorMessage(error.message);
    }
  };

  const handleDownload = async () => {
    try {
      const response = await fetch("http://localhost:5000/download");

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "فشل في تحميل الملف");
      }

      const data = await response.blob();
      const url = URL.createObjectURL(data);
      const link = document.createElement("a");
      link.href = url;
      link.download = "cleaned_contacts.vcf";
      link.click();
    } catch (error) {
      alert("حدث خطأ أثناء تحميل الملف: " + error.message);
    }
  };

  return (
    <main
    dir="rtl"
    className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#1e1b2e] to-[#111827] text-white px-4 py-12"
  >
    <div className="bg-white dark:bg-[#2c2a3f] rounded-3xl shadow-2xl px-10 py-14 max-w-2xl w-full text-center space-y-8 animate-fade-in relative">
      
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>
  
      <h1 className="text-3xl md:text-4xl  pb-2 font-bold bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 bg-clip-text text-transparent">
        تنظيف أرقام الهاتف المكررة من ملف VCF.
      </h1>
      <p className="text-gray-600 dark:text-gray-300 text-lg">
        قم برفع ملف VCF. وسيتم إزالة الأرقام المكررة تلقائيًا.
      </p>
  
      {errorMessage && (
        <div className="text-red-500 font-semibold">{errorMessage}</div>
      )}
  
      <label className="group cursor-pointer border-2 border-dashed border-purple-500 rounded-2xl  hover:bg-[#a855f7]/10 p-10 transition duration-300 flex flex-col items-center space-y-4">
        {loading ? (
          <Loader2 className="w-12 h-12 animate-spin text-purple-400" />
        ) : done ? (
          <CheckCircle2 className="w-12 h-12 text-green-400" />
        ) : (
          <UploadCloud className="w-12 h-12 text-pink-400 group-hover:scale-110 transition-transform" />
        )}
        <p className="text-lg text-gray-700 dark:text-gray-200">
  {done ? "تم تنظيف الملف بنجاح" : "اضغط هنا لتحديد ملف VCF"}
</p>

        <input
          type="file"
          accept=".vcf"
          className="hidden"
          onChange={handleFile}
        />
      </label>
  
      {done && (
        <div className="space-y-6 pt-6">
          <button
            onClick={handleDownload}
            className="bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-700 hover:to-pink-600 text-white font-bold py-3 px-8 rounded-xl shadow-md transition transform hover:scale-105"
          >
            تحميل الملف بعد التنظيف
          </button>
  
          <div className="text-right">
            <h2 className="text-lg font-semibold text-red-500 font-bold">
              الأرقام المكررة:
            </h2>
            <ul className="text-sm  mt-2 max-h-40 overflow-y-auto pr-2  text-gray-700 dark:text-gray-200">
              {contacts.map((contact, index) => (
                <li
  key={index}
  dir="ltr"

  className="pt-1 border-b border-gray-300 dark:border-white/20 text-gray-800 dark:text-gray-200"
>
                  {contact}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  </main>
  
  );
};

export default Index;
