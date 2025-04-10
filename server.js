import express from 'express';
import nodemailer from 'nodemailer';
import cors from 'cors';
import dotenv from 'dotenv';  // To load environment variables

// Load environment variables from .env file
dotenv.config();

// Ensure the environment variables are loaded properly
if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
  console.error("❌ Missing email credentials in environment variables.");
  process.exit(1);  // Stop the server if credentials are missing
}

const app = express();
const PORT = process.env.PORT || 4001;  // Use environment variable for the port

// Middleware
app.use(express.json());  // To parse JSON requests
app.use(cors({
  origin: process.env.CORS_ORIGIN || "*",  // CORS setup to allow all origins or specific origin
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type']
}));

// Nodemailer transporter setup with credentials from environment variables
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,  // Your email
    pass: process.env.EMAIL_PASS,  // Your Gmail app password
  },
  tls: {
    rejectUnauthorized: false  // TLS setting for Gmail
  }
});

// Email sending function
const sendEmail = async (from, to, subject, text) => {
  try {
    console.log("Sending email to:", to);
    console.log("From:", from);
    console.log("Subject:", subject);
    console.log("Text:", text);

    await transporter.sendMail({
      from: `"${from.name}" <${from.email}>`,  // The sender's email (formatted correctly)
      to,  // The recipient's email
      subject,
      text
    });
    return true;
  } catch (error) {
    console.error('Email sending error:', error);
    console.error('Error stack:', error.stack);
    return false;
  }
};

// Health check route (just to verify server is up)
app.get('/', (req, res) => {
  res.status(200).json({ 
    status: 'healthy',
    message: 'Backend is running!',
    timestamp: new Date().toISOString()
  });
});

// Contact form endpoint (POST /message)
app.post('/message', async (req, res) => {
  try {
    console.log("🔵 Received request:", req.body);
    const { name, email, message } = req.body;

    // Basic validation: check if all fields are provided
    if (!name || !email || !message) {
      console.log("❌ Validation failed:", req.body);
      return res.status(400).json({ success: false, error: "All fields are required." });
    }

    // Send email to recipient
    const recipientEmailSent = await sendEmail(
      { name: "Mark Relic Team", email: "ksmsjjsis@gmail.com" },  // Sender's email
      'ksmsjjsis@gmail.com',  // The recipient's email address (replace with your recipient email)
      `New Contact from ${name}`,
      `Name: ${name}\nEmail: ${email}\nMessage: ${message}`
    );

    // Send confirmation email to the user
    const userConfirmationSent = await sendEmail(
      { name: "Mark Relic Team", email: "markoreljin5dva@gmail.com" },  // Sender's email
      email,
      "markoreljin5dva@gmail.com",
      `Hello ${name},\n\nThank you for reaching out to Mark Relic. We have received your message and will get back to you shortly.\n\nMessage Details:\nName: ${name}\nEmail: ${email}\nMessage: ${message}\n\nBest regards,\nMark Relic Team`
    );

    // If emails failed to send, respond with error
    if (!recipientEmailSent || !userConfirmationSent) {
      console.log("❌ Email sending failed.");
      return res.status(500).json({ success: false, error: "Failed to send emails." });
    }

    console.log("✅ Emails sent successfully.");
    return res.status(200).json({ success: true, message: "Message sent successfully" });

  } catch (error) {
    console.error("❌ Server Error:", error);
    return res.status(500).json({ 
      success: false, 
      error: "Internal Server Error", 
      details: error.message 
    });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});
