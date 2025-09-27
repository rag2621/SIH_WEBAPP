const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: false, 
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

transporter.verify((error, success) => {
    if (error) {
        console.log(' Email configuration error:', error);
    } else {
        console.log(' Email server ready to send messages');
    }
});

// Email sending function
async function sendBreakdownAlerts(gmails, breakdownData) {
    try {
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: gmails.join(', '), // Send to multiple emails
            subject: `🚨 BREAKDOWN ALERT - Issue Id ${breakdownData.issueId}`,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #d32f2f;">⚡ POWERLINE BREAKDOWN ALERT</h2>
                    
                    <div style="background-color: #ffebee; padding: 15px; border-radius: 5px; margin: 10px 0;">
                        <h3>Breakdown Details:</h3>
                        <p><strong>Issue ID:</strong> ${breakdownData.issueId}</p>
                        <p><strong>Out Nodes:</strong> ${breakdownData.outNodeId}</p>
                         <p><strong>In Nodes:</strong> ${breakdownData.inNodeId}</p>
                       
                        
                        <p><strong>Time:</strong> ${new Date(breakdownData.timestamp).toLocaleString()}</p>
                    </div>
                    
                  
                    
                    <div style="background-color: #fff3e0; padding: 15px; border-radius: 5px; margin: 10px 0;">
                        <p><strong>⚠ IMMEDIATE ACTION REQUIRED</strong></p>
                        <p>Please investigate and resolve this issue immediately.</p>
                    </div>
                    
                    <hr>
                    <p style="color: #666; font-size: 12px;">
                        This is an automated alert from Powerline Monitoring System.<br>
                        Generated on: ${new Date().toLocaleString()}
                    </p>
                </div>
            `
        };

        const info = await transporter.sendMail(mailOptions);
        console.log(' Breakdown alert emails sent successfully');
        console.log(' Message ID:', info.messageId);
        console.log(' Emails sent to:', gmails);
        
        return true;
    } catch (error) {
        console.error(' Error sending breakdown alert emails:', error.message);
        return false;
    }
}

module.exports = {
    sendBreakdownAlerts
};