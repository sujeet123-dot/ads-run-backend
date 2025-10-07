// Import necessary packages
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import sgMail from '@sendgrid/mail';

// Load environment variables from .env file
dotenv.config();

// Initialize the Express app
const app = express();
const PORT = process.env.PORT || 8000;

// Set SendGrid API Key
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

// --- Middleware ---
// Enable CORS to allow requests from your frontend
// In production, you should restrict this to your actual frontend domain
const frontendURL = process.env.FRONTEND_URL;
app.use(cors({ origin: frontendURL })); // For development, '*' is fine.

// Enable Express to parse JSON request bodies
app.use(express.json());


// --- API Routes ---
app.get('/', (req, res) => {
    res.send('Backend server is running!');
});

// The main endpoint for handling contact form submissions
app.post('/api/contact', async (req, res) => {
    // Destructure the form data from the request body
    const { name, email, message } = req.body;

    // Basic validation: Check if required fields are present
    if (!name || !email || !message) {
        return res.status(400).json({ error: 'Please fill out all fields.' });
    }

    // Construct the email message
    const emailMessage = {
        to: process.env.TO_EMAIL,       // Your personal email where you'll receive the message
        from: process.env.FROM_EMAIL,   // Your verified sender email in SendGrid
        subject: `New Contact Form Submission from ${name}`,
        html: `
            <h2>You have a new message from your website!</h2>
            <p><strong>Name:</strong> ${name}</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Message:</strong></p>
            <p>${message}</p>
        `,
    };

    // Try to send the email
    try {
        await sgMail.send(emailMessage);
        console.log('Email sent successfully');
        res.status(200).json({ success: 'Thank you for your message! It has been sent.' });
    } catch (error) {
        console.error('Error sending email:', error);
        
        // Log more detailed error if available from SendGrid
        if (error.response) {
            console.error(error.response.body)
        }
        
        res.status(500).json({ error: 'An error occurred while sending the message. Please try again later.' });
    }
});


// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});