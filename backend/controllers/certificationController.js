import PDFDocument from "pdfkit";
import { sendPaymentStatusEmail } from "../utils/sendCertificate.js";
import { sendCertificate } from "../utils/sendCertificate.js";

export const generateCertificateController = async (req, res) => {
  try {
    const { name, email, courseName, xp } = req.body;

    // 1. Generate certificate PDF as buffer
    const doc = new PDFDocument();
    const buffers = [];

    doc.on("data", buffers.push.bind(buffers));
    doc.on("end", async () => {
      const pdfBuffer = Buffer.concat(buffers);

      // 2. Send certificate via email
      await sendCertificate({ name, email, courseName, xp, buffer: pdfBuffer });

      return res.status(200).json({
        message: "Certificate generated and emailed successfully",
      });
    });

    // PDF content
    doc.fontSize(24).text("TechLearn Solutions", { align: "center" });
    doc.moveDown();
    doc.fontSize(20).text("Certificate of Completion", { align: "center" });
    doc.moveDown();
    doc
      .fontSize(16)
      .text(`${name} has completed the course`, { align: "center" });
    doc
      .fontSize(18)
      .text(`"${courseName}"`, { align: "center", underline: true });
    doc.moveDown();
    doc.text(`XP Earned: ${xp}`, { align: "center" });
    doc.moveDown();

    doc.text(`Issued on: ${new Date().toLocaleDateString()}`, {
      align: "center",
    });

    doc.end(); // End PDF stream
  } catch (err) {
    console.error("Certificate generation error:", err);
    return res
      .status(500)
      .json({ error: "Failed to generate/send certificate" });
  }
};
