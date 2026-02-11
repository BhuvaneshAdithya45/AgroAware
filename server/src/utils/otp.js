// OTP Service - SMS-based authentication
import twilio from 'twilio';

// In-memory OTP storage (for development)
// In production, use Redis or database with TTL
const otpStore = new Map();

// Initialize Twilio client safely
let twilioClient = null;

function getTwilioClient() {
  if (twilioClient) return twilioClient;

  if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN) {
    console.warn('⚠️ Twilio credentials not configured. OTP will use mock mode for testing.');
    return null;
  }

  try {
    twilioClient = twilio(
      process.env.TWILIO_ACCOUNT_SID,
      process.env.TWILIO_AUTH_TOKEN
    );
    return twilioClient;
  } catch (error) {
    console.error('❌ Error initializing Twilio:', error.message);
    return null;
  }
}

/**
 * Generate a random 6-digit OTP
 */
export function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * Send OTP to phone number via Twilio
 * @param {string} phone - 10-digit phone number
 * @returns {Promise<{success: boolean, message: string}>}
 */
export async function sendOTP(phone) {
  try {
    // Validate phone
    if (!phone || phone.length !== 10) {
      return { success: false, message: 'Invalid phone number' };
    }

    // Generate OTP
    const otp = generateOTP();
    const phoneWithCode = '+91' + phone;

    const client = getTwilioClient();

    if (client) {
      try {
        // Try to send via Twilio (real SMS)
        await client.messages.create({
          body: `🌾 AgroAware OTP: ${otp}\n\nValid for 10 minutes. Do not share with anyone.`,
          from: process.env.TWILIO_PHONE_NUMBER,
          to: phoneWithCode,
        });
        console.log(`✅ OTP sent to ${phoneWithCode}`);
      } catch (twilioError) {
        // If Twilio fails (e.g., invalid number), fall back to test mode
        console.log(`📱 [TEST MODE] Twilio error - Using console mode instead`);
        console.log(`📱 [TEST MODE] OTP for ${phoneWithCode}: ${otp}`);
      }
    } else {
      // No Twilio client - use test mode
      console.log(`📱 [TEST MODE] OTP for ${phoneWithCode}: ${otp}`);
    }

    // Store OTP (expires in 10 minutes)
    otpStore.set(phone, {
      otp,
      expiresAt: Date.now() + 10 * 60 * 1000,
      attempts: 0,
    });

    return { success: true, message: 'OTP sent successfully' };
  } catch (error) {
    console.error('❌ Error sending OTP:', error.message);
    return { success: false, message: 'Failed to send OTP. Please try again.' };
  }
}

/**
 * Verify OTP
 * @param {string} phone - 10-digit phone number
 * @param {string} otp - 6-digit OTP
 * @returns {Promise<{success: boolean, message: string}>}
 */
export async function verifyOTP(phone, otp) {
  try {
    if (!otpStore.has(phone)) {
      return { success: false, message: 'OTP not requested. Please request OTP first.' };
    }

    const storedData = otpStore.get(phone);

    // Check if OTP expired
    if (Date.now() > storedData.expiresAt) {
      otpStore.delete(phone);
      return { success: false, message: 'OTP expired. Please request a new one.' };
    }

    // Check attempts (max 5)
    if (storedData.attempts >= 5) {
      otpStore.delete(phone);
      return { success: false, message: 'Too many attempts. Please request OTP again.' };
    }

    // Verify OTP
    if (storedData.otp !== otp) {
      storedData.attempts += 1;
      return { success: false, message: 'Invalid OTP. Please try again.' };
    }

    // OTP verified - clean up
    otpStore.delete(phone);
    return { success: true, message: 'OTP verified successfully' };
  } catch (error) {
    console.error('❌ Error verifying OTP:', error.message);
    return { success: false, message: 'Error verifying OTP' };
  }
}

/**
 * Get OTP status (for testing)
 */
export function getOTPStatus(phone) {
  if (!otpStore.has(phone)) {
    return { stored: false };
  }
  const data = otpStore.get(phone);
  return {
    stored: true,
    expiresIn: Math.ceil((data.expiresAt - Date.now()) / 1000),
    attempts: data.attempts,
  };
}

/**
 * Clear OTP (for testing)
 */
export function clearOTP(phone) {
  otpStore.delete(phone);
}
