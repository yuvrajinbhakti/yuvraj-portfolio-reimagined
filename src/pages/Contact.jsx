import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import ScrollReveal from "../Components/ScrollReveal";
import { RESUME_URL } from "../constants";
import { sendContactEmail, isEmailJSConfigured, createMailtoLink } from "../utils/emailService";

/*
 * One heading, one address, three links — and a form that waits to be asked.
 *
 * This section sits at the bottom of the page, which on this page is not an
 * arbitrary place: the sky behind it has run from dusk to the edge of sunrise,
 * and the sun comes up exactly here. The previous layout put a five-field form
 * and a full-width blue button over it. Cold navy boxes on a warm dawn, and the
 * one moment the whole scroll is building to, hidden behind a textarea.
 *
 * So the form is collapsed until somebody wants it. The address is the primary
 * control and cannot fail; the three links are the ways to check the person is
 * real; one quiet line offers the form, and the sunrise stays visible. When the
 * form does open, its fields are translucent rather than painted navy, so they
 * take the colour of whatever sky is behind them, and the button is the same
 * outline the hero's "Contact Me" uses — the ask that opens the page and the
 * one that closes it look like the same ask.
 *
 * The form still sends. The deployed site has EmailJS keys, so with them the
 * button reads "Send" and sends; without them it reads "Open in your mail app"
 * and does exactly that with the draft carried across — never a form that
 * collects a message and then asks for it to be typed again.
 */

const EMAIL = "yuvrajsinghnain03@gmail.com";

const links = [
  { name: "GitHub", href: "https://github.com/yuvrajinbhakti" },
  { name: "LinkedIn", href: "https://www.linkedin.com/in/yuvraj-singh-nain-76715921b/" },
  { name: "Resume", href: RESUME_URL },
];

// Read once at module load: it is build-time configuration, not state.
const CAN_SEND = Boolean(isEmailJSConfigured());

// Translucent, not painted. bg-[#0f172a]/70 was a navy slab on an orange sky;
// white at 6% is a slightly lighter patch of whatever the sky is doing.
const field =
  "w-full min-h-[44px] px-4 py-3 rounded-lg bg-white/[0.06] border border-white/15 text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-blue-400/70 focus:border-transparent transition-colors";

const Contact = () => {
  const reduce = useReducedMotion();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [sending, setSending] = useState(false);
  const [status, setStatus] = useState(null);
  const nameRef = useRef(null);

  // Opening the form is a request to type, so the caret goes to the first
  // field. preventScroll: the field is already on screen, and a scroll jump on
  // top of a disclosure reads as the page lurching.
  useEffect(() => {
    if (open) nameRef.current?.focus({ preventScroll: true });
  }, [open]);

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

            {/* The disclosure. One line of text, not a button-shaped button:
                the address above is the primary action and this should not
                compete with it. */}
            {!open && (
              <p className="mt-8">
                <button
                  type="button"
                  onClick={() => setOpen(true)}
                  aria-expanded={open}
                  aria-controls="contact-form"
                  className="inline-flex items-center min-h-[44px] px-3 text-sm text-white/55 hover:text-white transition-colors underline decoration-white/20 underline-offset-4 hover:decoration-blue-400"
                >
                  {CAN_SEND ? "Or write here — it arrives in the same inbox" : "Or draft here — it opens in your mail app"}
                </button>
              </p>
            )}

            {open && (
              <motion.form
                id="contact-form"
                onSubmit={onSubmit}
                initial={reduce ? false : { opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                className="mt-8 text-left space-y-4 rounded-2xl border border-white/10 bg-white/[0.04] backdrop-blur-md p-5 sm:p-6"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="contact-name" className="block text-sm text-white/60 mb-1.5">
                      Name
                    </label>
                    <input
                      ref={nameRef}
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

                {/* Glass, but only while open. A frosted panel behind an always-visible
                    form would be a slab over the sunrise again; behind a form the
                    visitor asked for, it is the site's own idiom doing the
                    legibility work over the brightest part of the dawn, and it is
                    gone again the moment they close it. */}
                {/* The hero's secondary CTA, not a full-width slab. A saturated
                    blue bar was the loudest thing on the page at its quietest
                    moment, and it sat directly over the sunrise. */}
                <div className="flex items-center justify-center gap-4 pt-1">
                  <motion.button
                    type="submit"
                    disabled={sending}
                    whileHover={sending || reduce ? undefined : { y: -2 }}
                    whileTap={sending || reduce ? undefined : { scale: 0.98 }}
                    className="inline-flex items-center justify-center min-h-[44px] px-7 py-3 rounded-lg border border-white/30 text-white text-sm sm:text-base font-medium hover:bg-white/10 disabled:opacity-60 disabled:cursor-wait transition-colors"
                  >
                    {sending ? "Sending…" : CAN_SEND ? "Send" : "Open in your mail app"}
                  </motion.button>
                  <button
                    type="button"
                    onClick={() => setOpen(false)}
                    className="inline-flex items-center min-h-[44px] px-3 text-sm text-white/45 hover:text-white transition-colors"
                  >
                    Never mind
                  </button>
                </div>

                {/* Mounted with the form and filled later: screen readers only
                    announce changes to a live region that already existed. */}
                <div role="status" aria-live="polite" className="min-h-[1.5rem] text-sm text-center">
                  {status && (
                    <span className={status.ok ? "text-emerald-300" : "text-rose-300"}>{status.text}</span>
                  )}
                </div>
              </motion.form>
            )}
          </ScrollReveal>
        </div>
      </section>
    </div>
  );
};

export default Contact;
