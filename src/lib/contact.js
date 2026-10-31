// Visitor messages, delivered to Pratyush's inbox by Web3Forms (https://web3forms.com).
// The access key is designed to be public; set VITE_WEB3FORMS_KEY in .env and in Vercel.
// Without a key the form falls back to opening the visitor's email app.

export const CONTACT_EMAIL = 'sharmapratyush.2005@gmail.com';
export const MESSAGE_MAX_LENGTH = 2000;

const ACCESS_KEY = import.meta.env.VITE_WEB3FORMS_KEY || '';
export const formEnabled = Boolean(ACCESS_KEY);

function subjectFor(storyName) {
  return storyName ? `Peak Fiction: let's talk about ${storyName}` : 'Peak Fiction: hello!';
}

export function mailtoLink({ storyName, message = '' } = {}) {
  const params = new URLSearchParams({ subject: subjectFor(storyName), body: message });
  return `mailto:${CONTACT_EMAIL}?${params.toString().replace(/\+/g, '%20')}`;
}

/** Send a message. Resolves on success, throws an Error with a readable message on failure. */
export async function sendMessage({ name, email, message, storyName, honeypot }) {
  if (!formEnabled) throw new Error('The message form is not set up yet.');
  if (honeypot) return; // bots fill hidden fields; pretend it worked

  const res = await fetch('https://api.web3forms.com/submit', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({
      access_key: ACCESS_KEY,
      subject: subjectFor(storyName),
      from_name: 'Peak Fiction',
      name: name.trim() || 'Anonymous',
      email: email.trim(),
      story: storyName || '(general)',
      message: message.trim().slice(0, MESSAGE_MAX_LENGTH),
    }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok || !data.success) throw new Error(data.message || 'Could not send your message.');
}
