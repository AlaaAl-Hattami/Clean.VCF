const express = require("express");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const cors = require("cors");

const app = express();
const port = 5000;

app.use(cors({ origin: 'http://localhost:3000' }));

const upload = multer({ dest: "uploads/" });

let cleanedFilePath = "";

app.post("/upload", upload.single("vcf"), (req, res) => {
  const file = req.file;

  if (!file || !file.path) {
    return res.status(400).json({ message: "لم يتم رفع الملف بشكل صحيح" });
  }

  try {
    const content = fs.readFileSync(file.path, "utf-8");
    const entries = content.split(/BEGIN:VCARD/i).filter(Boolean);

    const numberCount = {};
    const numberList = [];

    entries.forEach((entry) => {
      const numberMatches = [...entry.matchAll(/TEL[^:]*:(\+?\d{6,})/g)];

      numberMatches.forEach((match) => {
        const number = match[1];
        numberCount[number] = (numberCount[number] || 0) + 1;
        numberList.push(number);
      });
    });

    const duplicates = numberList.filter((number, index, self) =>
      self.indexOf(number) !== index
    );

    const seen = new Set();
    const finalDuplicates = duplicates.filter((num) => {
      if (seen.has(num)) return false;
      seen.add(num);
      return true;
    });

    const uniqueOnly = Object.entries(numberCount)
      .filter(([_, count]) => count === 1)
      .map(([number]) => number);

    const cleanedVcf = uniqueOnly
      .map(
        (number) => `BEGIN:VCARD
VERSION:3.0
TEL:${number}
END:VCARD`
      )
      .join("\n");

    cleanedFilePath = path.join(__dirname, "cleaned_contacts.vcf");
    fs.writeFileSync(cleanedFilePath, cleanedVcf, "utf-8");
    fs.unlinkSync(file.path);

    res.status(200).json({
      message: "تمت معالجة الملف بنجاح",
      contacts: finalDuplicates.map((num) => ({ number: num })),
    });
  } catch (error) {
    console.error("خطأ أثناء المعالجة:", error);
    res.status(500).json({ message: "حدث خطأ أثناء معالجة الملف" });
  }
});

app.get("/download", (req, res) => {
  if (!cleanedFilePath || !fs.existsSync(cleanedFilePath)) {
    return res.status(404).json({ message: "لم يتم العثور على ملف نظيف" });
  }

  res.download(cleanedFilePath, "cleaned_contacts.vcf", (err) => {
    if (err) {
      console.error("خطأ في التنزيل:", err);
      res.status(500).json({ message: "فشل في تنزيل الملف" });
    }
  });
});

app.get("/", (req, res) => {
  res.send("✅ السيرفر يعمل بنجاح!");
});

app.listen(port, () => {
  console.log(`✅ السيرفر يعمل على http://localhost:${port}`);
});
