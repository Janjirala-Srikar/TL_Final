import fs from "fs";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import { PDFDocument, rgb } from "pdf-lib";
import fontkit from "@pdf-lib/fontkit";
import { sendCertificate } from "../utils/sendCertificate.js";
import { uploadToCloudinary } from "../utils/uploadToCloudinary.js";

export const generateCertificateController = async (req, res) => {
  try {
    const { name, email, courseName, xp } = req.body;

    // Generate Certificate ID
    const certificateId = `TLS-${uuidv4().split("-")[0].toUpperCase()}`;

    const templatePath = `./templates/template-${courseName.toLowerCase().replace(/\s+/g, '-')}.pdf`;
    const fontPath = path.resolve("./fonts/Slight-Regular.ttf");

    const templateBytes = fs.readFileSync(templatePath);
    const fontBytes = fs.readFileSync(fontPath);

    const pdfDoc = await PDFDocument.load(templateBytes);
    pdfDoc.registerFontkit(fontkit);
    const slightFont = await pdfDoc.embedFont(fontBytes);
    const pages = pdfDoc.getPages();
    const firstPage = pages[0];

    // Student Name - Centered
    firstPage.drawText(name, {
      x: 180,        // adjust as needed
      y: 250,
      size: 35,
      font: slightFont,
      color: rgb(14 / 255, 25 / 255, 109 / 255)
    });

    // ➤ Certificate ID - Bottom Right
    firstPage.drawText(`${certificateId}`, {
      x: 633,       // adjust depending on template width
      y: 100,
      size: 20,
      color: rgb(14 / 255, 25 / 255, 109 / 255)
    });

    // ➤ Issue Date - Bottom Left
    firstPage.drawText(`${new Date().toLocaleDateString("en-IN")}`, {
      x: 197,
      y: 100,
      size: 20,
      color: rgb(14 / 255, 25 / 255, 109 / 255)
    });

    const finalPdfBuffer = await pdfDoc.save();

    // Upload to cloudinary
    const fileName = `certificates/${courseName}-${name}.pdf`;
    const cloudinaryUrl = await uploadToCloudinary(finalPdfBuffer, fileName);

    // Send Email
    await sendCertificate({
     name,
     email,
     courseName,
     xp,
     buffer: Buffer.from(finalPdfBuffer),
     certificateId,
     cloudinaryUrl,
    });

    return res.status(200).json({
      message: "Certificate generated and emailed successfully",
      certificateId,
      url: cloudinaryUrl,
    });
  } catch (err) {
    console.error("Certificate generation error:", err);
    return res.status(500).json({ error: "Failed to generate/send certificate" });
  }
};
