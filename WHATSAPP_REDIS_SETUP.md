# WhatsApp OTP + Redis Setup Guide

This guide explains how to set up WhatsApp-based OTP verification with Redis storage.

## 📋 Overview

#Connect now uses **WhatsApp** for OTP delivery instead of SMS, with **Redis** for OTP storage and validation.

**Benefits:**
- ✅ No SMS costs
- ✅ Higher delivery rates
- ✅ Users prefer WhatsApp
- ✅ Faster OTP delivery
- ✅ 5-minute OTP validity
- ✅ Rate limiting (10 OTPs per hour)

---

## 🚀 Setup Instructions

### Option 1: Mock Mode (Development - Quick Start)

**No setup required!** The app works in mock mode by default.

1. Start Redis:
   ```bash
   # Install Redis if not installed
   # macOS
   brew install redis
   brew services start redis

   # Ubuntu/Debian
   sudo apt-get install redis-server
   sudo systemctl start redis

   # Windows
   # Download Redis from https://redis.io/download
   ```

2. Run the app:
   ```bash
   npm run dev
   ```

3. Test OTP:
   - Enter phone number
   - Click "Send OTP"
   - OTP will be printed in console (like below):
   ```
   ╔══════════════════════════════════════════╗
   ║       WHATSAPP OTP - MOCK MODE         ║
   ╠══════════════════════════════════════════╣
   ║ Phone: 919876543210                     ║
   ║ OTP: 123456                              ║
   ║                                        ║
   ║ Valid for: 5 minutes                    ║
   ╚══════════════════════════════════════════╝
   ```

4. Enter the OTP from console
5. Verify!

---

### Option 2: Production WhatsApp Integration

Choose your WhatsApp provider and follow the setup:

#### A. Twilio API for WhatsApp

**1. Create Twilio Account:**
- Go to https://www.twilio.com/
- Sign up for free trial
- Get your Account SID and Auth Token

**2. Get WhatsApp Sandbox Number:**
- Go to Messaging → Try it out → Send a WhatsApp message
- Note your sandbox number

**3. Configure Environment Variables:**
```env
WHATSAPP_PROVIDER=twilio
TWILIO_ACCOUNT_SID=your_account_sid
TWILIO_AUTH_TOKEN=your_auth_token
WHATSAPP_FROM_NUMBER=+14155238886
REDIS_URL=redis://localhost:6379
```

**4. Add Your Number to Sandbox:**
- In Twilio console, add your WhatsApp number to the sandbox
- Send "join<keyword>" from WhatsApp to the sandbox number

#### B. MessageBird

**1. Create MessageBird Account:**
- Go to https://www.messagebird.com/
- Sign up and get API key

**2. Configure Environment Variables:**
```env
WHATSAPP_PROVIDER=messagebird
WHATSAPP_API_KEY=your_api_key
WHATSAPP_FROM_NUMBER=your_business_number
REDIS_URL=redis://localhost:6379
```

#### C. WhatsApp Business API (Meta)

**1. Create WhatsApp Business App:**
- Go to https://developers.facebook.com/
- Create a new app
- Add WhatsApp product

**2. Get Phone Number ID:**
- In WhatsApp settings, add your phone number
- Note the Phone Number ID

**3. Configure Environment Variables:**
```env
WHATSAPP_PROVIDER=whatsapp-business
WHATSAPP_ACCESS_TOKEN=your_access_token
WHATSAPP_PHONE_NUMBER_ID=your_phone_number_id
REDIS_URL=redis://localhost:6379
```

---

## 📦 Redis Setup

### Local Development

```bash
# Install Redis
brew install redis  # macOS
sudo apt-get install redis-server  # Ubuntu/Debian

# Start Redis
brew services start redis  # macOS
sudo systemctl start redis  # Linux
redis-server  # Any OS

# Verify Redis is running
redis-cli ping
# Should return: PONG
```

### Production Redis

**Option 1: Redis Cloud**
- Go to https://redis.com/try-free/
- Get free Redis database URL
- Set `REDIS_URL` in your environment

**Option 2: AWS ElastiCache**
- Create ElastiCache Redis cluster
- Get endpoint URL
- Set `REDIS_URL=redis://your-endpoint:6379`

**Option 3: Self-hosted**
```env
REDIS_URL=redis://username:password@your-redis-server:6379
```

---

## 🔧 Environment Variables

Create `.env.local` file:

```env
# Firebase (keep existing)
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# Redis
REDIS_URL=redis://localhost:6379

# WhatsApp
WHATSAPP_PROVIDER=mock
TWILIO_ACCOUNT_SID=your_account_sid
TWILIO_AUTH_TOKEN=your_auth_token
WHATSAPP_FROM_NUMBER=+14155238886
```

---

## 🧪 Testing

### Test Mock Mode (Default)

1. Start app:
   ```bash
   npm run dev
   ```

2. Try login/register:
   - Enter phone: `9876543210`
   - Click "Send OTP"
   - Check console for OTP
   - Enter OTP
   - Login!

### Test with Real WhatsApp (Twilio)

1. Configure `.env.local` with Twilio credentials
2. Add your WhatsApp number to Twilio Sandbox
3. Send OTP to your WhatsApp
4. Receive OTP in WhatsApp
5. Enter OTP in app
6. Verify!

---

## 🔒 Security Features

### Rate Limiting
- Max 10 OTP requests per hour per phone number
- Prevents OTP spamming

### OTP Expiry
- OTPs valid for 5 minutes (300 seconds)
- Automatically deleted after verification

### Redis Storage
- OTPs stored securely in Redis
- Deleted immediately after verification
- No OTPs logged in files

---

## 📱 OTP Message Format

Users receive this message on WhatsApp:

```
Your #Connect verification code is: 123456
Valid for 5 minutes
Don't share this code with anyone.
```

---

## ⚡ Performance

Redis provides:
- **Sub-millisecond** OTP lookup
- **Automatic expiry** of old OTPs
- **Rate limiting** without database queries
- **Scalable** for millions of users

---

## 🐛 Troubleshooting

### "Redis connection error"
```bash
# Check if Redis is running
redis-cli ping

# Start Redis if not running
brew services start redis  # macOS
sudo systemctl start redis  # Linux
```

### "Too many OTP requests"
- Wait 1 hour before trying again
- Or clear Redis: `redis-cli FLUSHDB`

### OTP not received in WhatsApp
- Check your WhatsApp sandbox settings
- Verify your number is added to sandbox
- Check API credentials
- Check console logs

---

## 📊 Monitoring

### Check Redis Data
```bash
# Connect to Redis CLI
redis-cli

# View all OTPs
KEYS otp:*

# View specific OTP
GET otp:919876543210

# Check rate limit
GET rate_limit:919876543210
```

---

## 🚀 Production Deployment

**Remember to change:**
1. ✅ Set `WHATSAPP_PROVIDER` to `twilio` or real provider
2. ✅ Use production Redis URL
3. ✅ Never commit `.env.local` to Git
4. ✅ Use secure environment variable management

---

**Mock mode is perfect for development! Switch to production when ready.** 🎉
