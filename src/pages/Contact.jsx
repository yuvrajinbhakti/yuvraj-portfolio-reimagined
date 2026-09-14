import ScrollReveal from "../Components/ScrollReveal";
import { RESUME_URL } from "../constants";

/*
 * One heading, one address, three links.
 *
 * This section used to be three headings — "Get In Touch", "Contact
 * Information", "Send Me a Message" — a two-column pair of glass cards, a
 * location, a Twitter handle, and a form. The form was the problem. It looked
 * like a form, validated like a form, and on submit told the visitor that
 * EmailJS was not configured and offered a mailto link — which is to say it
 * collected a name, an email and a message and then asked the visitor to type
 * them again somewhere else. A form that cannot send is worse than no form: it
 * costs the reader the effort and then the trust.
 *
 * What a visitor to a portfolio actually wants from a contact section is the
 * address and a way to check the person is real. So: the email, as text,
 * copyable and clickable; GitHub and LinkedIn; the CV. Nothing to fill in,
 * nothing that can fail, nothing the footer does not also do — except say it
 * once, at full size, at the end, where the page's single ask belongs.
 */

const EMAIL = "yuvrajsinghnain03@gmail.com";

const links = [
  { name: "GitHub", href: "https://github.com/yuvrajinbhakti" },
  { name: "LinkedIn", href: "https://www.linkedin.com/in/yuvraj-singh-nain-76715921b/" },
  { name: "Resume", href: RESUME_URL },
];

const Contact = () => (
  <div className="w-full">
    <section className="w-full pt-12 md:pt-20 px-4 md:px-8 mb-12 md:mb-20">
      <div className="max-w-2xl mx-auto text-center">
        <ScrollReveal animation="fade">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Get in touch
          </h2>
          <p className="text-base md:text-lg text-white/70 leading-relaxed mb-8">
            I read everything that arrives here. If something on this page made you
            want to talk — about the work, a role, or a bug you found — this is the
            address.
          </p>

          {/* The address as the primary control: a link, in type large enough
              to read across a room, that opens the visitor's own mail client
              with nothing prefilled. select-all so a tap or a triple-click
              takes the whole thing for pasting elsewhere. */}
          <a
            href={`mailto:${EMAIL}`}
            className="inline-flex items-center justify-center min-h-[44px] px-2 text-xl sm:text-2xl md:text-3xl font-semibold text-white hover:text-blue-300 transition-colors break-all select-all underline decoration-white/20 underline-offset-8 hover:decoration-blue-400"
          >
            {EMAIL}
          </a>

          <ul className="mt-8 flex flex-wrap items-center justify-center gap-x-2 gap-y-1">
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
        </ScrollReveal>
      </div>
    </section>
  </div>
);

export default Contact;
