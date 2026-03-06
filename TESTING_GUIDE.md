# 🧪 Testing WhatsApp OTP Integration

## ✅ System Status

- ✅ **Redis**: Running and responding (PONG)
- ✅ **Next.js**: Running at http://localhost:3000
- ✅ **WhatsApp OTP**: Ready (Mock Mode)
- ✅ **API Routes**: Configured

---

## 📱 Testing Instructions

### **Test 1: Send OTP via WhatsApp (Mock Mode)**

1. **Open the app**: http://localhost:3000

2. **Click "Register" tab**

3. **Select your community**:
   - Click anywhere on the map OR
   - Search for a location
   - Click "Continue to Registration"

4. **Fill in the form**:
   ```
   Full Name: Test User
   Phone: 9876543210
   ```

5. **Click "Send OTP" button**

6. **Check the terminal/console** where `npm run dev` is running
   - You should see:
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

7. **Copy the OTP** from the console

8. **Enter OTP in the app**: `123456` (or whatever is shown)

9. **Click "Create Account"**

10. **Success!** 🎉

---

### **Test 2: Login with OTP**

1. **Go to "Login" tab**

2. **Enter phone**: `9876543210`

3. **Click "Send OTP"**

4. **Check console for OTP**

5. **Enter OTP and verify**

6. **Success!** ✅

---

## 🔍 What to Look For

### Console Output:
When you click "Send OTP", the console should display:
```
✅ Redis connected successfully
╔══════════════════════════════════════════╗
║       WHATSAPP OTP - MOCK MODE         ║
╠══════════════════════════════════════════╣
║ Phone: 919876543210                     ║
║ OTP: 123456                              ║
║                                        ║
║ Valid for: 5 minutes                    ║
╚══════════════════════════════════════════╝
```

### Success Screen:
After entering the correct OTP, you should see:
- ✅ Logo displayed
- ✅ "Welcome to #Connect!" message
- ✅ Redirect to dashboard (or success screen)

---

## 🐛 Troubleshooting

### "Failed to send OTP"
- Make sure Redis is running: `brew services list | grep redis`
- Check `.env.local` exists
- Check server console for errors

### "Invalid OTP"
- OTP is case-sensitive
- OTP must be exactly 6 digits
- OTP expires in 5 minutes
- Check console for the correct OTP

### Redis Connection Error
```bash
# Restart Redis
brew services restart redis

# Verify
redis-cli ping
# Should return: PONG
```

---

## 🎯 Expected Behavior

### Send OTP Flow:
1. User clicks "Send OTP"
2. Button shows loading spinner
3. API call to `/api/otp/send`
4. OTP generated (6 digits)
5. Stored in Redis (5 min TTL)
6. Logged to console
7. Button shows "Sent!" with green checkmark
8. OTP input becomes enabled

### Verify OTP Flow:
1. User enters 6-digit OTP
2. API call to `/api/otp/verify`
3. Retrieved from Redis
4. Compared with user input
5. If match: Deleted from Redis, success
6. If no match: Error message

---

## 📊 Redis Commands (For Debugging)

```bash
# Connect to Redis
redis-cli

# View all OTPs currently stored
KEYS otp:*

# View specific OTP
GET otp:919876543210

# Check TTL (time to live in seconds)
TTL otp:919876543210

# Check rate limit counter
GET rate_limit:919876543210

# Clear all OTPs (development only)
FLUSHDB
```

---

## 🎉 Success Indicators

### ✅ Everything Working If:
- OTP appears in console with box formatting
- Button changes to "Sent!" with green checkmark
- Entering correct OTP shows success screen
- Dashboard/Profile loads with user data
- No errors in console

### ❌ Issues To Check:
- Redis not running
- Port 3000 already in use
- Next.js compilation errors
- Network issues with API routes

---

## 🚀 Ready to Test!

**App URL**: http://localhost:3000

**Status**:
- ✅ Redis: Running
- ✅ Server: Running
- ✅ WhatsApp OTP: Mock mode active
- ✅ OTP Storage: Redis configured

**Go ahead and test!** 🎯
