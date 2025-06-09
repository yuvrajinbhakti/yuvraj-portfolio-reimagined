import { sendContactEmail, isEmailJSConfigured } from './emailService';

// Test email functionality
export const testEmailService = async () => {
  console.log('🧪 Testing Email Service...');
  
  // Check configuration
  console.log('📋 Configuration Status:', {
    isConfigured: isEmailJSConfigured(),
    serviceId: import.meta.env.VITE_EMAILJS_SERVICE_ID ? '✅ Set' : '❌ Missing',
    templateId: import.meta.env.VITE_EMAILJS_TEMPLATE_ID ? '✅ Set' : '❌ Missing',
    publicKey: import.meta.env.VITE_EMAILJS_PUBLIC_KEY ? '✅ Set' : '❌ Missing',
  });

  if (!isEmailJSConfigured()) {
    console.warn('⚠️ EmailJS not configured. Please check EMAILJS_SETUP.md');
    return false;
  }

  // Test data
  const testData = {
    name: 'Test User',
    email: 'test@example.com',
    message: 'This is a test message from your portfolio contact form. If you receive this, EmailJS is working correctly!'
  };

  try {
    console.log('📧 Sending test email...');
    const result = await sendContactEmail(testData);
    console.log('✅ Test email sent successfully!', result);
    return true;
  } catch (error) {
    console.error('❌ Test email failed:', error.message);
    return false;
  }
};

// Quick test function you can call from browser console
export const quickTest = () => {
  console.log('🚀 Quick Email Test');
  console.log('Run: testEmailService()');
  return testEmailService();
};

// Usage in browser console:
// import { testEmailService } from './src/utils/emailTester.js'
// testEmailService()

export default {
  testEmailService,
  quickTest,
}; 