import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import sgMail from '@sendgrid/mail';


dotenv.config();


const app = express();
const PORT = process.env.PORT || 8000;


sgMail.setApiKey(process.env.SENDGRID_API_KEY);


const frontendURL = process.env.FRONTEND_URL;
app.use(cors({ origin: frontendURL })); // For development, '*' is fine.


app.use(express.json());


// --- API Routes ---
app.get('/', (req, res) => {
    res.send('Backend server is running!');
});


app.post('/api/contact', async (req, res) => {
    
    const { name, email, message } = req.body;

    
    if (!name || !email || !message) {
        return res.status(400).json({ error: 'Please fill out all fields.' });
    }

    // Construct the email message
    const emailMessage = {
        to: process.env.TO_EMAIL,       
        from: process.env.FROM_EMAIL,   
        subject: `New Contact Form Submission from ${name}`,
        html: `
            <h2>You have a new message from your website!</h2>
            <p><strong>Name:</strong> ${name}</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Message:</strong></p>
            <p>${message}</p>
        `,
    };

    
    try {
        await sgMail.send(emailMessage);
        console.log('Email sent successfully');
        res.status(200).json({ success: 'Thank you for your message! It has been sent.' });
    } catch (error) {
        console.error('Error sending email:', error);
        
        
        if (error.response) {
            console.error(error.response.body)
        }
        
        res.status(500).json({ error: 'An error occurred while sending the message. Please try again later.' });
    }
});



app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});