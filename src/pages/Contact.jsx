import { useState } from "react";
import { motion } from "framer-motion";
import ScrollReveal from "../Components/ScrollReveal";
import { RESUME_URL } from "../constants";
import { sendContactEmail, isEmailJSConfigured, createMailtoLink } from "../utils/emailService";

/*
 * One heading, one address, three links — and a form that says what it does.
 *
 * This section used to be three headings, two glass cards, a location, a
 * Twitter handle and the form. It is one column now, address first, because
 * the address is what a visitor to a portfolio actually wants and the one
 * thing here that cannot fail.
 *
 * The form stays, wired to EmailJS, because the deployed site has the keys set
 * and it sends. The mistake to avoid is the one the previous version made when
 * the keys were absent: it looked like a form, validated like a form, and on
 * submit announced that EmailJS was not configured and offered a mailto link —
 * collecting a message and then asking for it to be typed again. So the button
 * is honest about which of the two it will do. With keys, it sends. Without,
 * it says "Open in your mail app" and does exactly that, with the message
 * carried across in the body.
 */

const EMAIL = "yuvrajsinghnain03@gmail.com";

const links = [
  { name: "GitHub", href: "https://github.com/yuvrajinbhakti" },
  { name: "LinkedIn", href: "https://www.linkedin.com/in/yuvraj-singh-nain-76715921b/" },
  { name: "Resume", href: RESUME_URL },
];

// Read once at module load: it is build-time configuration, not state.
const CAN_SEND = Boolean(isEmailJSConfigured());

const field =
  "w-full min-h-[44px] px-4 py-3 rounded-lg bg-[#0f172a]/70 border border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors";

const Contact = () => {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [sending, setSending] = useState(false);
  const [status, setStatus] = useState(null);

  const onChange = (e) => setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const onSubmit = async (e) => {
    e.preventDefault();
    setStatus(null);

    if (!CAN_SEND) {
      // The honest fallback: hand the drafted message to the visitor's own
      // mail client rather than pretending to send it.
      window.location.href = createMailtoLink(form);
      return;
    }

    setSending(true);
    try {
      await sendContactEmail(form);
      setForm({ name: "", email: "", message: "" });
      setStatus({ ok: true, text: "Sent. I read everything that arrives here and will reply." });
    } catch (err) {
      setStatus({ ok: false, text: err?.message || "That did not send. The address above always works." });
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="w-full">
      <section className="w-full pt-12 md:pt-20 px-4 md:px-8 mb-12 md:mb-20">
        <div className="max-w-xl mx-auto text-center">
          <ScrollReveal animation="fade">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Get in touch</h2>
            <p className="text-base md:text-lg text-white/70 leading-relaxed mb-8">
              If something on this page made you want to talk — about the work, a role, or a
              bug you found — this is the address.
            </p>

            {/* The address as the primary control: a link, in type large enough
                to read across a room. select-all so a tap or a triple-click
                takes the whole thing for pasting elsewhere. */}
            <a
              href={`mailto:${EMAIL}`}
              className="inline-flex items-center justify-center min-h-[44px] px-2 text-xl sm:text-2xl md:text-3xl font-semibold text-white hover:text-blue-300 transition-colors break-all select-all underline decoration-white/20 underline-offset-8 hover:decoration-blue-400"
            >
              {EMAIL}
            </a>

            <ul className="mt-6 flex flex-wrap items-center justify-center gap-x-2 gap-y-1">
              {links.map((link, i) => (
                <li key={link.name} className="flex items-center">
                  <a
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center min-h-[44px] px-3 text-base text-white/70 hover:text-white transition-colors"
                  >
                    {link.name}
                  </a>
                  {i < links.length - 1 && (
                    <span aria-hidden="true" className="text-white/25">
                      ·
                    </span>
                  )}
                </li>
              ))}
            </ul>

            <form onSubmit={onSubmit} className="mt-10 text-left space-y-4" noValidate={false}>
              <p className="text-sm text-white/45 text-center mb-2">
                {CAN_SEND ? "Or write here — it arrives in the same inbox." : "Or draft here — it opens in your mail app."}
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="contact-name" className="block text-sm text-white/60 mb-1.5">
                    Name
                  </label>
                  <input
                    id="contact-name"
                    name="name"
                    type="text"
                    required
                    autoComplete="name"
                    value={form.name}
                    onChange={onChange}
                    className={field}
                  />
                </div>
                <div>
                  <label htmlFor="contact-email" className="block text-sm text-white/60 mb-1.5">
                    Email
                  </label>
                  <input
                    id="contact-email"
                    name="email"
                    type="email"
                    required
                    autoComplete="email"
                    value={form.email}
                    onChange={onChange}
                    className={field}
                  />
                </div>
              </div>
              <div>
                <label htmlFor="contact-message" className="block text-sm text-white/60 mb-1.5">
                  Message
                </label>
                <textarea
                  id="contact-message"
                  name="message"
                  required
                  rows={4}
                  minLength={10}
                  value={form.message}
                  onChange={onChange}
                  className={`${field} resize-none`}
                />
              </div>

              <motion.button
                type="submit"
                disabled={sending}
                whileHover={sending ? undefined : { scale: 1.01 }}
                whileTap={sending ? undefined : { scale: 0.99 }}
                className="w-full min-h-[48px] rounded-lg font-semibold text-white bg-blue-600 hover:bg-blue-500 disabled:bg-blue-400/60 disabled:cursor-wait transition-colors"
              >
                {sending ? "Sending…" : CAN_SEND ? "Send" : "Open in your mail app"}
              </motion.button>

              {/* Mounted unconditionally and filled later: screen readers only
                  announce changes to a live region that already existed. */}
              <div role="status" aria-live="polite" className="min-h-[1.5rem] text-sm text-center">
                {status && (
                  <span className={status.ok ? "text-emerald-300" : "text-rose-300"}>{status.text}</span>
                )}
              </div>
            </form>
          </ScrollReveal>
        </div>
      </section>
    </div>
  );
};

export default Contact;
