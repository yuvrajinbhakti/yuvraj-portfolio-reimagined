import { useState, useRef } from "react";
import { motion } from "framer-motion";
import AnimatedBackground from "../Components/AnimatedBackground";
import ScrollReveal from "../Components/ScrollReveal";
import GlassCard from "../Components/GlassCard";
import { sendContactEmail, isEmailJSConfigured, createMailtoLink } from "../utils/emailService";

const Contact = () => {
  const formRef = useRef(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus(null);

    try {
      if (isEmailJSConfigured()) {
        // Use EmailJS service
        const result = await sendContactEmail(formData);
        
        console.log('Email sent successfully:', result.response);
        
        // Reset form
        setFormData({ name: "", email: "", message: "" });
        setSubmitStatus({
          success: true,
          message: "🎉 Thanks for your message! I'll get back to you within 24 hours.",
        });
        
        // Reset status after 8 seconds
        setTimeout(() => {
          setSubmitStatus(null);
        }, 8000);

      } else {
        // Fallback: Create mailto link
        const mailtoLink = createMailtoLink(formData);
        
        setSubmitStatus({
          success: false,
          message: (
            <div className="space-y-2">
              <p>📧 EmailJS not configured yet.</p>
              <p>
                <a 
                  href={mailtoLink}
                  className="inline-flex items-center gap-2 text-blue-400 hover:text-blue-300 underline transition-colors"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                  Click here to send email directly
                </a>
              </p>
            </div>
          ),
        });
      }

    } catch (error) {
      console.error("Error sending email:", error);
      
      setSubmitStatus({
        success: false,
        message: `❌ ${error.message}`,
      });
      
      // Reset error after 10 seconds
      setTimeout(() => {
        setSubmitStatus(null);
      }, 10000);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="overflow-y-auto overflow-x-hidden">
      <AnimatedBackground>
        <section className="w-full pt-24 md:pt-32 px-4 md:px-8 mb-12 md:mb-20">
          <div className="max-w-6xl mx-auto">
            <ScrollReveal animation="fade">
              <motion.h1 
                className="text-5xl font-bold text-center mb-2 text-white"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                Get In <span className="text-blue-400">Touch</span>
              </motion.h1>
              <motion.p 
                className="text-lg text-center mb-12 text-gray-300"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.5 }}
              >
                Have a project in mind or just want to say hello? Send me a message!
              </motion.p>
            </ScrollReveal>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Contact Information */}
              <ScrollReveal animation="slide" direction="left">
                <GlassCard className="p-8 h-full">
                  <h2 className="text-2xl font-bold mb-6 text-white">Contact Information</h2>

                  <div className="space-y-6">
                    <div className="flex items-start group">
                      <div className="flex-shrink-0 p-3 bg-gradient-to-br from-blue-500/30 to-cyan-500/20 rounded-xl border border-blue-400/30 group-hover:border-blue-400/60 transition-all duration-300 group-hover:shadow-lg group-hover:shadow-blue-500/25">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-400 group-hover:text-blue-300 transition-colors duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <div className="ml-4">
                        <h3 className="text-lg font-semibold text-white mb-1 group-hover:text-blue-300 transition-colors duration-300">Email</h3>
                        <p className="text-gray-300 mt-1">
                          <a href="mailto:yuvrajsinghnain03@gmail.com" className="hover:text-blue-400 transition-all duration-300 hover:underline decoration-blue-400/50 underline-offset-2">
                            yuvrajsinghnain03@gmail.com
                          </a>
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-start group">
                      <div className="flex-shrink-0 p-3 bg-gradient-to-br from-purple-500/30 to-pink-500/20 rounded-xl border border-purple-400/30 group-hover:border-purple-400/60 transition-all duration-300 group-hover:shadow-lg group-hover:shadow-purple-500/25">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-purple-400 group-hover:text-purple-300 transition-colors duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                      </div>
                      <div className="ml-4">
                        <h3 className="text-lg font-semibold text-white mb-1 group-hover:text-purple-300 transition-colors duration-300">Location</h3>
                        <p className="text-gray-300 mt-1">Chandigarh, India</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start group">
                      <div className="flex-shrink-0 p-3 bg-gradient-to-br from-green-500/30 to-teal-500/20 rounded-xl border border-green-400/30 group-hover:border-green-400/60 transition-all duration-300 group-hover:shadow-lg group-hover:shadow-green-500/25">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-400 group-hover:text-green-300 transition-colors duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                      </div>
                      <div className="ml-4">
                        <h3 className="text-lg font-semibold text-white mb-1 group-hover:text-green-300 transition-colors duration-300">Social</h3>
                        <div className="flex space-x-4 mt-3">
                          <a
                            href="https://github.com/yuvrajinbhakti"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 rounded-lg bg-gray-800/50 border border-gray-600/50 hover:border-gray-400 text-gray-300 hover:text-white transition-all duration-300 hover:bg-gray-700/50 hover:scale-110 hover:shadow-lg hover:shadow-gray-500/25"
                            title="GitHub"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                            </svg>
                          </a>
                          <a
                            href="https://www.linkedin.com/in/yuvraj-singh-nain-76715921b/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 rounded-lg bg-blue-600/20 border border-blue-500/50 hover:border-blue-400 text-blue-400 hover:text-blue-300 transition-all duration-300 hover:bg-blue-600/30 hover:scale-110 hover:shadow-lg hover:shadow-blue-500/25"
                            title="LinkedIn"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                            </svg>
                          </a>
                          <a
                            href="https://twitter.com/YuvrajS82748951"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 rounded-lg bg-cyan-500/20 border border-cyan-400/50 hover:border-cyan-300 text-cyan-400 hover:text-cyan-300 transition-all duration-300 hover:bg-cyan-500/30 hover:scale-110 hover:shadow-lg hover:shadow-cyan-500/25"
                            title="Twitter"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/>
                            </svg>
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>
                </GlassCard>
              </ScrollReveal>

              {/* Contact Form */}
              <ScrollReveal animation="slide" direction="right">
                <GlassCard className="p-8 h-full">
                  <h2 className="text-2xl font-bold mb-6 text-white">Send Me a Message</h2>
                  <form ref={formRef} onSubmit={handleSubmit} className="space-y-6">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-2">
                        Your Name
                      </label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 rounded-lg bg-[#0f172a]/60 border border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                        placeholder="John Doe"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                        Your Email
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 rounded-lg bg-[#0f172a]/60 border border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                        placeholder="john@example.com"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="message" className="block text-sm font-medium text-gray-300 mb-2">
                        Your Message
                      </label>
                      <textarea
                        id="message"
                        name="message"
                        value={formData.message}
                        onChange={handleChange}
                        required
                        rows={5}
                        className="w-full px-4 py-3 rounded-lg bg-[#0f172a]/60 border border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 resize-none"
                        placeholder="Hi Yuvraj, I would like to talk about..."
                      ></textarea>
                    </div>

                    <motion.button
                      type="submit"
                      disabled={isSubmitting}
                      whileHover={{ scale: isSubmitting ? 1 : 1.02 }}
                      whileTap={{ scale: isSubmitting ? 1 : 0.98 }}
                      className={`w-full py-4 px-6 rounded-xl font-semibold text-white transition-all duration-500 relative overflow-hidden group shadow-lg ${
                        isSubmitting
                          ? "bg-blue-400/80 cursor-not-allowed shadow-blue-400/20"
                          : "bg-gradient-to-r from-blue-600 via-blue-700 to-purple-600 hover:from-blue-700 hover:via-purple-600 hover:to-blue-800 hover:shadow-2xl hover:shadow-blue-500/30 hover:-translate-y-1"
                      }`}
                    >
                      {/* Background gradient animation */}
                      {!isSubmitting && (
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out" />
                      )}
                      
                      {/* Sparkle effects */}
                      {!isSubmitting && (
                        <>
                          <div className="absolute top-2 left-6 w-1 h-1 bg-white/60 rounded-full opacity-0 group-hover:opacity-100 group-hover:animate-ping transition-opacity duration-300" />
                          <div className="absolute bottom-3 right-8 w-1 h-1 bg-white/60 rounded-full opacity-0 group-hover:opacity-100 group-hover:animate-ping transition-opacity duration-300 delay-150" />
                          <div className="absolute top-1/2 right-4 w-0.5 h-0.5 bg-white/60 rounded-full opacity-0 group-hover:opacity-100 group-hover:animate-pulse transition-opacity duration-300 delay-75" />
                        </>
                      )}

                      {isSubmitting ? (
                        <div className="flex justify-center items-center relative z-10">
                          <svg className="animate-spin -ml-1 mr-3 h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          <span className="text-lg">Sending your message...</span>
                        </div>
                      ) : (
                        <span className="flex items-center justify-center gap-3 relative z-10 text-lg">
                          <svg 
                            className="w-6 h-6 transition-transform duration-300 group-hover:translate-x-1" 
                            fill="none" 
                            stroke="currentColor" 
                            viewBox="0 0 24 24"
                          >
                            <path 
                              strokeLinecap="round" 
                              strokeLinejoin="round" 
                              strokeWidth={2.5} 
                              d="M13 7l5 5m0 0l-5 5m5-5H6" 
                            />
                          </svg>
                          <span className="font-semibold tracking-wide">Send Message</span>
                          <div className="absolute -right-1 top-1/2 transform -translate-y-1/2 w-2 h-2 bg-white/20 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 group-hover:scale-150" />
                        </span>
                      )}
                      
                      {/* Glow effect */}
                      {!isSubmitting && (
                        <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-600/50 via-purple-600/50 to-blue-600/50 opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-500 -z-10" />
                      )}
                    </motion.button>

                    {submitStatus && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`mt-4 p-4 rounded-lg border ${
                          submitStatus.success
                            ? "bg-green-500/20 text-green-300 border-green-400/30"
                            : "bg-red-500/20 text-red-300 border-red-400/30"
                        }`}
                      >
                        {submitStatus.message}
                      </motion.div>
                    )}
                  </form>
                </GlassCard>
              </ScrollReveal>
            </div>
          </div>
        </section>   
      </AnimatedBackground>
    </div>
  );
};

export default Contact;
