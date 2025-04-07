// /pages/api/message.js
import nodemailer from 'nodemailer';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { name, email, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({ success: false, error: 'All fields are required' });
    }

    // Nodemailer transporter setup using environment variables
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,  // Gmail username
        pass: process.env.EMAIL_PASS,  // Gmail app password
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,  // Sender's email
      to: 'recipient-email@gmail.com',  // Recipient's email
      subject: `New Contact from ${name}`,
      text: `Name: ${name}\nEmail: ${email}\nMessage: ${message}`,
    };

    try {
      // Send the email to the recipient
      await transporter.sendMail(mailOptions);

      // Send confirmation email to the user
      await transporter.sendMail({
        from: process.env.EMAIL_USER,  // Sender's email
        to: email,  // User's email
        subject: 'Your message has been received',
        text: `Thank you ${name}, we received your message.`,
      });

      return res.status(200).json({ success: true, message: 'Message sent successfully' });
    } catch (error) {
      console.error('Error sending email:', error);
      return res.status(500).json({ success: false, error: 'Failed to send email' });
    }
  } else {
    // If the request method is not POST, return a 405 Method Not Allowed
    res.status(405).json({ success: false, error: 'Method Not Allowed' });
  }
}
