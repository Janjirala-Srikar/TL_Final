import nodemailer from "nodemailer";

// Sends certificate (with buffer) after successful course completion
export const sendCertificate = async ({
  name,
  email,
  courseName,
  xp,
  buffer,
}) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const mailOptions = {
    from: `"TechLearn Solutions" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: `Certificate for ${courseName}`,
    html: `
      <h2>Hi ${name},</h2>
      <p>You have successfully completed the course <strong>${courseName}</strong> with <strong>${xp} XP</strong>.</p>
      <p>Your certificate is attached and also available on the cloud.</p>
    `,
    attachments: [
      {
        filename: `${courseName}-${name}.pdf`,
        content: buffer,
        contentType: "application/pdf",
      },
    ],
  };

  await transporter.sendMail(mailOptions);
};

// Sends simple payment status update
export const sendPaymentStatusEmail = async ({ user, status }) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    host: "smtp.gmail.com",
    port: 587,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  let mailOptions;
  if (status === "approved") {
    mailOptions = {
      from: `<${process.env.EMAIL_USER}>`,
      to: user.email,
      subject: "Your Certificate is Ready!",
      text: `Congratulations ${user.firstName}, your payment is approved. Certificate attached.`,
    };
  } else {
    mailOptions = {
      from: `<${process.env.EMAIL_USER}>`,
      to: user.email,
      subject: "Certificate Rejected",
      text: `Sorry ${user.firstName}, There were issues with your payment. Please contact support.`,
    };
  }

  await transporter.sendMail(mailOptions);
};
