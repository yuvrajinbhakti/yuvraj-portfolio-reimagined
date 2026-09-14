import emailjs from '@emailjs/browser';

// Email service configuration
const emailConfig = {
  serviceId: import.meta.env.VITE_EMAILJS_SERVICE_ID,
  templateId: import.meta.env.VITE_EMAILJS_TEMPLATE_ID,
  publicKey: import.meta.env.VITE_EMAILJS_PUBLIC_KEY,
};

// Check if EmailJS is properly configured
export const isEmailJSConfigured = () => {
  return (
    emailConfig.serviceId && 
    emailConfig.templateId && 
    emailConfig.publicKey &&
    emailConfig.serviceId !== 'your_service_id' &&
    emailConfig.templateId !== 'your_template_id' &&
    emailConfig.publicKey !== 'your_public_key'
  );
};

// Validate email format
export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Validate form data
export const validateContactForm = (formData) => {
  const errors = [];

  if (!formData.name?.trim()) {
    errors.push('Name is required');
  }

  if (!formData.email?.trim()) {
    errors.push('Email is required');
  } else if (!validateEmail(formData.email)) {
    errors.push('Please enter a valid email address');
  }

  if (!formData.message?.trim()) {
    errors.push('Message is required');
  } else if (formData.message.trim().length < 10) {
    errors.push('Message must be at least 10 characters long');
  }

  return errors;
};

// Send email via EmailJS
export const sendContactEmail = async (formData) => {
  // Validate configuration
  if (!isEmailJSConfigured()) {
    throw new Error('EmailJS is not configured. Please check your environment variables.');
  }

  // Validate form data
  const validationErrors = validateContactForm(formData);
  if (validationErrors.length > 0) {
    throw new Error(validationErrors.join(', '));
  }

  try {
    // Prepare template parameters
    const templateParams = {
      from_name: formData.name.trim(),
      from_email: formData.email.trim(),
      message: formData.message.trim(),
      to_name: 'Yuvraj Singh Nain',
      reply_to: formData.email.trim(),
      subject: `Portfolio Contact: Message from ${formData.name.trim()}`,
      timestamp: new Date().toLocaleString(),
    };

    // Send email
    const response = await emailjs.send(
      emailConfig.serviceId,
      emailConfig.templateId,
      templateParams,
      emailConfig.publicKey
    );

    return {
      success: true,
      response,
      message: 'Email sent successfully!'
    };

  } catch (error) {
    console.error('EmailJS Error:', error);
    
    // Handle specific EmailJS errors
    let errorMessage = 'Failed to send email. ';
    
    switch (error.status) {
      case 400:
        errorMessage += 'Invalid request format.';
        break;
      case 401:
        errorMessage += 'Unauthorized. Please check your EmailJS configuration.';
        break;
      case 403:
        errorMessage += 'Forbidden. You may have exceeded your email quota.';
        break;
      case 404:
        errorMessage += 'Service or template not found.';
        break;
      case 422:
        errorMessage += 'Invalid template parameters.';
        break;
      case 429:
        errorMessage += 'Too many requests. Please try again later.';
        break;
      default:
        errorMessage += error.text || 'Unknown error occurred.';
    }
    
    throw new Error(errorMessage);
  }
};

// Alternative: Create mailto link for fallback
export const createMailtoLink = (formData) => {
  const subject = encodeURIComponent(`Portfolio Contact: Message from ${formData.name || 'Visitor'}`);
  const body = encodeURIComponent(`
Hi Yuvraj,

Name: ${formData.name || 'Not provided'}
Email: ${formData.email || 'Not provided'}

Message:
${formData.message || 'No message provided'}

---
Sent from your portfolio website
  `.trim());

  return `mailto:yuvrajsinghnain03@gmail.com?subject=${subject}&body=${body}`;
};

// Usage example:
// import { sendContactEmail, isEmailJSConfigured, createMailtoLink } from '../utils/emailService';
//
// const handleSubmit = async (formData) => {
//   try {
//     if (isEmailJSConfigured()) {
//       await sendContactEmail(formData);
//       // Success handling
//     } else {
//       // Fallback to mailto
//       window.location.href = createMailtoLink(formData);
//     }
//   } catch (error) {
//     // Error handling
//     console.error(error.message);
//   }
// }; 