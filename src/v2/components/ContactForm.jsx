import React, { useState } from 'react';
import { Send, Copy, Check } from 'lucide-react';
import { CONTACT_EMAIL, MESSAGE_MAX_LENGTH, formEnabled, mailtoLink, sendMessage } from '../../lib/contact';

// "Message me" form. Without a Web3Forms key it becomes an email link + copy button.
export default function ContactForm({ storyName, prompt = 'Want to talk about it? Send me a message.' }) {
  const [fields, setFields] = useState({ name: '', email: '', message: '', honeypot: '' });
  const [status, setStatus] = useState('idle'); // idle | sending | sent | error
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  const update = (key) => (e) => setFields(f => ({ ...f, [key]: e.target.value }));

  const copyEmail = async () => {
    try {
      await navigator.clipboard.writeText(CONTACT_EMAIL);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch { /* clipboard blocked; the address is visible anyway */ }
  };

  if (!formEnabled) {
    return (
      <div className="v2-contact">
        <p className="v2-contact__prompt">{prompt}</p>
        <div className="v2-contact__actions">
          <a className="v2-button v2-button--primary" href={mailtoLink({ storyName })}>
            <Send size={16} aria-hidden="true" /> Email me
          </a>
          <button type="button" className="v2-button" onClick={copyEmail}>
            {copied ? <Check size={16} aria-hidden="true" /> : <Copy size={16} aria-hidden="true" />}
            {copied ? 'Copied' : CONTACT_EMAIL}
          </button>
        </div>
      </div>
    );
  }

  if (status === 'sent') {
    return (
      <div className="v2-contact v2-contact--sent" role="status">
        <p className="v2-contact__prompt">Thanks! It's on its way. I'll reply to {fields.email}.</p>
      </div>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('sending');
    setError('');
    try {
      await sendMessage({ ...fields, storyName });
      setStatus('sent');
    } catch (err) {
      setStatus('error');
      setError(err.message);
    }
  };

  return (
    <form className="v2-contact" onSubmit={handleSubmit}>
      <p className="v2-contact__prompt">{prompt}</p>
      <div className="v2-contact__row">
        <label className="v2-field">
          <span className="v2-field__label">Name <span className="v2-field__optional">(optional)</span></span>
          <input className="v2-input" maxLength={60} value={fields.name} onChange={update('name')} autoComplete="name" />
        </label>
        <label className="v2-field">
          <span className="v2-field__label">Email, so I can reply</span>
          <input className="v2-input" type="email" required value={fields.email} onChange={update('email')} autoComplete="email" />
        </label>
      </div>
      <label className="v2-field">
        <span className="v2-field__label">Message</span>
        <textarea className="v2-input v2-input--area" required maxLength={MESSAGE_MAX_LENGTH} rows={4}
          value={fields.message} onChange={update('message')}
          placeholder={storyName ? `What did you think of ${storyName}?` : "What's on your mind?"} />
      </label>
      <input type="text" tabIndex={-1} autoComplete="off" aria-hidden="true" className="v2-honeypot"
        value={fields.honeypot} onChange={update('honeypot')} />
      {status === 'error' && (
        <p className="v2-contact__error" role="alert">
          {error} You can also <a href={mailtoLink({ storyName, message: fields.message })}>email me directly</a>.
        </p>
      )}
      <div className="v2-contact__actions">
        <button type="submit" className="v2-button v2-button--primary" disabled={status === 'sending'}>
          <Send size={16} aria-hidden="true" /> {status === 'sending' ? 'Sending…' : 'Send message'}
        </button>
      </div>
    </form>
  );
}
