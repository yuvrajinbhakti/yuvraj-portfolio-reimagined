/**
 * Speaking to the site.
 *
 * This existed once as VoiceNavigation.jsx — 451 lines, a 64px microphone disc
 * floating over every page, and a hand-written map of about thirty exact
 * phrases ("go to contact", "go contact", "contact page") to functions. It was
 * removed because the button was the loudest thing on screen and the feature
 * was a second navigation system that only knew five destinations.
 *
 * The idea was worth keeping; the delivery was not. Speech now feeds the
 * command palette rather than competing with it, which deletes the phrase map
 * entirely: whatever you say becomes a search, and the palette already knows
 * every page, project, case study, playground example, individual case-study
 * *section*, and action. "Contact" still works. So does "operational
 * transform", "encryption", and "copy email", none of which the old version
 * could ever have matched.
 *
 * Web Speech is Chromium and Safari only, and needs HTTPS. Firefox has no
 * implementation at all, so the control is not rendered there rather than
 * being rendered broken.
 */

const Recognition =
  typeof window === 'undefined'
    ? null
    : window.SpeechRecognition || window.webkitSpeechRecognition || null;

export const SPEECH_SUPPORTED = Boolean(Recognition);

/**
 * Strip the words people put around a request but do not mean.
 *
 * "take me to the contact page" and "contact" should reach the same place, and
 * the leftover words are actively harmful once the transcript is a search
 * query: "page" matches half the index, and "show" matches nothing at all.
 *
 * Applied repeatedly, because the patterns nest — "go to the projects page"
 * needs three passes.
 */
const LEADING = [
  /^(hey|ok|okay|hi|um|uh|so)\s+/,
  /^(please)\s+/,
  /^(can you|could you|i want to|i'd like to|let's)\s+/,
  /^(go|jump|take me|bring me|navigate|head|move)\s+(to|over to|back to|into)\s+/,
  /^(go|open|show|find|view|see|visit|read|launch|start)\s+(me\s+)?/,
  /^(search|look)\s+(for|up)\s+/,
  /^(the|a|an|my|your)\s+/,
];

const TRAILING = [/\s+(page|section|screen|tab|please|thanks|thank you)$/];

export const cleanSpeech = (raw) => {
  let text = String(raw ?? '')
    .toLowerCase()
    .trim()
    // Speech engines punctuate. A trailing question mark or full stop would be
    // a literal character in the search.
    .replace(/[.,!?;:]+$/g, '')
    .replace(/\s+/g, ' ');

  let previous;
  do {
    previous = text;
    for (const pattern of [...LEADING, ...TRAILING]) text = text.replace(pattern, '').trim();
  } while (text !== previous && text.length > 0);

  return text;
};

/**
 * One utterance, then stop.
 *
 * `continuous` is deliberately off. A command is a sentence, not a dictation
 * session, and an always-on microphone on a portfolio is both a privacy
 * question nobody asked to answer and a battery cost. The recogniser ends
 * itself after a pause, which is exactly the boundary wanted.
 */
export const createRecognizer = ({ onInterim, onFinal, onError, onEnd }) => {
  if (!Recognition) return null;

  const recognition = new Recognition();
  recognition.continuous = false;
  recognition.interimResults = true;
  recognition.maxAlternatives = 1;
  // The visitor's language, not the author's. This site is read from
  // everywhere, and en-US would mishear most of them.
  recognition.lang = (typeof navigator !== 'undefined' && navigator.language) || 'en-US';

  let started = false;

  recognition.onresult = (event) => {
    let interim = '';
    let final = '';
    for (let i = event.resultIndex; i < event.results.length; i += 1) {
      const result = event.results[i];
      if (result.isFinal) final += result[0].transcript;
      else interim += result[0].transcript;
    }
    if (interim) onInterim?.(interim);
    if (final) onFinal?.(final);
  };

  recognition.onerror = (event) => {
    // "aborted" is what stop() produces and "no-speech" is someone changing
    // their mind. Neither is a failure worth putting on screen.
    if (event.error === 'aborted' || event.error === 'no-speech') return;
    onError?.(
      event.error === 'not-allowed'
        ? 'Microphone permission was refused.'
        : event.error === 'audio-capture'
          ? 'No microphone was found.'
          : 'Speech recognition failed. Try typing instead.'
    );
  };

  recognition.onend = () => {
    started = false;
    onEnd?.();
  };

  return {
    start() {
      // start() throws InvalidStateError if it is already running, and the
      // recogniser can end on its own at any moment, so this tracks its own
      // state rather than trusting a flag held by the caller.
      if (started) return;
      try {
        recognition.start();
        started = true;
      } catch {
        started = false;
      }
    },
    stop() {
      if (!started) return;
      try {
        recognition.abort();
      } catch {
        // Already stopped.
      }
      started = false;
    },
  };
};

export default createRecognizer;
