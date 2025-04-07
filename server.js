import express from 'express';
import nodemailer from 'nodemailer';
import cors from 'cors';

const app = express();
const PORT = process.env.PORT || 4001;

// Middleware
app.use(express.json());
app.use(cors({
  origin: '*', // Allow all origins (for testing only)
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type']
}));

// Nodemailer transporter setup
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'shabbirzain314@gmail.com', 
    pass: 'eovk zlga qiul ttlx'
  },
  tls: {
    rejectUnauthorized: false 
  }
});

// Email sending function (must be defined before routes that use it)
const sendEmail = async (to, subject, text) => {
  try {
    await transporter.sendMail({
      from: 'shabbirzain314@gmail.com',
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

// Test email on server start
transporter.sendMail({
  from: 'shabbirzain314@gmail.com',
  to: 'appointmentstudio@gmail.com',
  subject: 'Test Email',
  text: 'This is a test email from Nodemailer.'
}, (error, info) => {
  if (error) {
    console.log('Error:', error);
  } else {
    console.log('Email sent:', info.response);
  }
});

// Health check route
app.get('/', (req, res) => {
  res.status(200).json({ 
    status: 'healthy',
    message: 'backend all set',
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
      "appointmentstudio@gmail.com",
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