# 📱 Twilio WhatsApp OTP Setup Guide

This guide will help you configure real WhatsApp OTP delivery using Twilio.

---

## Step 1: Create a Twilio Account

1. Go to https://www.twilio.com/
2. Click **"Try Twilio Free"**
3. Sign up with your email
4. Verify your email address
5. Verify your phone number (Twilio will call or text you)

---

## Step 2: Get Your Twilio Credentials

After signing up, you'll land on the Twilio Console:

1. **Account SID**: Copy from the dashboard
   - Located at the top of your console homepage
   - Example: `ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`

2. **Auth Token**: Copy from the dashboard
   - Located right below Account SID
   - Click the "Show" button to reveal it
   - ⚠️ Keep this secret! Never share it!
   - Example: `your_auth_token_here`

---

## Step 3: Set Up WhatsApp Sandbox

Twilio provides a free WhatsApp sandbox for testing:

1. In your Twilio Console, search for **"WhatsApp"** in the top search bar
2. Click on **"Messaging"** → **"Try it out"** → **"Send a WhatsApp message"**
3. You'll see a **WhatsApp Sandbox Number** (like `+14155238886`)
4. **Join the sandbox** from your phone:
   - Open WhatsApp on your phone
   - Send a message to the sandbox number: `join <keyword>`
   - The keyword is shown in your Twilio console (usually `join` or a custom word)
   - You'll receive a confirmation message from Twilio

5. **Save the sandbox number** - you'll use this as `WHATSAPP_FROM_NUMBER`

---

## Step 4: Configure Environment Variables

Create or update your `.env.local` file:

```bash
# WhatsApp Provider - Change to 'twilio'
WHATSAPP_PROVIDER=twilio

# Twilio Credentials (from Step 2)
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_auth_token_here

# WhatsApp Sandbox Number (from Step 3)
# Format: +14155238886 (with country code, no spaces or dashes)
WHATSAPP_FROM_NUMBER=+14155238886

# Redis (already configured)
REDIS_URL=redis://localhost:6379
```

### Example `.env.local` file:

```bash
WHATSAPP_PROVIDER=twilio
TWILIO_ACCOUNT_SID=YOUR_TWILIO_ACCOUNT_SID
TWILIO_AUTH_TOKEN=YOUR_TWILIO_AUTH_TOKEN
WHATSAPP_FROM_NUMBER=+14155238886
REDIS_URL=redis://localhost:6379
```

---

## Step 5: Restart Your Server

After updating `.env.local`, restart the Next.js dev server:

```bash
# Stop the current server (Ctrl+C)
# Then restart:
npm run dev
```

---

## Step 6: Test Real WhatsApp OTP

Now when you send an OTP:

1. Open http://localhost:3000
2. Click **"Register"**
3. Enter your phone number (must be joined to WhatsApp sandbox)
4. Click **"Send OTP"**
5. ✅ You'll receive the OTP on WhatsApp!

### How it works:

```
User's Phone (WhatsApp)
       ↑
       │ OTP: "Your #Connect verification code is: 123456"
       │
       │
Twilio WhatsApp API ← Your #Connect App
       ↑
       │
       │
Twilio Account (using your credentials)
```

---

## Step 7: Move to Production (Optional)

When you're ready to send OTPs to real users (not just sandbox):

### Option A: Use Twilio's WhatsApp Business Profile

1. Apply for a WhatsApp Business API account through Twilio
2. Get approved (takes 1-2 weeks)
3. Use your approved WhatsApp number instead of sandbox
4. Update `WHATSAPP_FROM_NUMBER` in `.env.local`

### Option B: Use Your Own WhatsApp Number

You can use your existing WhatsApp business number:

1. In Twilio Console, go to **"Messaging"** → **"Settings"** → **"WhatsApp Sender Numbers"**
2. Add your WhatsApp business number
3. Wait for approval
4. Update `WHATSAPP_FROM_NUMBER` with your number

---

## 🎯 Testing Checklist

- [ ] Twilio account created
- [ ] Account SID and Auth Token copied
- [ ] WhatsApp sandbox joined from your phone
- [ ] `.env.local` updated with Twilio credentials
- [ ] `WHATSAPP_PROVIDER=twilio`
- [ ] Server restarted
- [ ] Test OTP sent to your WhatsApp ✅

---

## 💰 Twilio Pricing

### Free Tier (Sandbox):
- **Free** for testing
- Messages only to numbers that joined your sandbox
- Limited to sandbox number

### Paid Tier (Production):
- WhatsApp messages: **~$0.0050 per message** (varies by country)
- For India: ~₹0.40 per message
- Free trial includes $15 credit when you sign up
- Pay-as-you-go after trial ends

### Cost Estimation:
- 1000 OTPs = ~$5 USD (₹400)
- 10,000 OTPs = ~$50 USD (₹4,000)

---

## 🐛 Troubleshooting

### "Twilio credentials not configured"
- Check that all 3 environment variables are set in `.env.local`
- Restart the server after updating `.env.local`

### "Failed to send OTP via WhatsApp"
- Verify the phone number has joined your WhatsApp sandbox
- Check `WHATSAPP_FROM_NUMBER` format (should be `+14155238886`)
- Verify Account SID and Auth Token are correct
- Check Twilio Console for error logs

### "Unauthorized" error
- Auth Token might be incorrect
- Regenerate Auth Token in Twilio Console if needed

### Phone number format issues
- Always include country code: `919876543210` (not `9876543210`)
- Format should be E.164: `+` + country code + number
- The app auto-formats Indian numbers

---

## 📊 Monitoring

### Check OTP Logs:
```bash
# View Redis OTPs
redis-cli
> KEYS otp:*
> GET otp:919876543210
> TTL otp:919876543210
```

### Check Twilio Message Logs:
1. Go to Twilio Console
2. Click **"Messaging"** → **"Logs"**
3. See all sent messages, status, and errors

---

## 🔒 Security Best Practices

1. **Never commit `.env.local` to Git**
2. **Use different credentials** for dev and production
3. **Rotate Auth Tokens** periodically
4. **Set up spending limits** in Twilio to avoid unexpected charges
5. **Monitor usage** regularly in Twilio Console

---

## ✅ Success!

Once configured, your #Connect app will send real WhatsApp OTPs to users!

Users will receive:
```
Your #Connect verification code is: 123456
Valid for 5 minutes
Don't share this code with anyone.
```

---

**Need help?**
- Twilio Docs: https://www.twilio.com/docs/whatsapp
- Twilio Support: https://www.twilio.com/help/contact

---

**Created by: Shyam Dasari**
**Contact: +91 9182227194**
