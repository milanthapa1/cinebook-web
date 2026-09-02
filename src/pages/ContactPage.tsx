import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';

const inputCls = 'w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-[#00a8cc] transition-colors dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100 dark:placeholder:text-gray-500';

const CONTACT_FORM_URL = import.meta.env.VITE_CONTACT_FORM_URL as string | undefined;

type Status = 'idle' | 'submitting' | 'success' | 'error';

export const ContactPage: React.FC = () => {
  const [status, setStatus] = useState<Status>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!CONTACT_FORM_URL) {
      setErrorMsg('Contact form is not configured. Please try again later.');
      setStatus('error');
      return;
    }

    const form = e.currentTarget;
    const formData = new FormData(form);
    const name = (formData.get('name') as string).trim();
    const email = (formData.get('email') as string).trim();
    const message = (formData.get('message') as string).trim();

    setStatus('submitting');

    try {
      const res = await fetch(CONTACT_FORM_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          email,
          message,
          timestamp: new Date().toISOString(),
        }),
      });

      // mode: 'no-cors' always returns opaque response, so treat any response as success
      setStatus('success');
      form.reset();
    } catch {
      setErrorMsg('Failed to send message. Please try again.');
      setStatus('error');
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight dark:text-gray-100">Contact CineBook</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">Have questions about tickets, group bookings, or venue rentals?</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

        {/* Contact Info */}
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-gray-200 space-y-6 dark:bg-gray-900 dark:border-gray-800">
          <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">Cinema Headquarters</h3>
          <div className="space-y-4 text-sm text-gray-600 dark:text-gray-400">
            <div className="flex items-start gap-3">
              <MapPin className="w-5 h-5 text-[#00a8cc] shrink-0 mt-0.5" />
              <div>
                <strong className="block text-gray-900 font-semibold dark:text-gray-100">Milan Residannce</strong>
                <span>Kathmandu, Nepal</span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Phone className="w-5 h-5 text-[#00a8cc] shrink-0" />
              <span>+977-9762415657</span>
            </div>
            <div className="flex items-center gap-3">
              <Mail className="w-5 h-5 text-[#00a8cc] shrink-0" />
              <span>support@cinebook.com.np</span>
            </div>
          </div>
        </div>

        {/* Contact Form */}
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-gray-200 dark:bg-gray-900 dark:border-gray-800">
          {status === 'success' ? (
            <div className="text-center py-10 space-y-3">
              <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
              <h4 className="text-base font-semibold text-gray-900 dark:text-gray-100">Message Delivered</h4>
              <p className="text-sm text-gray-500 dark:text-gray-400">Our customer team will respond within 2 hours.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-600 dark:text-gray-400">Your Name</label>
                <input type="text" name="name" required placeholder="your name" className={inputCls} />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-600 dark:text-gray-400">Email Address</label>
                <input type="email" name="email" required placeholder="user@example.com" className={inputCls} />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-600 dark:text-gray-400">Message</label>
                <textarea name="message" rows={4} required placeholder="How can we assist your cinema booking experience?" className={inputCls} />
              </div>

              {status === 'error' && (
                <div className="flex items-center gap-2 text-xs text-rose-600 dark:text-rose-400">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  {errorMsg}
                </div>
              )}

              <button
                type="submit"
                disabled={status === 'submitting'}
                className="w-full py-3 rounded-xl bg-[#00a8cc] hover:bg-[#0096c7] text-white font-semibold text-sm transition-all flex items-center justify-center gap-2 active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {status === 'submitting' ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
                {status === 'submitting' ? 'Sending...' : 'Send Message'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
