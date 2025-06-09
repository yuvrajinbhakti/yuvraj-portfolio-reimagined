# Assets Folder

## Resume Setup

To enable automatic resume downloads without updating URLs:

1. **Add your resume file**: Place your resume as `resume.pdf` in this folder (`public/assets/resume.pdf`)

2. **File naming**: The system looks for `resume.pdf` by default. You can change this in `src/Components/CTA.jsx` if needed.

3. **Benefits**: 
   - No need to update Google Drive links
   - Faster download speeds
   - Works offline
   - Better user experience

## EmailJS Setup

To enable the contact form email functionality:

1. **Create EmailJS Account**: 
   - Go to [EmailJS.com](https://www.emailjs.com/)
   - Sign up for a free account

2. **Create Email Service**:
   - Add your email service (Gmail, Outlook, etc.)
   - Note the Service ID

3. **Create Email Template**:
   - Create a new template with these variables:
     - `{{from_name}}` - Sender's name
     - `{{from_email}}` - Sender's email  
     - `{{message}}` - Message content
     - `{{to_name}}` - Your name (recipient)
   - Note the Template ID

4. **Get Public Key**:
   - Go to Account > API Keys
   - Copy your Public Key

5. **Update Configuration**:
   - Open `src/pages/Contact.jsx`
   - Replace the following values:
     ```javascript
     const EMAILJS_SERVICE_ID = 'your_service_id';
     const EMAILJS_TEMPLATE_ID = 'your_template_id'; 
     const EMAILJS_PUBLIC_KEY = 'your_public_key';
     ```

6. **Test the Form**: The contact form should now send real emails!

## File Structure
```
public/
├── assets/
│   ├── resume.pdf          # Your resume file
│   └── README.md          # This file
└── ...
``` 