# EmailJS Setup Guide 📧

## Quick Setup Instructions

### 1. Create EmailJS Account
- Go to [EmailJS.com](https://www.emailjs.com/)
- Sign up for a free account
- Verify your email

### 2. Create Email Service
- In your EmailJS dashboard, go to **Email Services**
- Click **Add New Service**
- Choose your email provider (Gmail recommended)
- Connect your email account
- Copy your **Service ID** (e.g., `service_abc123`)

### 3. Create Email Template
- Go to **Email Templates**
- Click **Create New Template**
- Use this template structure:

```html
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
```

- Copy your **Template ID** (e.g., `template_xyz456`)

### 4. Get Public Key
- Go to **Account** → **General**
- Copy your **Public Key** (e.g., `user_def789`)

### 5. Set Environment Variables
Create a `.env` file in your project root:

```bash
# EmailJS Configuration
VITE_EMAILJS_SERVICE_ID=service_abc123
VITE_EMAILJS_TEMPLATE_ID=template_xyz456
VITE_EMAILJS_PUBLIC_KEY=user_def789
```

### 6. Test Your Setup
- Restart your development server: `npm run dev`
- Go to `/contact` page
- Fill out and submit the form
- Check your email for the message

## Template Variables Available

Your EmailJS template can use these variables:
- `{{from_name}}` - Sender's name
- `{{from_email}}` - Sender's email
- `{{message}}` - Message content
- `{{to_name}}` - Your name (Yuvraj Singh Nain)
- `{{reply_to}}` - Reply-to email
- `{{subject}}` - Auto-generated subject

## Troubleshooting

### Common Issues:
1. **"EmailJS not configured"** → Check your .env file
2. **Status 422 Error** → Invalid email template or missing variables
3. **Status 403 Error** → Check your EmailJS quota/limits
4. **Network Error** → Check internet connection

### Gmail Setup Tips:
- Use Gmail service in EmailJS
- Make sure 2FA is enabled
- Generate an App Password if needed
- Allow less secure apps (if required)

## Security Notes
- Never expose your Private Key (only use Public Key)
- Environment variables keep credentials secure
- EmailJS has rate limiting (200 emails/month free)

## Alternative Email Solutions

If EmailJS doesn't work, consider these alternatives:

### 1. Netlify Forms (if hosting on Netlify)
```html
<form name="contact" method="POST" data-netlify="true">
  <input type="hidden" name="form-name" value="contact" />
  <!-- your form fields -->
</form>
```

### 2. Formspree
- Sign up at [Formspree.io](https://formspree.io/)
- Use their endpoint in your form action

### 3. Web3Forms
- Free service at [Web3Forms.com](https://web3forms.com/)
- No registration required

## Testing Command
```bash
# Start development server
npm run dev

# Navigate to contact page
# http://localhost:5173/contact
```

---
**Need help?** Contact me at yuvrajsinghnain03@gmail.com 