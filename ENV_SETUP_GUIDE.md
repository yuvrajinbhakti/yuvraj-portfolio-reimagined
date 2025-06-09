# Environment Variables Setup Guide 🔧

## Quick Setup

### 1. Create .env File
Create a new file called `.env` in your project root (same level as package.json):

```bash
# In your terminal, from project root:
touch .env
```

### 2. Add EmailJS Configuration
Copy and paste this into your `.env` file:

```bash
# EmailJS Configuration
# Replace these dummy values with your actual EmailJS credentials

# Service ID - Get this from EmailJS Dashboard > Email Services
VITE_EMAILJS_SERVICE_ID=service_dummy123

# Template ID - Get this from EmailJS Dashboard > Email Templates  
VITE_EMAILJS_TEMPLATE_ID=template_dummy456

# Public Key - Get this from EmailJS Dashboard > Account > General
VITE_EMAILJS_PUBLIC_KEY=user_dummy789
```

### 3. Get Real EmailJS Credentials

1. **Sign up at [EmailJS.com](https://www.emailjs.com/)**
2. **Create Email Service**:
   - Go to Email Services → Add New Service
   - Choose Gmail (recommended)
   - Connect your account
   - Copy the **Service ID** (e.g., `service_abc1234`)

3. **Create Email Template**:
   - Go to Email Templates → Create New Template
   - Use this template structure:
   
   ```
   Subject: New Portfolio Contact from {{from_name}}
   
   Hi Yuvraj,
   
   You have received a new message through your portfolio website:
   
   From: {{from_name}}
   Email: {{from_email}}
   Subject: {{subject}}
   
   Message:
   {{message}}
   
   ---
   Reply to: {{reply_to}}
   Timestamp: {{timestamp}}
   ```
   
   - Copy the **Template ID** (e.g., `template_xyz5678`)

4. **Get Public Key**:
   - Go to Account → General
   - Copy your **Public Key** (e.g., `user_def9012`)
### 4. Update .env with Real Values
Replace the dummy values in your `.env` file:

```bash
# Real EmailJS Configuration
VITE_EMAILJS_SERVICE_ID=service_abc1234
VITE_EMAILJS_TEMPLATE_ID=template_xyz5678
VITE_EMAILJS_PUBLIC_KEY=user_def9012
```

### 5. Restart Development Server
```bash
npm run dev
```

## Variable Names Explained

- **VITE_EMAILJS_SERVICE_ID**: Your email service identifier
- **VITE_EMAILJS_TEMPLATE_ID**: Your email template identifier  
- **VITE_EMAILJS_PUBLIC_KEY**: Your public API key (NOT private key)

*Note: `VITE_` prefix is required for Vite to expose variables to the frontend*

## Testing Your Setup

### Option 1: Use the Contact Form
1. Go to `http://localhost:5173/contact`
2. Fill out and submit the form
3. Check your email for the message

### Option 2: Use Browser Console
```javascript
// Open browser console and run:
import { testEmailService } from './src/utils/emailTester.js'
testEmailService()
```

## Security Notes

✅ **DO:**
- Use environment variables for credentials
- Only use the Public Key (never Private Key)
- Keep `.env` file in `.gitignore`

❌ **DON'T:**
- Commit `.env` to version control
- Share your credentials publicly
- Use Private Key in frontend code

## Troubleshooting

### "EmailJS not configured" message?
- Check if `.env` file exists in project root
- Verify variable names have `VITE_` prefix
- Restart development server after changes

### Form shows mailto fallback?
- Variables are still set to dummy values
- Replace dummy values with real EmailJS credentials
- Restart development server

### Still not working?
- Check browser console for errors
- Verify EmailJS service and template are active
- Check EmailJS quota (200 emails/month free)

## Example .env File Structure

```
project-root/
├── src/
├── public/
├── package.json
├── .env              ← Create this file
├── .env.template     ← This guide
└── .gitignore        ← Should include .env
```

---
**Need help?** Contact me at yuvrajsinghnain03@gmail.com 