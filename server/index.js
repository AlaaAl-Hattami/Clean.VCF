const express = require("express");
const app = express();
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const cors = require("cors");

app.use(cors());
app.use(express.json());

// إعداد التخزين
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, "uploads");
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir);
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const fileName = Date.now() + path.extname(file.originalname);
    cb(null, fileName);
  },
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype === "text/vcard" || file.originalname.endsWith(".vcf")) {
    cb(null, true);
  } else {
    cb(new Error("❌ فقط ملفات VCF مسموحة!"), false);
  }
};

const upload = multer({ storage, fileFilter });

// نقطة فحص
app.get("/", (req, res) => {
  res.send("🚀 الخادم يعمل بنجاح!");
});

// نقطة الرفع ومعالجة ملف VCF
app.post("/upload", upload.single("vcf"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "لم يتم رفع أي ملف." });
  }

  try {
    const filePath = path.join(__dirname, "uploads", req.file.filename);
    const rawData = fs.readFileSync(filePath, "utf-8");

    const lines = rawData.split(/\r?\n/);
    const contacts = [];
    const duplicates = new Set();

    lines.forEach((line) => {
      if (line.startsWith("TEL:")) {
        const number = line.replace("TEL:", "").trim();
        if (!duplicates.has(number)) {
          duplicates.add(number);
          contacts.push(number);
        }
      }
    });

    if (contacts.length === 0) {
      return res.status(400).json({ message: "الملف لا يحتوي على جهات اتصال صالحة." });
    }

    res.status(200).json({
      message: "✅ تم رفع الملف بنجاح!",
      file: req.file.filename,
      contacts: contacts,
    });
  } catch (error) {
    res.status(500).json({ message: `❌ خطأ: ${error.message}` });
  }
});

// نقطة لتحميل الملف المنظف
app.get("/download", (req, res) => {
  const contacts = ["+1234567890", "+0987654321", "+1122334455"]; // استبدل هذا بقائمة الأرقام المنظفة
  let vcfContent = "";
  contacts.forEach((contact) => {
    vcfContent += `BEGIN:VCARD\nVERSION:3.0\nTEL:${contact}\nEND:VCARD\n`;
  });

  res.setHeader("Content-Type", "text/vcard");
  res.setHeader("Content-Disposition", "attachment; filename=cleaned_contacts.vcf");
  res.send(vcfContent);
});

app.listen(5000, () => {
  console.log("✅ الخادم يعمل على http://localhost:5000");
});
