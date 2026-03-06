import { storeOTP, isRateLimited } from './redis';

// WhatsApp OTP Service
interface WhatsAppConfig {
  provider: 'twilio' | 'messagebird' | 'whatsapp-business' | 'mock';
  accountSid?: string;
  authToken?: string;
  fromNumber?: string;
  apiKey?: string;
}

const config: WhatsAppConfig = {
  provider: (process.env.WHATSAPP_PROVIDER as any) || 'mock',
  accountSid: process.env.TWILIO_ACCOUNT_SID,
  authToken: process.env.TWILIO_AUTH_TOKEN,
  fromNumber: process.env.WHATSAPP_FROM_NUMBER,
  apiKey: process.env.WHATSAPP_API_KEY,
};

// Generate 6-digit OTP
function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Format phone number for WhatsApp
function formatPhoneNumber(phone: string): string {
  // Remove any non-digit characters
  let cleaned = phone.replace(/\D/g, '');

  // If starting with 0, replace with country code (assumed +91 for India)
  if (cleaned.startsWith('0')) {
    cleaned = '91' + cleaned.substring(1);
  }

  // Ensure it has country code
  if (!cleaned.startsWith('91') && cleaned.length === 10) {
    cleaned = '91' + cleaned;
  }

  return cleaned;
}

// Send OTP via WhatsApp
export async function sendWhatsAppOTP(phoneNumber: string): Promise<{
  success: boolean;
  otp?: string;
  message?: string;
}> {
  try {
    // Check rate limit
    const rateLimited = await isRateLimited(phoneNumber);
    if (rateLimited) {
      return {
        success: false,
        message: 'Too many OTP requests. Please try again after 1 hour.',
      };
    }

    const formattedPhone = formatPhoneNumber(phoneNumber);
    const otp = generateOTP();

    // Store OTP in Redis with 5 minutes expiry
    await storeOTP(formattedPhone, otp);

    // Send based on provider
    switch (config.provider) {
      case 'twilio':
        await sendViaTwilio(formattedPhone, otp);
        break;
      case 'messagebird':
        await sendViaMessageBird(formattedPhone, otp);
        break;
      case 'whatsapp-business':
        await sendViaWhatsAppBusiness(formattedPhone, otp);
        break;
      case 'mock':
      default:
        await sendMockOTP(formattedPhone, otp);
        break;
    }

    return {
      success: true,
      otp: config.provider === 'mock' ? otp : undefined,
    };
  } catch (error: any) {
    console.error('WhatsApp OTP error:', error);
    return {
      success: false,
      message: error.message || 'Failed to send OTP via WhatsApp',
    };
  }
}

// Twilio integration
async function sendViaTwilio(phone: string, otp: string): Promise<void> {
  const accountSid = config.accountSid;
  const authToken = config.authToken;
  const fromNumber = config.fromNumber;

  if (!accountSid || !authToken || !fromNumber) {
    throw new Error('Twilio credentials not configured');
  }

  const response = await fetch(
    `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: 'Basic ' + Buffer.from(`${accountSid}:${authToken}`).toString('base64'),
      },
      body: new URLSearchParams({
        From: `whatsapp:${fromNumber}`,
        To: `whatsapp:${phone}`,
        Body: `Your #Connect verification code is: ${otp}. Valid for 5 minutes. Don't share this code with anyone.`,
      }),
    }
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Twilio error: ${error}`);
  }
}

// MessageBird integration
async function sendViaMessageBird(phone: string, otp: string): Promise<void> {
  const apiKey = config.apiKey;

  if (!apiKey) {
    throw new Error('MessageBird API key not configured');
  }

  const response = await fetch('https://whatsapp.messagebird.com/v1/messages', {
    method: 'POST',
    headers: {
      'Authorization': `AccessKey ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      to: phone,
      from: config.fromNumber,
      type: 'text',
      content: {
        text: `Your #Connect verification code is: ${otp}. Valid for 5 minutes. Don't share this code with anyone.`,
      },
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`MessageBird error: ${error}`);
  }
}

// WhatsApp Business API integration
async function sendViaWhatsAppBusiness(phone: string, otp: string): Promise<void> {
  const accessToken = process.env.WHATSAPP_ACCESS_TOKEN;
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;

  if (!accessToken || !phoneNumberId) {
    throw new Error('WhatsApp Business API credentials not configured');
  }

  const response = await fetch(
    `https://graph.facebook.com/v18.0/${phoneNumberId}/messages`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        to: phone,
        type: 'text',
        text: {
          body: `Your #Connect verification code is: ${otp}. Valid for 5 minutes. Don't share this code with anyone.`,
        },
      }),
    }
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`WhatsApp Business API error: ${error}`);
  }
}

// Mock for testing (logs OTP to console)
async function sendMockOTP(phone: string, otp: string): Promise<void> {
  console.log('╔══════════════════════════════════════════╗');
  console.log('║       WHATSAPP OTP - MOCK MODE         ║');
  console.log('╠══════════════════════════════════════════╣');
  console.log(`║ Phone: ${phone}                        ║`);
  console.log(`║ OTP: ${otp}                            ║`);
  console.log('║                                        ║');
  console.log('║ Valid for: 5 minutes                   ║');
  console.log('╚══════════════════════════════════════════╝');
}
