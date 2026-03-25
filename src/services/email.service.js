require("dotenv").config();
const nodemailer = require("nodemailer");

//transporter are use to connect with google SMTP server
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    type: "OAuth2",
    user: process.env.EMAIL_USER,
    clientId: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    refreshToken: process.env.REFRESH_TOKEN,
  },
});

// Verify the connection configuration
transporter.verify((error, success) => {
  if (error) {
    console.error("Error connecting to email server:", error);
  } else {
    console.log("Email server is ready to send messages");
  }
});
// Function to send email
const sendEmail = async (to, subject, text, html) => {
  try {
    const info = await transporter.sendMail({
      from: `"fintech-core-api" <${process.env.EMAIL_USER}>`, // sender address
      to, // list of receivers
      subject, // Subject line
      text, // plain text body
      html, // html body
    });

    console.log("Message sent: %s", info.messageId);
    console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
  } catch (error) {
    console.error("Error sending email:", error);
  }
};

async function sendRegistraionEmail(name, userEmail) {
  const subject = "Welcome to Fintech Core API! 🎉";

  const text = `Hi ${name},\n\nWelcome to Fintech Core API! We are thrilled to have you on board.\n\nBest regards,\nThe Fintech Team`;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eaeaea; border-radius: 10px;">
      <h2 style="color: #333;">Welcome to Fintech Core API, ${name}!</h2>
      <p style="color: #555; line-height: 1.5;">We are absolutely thrilled to have you on board. Your account has been successfully created.</p>
      <p style="color: #555; line-height: 1.5;">You can now log in to explore all the features of your new account and start managing your finances securely.</p>
      <br/>
      <p style="color: #555;">Best regards,</p>
      <p style="color: #333;"><strong>The Fintech Team</strong></p>
    </div>
  `;
  await sendEmail(userEmail, subject, text, html);
}
async function sendTransactioSuccessEmail(userEmail, name, amount, toAccount) {
  const subject = `Transaction Successful: $${amount} sent`;

  const text = `Hi ${name},\n\nYour transfer of $${amount} to ${toAccount} has been processed successfully.\n\nIf you did not authorize this transaction, please contact support immediately.\n\nBest regards,\nThe Fintech Team`;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eaeaea; border-radius: 10px;">
      <h2 style="color: #333;">Transfer Successful ✅</h2>
      <p style="color: #555; line-height: 1.5;">Hi ${name},</p>
      <p style="color: #555; line-height: 1.5;">Your recent transaction has been processed. Here are the details of your transfer:</p>

      <div style="background-color: #f8f9fa; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 5px solid #007bff;">
        <h3 style="margin-top: 0; color: #333;">$${amount}</h3>
        <p style="margin: 5px 0; color: #555;"><strong>Sent to:</strong> ${toAccount}</p>
        <p style="margin: 5px 0; color: #555;"><strong>Date:</strong> ${new Date().toLocaleString()}</p>
      </div>

      <p style="color: #555; line-height: 1.5; font-size: 14px;">If you did not authorize this transaction, please secure your account and contact our support team immediately.</p>
      <br/>
      <p style="color: #555;">Best regards,</p>
      <p style="color: #333;"><strong>The Fintech Team</strong></p>
    </div>
  `;

  await sendEmail(userEmail, subject, text, html);
}
async function sendTransactioFailedEmail(userEmail, name, amount, toAccount) {
  const subject = `Transaction Failed: Transfer of $${amount}`;

  const text = `Hi ${name},\n\nUnfortunately, your attempt to transfer $${amount} to ${toAccount} has failed.\n\nNo funds have been deducted from your account. Please check your balance or verify the recipient details before trying again.\n\nBest regards,\nThe Fintech Team`;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eaeaea; border-radius: 10px;">
      <h2 style="color: #dc3545;">Transfer Failed ❌</h2>
      <p style="color: #555; line-height: 1.5;">Hi ${name},</p>
      <p style="color: #555; line-height: 1.5;">Unfortunately, we could not process your recent transaction request. <strong>No funds have been deducted from your account for this transfer.</strong></p>

      <div style="background-color: #fcf8f8; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 5px solid #dc3545;">
        <h3 style="margin-top: 0; color: #333;">Attempted: $${amount}</h3>
        <p style="margin: 5px 0; color: #555;"><strong>Intended Recipient:</strong> ${toAccount}</p>
        <p style="margin: 5px 0; color: #555;"><strong>Date:</strong> ${new Date().toLocaleString()}</p>
      </div>

      <p style="color: #555; line-height: 1.5; font-size: 14px;">Please check your available balance or ensure the recipient details are correct. If you continue to experience issues, please contact our support team.</p>
      <br/>
      <p style="color: #555;">Best regards,</p>
      <p style="color: #333;"><strong>The Fintech Team</strong></p>
    </div>
  `;

  await sendEmail(userEmail, subject, text, html);
}

module.exports = {
  sendRegistraionEmail,
  sendTransactioSuccessEmail,
  sendTransactioFailedEmail,
};
