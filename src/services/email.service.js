
const nodemailer = require('nodemailer');

//transporter connects us to google's email server(SMTP server)
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    type: 'OAuth2',
    user: process.env.EMAIL_USER,
    clientId: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    refreshToken: process.env.REFRESH_TOKEN,
  },
});

// Verify the connection configuration
transporter.verify((error, success) => {
  if (error) {
    console.error('Error connecting to email server:', error);
  } else {
    console.log('Email server is ready to send messages');
  }
});

// Function to send email
const sendEmail = async (to, subject, text, html) => {
  try {
    const info = await transporter.sendMail({
      from: `"Backend-Bank-Proj" <${process.env.EMAIL_USER}>`, // sender address
      to, // list of receivers
      subject, // Subject line
      text, // plain text body
      html, // html body
    });

    console.log('Message sent: %s', info.messageId);
    console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
  } catch (error) {
    console.error('Error sending email:', error.message || error);
  }
};

async function sendRegEmail(userEmail,name){
    const subject = "Welcome to Backend-Bank-Proj";
    const text = `Hi ${name},\n\nThank you for registering with Backend-Bank-Proj! We're excited to have you on board.\n\nBest regards,\nThe Backend-Bank-Proj Team`;
    const html = `<p>Hi ${name},</p><p>Thank you for registering with Backend-Bank-Proj! We're excited to have you on board.</p><p>Best regards,<br>The Backend-Bank-Proj Team</p>`;

    await sendEmail(userEmail,subject,text,html);
    
}

async function sendTransactionEmail(userEmail,name,amount,toAccount){
    const subject = "Transaction Successful!";
    const text = `Hi ${name},\n\n Your transaction of ${amount} to account ${toAccount} has been successfully completed! \n\nBest regards,\nThe Backend-Bank-Proj Team`;
    const html = `<p>Hi ${name},</p><p>Your transaction of ${amount} to account ${toAccount} has been successfully completed!</p><p>Best regards,<br>The Backend-Bank-Proj Team</p>`;

    await sendEmail(userEmail,subject,text,html);
    
}

async function sendTransactionFAILEmail(userEmail,name,amount,toAccount){
    const subject = "Transaction Failed!";
    const text = `Hi ${name},\n\n Your transaction of ${amount} to account ${toAccount} has been FAILED! Please try again later. \n\nBest regards,\nThe Backend-Bank-Proj Team`;
    const html = `<p>Hi ${name},</p><p>Your transaction of ${amount} to account ${toAccount} has been FAILED! Please try again later.</p><p>Best regards,<br>The Backend-Bank-Proj Team</p>`;

   await sendEmail(userEmail,subject,text,html);
}

module.exports = {sendRegEmail,sendTransactionEmail,sendTransactionFAILEmail};