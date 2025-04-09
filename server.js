import express from 'express';
import nodemailer from 'nodemailer';
import cors from 'cors';
import dotenv from 'dotenv';  // To load environment variables

// Load environment variables from .env file
dotenv.config();

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
// Email sending function
const sendEmail = async (from, to, subject, text) => {
  try {
    // Sending the email with proper "from" format
    await transporter.sendMail({
      from: `"${from.name}" <${from.email}>`,  // Display the user's name and their email
      to,
      subject,
      text
    });
    return true;
  } catch (error) {
    console.error('Email sending error:', error);
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
      "appointmentstudio@gmail.com",  // Replace with your recipient email
      `New Contact from ${name}`,
      `Name: ${name}\nEmail: ${email}\nMessage: ${message}`
    );

    // Send confirmation email to the user
    const userConfirmationSent = await sendEmail(
      email,
      "Your message has been received",
      `Hello ${name},\n\nThank you for reaching out to Mark Relic. We have received your message and will get back to you shortly.\n\nMessage Details:\nName: ${name}\nEmail: ${email}\nMessage: ${message}\n\nBest regards,\nMark Relic Team`
    );
    // If emails failed to send, respond with error
    if (!recipientEmailSent || !userConfirmationSent) {
      console.log("❌ Email sending failed.");
      throw new Error("Email sending failed.");
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
