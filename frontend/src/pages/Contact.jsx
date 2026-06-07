import React, { useState } from 'react';
import { Mail, Phone, MapPin, Clock, Send, MessageSquare, CheckCircle2 } from 'lucide-react';

export const Contact = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSendMessage = (e) => {
    e.preventDefault();
    setSubmitting(true);
    
    // Simulate API request send latency
    setTimeout(() => {
      setSubmitted(true);
      setSubmitting(false);
      setName('');
      setEmail('');
      setSubject('');
      setMessage('');
    }, 1200);
  };

  return (
    <div className="space-y-6">
      
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Contact Blood Station</h1>
        <p className="text-slate-500">Have queries about donation eligibility, blood drives, or bulk requests? Reach out to us.</p>
      </div>

      {submitted && (
        <div className="flex items-center gap-3 rounded-xl bg-emerald-50 border border-emerald-100 p-4 text-sm text-emerald-800">
          <CheckCircle2 className="text-emerald-600 shrink-0" size={18} />
          <span>Your message has been sent successfully. We will get back to you within 24 hours.</span>
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-3">
        
        {/* Contact Information Cards */}
        <div className="space-y-4 md:col-span-1">
          
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h3 className="font-bold text-slate-700 dark:text-slate-200 flex items-center gap-2 mb-4 text-sm uppercase tracking-wider">
              <MessageSquare size={16} className="text-primary-600" /> General Info
            </h3>
            
            <div className="space-y-3.5 text-sm text-slate-600">
              <div className="flex items-start gap-3">
                <Phone size={16} className="text-slate-400 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-slate-800">Hotline Inquiry</p>
                  <p>+1 (800) 555-LIFE</p>
                  <p>+1 (555) 010-0199</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Mail size={16} className="text-slate-400 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-slate-800">Email Address</p>
                  <p className="hover:text-primary-600 transition-colors">support@lifesavebank.org</p>
                  <p className="hover:text-primary-600 transition-colors">drives@lifesavebank.org</p>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h3 className="font-bold text-slate-700 dark:text-slate-200 flex items-center gap-2 mb-4 text-sm uppercase tracking-wider">
              <Clock size={16} className="text-primary-600" /> Operational Hours
            </h3>
            <div className="text-sm text-slate-600 space-y-2">
              <div className="flex justify-between">
                <span>Monday - Friday</span>
                <span className="font-semibold text-slate-800">8:00 AM - 6:00 PM</span>
              </div>
              <div className="flex justify-between">
                <span>Saturday</span>
                <span className="font-semibold text-slate-800">9:00 AM - 4:00 PM</span>
              </div>
              <div className="flex justify-between">
                <span>Sunday</span>
                <span className="text-red-500 font-semibold">Closed (Emergency Only)</span>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-start gap-3 text-sm text-slate-600">
              <MapPin size={18} className="text-primary-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold text-slate-800">Headquarters Address</h4>
                <p className="mt-1 leading-relaxed">
                  75 Blood Donor Way,<br />
                  Suite 100, Biomedical Center,<br />
                  Metro City, MC 00100
                </p>
              </div>
            </div>
          </div>

        </div>

        {/* Contact Form */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:col-span-2">
          <h2 className="text-lg font-bold text-slate-800 mb-4">Send a Message</h2>
          <p className="text-xs text-slate-400 mb-5">
            If you represent a hospital needing to schedule regular deliveries or have questions about eligibility, please use this form.
          </p>

          <form onSubmit={handleSendMessage} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Your Name</label>
                <input
                  type="text"
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="form-input text-sm"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Email Address</label>
                <input
                  type="email"
                  placeholder="john@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="form-input text-sm"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Subject</label>
              <input
                type="text"
                placeholder="e.g. Schedule blood drive at our college"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="form-input text-sm"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Message</label>
              <textarea
                placeholder="Write your details here..."
                rows="5"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="form-input text-sm resize-none"
                required
              ></textarea>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="btn-primary w-fit px-6 ml-auto"
            >
              {submitting ? (
                <span className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"></span>
              ) : (
                <>
                  Send Message <Send size={14} />
                </>
              )}
            </button>
          </form>

        </div>

      </div>

    </div>
  );
};
