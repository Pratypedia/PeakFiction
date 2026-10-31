import React, { useState } from 'react';
import { Send, Copy, Check } from 'lucide-react';
import { CONTACT_EMAIL, MESSAGE_MAX_LENGTH, formEnabled, mailtoLink, sendMessage } from '../lib/contact';

// "Talk to me about this story" form. Falls back to an email link when no form key is configured.
export default function ContactForm({ storyName, prompt = 'Want to talk about this story? Send me a message.' }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [honeypot, setHoneypot] = useState('');
  const [status, setStatus] = useState('idle'); // idle | sending | sent | error
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  const copyEmail = async () => {
    try {
      await navigator.clipboard.writeText(CONTACT_EMAIL);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch { /* clipboard blocked; the address is visible anyway */ }
  };

  if (!formEnabled) {
    return (
      <div className="contact-box">
        <p className="contact-prompt">{prompt}</p>
        <div className="contact-actions">
          <a className="btn btn-primary" href={mailtoLink({ storyName })}>
            <Send size={16} /> Email me
          </a>
          <button type="button" className="btn btn-secondary" onClick={copyEmail}>
            {copied ? <Check size={16} /> : <Copy size={16} />} {copied ? 'Copied' : CONTACT_EMAIL}
          </button>
        </div>
      </div>
    );
  }

  if (status === 'sent') {
    return (
      <div className="contact-box">
        <p className="contact-prompt">Thanks! Your message is on its way. I'll reply to {email || 'you'} soon.</p>
      </div>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('sending');
    setError('');
    try {
      await sendMessage({ name, email, message, storyName, honeypot });
      setStatus('sent');
    } catch (err) {
      setStatus('error');
      setError(err.message);
    }
  };

  return (
    <form className="contact-box comment-form" onSubmit={handleSubmit}>
      <p className="contact-prompt">{prompt}</p>
      <div className="comment-row">
        <input className="comment-name-input" placeholder="Your name (optional)" maxLength={60}
          value={name} onChange={e => setName(e.target.value)} />
        <input className="comment-name-input" type="email" placeholder="Your email (so I can reply)" required
          value={email} onChange={e => setEmail(e.target.value)} />
      </div>
      <textarea className="comment-input" placeholder="What's on your mind?" required maxLength={MESSAGE_MAX_LENGTH}
        value={message} onChange={e => setMessage(e.target.value)} />
      <input type="text" tabIndex={-1} autoComplete="off" aria-hidden="true" className="contact-honeypot"
        value={honeypot} onChange={e => setHoneypot(e.target.value)} />
      {status === 'error' && (
        <p className="contact-error">
          {error} You can also <a href={mailtoLink({ storyName, message })}>email me directly</a>.
        </p>
      )}
      <button type="submit" className="btn btn-primary" disabled={status === 'sending'} style={{ alignSelf: 'flex-end' }}>
        <Send size={16} /> {status === 'sending' ? 'Sending...' : 'Send message'}
      </button>
    </form>
  );
}
