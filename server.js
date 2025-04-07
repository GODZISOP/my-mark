import express from 'express';
import nodemailer from 'nodemailer';
import cors from 'cors';
import dotenv from 'dotenv';  // Import dotenv to load environment variables

// Load environment variables from .env file
dotenv.config();

const app = express();
const PORT = process.env.PORT || 4001;  // Use environment variable PORT

// Middleware
app.use(express.json());
app.use(cors({
  origin: process.env.CORS_ORIGIN,  // Use environment variable for allowed CORS origin
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type']
}));

// Nodemailer transporter setup with credentials from environment variables
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,  // Use environment variable for email
    pass: process.env.EMAIL_PASS,  // Use environment variable for app password
  },
  tls: {
    rejectUnauthorized: false
  }
});

// Email sending function
const sendEmail = async (to, subject, text) => {
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER,  // Use environment variable for email
      to,
      subject,
      text
    });
    return true;
  } catch (error) {
    console.error('Email error:', error);
    return false;
  }
};

// Health check route
app.get('/', (req, res) => {
  res.status(200).json({ 
    status: 'healthy',
    message: 'Backend is running',
    timestamp: new Date().toISOString()
  });
});

// Contact form endpoint
app.post('/message', async (req, res) => {
  try {
    console.log("🔵 New request received:", req.body);
    const { name, email, message } = req.body;

    if (!name || !email || !message) {
      console.log("❌ Validation failed:", req.body);
      return res.status(400).json({ success: false, error: "All fields are required." });
    }

    // Send email to recipient
    const recipientEmailSent = await sendEmail(
      "appointmentstudio@gmail.com", // Hardcoded recipient email (or replace with another env variable if needed)
      `New Contact from ${name}`,
      `Name: ${name}\nEmail: ${email}\nMessage: ${message}`
    );

    // Send confirmation email to user
    const userConfirmationSent = await sendEmail(
      email,
      "Your message has been received",
      `Thank you ${name}, we received your message.`
    );

    if (!recipientEmailSent || !userConfirmationSent) {
      console.log("❌ Email sending failed.");
      throw new Error("Email sending failed.");
    }

    console.log("✅ Email sent successfully.");
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
