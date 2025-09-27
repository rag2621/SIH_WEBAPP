
const twilio = require('twilio');
require('dotenv').config();


const client = twilio(
    process.env.TWILIO_ACCOUNT_SID,
    process.env.TWILIO_AUTH_TOKEN
);

const fromNumber = process.env.TWILIO_PHONE_NUMBER;


async function sendBreakdownAlert(phoneNumbers, breakdownData) {
    const message = `🚨 BREAKDOWN ALERT
Node: ${breakdownData.node_id}
Issue: ${breakdownData.breakdown_message}
Current: ${breakdownData.current}A
Voltage: ${breakdownData.voltage_present ? 'Present' : 'Absent'}
Relay: ${breakdownData.relay_status}
Location: ${breakdownData.gps.lat}, ${breakdownData.gps.lon}
Time: ${new Date(breakdownData.timestamp).toLocaleString()}

Immediate action required!`;

    const promises = phoneNumbers.map(async (number) => {
        try {
            const messageInstance = await client.messages.create({
                body: message,
                from: fromNumber,
                to: number 
            });
            
            console.log(` SMS sent to ${number}. SID: ${messageInstance.sid}`);
            return { success: true, number, sid: messageInstance.sid };
            
        } catch (error) {
            console.error(` SMS failed for ${number}:`, error.message);
            return { success: false, number, error: error.message };
        }
    });
    
    const results = await Promise.all(promises);
    const successful = results.filter(r => r.success).length;
    
    console.log(`📱 SMS Results: ${successful}/${phoneNumbers.length} sent successfully`);
    return results;
}

// Function to send test SMS
async function sendTestSMS(phoneNumber) {
    try {
        const messageInstance = await client.messages.create({
            body: ' Test SMS from Powerline Monitoring System. If you receive this, SMS setup is working!',
            from: fromNumber,
            to: phoneNumber
        });
        
        console.log(` Test SMS sent successfully. SID: ${messageInstance.sid}`);
        return true;
        
    } catch (error) {
        console.error(' Test SMS failed:', error.message);
        return false;
    }
}

// Function to send custom SMS
async function sendCustomSMS(phoneNumbers, message) {
    const promises = phoneNumbers.map(async (number) => {
        try {
            const messageInstance = await client.messages.create({
                body: message,
                from: fromNumber,
                to: number
            });
            
            console.log(` Custom SMS sent to ${number}. SID: ${messageInstance.sid}`);
            return { success: true, number, sid: messageInstance.sid };
            
        } catch (error) {
            console.error(` Custom SMS failed for ${number}:`, error.message);
            return { success: false, number, error: error.message };
        }
    });
    
    const results = await Promise.all(promises);
    const successful = results.filter(r => r.success).length;
    
    console.log(`📱 Custom SMS Results: ${successful}/${phoneNumbers.length} sent successfully`);
    return results;
}


async function sendSingleSMS(phoneNumber, message) {
    try {
        const messageInstance = await client.messages.create({
            body: message,
            from: fromNumber,
            to: phoneNumber
        });
        
        console.log(` SMS sent to ${phoneNumber}. SID: ${messageInstance.sid}`);
        return { success: true, sid: messageInstance.sid };
        
    } catch (error) {
        console.error(` SMS failed for ${phoneNumber}:`, error.message);
        return { success: false, error: error.message };
    }
}


function validatePhoneNumber(phoneNumber) {
    
    const phoneRegex = /^\+[1-9]\d{1,14}$/;
    return phoneRegex.test(phoneNumber);
}


function formatIndianNumber(phoneNumber) {
    
    const cleaned = phoneNumber.replace(/\D/g, '');
    
    // If number starts with 91, add +
    if (cleaned.startsWith('91') && cleaned.length === 12) {
        return '+' + cleaned;
    }
    
    // If it's a 10-digit Indian number, add +91
    if (cleaned.length === 10) {
        return '+91' + cleaned;
    }
    
    
    return phoneNumber;
}

// Function to check Twilio account status
async function checkTwilioStatus() {
    try {
        const account = await client.api.accounts(process.env.TWILIO_ACCOUNT_SID).fetch();
        console.log(' Twilio account status:', account.status);
        console.log(' Account balance: $' + (account.balance || 'N/A'));
        return true;
    } catch (error) {
        console.error(' Twilio account check failed:', error.message);
        return false;
    }
}


module.exports = {
    sendBreakdownAlert,
    sendTestSMS,
    sendCustomSMS,
    sendSingleSMS,
    validatePhoneNumber,
    formatIndianNumber,
    checkTwilioStatus
};
